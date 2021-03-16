package ODILeeds::DateTime;

use strict;
use warnings;

sub new {
    my ($class, %args) = @_;
 
    my $self = \%args;
 
    bless $self, $class;
 
    return $self;
}


sub parseISO {

	my ($self, $str) = @_;
	my ($m,$mm,$dd,$yy,$ts);

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
		$str = sprintf("%04d",$yy)."-".sprintf("%02d",$mm)."-".sprintf("%02d",$dd);
	}
	
	return $str.$ts;
}

# Get the Julian Date from an ISO formatted date string
sub getJulianFromISO {
	
	my ($self, $iso) = @_;

	my ($dd,$tt,$y,$m,$d,$h,$mn,$sc,$tz);

	$dd = substr($iso,0,10);
	if(length($iso) > 10){
		$tt = substr($iso,11);
	}else{
		$tt = "";
	}
	($y,$m,$d) = split(/\-/,$dd);
	if($tt){
		($h,$mn,$sc) = split(/\:/,$tt);
	}else{
		$h = 0;
		$mn = 0;
		$sc = 0;
	}
	if($sc){
		$tz = substr($sc,2,length($sc));
		$sc = substr($sc,0,2);
	}else{
		$tz = "";
		$sc = 0;
	}
	return ($self->getJulianDate($y,$m,$d,$h,$mn,$sc)-(getTimeZoneOffset($tz)/24.0));
}

sub getTimeZoneOffset {
	return 0;
}

sub getTimeZones {
	my ($self, $type, $tz) = @_;
	my $tz_m;
	my $output = "";
	my %tzs = ("A",1,"ACDT",10.5,"ACST",9.5,"ADT",-3,"AEDT",11,"AEST",10,"AKDT",-8,"AKST",-9,"AST",-4,"AWST",8,"B",2,"BST",1,"C",3,"CDT",-5,"CEDT",2,"CEST",2,"CET",1,"CST",-6,"CXT",7,"D",4,"E",5,"EDT",-4,"EEDT",3,"EEST",3,"EET",2,"EST",-5,"F",6,"G",7,"GMT",0,"H",8,"HAA",-3,"HAC",-5,"HADT",-9,"HAE",-4,"HAP",-7,"HAR",-6,"HAST",-10,"HAT",-2.5,"HAY",-8,"HNA",-4,"HNC",-6,"HNE",-5,"HNP",-8,"HNR",-7,"HNT",-3.5,"HNY",-9,"I",9,"IST",9,"IST",1,"JST",9,"K",10,"L",11,"M",12,"MDT",-6,"MESZ",2,"MEZ",1,"MST",-7,"N",-1,"NDT",-2.5,"NFT",11.5,"NST",-3.5,"O",-2,"P",-3,"PDT",-7,"PST",-8,"Q",-4,"R",-5,"S",-6,"T",-7,"U",-8,"UTC",0,"UT",0,"V",-9,"W",-10,"WEDT",1,"WEST",1,"WET",0,"WST",8,"X",-11,"Y",-12,"Z",0);
	
	if(!$type){
		$type = "";
	}
	if($type eq "RFC-822"){
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

sub getJulianDate {
	my ($self,$y,$m,$d,$h,$mn) = @_;
	my ($jy,$jm,$intgr,$gregcal,$ja,$dayfrac,$frac,$jd,$thistime);

	if(!$y || $y==0){ return ((time)/86400.0 + 2440587.5); }

	if(!$h){ $h = 0; }
	if(!$mn){ $mn = 0; }
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


sub convertJulianToUnix {
	my ($self, $jd) = @_;
	
	if(!$jd){
		return time;
	}
	
	return ($jd - 2440587.5)*86400;
}

sub convertJulianToDate {
	my ($self, $thistime) = @_;
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
	my $hh = 24 * ($jd+0.5-$jd0);
	my $hour = 0;
	my $min = 0;
	my $sec = 0;
	if ($hh == 0) {
		#@output = (0,0,0,$day,$month,$year,0);
		#return @output;
	}else{
		$hour = int($hh);
		$hh -= $hour;
		$min = int($hh*60);
		$hh -= $min/60;
		if($hh > 0){
			$sec = sprintf("%0.3f",$hh*3600) + 0;
		}else{
			$sec = 0;
		}
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

###########################

sub roundInt {
	if($_[0] < 0){ return int($_[0] - .5); }
	else{ return int($_[0] + .5); }
}

sub floorInt {
	return int($_[0]);
}

1;