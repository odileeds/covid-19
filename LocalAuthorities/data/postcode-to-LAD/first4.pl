#!/usr/bin/perl

use utf8;
%pcds;

# Data downloaded and extracted from https://geoportal.statistics.gov.uk/datasets/postcode-to-output-area-to-lower-layer-super-output-area-to-middle-layer-super-output-area-to-local-authority-district-february-2020-lookup-in-the-uk

open(FILE,"PCD_OA_LSOA_MSOA_LAD_FEB20_UK_LU.csv");
$n = 0;
while (my $line = <FILE>){
	if($n > 0){
	
		chomp $line;
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
		$cols[2] =~ s/(^\"|\"$| )//g;
		$cols[9] =~ s/(^\"|\"$| )//g;
		$lad = $cols[9];
		if($lad ne ""){
			$pcd = substr($cols[2],0,4);
			if(!$pcds{$pcd}){ $pcds{$pcd} = {'LA'=>{}}; }
			if(!$pcds{$pcd}{'LA'}{$lad}){ $pcds{$pcd}{'LA'}{$lad} = 0; }
			$pcds{$pcd}{'LA'}{$lad}++;
		}
	}
	if($n % 100000 == 0){ print "$n lines\n"; }
	$n++;
}
close(FILE);


open(FILE,">","postcode-to-LA.json");
print FILE "{\n";
@ps = sort(keys(%pcds));
for($p = 0; $p < @ps; $p++){
	$postcode = $ps[$p];
	if($p > 0){ print FILE ",\n"; }
	print FILE "\"$postcode\":{";
	@las = sort(keys(%{$pcds{$postcode}{'LA'}}));
	$la = "";
	for($l = 0; $l < @las; $l++){
		$lad = $las[$l];
		if($la){ $la .= ","; }
		$la .= "\"$lad\":$pcds{$postcode}{'LA'}{$lad}";	
	}
	print FILE $la."}";
}
print FILE "\n}";