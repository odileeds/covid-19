#!/usr/bin/perl

use Data::Dumper;
use POSIX qw(strftime);
use JSON::XS;
use lib "./lib/";
use ODILeeds::Graph;
use ODILeeds::DateTime;


# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1/g; }
else{ $dir = "./"; }

# Create a DateTime object
$datetime = ODILeeds::DateTime->new();


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


# Get the names data
open(FILE,$dir."names.json");
@lines = <FILE>;
close(FILE);
%names = %{JSON::XS->new->utf8->decode(join("\n",@lines))};



# Get local restrictions
$url = "https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/commonslibrary-coronavirus-restrictions-data.csv";
$file = $dir."commonslibrary-coronavirus-restrictions-data.csv";
$head = $dir."commonslibrary-coronavirus-restrictions-data.head";
`curl -sI "$url" > $head`;
`curl -s "$url" > $file`;
open(FILE,$head);
@headlines = <FILE>;
close(FILE);
$strhead = join("",@headlines);
$strhead =~ /Last-Modified: (.*)\n/i;
$restrictionsdate = $datetime->parseISO($1);
open(FILE,$file);
@lines = <FILE>;
close(FILE);
$i = 0;
%restrictions;
@header;
%headerlookup;
foreach $line (@lines){
	$line =~ s/[\n\r]//g;

	if($i == 0){
		@header = split(/\,/,$line);
		for($j = 0; $j < @header; $j++){
			$header[$j] =~ s/^l_//g;
			$headerlookup{$header[$j]} = $j;
		}
	}else{
		@cols = split(/\,/,$line);
		$la = "";
		if($cols[$headerlookup{'restrictions'}] eq "National"){
			# Loop over all authorities finding any with the country letter
			foreach $l (keys(%names)){
				if($l =~ /^$cols[$headerlookup{'Country'}]/){
					# If we've not created an empty holder do that now
					if(!$restrictions{$l}){ $restrictions{$l} = {}; }
					for($j = 0; $j < @cols; $j++){
						# If we haven't set the restriction do that (don't over-write any that have already been processed)
						if(!$restrictions{$l}{$header[$j]}){
							$restrictions{$l}{$header[$j]} = $cols[$j];
						}
					}
				}
			}
		}
		foreach $l (keys(%names)){
			if($names{$l}{'name'} eq $cols[$headerlookup{'Category'}]){
				$la = $l;
			}
		}
		if(!$la){
			print "Didn't find $cols[$headerlookup{'Category'}]\n";
		}else{
			if(!$restrictions{$la}){ $restrictions{$la} = {}; }
			for($j = 0; $j < @cols; $j++){
				$restrictions{$la}{$header[$j]} = $cols[$j];
			}
		}
	}
	$i++;
}

# Get the death data
%deaths = processDeaths();

$start = 5;

