#!/usr/bin/perl

use Data::Dumper;
use POSIX qw(strftime);
use JSON::XS;
use lib "./lib/";
use ODILeeds::Graph;


# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1/g; }
else{ $dir = "./"; }




$deathurl = "";
@las;
%names;
open(FILE,"la.csv");
@lines = <FILE>;
close(FILE);
foreach $line (@lines){
	chomp($line);
	push(@las,$line);
}

# Get the populations data
open(FILE,$dir."populations.json");
@lines = <FILE>;
close(FILE);
%pop = %{JSON::XS->new->utf8->decode(join("\n",@lines))};


# Get the death data
%deaths = processDeaths();

$start = 5;

for($i = 0; $i < @las; $i++){
	$la = $las[$i];
	$url = "https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=ltla;areaCode=$la&structure=%7B%22date%22:%22date%22,%22areaName%22:%22areaName%22,%22areaCode%22:%22areaCode%22,%22newCasesBySpecimenDate%22:%22newCasesBySpecimenDate%22,%22cumCasesBySpecimenDate%22:%22cumCasesBySpecimenDate%22,%22cumCasesBySpecimenDateRate%22:%22cumCasesBySpecimenDateRate%22%7D&format=json";
	$file = $dir."raw/$la.json";
	$head = $dir."raw/$la.head";
	print "$la:\n";
	# If it is older than 12 hours we grab a new copy
	if(time() - (stat $file)[9] >= 43200){
		print "\tGetting URL\n";
		`curl -sI "$url" > $head`;
		@lines = `curl -s --compressed "$url"`;
		$str = join("",@lines);
		# Add new lines before every day
		$str =~ s/(\{"date")/\n\t$1/g;
		# Add a new line before the pagination object
		$str =~ s/(\],"pagination")/\n$1/g;
		# If it seems to be valid JSON we save it over the previous version
		if($str =~ /\{"date\"/){
			open(FILE,">",$file);
			print FILE $str;
			close(FILE);
		}else{
			print "Opening previous\n";
			# Open the previous version
			open(FILE,$file);
			@lines = <FILE>;
			close(FILE);
			$str = join("",@lines);
		}
		sleep rand(3) + 1;
	}else{
		open(FILE,$file);
		@lines = <FILE>;
		close(FILE);
		$str = join("",@lines);
	}
	open(FILE,$head);
	@headlines = <FILE>;
	close(FILE);
	$strhead = join("",@headlines);
	
	$strhead =~ /Last-Modified: (.*)\n/;
	$casesdate = tidyDate($1);
	
	
	# Find number of lines
	if($str =~ /"length":([0-9]+)/){
		$len = $1;
		print "\t$1 days\n";
	}else{
		$len = 0;
		print "\tERROR: No lines\n";
	}
	%data = getArea($la);

	
	$file = $dir."processed/$la.json";
	$names{$la} = $data{'data'}{'attributes'}{'name'};

	open(FILE,">",$file);
	print FILE "{\n";
	print FILE "\t\"name\":\"$names{$la}\",\n";
	print FILE "\t\"population\": ".($pop{$la}||0).",\n";
	if($deaths{$la}){
		#"E06000001": {"total":{"date":"2020-09-24","all":819,"covid-19":110},"week":{"text":"Week 37","all":16,"covid-19":0}},
		print FILE "\t\"deaths\":{\n";
		print FILE "\t\t\"src\": \"$deathurl\",\n";
		print FILE "\t\t\"updated\": \"$deaths{$la}{'date'}\",\n";
		print FILE "\t\t\"all\": $deaths{$la}{'all-causes'},\n";
		print FILE "\t\t\"cov\": $deaths{$la}{'covid-19'},\n";
		print FILE "\t\t\"weeks\":[\n";
		$w = 0;
		foreach $wk (reverse(sort(keys(%{$deaths{$la}{'weeks'}})))){
			if($w > 0){ print FILE "\,\n"; }
			print FILE "\t\t\t{\"txt\":\"$wk\",\"all\":$deaths{$la}{'weeks'}{$wk}{'all-causes'},\"cov\":$deaths{$la}{'weeks'}{$wk}{'covid-19'}}";
			$w++;
		}
		print FILE "\n\t\t]\n";
		print FILE "\t},\n";
	}
	print FILE "\t\"cases\": {\n";
	$recentday = "";
	if($len > 0){
		print FILE "\t\t\"src\":\"$url\",\n";
		print FILE "\t\t\"updated\":\"$casesdate\",\n";
		print FILE "\t\t\"type\":\"SpecimenDate\",\n";
		print FILE "\t\t\"n\": $len,\n";
		print FILE "\t\t\"days\":[\n";
		for($l = 0; $l < @lines; $l++){
			chomp($lines[$l]);
			if($lines[$l] =~ /\"date\"/){
				$lines[$l] =~ s/\,"(areaName|areaCode)":"[^\"]*"//g;
				# Remove rate (as we can calculate it
				$lines[$l] =~ s/\,\"cumCasesBySpecimenDateRate\":[0-9\.]*//g;
				$lines[$l] =~ s/newCasesBySpecimenDate/day/g;
				$lines[$l] =~ s/cumCasesBySpecimenDate/tot/g;
				print FILE "\t\t$lines[$l]\n";
			}
		}
		print FILE "\t\t]\n";
	}
	print FILE "\t}\n";
	print FILE "}\n";
	close(FILE);
	
	
	makeGraph($la);

}

open(FILE,">","processed/index.json");
print FILE "{\n";
$i = 0;
foreach $la (sort(keys(%names))){
	if($i > 0){ print FILE ",\n"; }
	print FILE "\t\"$la\":\"$names{$la}\"";
	$i++;
}
print FILE "\n\}\n";
close(FILE);









sub makeGraph {
	my $la = $_[0];
	my ($file,%ladata,@lines,$i,$j,$n,@smooth,@raw,@recent,@recentraw,$graph);

	
	@raw = [];
	@smooth = [];
	
	$file = $dir."processed/$la.json";
	# Get the populations data
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	%ladata = %{JSON::XS->new->utf8->decode(join("\n",@lines))};

	$n = @{$ladata{'cases'}{'days'}};
	
	for($i = $n-1, $j = 0; $i>= 0; $i--,$j++){
		$raw[$j] = {'x'=>((getJulianFromISO($ladata{'cases'}{'days'}[$i]{'date'}) + 0  - 2440587.5)*86400),'y'=>($ladata{'cases'}{'days'}[$i]{'day'}||0)};
	}
	if($la eq "E06000053"){
		print Dumper %ladata;
	}
	if($n > 0){
		# Calculate 7-day rolling average
		for($i = 0; $i < @raw; $i++){
			$smooth[$i] = {'x'=>$raw[$i]{'x'},'y'=>0};
			$n = 0;
			for($j = $i-3; $j <= $i+3; $j++){
				if($j >=0 && $j < @raw){
					$smooth[$i]{'y'} += $raw[$j]{'y'};
					$n++;
				}
			}
			$smooth[$i]{'y'} /= $n;
			if($ladata{'population'}){
				$smooth[$i]{'y'} *= 1e5/$ladata{'population'};
			}
		}
		
		@recent = splice(@smooth,@smooth-$start,$start);
		@recentraw = splice(@raw,@raw-$start,$start);
		# Add first point back
		unshift(@recent,@smooth[@smooth-1]);
		unshift(@recentraw,$raw[@raw-1]);
		# Create the SVG output
		$file = $dir."processed/$la.svg";
		$graph = ODILeeds::Graph->new();
		$graph->addSeries({'title'=>'New cases',
					'data'=>\@smooth,
					'raw'=>\@raw,
					'color'=>'white',
					'stroke'=>1,
					'strokehover'=>3,
					'point'=>3,
					'pointhover'=>5,
					'line'=>1
		});
		$graph->addSeries({'title'=>'New cases',
					'data'=>\@recent,
					'raw'=>\@recentraw,
					'color'=>'white',
					'stroke'=>1,
					'strokehover'=>3,
					'stroke-dasharray'=>'5,5',
					'point'=>3,
					'pointhover'=>5,
					'line'=>1
		});
		$svg = $graph->draw({'width'=>480,'height'=>400,'left'=>15,'bottom'=>25,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>1,'ticks'=>true}}});
		open(FILE,">",$file);
		print FILE "$svg";
		close(FILE);
	}
	return;
}

