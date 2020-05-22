#!/usr/bin/perl

use Data::Dumper;
use POSIX qw(strftime);
use JSON::XS;
use lib "./lib/";
use ODILeeds::HexJSON;

# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1/g; }
else{ $dir = "./"; }

%LA;
%headers;
%LAlast;
$mostrecent = "2000-01-01";
$mindate = "3000-01-01";
$maxdate = "2000-01-01";




# Get the conversion file from UTLA to LA
open(FILE,$dir."conversion.json");
@lines = <FILE>;
close(FILE);
$conversion = JSON::XS->new->utf8->decode(join("\n",@lines));
%conv = %{$conversion};
%utla;
foreach $la (keys(%conv)){
	#print "$la - $conv{$la}{'id'}\n";
	if(!$utla{$conv{$la}{'id'}}){
		%{$utla{$conv{$la}{'id'}}} = ('name'=>$conv{$la}{'n'},'la'=>());
	}
	push(@{$utla{$conv{$la}{'id'}}->{'la'}},$la);
}


# Get the conversion file from UTLA to LA
open(FILE,$dir."populations.json");
@lines = <FILE>;
close(FILE);
$pop = JSON::XS->new->utf8->decode(join("\n",@lines));
%pop = %{$pop};


# Get the CSV from Tom White
$url = "https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv";
@lines = `wget -q --no-check-certificate -O- "$url"`;
if(@lines > 0){


	# Split the headers and tidy
	$lines[0] =~ s/[\n\r]//g;
	(@header) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[0]);
	for($c = 0; $c < @header; $c++){
		$header[$c] =~ s/(^\"|\"$)//g;
		$headers{$header[$c]} = $c;
	}

	for($i = 1 ; $i < @lines; $i++){
		chomp($lines[$i]);
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
		$cols[$headers{'Area'}] =~ s/(^\"|\"$)//g;
		if($cols[$headers{'TotalCases'}] =~ /[\s\D]/){ $cols[$headers{'TotalCases'}] = "\"$cols[$headers{'TotalCases'}]\""; }
		$d = $cols[$headers{'Date'}];
		#$d =~ s/\-//g;
		
		if($d lt $mindate){ $mindate = $d; }
		if($d gt $maxdate){ $maxdate = $d; }
		
		$id = $cols[$headers{'AreaCode'}];
		$oid = $id;
		$name = $cols[$headers{'Area'}];
		
		if($id eq "E06000052" || $id eq "E06000053"){ $id = "E06000052-3"; $name = "Cornwall and Isles of Scilly" }
		#if($id eq "E09000001" || $id eq "E09000012"){ $id = "E09000001-12"; $name = "Hackney and City of London"; }
		
		if(!$LA{$id}){ $LA{$id} = {'name'=>'','country'=>$cols[$headers{'Country'}],'dates'=>{}}; }
		# Only add the date if it has a value
		if($cols[$headers{'TotalCases'}] ne ""){
			if(!$LA{$id}{'dates'}{$d} || $LA{$id}{'dates'}{$d} eq ""){ $LA{$id}{'dates'}{$d} = 0; }
			$LA{$id}{'dates'}{$d} += $cols[$headers{'TotalCases'}];
		}
		$LA{$id}{'name'} = $name;
		
		if($cols[$headers{'Date'}] gt $mostrecent){ $mostrecent = $cols[$headers{'Date'}]; }
	}
	
	@dates = ();
	$min = getJulianFromISO($mindate);
	$max = getJulianFromISO($maxdate);

	$dt = getJulianFromISO($mindate);

	print "$mindate - $maxdate ".$dt."\n";
	
	for($dt = $min; $dt <= $max; $dt++){
		push(@dates,getDate($dt,"%Y-%m-%d"));
	}
	
	$json = "";
	for $id (sort(keys(%LA))){
		if($id ne ""){

			@dates = sort(keys(%{$LA{$id}{'dates'}}));
			$n = @dates;

			if($json){ $json .= ",\n";}
			$json .= "\t\t\"$id\":{";
			$json .= "\"n\":\"$LA{$id}{'name'}\",";
			$json .= "\"c\":\"$LA{$id}{'country'}\",";
			$json .= "\"mindate\":\"$dates[0]\",";
			$json .= "\"maxdate\":\"".$dates[$n-1]."\",";
			$json .= "\"v\":[";

			$min = getJulianFromISO($dates[0]);
			$max = getJulianFromISO($dates[$n-1]);
			$dt = getJulianFromISO($dates[0]);
			
			for($i = 0; $dt <= $max; $i++, $dt++){
				if($i > 0){
					$json .= ",";
				}
				$d = getDate($dt,"%Y-%m-%d");
				$json .= ($LA{$id}{'dates'}{$d} ? $LA{$id}{'dates'}{$d} : "null");
				if($utla{$id}){
					$nla = @{$utla{$id}->{'la'}};
					foreach $convla (@{$utla{$id}->{'la'}}){
						if($pop{$id}){
							$LAlast{$convla} = {'percapita'=>int($LA{$id}{'dates'}{$d}*1e5/$pop{$id} + 0.5),'casesUTLA'=>$LA{$id}{'dates'}{$d},'cases'=>$LA{$id}{'dates'}{$d}/$nla,'UTLA'=>$LA{$id}{'name'}};
						}else{
							print "No population for $id\n";
						}
					}
				}else{
					if($pop{$id}){
						$LAlast{$id} = {'percapita'=>int($LA{$id}{'dates'}{$d}*1e5/$pop{$id} + 0.5),'cases'=>$LA{$id}{'dates'}{$d},'casesUTLA'=>$LA{$id}{'dates'}{$d}};
					}else{
						print "No population for $id\n";
					}
				}
			}

			$json .= $dates."]";
			$json .= "}";
		}
	}
	print "Save to $dir/utla.json\n";
	open(FILE,">","$dir/utla.json");
	print FILE "{\n";
	print FILE "\t\"src\":{\"name\":\"Tom White\",\"url\":\"https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv\"},\n";
	print FILE "\t\"lastupdate\":\"".$mostrecent."\",\n";
	print FILE "\t\"data\": {\n";
	print FILE $json."\n";
	print FILE "\t}\n";
	print FILE "}";
	close(FILE);
}else{
	print "Empty file";
}



%svg;


open(FILE,$dir."../hexmap.html");
@html = <FILE>;
close(FILE);



# Create hexmaps
$hj = ODILeeds::HexJSON->new();
# Load the HexJSON
$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
# Add the data
$hj->addData(%LAlast);
# Set primary value keys
$hj->setPrimaryKey('percapita');
$hj->setKeys('percapita','UTLA');
# Set the colour scale to use
$hj->setColourScale('Viridis');
# Create the SVG output
$svg{'percapita'} = $hj->map(('width'=>'480'));

# Set primary value keys
$hj->setPrimaryKey('cases');
$hj->setKeys('cases','casesUTLA','UTLA');
# Create the SVG output
$svg{'cases'} = $hj->map(('width'=>'480'));



################################
# Read in ONS death data
%deaths;
$file = $dir."temp/deaths.csv";
if(!-e $file){
	$url = "https://download.ons.gov.uk/downloads/datasets/weekly-deaths-local-authority/editions/time-series/versions/4.csv";
	`wget -q --no-check-certificate -O "$file" "$url"`;
	
}
open(FILE,$file);
$i = 0;
while (my $line = <FILE>) {
    chomp $line;
	if($i > 0 && $i < 160000 && $line =~ /\,/){
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
		#v4_1,Data Marking,calendar-years,time,admin-geography,geography,week-number,week,cause-of-death,causeofdeath,place-of-death,placeofdeath,registration-or-occurrence,registrationoroccurrence
		if(!$deaths{$cols[4]}){
			$deaths{$cols[4]} = { 'all-causes'=>0,'covid-19'=>0 };
		}
		if($cols[12] eq "registrations"){
			if($cols[8] eq "all-causes"){
				$deaths{$cols[4]}{'all-causes'} += $cols[0];
			}elsif($cols[8] eq "covid-19"){
				$deaths{$cols[4]}{'covid-19'} += $cols[0];
			}
		}
	}
	$i++;
}
foreach $id (keys(%deaths)){
	if($pop{$id}){
		# Normalise the numbers to per capita figures
		$deaths{$id}{'covid-19-percapita'} = int($deaths{$id}{'covid-19'}*1e5/$pop{$id} + 0.5);
		$deaths{$id}{'all-causes-percapita'} = int($deaths{$id}{'all-causes'}*1e5/$pop{$id} + 0.5);
	}else{
		$deaths{$id}{'covid-19-percapita'} = 0;
		$deaths{$id}{'all-causes-percapita'} = 0;
	}

}

# Add the data
$hj->addData(%deaths);
# Set primary value keys
$hj->setPrimaryKey('covid-19-percapita');
$hj->setKeys('covid-19','covid-19-percapita');
# Create the SVG output
$svg{'deaths-covid'} = $hj->map(('width'=>'480'));



# Set primary value keys
$hj->setPrimaryKey('all-causes-percapita');
$hj->setKeys('all-causes','all-causes-percapita');
# Create the SVG output
$svg{'deaths-all'} = $hj->map(('width'=>'480'));




#################################################
# Read in keyworker data from ONS
%keyworkers;
open(FILE,$dir."ons-table19-keyworkers-2019.csv");
@lines = <FILE>;
close(FILE);
# Split the headers and tidy
$lines[0] =~ s/[\n\r]//g;
#LA,LAD18CD,Population (thousand),Percent
for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
	$keyworkers{$cols[1]} = { 'keyworkers'=>$cols[3],'population'=>$cols[2] };
}
# Create key worker map - the data are for 
$hj->load('../resources/uk-local-authority-districts.hexjson');
$hj->addData(%keyworkers);
$hj->setPrimaryKey('keyworkers');
$hj->setKeys('keyworkers');
$hj->setColourScale('Viridis');
$svg{'keyworkers'} = $hj->map(('width'=>'480'));



