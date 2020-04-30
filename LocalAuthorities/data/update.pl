#!/usr/bin/perl

use POSIX qw(strftime);
use DateTime;


# Get directory
$dir = $0;
$dir =~ s/^(.*)\/([^\/]*)/$1/g;

$url = "https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv";
@lines = `wget -q --no-check-certificate -O- "$url"`;




%LA;
%headers;
$mostrecent = "2000-01-01";
$mindate = "3000-01-01";
$maxdate = "2000-01-01";

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
	$min = getISODate($mindate);
	$max = getISODate($maxdate);

	$dt = getISODate($mindate);

	print "$mindate - $maxdate ".$dt->epoch."\n";
	
	for(; $dt->epoch <= $max->epoch; ){
		push(@dates,$dt->strftime("%F"));
		$dt += DateTime::Duration->new( days => 1 );
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

			$min = getISODate($dates[0]);
			$max = getISODate($dates[$n-1]);
			$dt = getISODate($dates[0]);
			
			for($i = 0; $dt->epoch <= $max->epoch; $i++){
				if($i > 0){
					$json .= ",";
				}
				$d = $dt->strftime("%F");
				$json .= ($LA{$id}{'dates'}{$d} ? $LA{$id}{'dates'}{$d} : "null");
				$dt += DateTime::Duration->new( days => 1 );
			}

#			for($d = 0; $d < @dates; $d++){
#				if($d > 0){
#					$json .= ",";
#				}
#				$json .= "\"$dates[$d]\":".($LA{$id}{'dates'}{$dates[$d]} ? $LA{$id}{'dates'}{$dates[$d]} : "null");
##				$json .= ($LA{$id}{'dates'}{$dates[$d]} ? $LA{$id}{'dates'}{$dates[$d]} : "null");
	#		}
			$json .= $dates."]";
			$json .= "}";
		}
	}
	open(FILE,">","$dir/utla.json");
	print FILE "{\n";
	print FILE "\t\"lastupdate\":\"".$mostrecent."\",\n";
	print FILE "\t\"data\": {\n";
	print FILE $json."\n";
	print FILE "\t}\n";
	print FILE "}";
	close(FILE);
}else{
	print "Empty file";
}


#Date,Country,AreaCode,Area,TotalCases
#2020-03-01,Scotland,S08000015,Ayrshire and Arran,0
#2020-03-01,Scotland,S08000016,Borders,0
#2020-03-01,Scotland,S08000017,Dumfries and Galloway,0
#2020-03-01,Scotland,S08000029,Fife,0
#2020-03-01,Scotland,S08000019,Forth Valley,0


sub getISODate {
	local $dt;
	local $str = $_[0];
	if($str =~ /([0-9]{4})-?([0-9]{2})-?([0-9]{2})/){
		$dt = DateTime->new(
			year       => $1,
			month      => $2,
			day        => $3,
		);
	}else{
	
	}
	return $dt;
}




