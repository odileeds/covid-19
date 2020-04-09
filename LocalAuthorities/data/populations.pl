#!/usr/bin/perl

%areas;


#########################
# Populations for England
open(FILE,"populations.csv");
@lines = <FILE>;
close(FILE);

# Split the headers and tidy
$lines[0] =~ s/[\n\r]//g;
(@header) = split(/\t/,$lines[0]);
for($c = 0; $c < @header; $c++){
	$header[$c] =~ s/(^\"|\"$)//g;
	$headers{$header[$c]} = $c;
}

for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	if($lines[$i] =~ /All ages/i){
		(@cols) = split(/\t/,$lines[$i]);
		$p = $cols[$headers{'2020'}];
		$p =~ s/\,//g;
		$areas{$cols[0]} = $p;
	}
}


#################################################
# Populations for NI, Wales, Scotland (mid 2018)
# along with Health Board lookups
open(FILE,"HealthBoardtoLALookUP.csv");
@lines = <FILE>;
close(FILE);

# Split the headers and tidy
$lines[0] =~ s/[\n\r]//g;
#LAD19CD,Name,Estimated Population  mid-2018,HLTHAUCDO,hlthau,HLTHAUNM,UTLA19CD,UTLA19NM
(@header) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[0]);
for($c = 0; $c < @header; $c++){
	$header[$c] =~ s/(^\"|\"$)//g;
	$headers{$header[$c]} = $c;
}
$str = "";
for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	if($lines[$i] =~ /^[SWN]/i){
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
		for($c = 0; $c < @cols; $c++){ $cols[$c] =~ s/(^\"|\"$)//g; }
		$la = $cols[$headers{'LAD19CD'}];
		$p = $cols[$headers{'Estimated Population  mid-2018'}];
		$p =~ s/\,//g;
		if(!$areas{$la}){
			$areas{$la} = $p;
		}
		# Create Health Board values for Scotland and Wales
		if($lines[$i] =~ /^[SW]/i){
			if($str){ $str .= ", // $ln\n"; }
			$hb = $cols[$headers{'hlthau'}];
			$hn = $cols[$headers{'HLTHAUNM'}];
			$la = $cols[$headers{'LAD19CD'}];
			$ln = $cols[$headers{'Name'}];
			#"W06000022":{"id":"W11000028","n":"Aneurin Bevan"},	// Newport
			$str .= "\"$la\":{\"id\":\"$hb\",\"n\":\"$hn\"}";
			if(!$areas{$hb}){ $areas{$hb} = 0; }
			$areas{$hb} += $p;
		}
	}
}
$str .= " // $ln\n";



##############
# Kludges
$areas{'E09000001-12'} = $areas{'E09000001'}+$areas{'E09000012'};	# Hackney and City of London
$areas{'E06000052-3'} = $areas{'E06000052'}+$areas{'E06000053'};	# Cornwall and Isles of Scilly
$areas{'E06000059'} = $areas{'E10000009'};	# Dorset
if(!$areas{'E06000058'}){
	$areas{'E06000058'} = $areas{'E06000028'}+$areas{'E07000048'}+$areas{'E06000029'};	# Bournemouth+Christchurch+Poole
}

$json = "";
for $a (sort(keys(%areas))){
	if($json){ $json .= ","; }
	$json .= "\"$a\":$areas{$a}";
}
print "var populations = {$json}\n\n";

print $str."\n\n";