################################
# Build HTML page
@htmloutput;
$inhexmap = 0;
for($i = 0; $i < @html; $i++){
	if(!$inhexmap){
		push(@htmloutput,$html[$i]);
	}
	if($html[$i] =~ /\<\!-- Begin hexmap ([^\s]*) --\>/){
		print "Adding $1 svg\n";
		push(@htmloutput,$svg{$1});
		$inhexmap = 1;
	}
	if($html[$i] =~ /\<\!-- End hexmap /){
		push(@htmloutput,$html[$i]);
		$inhexmap = 0;
	}
}

open(FILE,">",$dir."../hexmap.html");
print FILE @htmloutput;
close(FILE);

# Save SVG files
foreach $t (keys(%svg)){
	open(FILE,">",$dir."local-authorities-".$t.".svg");
	print FILE $svg{$t};
	close(FILE);
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

sub getUnixDate {
	my $thistime = $_[0];
	my $thetime = "";
	my $timezone = "";
	my @output;
	
	# Check supplied timezone
	if($thistime =~ /\-/){ 
		($thetime,$timezone) = split(/-/,$thistime);
	}else{ $thetime = $thistime; $timezone = "UTC"; }

	if($thetime <= 0){
		my ($sec,$min,$hour,$mday,$mon,$year,$wday) = (localtime(time))[0,1,2,3,4,5,6];
		if($year < 1900){ $year += 1900; }
		$mon = sprintf("%02d",($mon+1));
		return ($sec,$min,$hour,$mday,$mon,$year,$wday,"UT");
	}

	# The following routine is adapted from the DJM()
	# function of Toby Thurston's Cal::Date
	# http://www.wildfire.dircon.co.uk/
	# Add on the timezone offset as a fraction of a day
	# this assumes that the input time is in UT
	my $jd  = $thetime + getTimeZones($timezone)/24.0;

	# jd0 is the Julian number for noon on the day in question
	# for example   mjd  jd jd0   === mjd0
	#   3.0  ...3.5  ...4.0   === 3.5
	#   3.3  ...3.8  ...4.0   === 3.5
	#   3.7  ...4.2  ...4.0   === 3.5
	#   3.9  ...4.4  ...4.0   === 3.5
	#   4.0  ...4.5  ...5.0   === 4.5
	my $jd0 = int($jd+0.5);

	# next we convert to Julian dates to make the rest of the maths easier.
	# JD1867217 = 1 Mar 400, so $b is the number of complete Gregorian
	# centuries since then.  The constant 36524.25 is the number of days
	# in a Gregorian century.  The 0.25 on the other constant ensures that
	# $b correctly rounds down on the last day of the 400 year cycle.
	# For example $b == 15.9999... on 2000 Feb 29 not 16.00000.
	my $b = int(($jd0-1867216.25)/36524.25);

	# b-int(b/4) is the number of Julian leap days that are not counted in
	# the Gregorian calendar, and 1402 is the number of days from 1 Jan 4713BC
	# back to 1 Mar 4716BC.  $c represents the date in the Julian calendar
	# corrected back to the start of a leap year cycle.
	my $c = $jd0+($b-int($b/4))+1402;

	# d is the whole number of Julian years from 1 Mar 4716BC to the date
	# we are trying to find.
	my $d = int(($c+0.9)/365.25);

	# e is the number of days from 1 Mar 4716BC to 1 Mar this year
	# using the Julian calendar
	my $e = 365*$d+int($d/4);

	# c-e is now the remaining days in this year from 1 Mar to our date
	# and we need to work out the magic number f such that f-1 == month
	my $f = int(($c-$e+123)/30.6001);

	# int(f*30.6001) is the day of the start of the month
	# so the day of the month is the difference between that and c-e+123
	my $day = $c-$e+123-int(30.6001*$f);

	# month is now f-1, except that Jan and Feb are f-13
	# ie f 4 5 6 7 8 9 10 11 12 13 14 15
	#m 3 4 5 6 7 8  9 10 11 12  1  2
	my $month = ($f-2)%12+1;

	# year is d - 4716 (adjusted for Jan and Feb again)
	my $year = $d - 4716 + ($month<3);

	# finally work out the hour (if any)
	my $hour = 24 * ($jd+0.5-$jd0);
	my $min = 0;
	my $sec = 0;
	if ($hour == 0) {
		#@output = (0,0,0,$day,$month,$year,0);
		#return @output;
	} else {
		$hour = int($hour*60+0.5)/60;   # round to nearest minute
		$min = int(0.5+60 * ($hour - int($hour)));
		$hour = int($hour);
		#@output = (0,$min,$hour,$day,$month,$year,0);
		#return @output;
	}
	$month = sprintf("%02d",($month));
	
	# work out the day of the week
	# Note that this only works back until the change in the calendar
	# as a number of days not divisible by seven were removed
	my $diff = $jd - 2453240.5;
	if($diff >= 0){ $diff += 1.0; }
	my $wday = $diff % 7;
	
	return ($sec,$min,$hour,$day,$month,$year,$wday,$timezone);
}


sub getDate {
	my $mytime = $_[0];
	my $format = $_[1];
	my $mytime2;
	my $tz;
	my $sec;
	my $min;
	my $hour;
	my $mday;
	my $mday2;
	my $mon;
	my $year;
	my $wday;
	my $ext;
	my $date;
	my $newtz;
	my $ampm;
	my $hour12;
	my $hour24;
	my $mins;
	my $shortampm;
	local ($shorttime,$longtime);
	
	my @days   = ('Sun','Mon','Tue','Wed','Thu','Fri','Sat');
	my @longdays   = ('Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday');
	my @months = ('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	my @monthslong = ('January','February','March','April','May','June','July','August','September','October','November','December');

	# Get all the date variables
	$mytime2 = $mytime;

	($sec,$min,$hour,$mday,$mon,$year,$wday,$tz) = (&getUnixDate($mytime))[0,1,2,3,4,5,6,7];

	if(!$tz){ $tz = "UT"; }

	# Format the time.
	$hour24 = sprintf("%02d",$hour);
	$mins = sprintf("%02d",$min);
	$ampmmins = $mins;
	$ampm = ($hour >= 12) ? "PM" : "AM";
	if($hour == 0 && $min == 0){
		$ampm = " midnight";
		$ampmmins = "";
	}
	if($hour == 12 && $min == 0){
		$ampm = " noon";
		$ampmmins = "";
	}
	$hour12 = ($hour > 12) ? $hour-12 : $hour;
	$shorttime = $hour24.($mins ? ":".$mins : "");
	$longtime = $shorttime.($sec ? ":".sprintf("%02d",$sec) : "");
	$shortampm = $hour12.($ampmmins ? ":".$ampmmins : "").$ampm;

	# Add th,st,nd,rd
	if($mday%10 == 1 && $mday != 11){ $ext = "st"; }
	elsif($mday%10 == 2 && $mday != 12){ $ext = "nd"; }
	elsif($mday%10 == 3 && $mday != 13){ $ext = "rd"; }
	else{ $ext = "th"; }

	$mon = sprintf("%02d",$mon);
	$mday2 = sprintf("%02d",$mday);
	# Format the date.
	if($format){
		$date = $format;
		$date =~ s/\%D/$longdays[$wday]/g;
		$date =~ s/\%a/$days[$wday]/g;
		$date =~ s/\%d/$mday2/g;
		$date =~ s/\%e/$mday/g;
		$date =~ s/\%Y/$year/g;
		$date =~ s/\%b/$months[$mon-1]/g;
		$date =~ s/\%B/$monthslong[$mon-1]/g;
		$date =~ s/\%m/$mon/g;
		$date =~ s/\%T/$longtime/g;
		$date =~ s/\%t/$shorttime/g;
		$date =~ s/\%P/$shortampm/g;
		$date =~ s/\%p/$ampm/g;
		$date =~ s/\%H/$hour24/g;
		$date =~ s/\%I/$hour12/g;
		$date =~ s/\%M/$mins/g;
		$date =~ s/\%x/$ext/g;
		$date =~ s/\%Z/$tz/g;
		$newtz = getTimeZones("RFC-822",$tz);
		$date =~ s/\%z/$newtz/g;
	}else{	$date = "$days[$wday] $mday$ext $months[$mon-1] $year ($shorttime)"; }
	return $date;
}
