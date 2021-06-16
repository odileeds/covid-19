#!/usr/bin/perl

use Data::Dumper;


%stps;
%msoapop = ();
%agegroups = ();
%msoas = getCSV("data/MSOA-STP-sorted.csv",{"id"=>"MSOA11CD"});


# Load in the MSOA population data from NIMS
%data = getCSV("data/NIMS-MSOA-population.csv",{'id'=>'MSOA11CD','map'=>{'MSOA Code'=>'MSOA11CD','MSOA Name'=>'MSOA11NM'}});
foreach $msoa (sort(keys(%data))){

	$msoapop{$msoa} = ();
	foreach $c (sort(keys(%{$data{$msoa}}))){
		$age = int($c);
		$c2 = $c;
		if($c2 eq "16+"){ next; }
		if($c2 =~ /^Under (.*)/i){
			$c2 = "0-$1";
		}
		if($c2 =~ /^[\d]/){
			if(!$agegroups{$c2}){ $agegroups{$c2} = 1; }
			$msoapop{$msoa}{$c2} = $data{$msoa}{$c}+0;
			$msoapop{$msoa}{'All Ages'} += $msoapop{$msoa}{$c2};
			if(!$agegroups{'All Ages'}){ $agegroups{'All Ages'} = 1; }
		}
	}
}
foreach $msoa (sort(keys(%msoas))){
	$stp = $msoas{$msoa}{'STP21CD'};
	#print "$msoa ($stp):\n";
	if(!$stps{$stp}){ $stps{$stp} = (); }
	foreach $ag (sort(keys(%{$msoapop{$msoa}}))){
		if(!$stps{$stp}{$ag}){ $stps{$stp}{$ag} = 0; }
		$stps{$stp}{$ag} += $msoapop{$msoa}{$ag};
		#print "\t$ag: $msoapop{$msoa}{$ag}\n";
	}
}

$csv = "STP21CD";
foreach $ag (sort(keys(%agegroups))){
	$csv .= ",".$ag;
}
$csv .= "\n";
foreach $stp (sort(keys(%stps))){
	$csv .= "$stp";
	foreach $ag (sort(keys(%agegroups))){
		$csv .= ",".$stps{$stp}{$ag};
	}
	$csv .= "\n";
}

print "Saving to data/NIMS-STP-population.csv\n";
open(FILE,">","data/NIMS-STP-population.csv");
print FILE $csv;
close(FILE);


sub getCSV {
	my (@lines,@header,%datum,$c,$i,$id,@data,%dat);
	my ($file, $props) = @_;

	# Open the file
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	$lines[0] =~ s/[\n\r]//g;
	@header = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[0]);
	$id = -1;
	for($c = 0; $c < @header; $c++){
		$header[$c] =~ s/(^\"|\"$)//g;
		if($props->{'map'} && $props->{'map'}{$header[$c]}){
			$header[$c] = $props->{'map'}{$header[$c]};
		}
		if($props->{'id'} && $header[$c] eq $props->{'id'}){
			$id = $c;
		}
	}

	for($i = 1; $i < @lines; $i++){
		undef %datum;
		$lines[$i] =~ s/[\n\r]//g;
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
		for($c = 0; $c < @cols; $c++){
			#print "\t$i = $header[$c] = $cols[$c]\n";
			if($cols[$c] =~ /^" ?([0-9\,]+) ?"$/){
				$cols[$c] =~ s/(^" ?| ?"$)//g;
				$cols[$c] =~ s/\,//g;
			}
			$cols[$c] =~ s/(^\"|\"$)//g;
			if($header[$c] ne ""){
				$datum{$header[$c]} = $cols[$c];
			}
		}
		if($id >= 0){
			$dat{$cols[$id]} = {%datum};
		}else{
			push(@data,{%datum});
		}
	}
	if($id >= 0){
		return %dat;
	}else{
		return @data;
	}
}