sub getArea {
	my $la = $_[0];
	my $file = $dir."areas/$la.json";
	my (%data,@lines,$jsonblob);
	
	if(!-e $file){
		print "Downloading JSON for $la\n";
		`wget -q --no-check-certificate -O "$file" "https://findthatpostcode.uk/areas/$la.json"`;
		sleep 1;
	}

	# Get the conversion file from UTLA to LA
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	$jsonblob = JSON::XS->new->utf8->decode(join("\n",@lines));
	return %{$jsonblob};
}


sub processDeaths {
	
	my ($file,$ofile,$i,@lines,$line,$latmp,$wk,%headers,$json,$id,$v,$date,%deaths,@cols,$latestversion,$la);
	$latestversion = 0;
	print "Processing deaths...";
	@lines = `wget -q --no-check-certificate -O- "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions"`;
	foreach $line (@lines){
		if($line =~ /<a href="\/datasets\/weekly-deaths-local-authority\/editions\/time-series\/versions\/([0-9]*)"><h2 [^\>]*>([^\)]*)([^\<]*)<\/h2>/){
			$v = $1+0;
			$ofile = $dir."temp/deaths-version-$v.csv";
			if($v > $latestversion && -s $ofile > 0){
				$latestversion = $v;
				$date = tidyDate($2);
				$file = $ofile;
			}
		}
	}
	print " version $latestversion ";
	$deathurl = "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions/$latestversion";
	# Set default values
	%deaths = {};
	for($i = 0; $i < @las; $i++){
		$la = $las[$i];
		if(!$deaths{$la}){
			$deaths{$la} = { 'date'=>$date,'all-causes'=>0,'covid-19'=>0,'weeks'=>{} };
		}
	}
	
	
	if(-e $file && -s $file > 0){
		open(FILE,$file);
		$i = 0;
		while (my $line = <FILE>) {
			chomp $line;
			if($i == 0){
				%headers = getHeaders($line);
			}
			if($i > 0 && $line =~ /\,/){
				(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
				$latmp = $cols[$headers{'admin-geography'}];
				
				#{"date":"2020-09-24","week":{"label":"Week 37","all":16,"covid-19":0},"total":{"all":819,"covid-19":110}
				$wk = $cols[$headers{'week'}];


				#v4_1,Data Marking,calendar-years,time,admin-geography,geography,week-number,week,cause-of-death,causeofdeath,place-of-death,placeofdeath,registration-or-occurrence,registrationoroccurrence
				if($cols[$headers{'registration-or-occurrence'}] eq "registrations"){
					if(!$deaths{$latmp}{'weeks'}{$wk}){
						$deaths{$latmp}{'weeks'}{$wk} = {'covid-19'=>0,'all-causes'=>0};
					}
					if($cols[$headers{'cause-of-death'}] eq "all-causes"){
						$deaths{$latmp}{'all-causes'} += $cols[$headers{'v4_1'}];
						$deaths{$latmp}{'weeks'}{$wk}{'all-causes'} += $cols[$headers{'v4_1'}];
					}elsif($cols[$headers{'cause-of-death'}] eq "covid-19"){
						$deaths{$latmp}{'covid-19'} += $cols[$headers{'v4_1'}];
						$deaths{$latmp}{'weeks'}{$wk}{'covid-19'} += $cols[$headers{'v4_1'}];
					}
				}

			}
			$i++;
		}
		close(FILE);
	}
	print "done\n";
	return %deaths;
}


