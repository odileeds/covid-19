#!/usr/bin/perl

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

%areas;

for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	if($lines[$i] =~ /All ages/i){
		(@cols) = split(/\t/,$lines[$i]);
		$p = $cols[$headers{'2020'}];
		$p =~ s/\,//g;
		$areas{$cols[0]} = $p;
	}
}

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
print "var populations = {$json}\n";