for($i = 0; $i < @las; $i++){
	$la = $las[$i];
	$url = "https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=ltla;areaCode=$la&structure=%7B%22date%22:%22date%22,%22areaName%22:%22areaName%22,%22areaCode%22:%22areaCode%22,%22newCasesBySpecimenDate%22:%22newCasesBySpecimenDate%22,%22cumCasesBySpecimenDate%22:%22cumCasesBySpecimenDate%22,%22cumCasesBySpecimenDateRate%22:%22cumCasesBySpecimenDateRate%22%7D&format=json";
	$file = $dir."raw/$la.json";
	$head = $dir."raw/$la.head";
	
	# Find the age of the file in hours
	if(-e $head){
		open(FILE,$head);
		@headlines = <FILE>;
		close(FILE);
		$strhead = join("",@headlines);
		$strhead =~ /Last-Modified: (.*)\n/;
		$jd = $datetime->getJulianFromISO($datetime->parseISO($1));
		$now = $datetime->getJulianDate();
		$diff = (($now-$jd)*24);
	}else{
		$diff = 24;
	}


	print "$la (".sprintf("%0.1f",$diff)." hours old):\n";
	# If it is older than 2 hours we grab a new copy
	if($diff > 2){
		print "\tGetting URL $url\n";
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
			@lines = split(/\n/,$str);
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
	$casesdate = $datetime->parseISO($1);
	
	
	# Find number of lines
	if($str =~ /"length":([0-9]+)/){
		$len = $1;
		print "\t$1 days\n";
	}else{
		$len = 0;
		print "\tERROR: No lines\n";
	}
	%data = getArea($la);

	
	$file = $dir."../dashboard/data/$la.json";
	$names{$la} = $data{'data'}{'attributes'}{'name'};

	open(FILE,">",$file);
	print FILE "{\n";
	print FILE "\t\"name\":\"$names{$la}\",\n";
	print FILE "\t\"population\": ".($pop{$la}||0).",\n";
	if($restrictions{$la}){
		print FILE "\t\"restrictions\":{\n";
		print FILE "\t\t\"src\": \"https://visual.parliament.uk/research/visualisations/coronavirus-restrictions-map/\",\n";
		print FILE "\t\t\"updated\": \"$restrictionsdate\",\n";
		print FILE "\t\t\"url\": {\"local\":\"$restrictions{$la}{'url_local'}\",\"national\":\"$restrictions{$la}{'url_national'}\"},\n";
		print FILE "\t\t\"local\": {";
		$r = 0;
		#l_local_ruleofsix,l_local_householdmixing,l_local_raves,l_local_stayinglocal,l_local_stayinghome,l_local_notstayingaway,l_local_businessclosures,l_local_openinghours,l_national_ruleofsix,l_national_householdmixing,l_national_raves,l_national_stayinglocal,l_national_stayinghome,l_national_notstayingaway,l_national_businessclosures,l_national_openinghours,l_national_gatherings
		foreach $restrict (sort(keys(%{$restrictions{$la}}))){
			if($restrict =~ /local_/ && $restrictions{$la}{$restrict} eq "1"){
				if($r > 0){ print FILE ","; }
				$restrict =~ s/^local\_//;
				print FILE "\n\t\t\t\"$restrict\": true";
				$r++;
			}
		}
		if($r > 0){
			print FILE "\n\t\t";
		}
		print FILE "},\n";
		print FILE "\t\t\"national\": {\n";
		$r = 0;
		foreach $restrict (sort(keys(%{$restrictions{$la}}))){
			if($restrict =~ /national_/ && $restrictions{$la}{$restrict} eq "1"){
				if($r > 0){ print FILE ",\n"; }
				$restrict =~ s/^national\_//;
				print FILE "\t\t\t\"$restrict\": true";
				$r++;
			}
		}
		print FILE "\n\t\t}\n";
		print FILE "\t},\n";
	}
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
			#print "line $l - $lines[$l]\n";
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
	
	$file = $dir."../dashboard/data/$la.json";
	# Get the populations data
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	%ladata = %{JSON::XS->new->utf8->decode(join("\n",@lines))};

	$n = @{$ladata{'cases'}{'days'}};
	
	for($i = $n-1, $j = 0; $i>= 0; $i--,$j++){
		$raw[$j] = {'x'=>(($datetime->getJulianFromISO($ladata{'cases'}{'days'}[$i]{'date'}) + 0  - 2440587.5)*86400),'y'=>($ladata{'cases'}{'days'}[$i]{'day'}||0)};
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
		$file = $dir."../dashboard/svg/$la.svg";
		$graph = ODILeeds::Graph->new();
		
		# Add lines denoting levels
		@levels = ({'v'=>7,'title'=>'Widespread'},{'v'=>4,'title'=>'Substantial'},{'v'=>1,'title'=>'Moderate'});
		for($l = 0; $l < @levels; $l++){
			$graph->addSeries({'title'=>$levels[$l]{'title'},
					'id'=>$la.'-level-'.$l,
					'data'=>[{'x'=>$smooth[0]{'x'},'y'=>$levels[$l]{'v'}},{'x'=>$recent[@recent-1]{'x'},'y'=>$levels[$l]{'v'}}],
					'raw'=>[{'x'=>$smooth[0]{'x'},'y'=>$levels[$l]{'v'}},{'x'=>$recent[@recent-1]{'x'},'y'=>$levels[$l]{'v'}}],
					'color'=>'#fff',
					'stroke'=>1,
					'strokehover'=>3,
					'stroke-dasharray'=>'3,3',
					'opacity'=>0.3,
					'fill-opacity'=>0.3,
					'line'=>1
			});
		}
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
		$graph->addSeries({'title'=>'Recent cases',
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
				$date = $datetime->parseISO($2);
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