sub getHeaders {
	my ($str,@header,$c,%headers);
	$str = $_[0];
	# Split the headers and tidy
	$str =~ s/[\n\r]//g;
	(@header) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$str);
	for($c = 0; $c < @header; $c++){
		$header[$c] =~ s/(^\"|\"$)//g;
		$headers{$header[$c]} = $c;
	}
	return %headers;
}


sub tidyDate {
	my ($m,$mm,$dd,$yy,$ts);
	my $str = $_[0];
	my @months = ('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	my @monthslong = ('January','February','March','April','May','June','July','August','September','October','November','December');
	
	if($str =~ /([0-9]{2}:[0-9]{2}:[0-9]{2}) GMT/){
		$ts = "T".$1."Z";
	}else{
		$ts = "";
	}
	
	if($str =~ /([0-9]{1,2}) ([A-Za-z]*) ([0-9]{4})/){
		$dd = $1;
		$mm = $2;
		$yy = $3;
		for($m = 0; $m < @months; $m++){
			if($mm eq $months[$m]){ $mm = sprintf("%02d",$m+1); }
		}
		for($m = 0; $m < @monthslong; $m++){
			if($mm eq $monthslong[$m]){ $mm = sprintf("%02d",$m+1); }
		}
		$str = "$yy-$mm-$dd";
	}
	
	return $str.$ts;
}



# Get the Julian Date from an ISO formatted date string
sub getJulianFromISO {
	my ($dd,$tt,$iso,$y,$m,$d,$h,$mn,$sc);
	$iso = $_[0];
	$dd = substr($iso,0,10);
	$tt = substr($iso,11);
	($y,$m,$d) = split(/\-/,$dd);
	($h,$mn,$sc) = split(/\:/,$tt);
	$tz = substr($sc,2,length($sc));
	$sc = substr($sc,0,2);
	return (getJulianDate($y,$m,$d,$h,$mn,$sc)-(getTimeZoneOffset($tz)/24.0));
}

sub getTimeZoneOffset {
	return 0;
}

sub getTimeZones {

	my $type = $_[0];
	my $tz = $_[1];
	my $tz_m;
	my $output = "";
	my %tzs = ("A",1,"ACDT",10.5,"ACST",9.5,"ADT",-3,"AEDT",11,"AEST",10,"AKDT",-8,"AKST",-9,"AST",-4,"AWST",8,"B",2,"BST",1,"C",3,"CDT",-5,"CEDT",2,"CEST",2,"CET",1,"CST",-6,"CXT",7,"D",4,"E",5,"EDT",-4,"EEDT",3,"EEST",3,"EET",2,"EST",-5,"F",6,"G",7,"GMT",0,"H",8,"HAA",-3,"HAC",-5,"HADT",-9,"HAE",-4,"HAP",-7,"HAR",-6,"HAST",-10,"HAT",-2.5,"HAY",-8,"HNA",-4,"HNC",-6,"HNE",-5,"HNP",-8,"HNR",-7,"HNT",-3.5,"HNY",-9,"I",9,"IST",9,"IST",1,"JST",9,"K",10,"L",11,"M",12,"MDT",-6,"MESZ",2,"MEZ",1,"MST",-7,"N",-1,"NDT",-2.5,"NFT",11.5,"NST",-3.5,"O",-2,"P",-3,"PDT",-7,"PST",-8,"Q",-4,"R",-5,"S",-6,"T",-7,"U",-8,"UTC",0,"UT",0,"V",-9,"W",-10,"WEDT",1,"WEST",1,"WET",0,"WST",8,"X",-11,"Y",-12,"Z",0);

	if($type eq "options"){
		if(!$data{'timezone'}){ $data{'timezone'} = $user{$data{'blog'}}{'timezone'} }
		foreach $tz (sort(keys(%tzs))){
			if($data{'timezone'} eq $tz){ $output .= "<option value=\"$tz\" selected>$tz\n"; }
			else{ $output .= "<option value=\"$tz\">$tz\n"; }
		}
	}elsif($type eq "RFC-822"){
		$tz = $tzs{$tz};
		$output = roundInt($tz);
		$tz_m = ($tz-floorInt($tz))*60;
		$output = sprintf("%+03d%02d",$tz,$tz_m);
	}else{
		if($tzs{$type}){ $output = $tzs{$type}; }
		else{ $output = 0; }
	}
	return $output;
}

sub roundInt {
	if($_[0] < 0){ return int($_[0] - .5); }
	else{ return int($_[0] + .5); }
}

sub floorInt {
	return int($_[0]);
}

sub getJulianDate {
	my $y = $_[0];
	my $m = $_[1];
	my $d = $_[2];
	my $h = $_[3];
	my $mn = $_[4];
	my $jy;
	my $jm;
	my $intgr;
	my $gregcal;
	my $ja;
	my $dayfrac;
	my $frac;
	my $jd;

	if(!$y || $y==0){ return ((time)/86400.0 + 2440587.5); }
	
	if(!$m || !$d){
		if($y){ $thistime = $y; }
		else{ $thistime = time; }
		# System time in seconds since 1/1/1970 00:00
		# To get Julian Date we just divide this by number of seconds
		# in a day and add Julian Date for start of system time
		return (($thistime)/86400.0 + 2440587.5);		

	}

	if($y == 1582 && $m == 10 && $d > 4 && $d < 15 ) {
		# The dates 5 through 14 October, 1582, do not exist in the Gregorian system!
		return ((time)/86400.0 + 2440587.5); 
	}

	if($y < 0){ $y = $y + 1; } # B.C.
	if($m > 2) {
		$jy = $y;
		$jm = $m + 1;
	}else{
		$jy = $y - 1;
		$jm = $m + 13;
	}
	$intgr = int(int(365.25*$jy) + int(30.6001*$jm) + $d + 1720995);

	#check for switch to Gregorian calendar
	$gregcal = 588829;
	if( ($d + 31*($m + 12*$y)) >= $gregcal ) {
		$ja = int(0.01*$jy);
		$intgr = $intgr + 2 - $ja + int(0.25*$ja);
	}

	#correct for half-day offset
	$dayfrac = ($h/24.0) - 0.5;
	if( $dayfrac < 0.0 ) {
		$dayfrac += 1.0;
		$intgr = $intgr - 1;
	}

	#now set the fraction of a day
	$frac = $dayfrac + ($mn + 0/60.0)/60.0/24.0;

	#round to nearest second
	$jd = ($intgr + $frac)*100000;
	$jd = int($jd+0.5);

	return ($jd/100000.0);
}

