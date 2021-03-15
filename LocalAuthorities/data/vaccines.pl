#!/usr/bin/perl
# Weekly vaccine data from https://www.england.nhs.uk/statistics/statistical-work-areas/covid-19-vaccinations/
# Take Clinical Commissioning Group population estimates (mid 2019) and group them into STPs
# Population data from https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/clinicalcommissioninggroupmidyearpopulationestimates
# CCG April 2020 ultra generalised boundaries at https://geoportal.statistics.gov.uk/datasets/clinical-commissioning-groups-april-2020-ultra-generalised-boundaries-en
# STP April 2020 ultra generalised boundaries at https://geoportal.statistics.gov.uk/datasets/sustainability-and-transformation-partnerships-april-2020-boundaries-en-buc

use lib "./lib/";
use Data::Dumper;
use ODILeeds::ColourScale;
use ODILeeds::GeoJSON;
use POSIX qw(strftime);

# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1\//g; }
else{ $dir = "./"; }


# Define a colour scale object
$cs = ODILeeds::ColourScale->new();

# Settings
$vaccinedate = "20210311";
$vaccinedatenice = "11th March 2021";
$vaccineperiod = "8th December 2020 to 7th March 2021";


# Process date
$vdate = $vaccinedate;
$vdate =~ s/([0-9]{4})([0-9]{2})([0-9]{2})/$1-$2-$3/;




# Now process NHS ICS/STP level data

%stp;

%data = getCSV($dir."vaccines/CCG-STP-ages-population.csv",{'id'=>'CCG Code','map'=>{'STP20 Code'=>'stp20cd','STP20 Name'=>'stp20nm'}});
foreach $ccg (keys(%data)){
	$code = $data{$ccg}{'stp20cd'};
	if(!$stp{$code}){
		$stp{$code} = {'name'=>$data{$ccg}{'stp20nm'}};
		$stp{$code}{'pop'} = {'total'=>0,'Under 60'=>0,'80+'=>0};
	}
	foreach $c (sort(keys(%{$data{$ccg}}))){
		$age = int($c);
		if($c eq "All Ages"){
			$stp{$code}{'pop'}{'total'} += $data{$ccg}{$c};
		}
		if($c =~ /^[\d\+]+$/){
			if($age < 60){
				$stp{$code}{'pop'}{'Under 60'} += $data{$ccg}{$c};
			}
			if($age >= 60 && $age < 65){
				$stp{$code}{'pop'}{'60-64'} += $data{$ccg}{$c};
			}
			if($age >= 65 && $age < 70){
				$stp{$code}{'pop'}{'65-69'} += $data{$ccg}{$c};
			}
			if($age >= 70 && $age < 75){
				$stp{$code}{'pop'}{'70-74'} += $data{$ccg}{$c};
			}
			if($age >= 75 && $age < 80){
				$stp{$code}{'pop'}{'75-79'} += $data{$ccg}{$c};
			}
			if($age < 80){
				$stp{$code}{'pop'}{'Under 80'} += $data{$ccg}{$c};
			}else{
				$stp{$code}{'pop'}{'80+'} += $data{$ccg}{$c};
			}
		}
	}
}

# Save output to file
open(FILE,">",$dir."vaccines/STP-populations-2019.csv");
print FILE "stp20cd,stp20nm,All,Under 60,60-64,65-69,70-74,75-79,80+\n";
foreach $s (sort(keys(%stp))){
	print FILE "$s,$stp{$s}{'name'},$stp{$s}{'pop'}{'total'},$stp{$s}{'pop'}{'Under 60'},$stp{$s}{'pop'}{'60-64'},$stp{$s}{'pop'}{'65-69'},$stp{$s}{'pop'}{'70-74'},$stp{$s}{'pop'}{'75-79'},$stp{$s}{'pop'}{'80+'}\n";
}
close(FILE);

$idt = "\t\t\t";
%vaccinations = getCSV($dir."vaccines/vaccinations-$vaccinedate.csv",{'id'=>'stp20nm','map'=>{'ICS/STP of Residence'=>'stp20nm','Cumulative Total Doses to Date'=>'total','Region of Residence'=>'region'}});
$table = "Area,Name,1st dose,1st dose %,1st dose under 60,1st dose under 60 %,1st dose 80+,1st dose 80+ %,2nd dose Under 60,2nd dose Under 60 %,2nd dose 80+,2nd dose 80+ %\n";
$thtml = "$idt<table class=\"table-sort\">\n$idt<thead><tr><th>Area</th><th>Name</th><th>Pop</th><th>1st<br />Total</th><th>1st<br />%</th><th>1st<br />0-59</th><th>1st<br />0-59 %</th><th>1st<br />60-64</th><th>1st<br />60-64 %</th><th>1st<br />65-69</th><th>1st<br />65-69 %</th><th>1st<br />70-74</th><th>1st<br />70-74 %</th><th>1st<br />75-79</th><th>1st<br />75-79 %</th><th>1st<br />80+</th><th>1st<br />80+ %</th><th>2nd<br />Total</th><th>2nd<br />%</th><th>2nd<br />0-59</th><th>2nd<br />0-59 %</th><th>2nd<br />60-64</th><th>2nd<br />60-64 %</th><th>2nd<br />65-69</th><th>2nd<br />65-69 %</th><th>2nd<br />70-74</th><th>2nd<br />70-74 %</th><th>2nd<br />75-79</th><th>2nd<br />75-79 %</th><th>2nd<br />80+</th><th>2nd<br />80+ %</th></tr></thead>\n";

foreach $a (sort(keys(%stp))){
	$nm = $stp{$a}{'name'};
	$stp{$a}{'vaccine'} = {};
	$stp{$a}{'vaccine'}{'1st dose'} = $vaccinations{$nm}{'1st dose Under 60'}+$vaccinations{$nm}{'1st dose 60-64'}+$vaccinations{$nm}{'1st dose 65-69'}+$vaccinations{$nm}{'1st dose 70-74'}+$vaccinations{$nm}{'1st dose 75-79'}+$vaccinations{$nm}{'1st dose 80+'};
	$stp{$a}{'vaccine'}{'1st dose pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose'}/$stp{$a}{'pop'}{'total'}));
	$stp{$a}{'vaccine'}{'1st dose Under 60'} = $vaccinations{$nm}{'1st dose Under 60'};
	$stp{$a}{'vaccine'}{'1st dose Under 60 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose Under 60'}/$stp{$a}{'pop'}{'Under 60'}));
	$stp{$a}{'vaccine'}{'1st dose 60-64'} = $vaccinations{$nm}{'1st dose 60-64'};
	$stp{$a}{'vaccine'}{'1st dose 60-64 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose 60-64'}/$stp{$a}{'pop'}{'60-64'}));
	$stp{$a}{'vaccine'}{'1st dose 65-69'} = $vaccinations{$nm}{'1st dose 65-69'};
	$stp{$a}{'vaccine'}{'1st dose 65-69 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose 65-69'}/$stp{$a}{'pop'}{'65-69'}));
	$stp{$a}{'vaccine'}{'1st dose 70-74'} = $vaccinations{$nm}{'1st dose 70-74'};
	$stp{$a}{'vaccine'}{'1st dose 70-74 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose 70-74'}/$stp{$a}{'pop'}{'70-74'}));
	$stp{$a}{'vaccine'}{'1st dose 75-79'} = $vaccinations{$nm}{'1st dose 75-79'};
	$stp{$a}{'vaccine'}{'1st dose 75-79 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose 75-79'}/$stp{$a}{'pop'}{'75-79'}));
	$stp{$a}{'vaccine'}{'1st dose 80'} = $vaccinations{$nm}{'1st dose 80+'};
	$stp{$a}{'vaccine'}{'1st dose 80 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose 80'}/$stp{$a}{'pop'}{'80+'}));

	$stp{$a}{'vaccine'}{'2nd dose'} = $vaccinations{$nm}{'2nd dose Under 60'}+$vaccinations{$nm}{'2nd dose 60-64'}+$vaccinations{$nm}{'2nd dose 65-69'}+$vaccinations{$nm}{'2nd dose 70-74'}+$vaccinations{$nm}{'2nd dose 75-79'}+$vaccinations{$nm}{'2nd dose 80+'};
	$stp{$a}{'vaccine'}{'2nd dose pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose'}/$stp{$a}{'pop'}{'total'}));
	$stp{$a}{'vaccine'}{'2nd dose Under 60'} = $vaccinations{$nm}{'2nd dose Under 60'};
	$stp{$a}{'vaccine'}{'2nd dose Under 60 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose Under 60'}/$stp{$a}{'pop'}{'Under 60'}));
	$stp{$a}{'vaccine'}{'2nd dose 60-64'} = $vaccinations{$nm}{'2nd dose 60-64'};
	$stp{$a}{'vaccine'}{'2nd dose 60-64 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose 60-64'}/$stp{$a}{'pop'}{'60-64'}));
	$stp{$a}{'vaccine'}{'2nd dose 65-69'} = $vaccinations{$nm}{'2nd dose 65-69'};
	$stp{$a}{'vaccine'}{'2nd dose 65-69 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose 65-69'}/$stp{$a}{'pop'}{'65-69'}));
	$stp{$a}{'vaccine'}{'2nd dose 70-74'} = $vaccinations{$nm}{'2nd dose 70-74'};
	$stp{$a}{'vaccine'}{'2nd dose 70-74 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose 70-74'}/$stp{$a}{'pop'}{'70-74'}));
	$stp{$a}{'vaccine'}{'2nd dose 75-79'} = $vaccinations{$nm}{'2nd dose 75-79'};
	$stp{$a}{'vaccine'}{'2nd dose 75-79 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose 75-79'}/$stp{$a}{'pop'}{'75-79'}));
	$stp{$a}{'vaccine'}{'2nd dose 80'} = $vaccinations{$nm}{'2nd dose 80+'};
	$stp{$a}{'vaccine'}{'2nd dose 80 pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose 80'}/$stp{$a}{'pop'}{'80+'}));

	$stp{$a}{'vaccine'}{'total'} = $vaccinations{$nm}{'total'};
	$table .= "$a,\"$nm\"";
	$table .= ",".$stp{$a}{'vaccine'}{'1st dose'};
	$table .= ",".sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose'}/$stp{$a}{'pop'}{'total'}));
	$table .= ",$stp{$a}{'vaccine'}{'1st dose Under 60'}";
	$table .= ",$stp{$a}{'vaccine'}{'1st dose Under 60 pc'}";
	$table .= ",$stp{$a}{'vaccine'}{'1st dose 80'}";
	$table .= ",$stp{$a}{'vaccine'}{'1st dose 80 pc'}";
	$table .= ",$stp{$a}{'vaccine'}{'2nd dose Under 60'}";
	$table .= ",$stp{$a}{'vaccine'}{'2nd dose Under 60 pc'}";
	$table .= ",$stp{$a}{'vaccine'}{'2nd dose 80'}";
	$table .= ",$stp{$a}{'vaccine'}{'2nd dose 80 pc'}";
	$table .= "\n";
	$thtml .= "$idt<tr><td>$a</td><td>$nm</td><td>$stp{$a}{'pop'}{'total'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose Under 60'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose Under 60 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 60-64'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 60-64 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 65-69'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 65-69 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 70-74'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 70-74 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 75-79'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 75-79 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 80'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'1st dose 80 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose Under 60'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose Under 60 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 60-64'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 60-64 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 65-69'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 65-69 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 70-74'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 70-74 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 75-79'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 75-79 pc'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 80'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose 80 pc'}</td>";
	$thtml .= "</tr>\n";
}
$thtml .= "$idt</table>";

open(FILE,">",$dir."vaccines-by-STP.csv");
print FILE $table;
close(FILE);

# Read in the HTML
open(FILE,$dir."../../vaccines.html");
@lines = <FILE>;
close(FILE);
$str = join("\n",@lines);
$str =~ s/\n\n/=NEWLINE=/g;


$geojson = ODILeeds::GeoJSON->new();
$geojson->addLayer("stp","vaccines/Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson",{'key'=>'stp20cd','shape-rendering'=>'crispedges','fill'=>\&getColour,'fillOpacity'=>1,'props'=>\&getProps});
%ranges;
@svgs = (
	{'key'=>'1st dose Under 60','file'=>'vaccine-1st-dose-0-59.svg'},
	{'key'=>'1st dose Under 60 pc','file'=>'vaccine-1st-dose-0-59-pc.svg'},
	{'key'=>'1st dose 60-64','file'=>'vaccine-1st-dose-60-64.svg'},
	{'key'=>'1st dose 60-64 pc','file'=>'vaccine-1st-dose-60-64-pc.svg'},
	{'key'=>'1st dose 65-69','file'=>'vaccine-1st-dose-65-69.svg'},
	{'key'=>'1st dose 65-69 pc','file'=>'vaccine-1st-dose-65-69-pc.svg'},
	{'key'=>'1st dose 70-74','file'=>'vaccine-1st-dose-70-74.svg'},
	{'key'=>'1st dose 70-74 pc','file'=>'vaccine-1st-dose-70-74-pc.svg'},
	{'key'=>'1st dose 75-79','file'=>'vaccine-1st-dose-75-79.svg'},
	{'key'=>'1st dose 75-79 pc','file'=>'vaccine-1st-dose-75-79-pc.svg'},
	{'key'=>'1st dose 80','file'=>'vaccine-1st-dose-80.svg'},
	{'key'=>'1st dose 80 pc','file'=>'vaccine-1st-dose-80-pc.svg'},
	{'key'=>'2nd dose Under 60','file'=>'vaccine-2nd-dose-0-59.svg'},
	{'key'=>'2nd dose Under 60 pc','file'=>'vaccine-2nd-dose-0-59-pc.svg'},
	{'key'=>'2nd dose 60-64','file'=>'vaccine-2nd-dose-60-64.svg'},
	{'key'=>'2nd dose 60-64 pc','file'=>'vaccine-2nd-dose-60-64-pc.svg'},
	{'key'=>'2nd dose 65-69','file'=>'vaccine-2nd-dose-65-69.svg'},
	{'key'=>'2nd dose 65-69 pc','file'=>'vaccine-2nd-dose-65-69-pc.svg'},
	{'key'=>'2nd dose 70-74','file'=>'vaccine-2nd-dose-70-74.svg'},
	{'key'=>'2nd dose 70-74 pc','file'=>'vaccine-2nd-dose-70-74-pc.svg'},
	{'key'=>'2nd dose 75-79','file'=>'vaccine-2nd-dose-75-79.svg'},
	{'key'=>'2nd dose 75-79 pc','file'=>'vaccine-2nd-dose-75-79-pc.svg'},
	{'key'=>'2nd dose 80','file'=>'vaccine-2nd-dose-80.svg'},
	{'key'=>'2nd dose 80 pc','file'=>'vaccine-2nd-dose-80-pc.svg'},
);

# Replace each SVG/key area
for($s = 0; $s < @svgs; $s++){
	$t = $svgs[$s]{'key'};
	$svg = $geojson->drawSVG({'padding'=>10,'data'=>$t,'indent'=>"\t"});
	open(SVG,">",$dir."../../resources/".$svgs[$s]{'file'});
	print SVG $svg;
	close(SVG);
	$str = replaceHTMLFragment($str,$t,"<div class=\"map\">\n\t".$svg."\n\t".getColourScale($ranges{$t})."\n</div><a href=\"resources/$svgs[$s]{'file'}\">Download map (SVG)</a>","\t\t\t\t\t");
}


# Replace the table
$str = replaceHTMLFragment($str,"table",$thtml);
# Replace dates
$str =~ s/(<!-- Start update -->).*?(<!-- End update -->)/$1$vaccinedatenice$2/g;
$str =~ s/(<!-- Start period -->).*?(<!-- End period -->)/$1$vaccineperiod$2/g;
# Save the output
$str =~ s/=NEWLINE=/\n/g;
open(FILE,">",$dir."../../vaccines.html");
print FILE $str;
close(FILE);

# Build GeoJSON for NHS ICS/STP
open(FILE,$dir."vaccines/Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson");
@lines = <FILE>;
close(FILE);
$str = "";
foreach $line (@lines){
	if($line =~ /"type":"FeatureCollection"/){
		$line .= "\"updated\":\"$vdate\",\n\"period\":\"$vaccineperiod\",\n";
	}
	if($line =~ /"stp20cd": ?"([^\"]+)"/){
		$id = $1;
		if($stp{$id}{'vaccine'}){
			# Need to add the data as properties
			$props = ",\"period\":\"$vaccineperiod\"";
			$props .= ",\"1st dose 0-59\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose Under 60'});
			$props .= ",\"1st dose 0-59 %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose Under 60 pc'});
			$props .= ",\"1st dose 60-64\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 60-64'});
			$props .= ",\"1st dose 60-64 %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 60-64 pc'});
			$props .= ",\"1st dose 65-69\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 65-69'});
			$props .= ",\"1st dose 65-69 %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 65-69 pc'});
			$props .= ",\"1st dose 70-74\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 70-74'});
			$props .= ",\"1st dose 70-74 %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 70-74 pc'});
			$props .= ",\"1st dose 75-79\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 75-79'});
			$props .= ",\"1st dose 75-79 %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 75-79 pc'});
			$props .= ",\"1st dose 80+\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 80'});
			$props .= ",\"1st dose 80+ %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose 80 pc'});
			$props .= ",\"2nd dose 0-59\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose Under 60'});
			$props .= ",\"2nd dose 0-59 %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose Under 60 pc'});
			$props .= ",\"2nd dose 60-64\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 60-64'});
			$props .= ",\"2nd dose 60-64 %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 60-64 pc'});
			$props .= ",\"2nd dose 65-69\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 65-69'});
			$props .= ",\"2nd dose 65-69 %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 65-69 pc'});
			$props .= ",\"2nd dose 70-74\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 70-74'});
			$props .= ",\"2nd dose 70-74 %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 70-74 pc'});
			$props .= ",\"2nd dose 75-79\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 75-79'});
			$props .= ",\"2nd dose 75-79 %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 75-79 pc'});
			$props .= ",\"2nd dose 80+\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 80'});
			$props .= ",\"2nd dose 80+ %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose 80 pc'});
			$line =~ s/(\}, ?"geometry")/$props$1/;
			$str .= $line;
		}
	}else{
		$str .= $line;
	}
}
$str =~ s/\,([\n\r]\])/$1/g;
open(FILE,">",$dir."../../resources/vaccine-nhs-stp.geojson");
print FILE $str;
close(FILE);
$file = $dir."../../resources/covid-19-vaccine-nhs-stp.json";
open(FILE,$file);
@lines = <FILE>;
close(FILE);
$str = join("",@lines);
$str =~ s/"date": "[^\"]*",/"date": "$vdate",/;
$str =~ s/Period: [^\.]+\./Period: $vaccineperiod\./;
open(FILE,">",$file);
print FILE $str;
close(FILE);







# Now process MSOA-level data
%msoa;
%data = getCSV($dir."vaccines/NIMS-MSOA-population.csv",{'id'=>'msoa11cd','map'=>{'MSOA Code'=>'msoa11cd','MSOA Name'=>'msoa11nm'}});

foreach $m (keys(%data)){
	if(!$msoa{$m}){
		$msoa{$m} = {'name'=>$data{$m}{'msoa11nm'}};
		$msoa{$m}{'pop'} = {'total'=>0,'0-64'=>0,'65-69'=>0,'70-74'=>0,'75-79'=>0,'80'=>0};
	}
	#Under 16,16-59,60-64,65-69,70-74,75-79,80+,16+
	foreach $c (sort(keys(%{$data{$m}}))){
		$age = int($c);
		$age = 0;
		if($c eq "Under 16"){
			$age = 1;
			$msoa{$m}{'pop'}{'0-59'} += $data{$m}{$c};
		}elsif($c eq "16-59"){
			$age = 1;
			$msoa{$m}{'pop'}{'0-59'} += $data{$m}{$c};
		}elsif($c eq "60-64"){
			$age = 1;
			$msoa{$m}{'pop'}{'60-64'} += $data{$m}{$c};
		}elsif($c eq "65-69"){
			$age = 1;
			$msoa{$m}{'pop'}{'65-69'} += $data{$m}{$c};
		}elsif($c eq "70-74"){
			$age = 1;
			$msoa{$m}{'pop'}{'70-74'} += $data{$m}{$c};
		}elsif($c eq "75-79"){
			$age = 1;
			$msoa{$m}{'pop'}{'75-79'} += $data{$m}{$c};
		}elsif($c eq "80+"){
			$age = 1;
			$msoa{$m}{'pop'}{'80'} += $data{$m}{$c};
		}
		if($age){
			$msoa{$m}{'pop'}{'total'} += $data{$m}{$c};
		}
	}
}

%vaccinemsoa = getCSV($dir."vaccines/vaccinations-MSOA-$vaccinedate.csv",{'id'=>'msoa11cd','map'=>{'MSOA Code'=>'msoa11cd','MSOA Name'=>'msoa11nm'}});

foreach $m (sort(keys(%msoa))){
	if($vaccinemsoa{$m}{'msoa11cd'}){
		# Update name with better one from NHS England
		if($vaccinemsoa{$m}{'msoa11nm'}){
			$msoa{$m}{'name'} = $vaccinemsoa{$m}{'msoa11nm'};
		}
		$msoa{$m}{'vaccine'} = {};
		$msoa{$m}{'vaccine'}{'all'} = $vaccinemsoa{$m}{'Under 60'}+$vaccinemsoa{$m}{'60-64'}+$vaccinemsoa{$m}{'65-69'}+$vaccinemsoa{$m}{'70-74'}+$vaccinemsoa{$m}{'75-79'}+$vaccinemsoa{$nm}{'80+'};
		$msoa{$m}{'vaccine'}{'all pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'all'}/$msoa{$m}{'pop'}{'total'}));
		$msoa{$m}{'vaccine'}{'0-59'} = $vaccinemsoa{$m}{'Under 60'}+0;
		$msoa{$m}{'vaccine'}{'0-59 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'0-59'}/$msoa{$m}{'pop'}{'0-59'}));
		$msoa{$m}{'vaccine'}{'60-64'} = $vaccinemsoa{$m}{'60-64'}+0;
		$msoa{$m}{'vaccine'}{'60-64 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'60-64'}/$msoa{$m}{'pop'}{'60-64'}));
		$msoa{$m}{'vaccine'}{'65-69'} = $vaccinemsoa{$m}{'65-69'}+0;
		$msoa{$m}{'vaccine'}{'65-69 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'65-69'}/$msoa{$m}{'pop'}{'65-69'}));
		$msoa{$m}{'vaccine'}{'70-74'} = $vaccinemsoa{$m}{'70-74'}+0;
		$msoa{$m}{'vaccine'}{'70-74 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'70-74'}/$msoa{$m}{'pop'}{'70-74'}));
		$msoa{$m}{'vaccine'}{'75-79'} = $vaccinemsoa{$m}{'75-79'}+0;
		$msoa{$m}{'vaccine'}{'75-79 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'75-79'}/$msoa{$m}{'pop'}{'75-79'}));
		$msoa{$m}{'vaccine'}{'80'} = $vaccinemsoa{$m}{'80+'}+0;
		$msoa{$m}{'vaccine'}{'80 pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'80'}/$msoa{$m}{'pop'}{'80'}));
	}else{
		print "No vaccine data for $m\n";
		delete $msoa{$m};
	}
}

$geojson = ODILeeds::GeoJSON->new();
$geojson->addLayer("stp","vaccines/Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson",{'key'=>'MSOA11CD','precision'=>1,'shape-rendering'=>'crispedges','fill'=>\&getMSOAColour,'props'=>\&getPropsMSOA});
%ranges;
@svgs = (
	{'key'=>'0-59','file'=>'vaccine-msoa-0-59.svg'},
	{'key'=>'0-59 pc','file'=>'vaccine-msoa-0-59-pc.svg'},
	{'key'=>'60-64','file'=>'vaccine-msoa-60-64.svg'},
	{'key'=>'60-64 pc','file'=>'vaccine-msoa-60-64-pc.svg'},
	{'key'=>'65-69','file'=>'vaccine-msoa-65-69.svg'},
	{'key'=>'65-69 pc','file'=>'vaccine-msoa-65-69-pc.svg'},
	{'key'=>'70-74','file'=>'vaccine-msoa-70-74.svg'},
	{'key'=>'70-74 pc','file'=>'vaccine-msoa-70-74-pc.svg'},
	{'key'=>'75-79','file'=>'vaccine-msoa-75-79.svg'},
	{'key'=>'75-79 pc','file'=>'vaccine-msoa-75-79-pc.svg'},
	{'key'=>'80','file'=>'vaccine-msoa-80.svg'},
	{'key'=>'80 pc','file'=>'vaccine-msoa-80-pc.svg'}
);

# Replace each SVG/key area
for($s = 0; $s < @svgs; $s++){
	$t = $svgs[$s]{'key'};
	$svg = $geojson->drawSVG({'padding'=>10,'data'=>$t,'indent'=>"\t"});
	open(SVG,">",$dir."../../resources/".$svgs[$s]{'file'});
	print SVG $svg;
	close(SVG);
}

# Build GeoJSON for MSOAs
open(FILE,$dir."vaccines/Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson");
@lines = <FILE>;
close(FILE);
$str = "";
foreach $line (@lines){
	if($line =~ /"type":"FeatureCollection"/){
		$vdate = $vaccinedate;
		$vdate =~ s/([0-9]{4})([0-9]{2})([0-9]{2})/$1-$2-$3/;
		$line .= "\"updated\":\"$vdate\",\n\"period\":\"$vaccineperiod\",\n";
	}
	if($line =~ /"MSOA11CD":"([^\"]+)"/){
		$id = $1;
		if($msoa{$id}{'vaccine'}){
			# Need to add the data as properties
			$line =~ s/(\},"geometry")/,\"MSOA11NM\":\"$msoa{$id}{'name'}\",\"period\":\"$vaccineperiod\",\"0-59\":$msoa{$id}{'vaccine'}{'0-59'},\"0-59 %\":$msoa{$id}{'vaccine'}{'0-59 pc'},\"60-64\":$msoa{$id}{'vaccine'}{'60-64'},\"60-64 %\":$msoa{$id}{'vaccine'}{'60-64 pc'},\"65-69\":$msoa{$id}{'vaccine'}{'65-69'},\"65-69 %\":$msoa{$id}{'vaccine'}{'65-69 pc'},\"70-74\":$msoa{$id}{'vaccine'}{'70-74'},\"70-74 %\":$msoa{$id}{'vaccine'}{'70-74 pc'},\"75-79\":$msoa{$id}{'vaccine'}{'75-79'},\"75-79 %\":$msoa{$id}{'vaccine'}{'75-79 pc'},\"80+\":$msoa{$id}{'vaccine'}{'80'},\"80+ %\":$msoa{$id}{'vaccine'}{'80 pc'}$1/;
			$str .= $line;
		}else{
			
		}
	}else{
		$str .= $line;
	}
}

$str =~ s/\,([\n\r]\])/$1/g;
open(FILE,">",$dir."../../resources/vaccine-msoa.geojson");
print FILE $str;
close(FILE);
$file = $dir."../../resources/covid-19-vaccine-msoa.json";
open(FILE,$file);
@lines = <FILE>;
close(FILE);
$str = join("",@lines);
$str =~ s/"date": "[^\"]*",/"date": "$vdate",/;
$str =~ s/Period: [^\.]+\./Period: $vaccineperiod\./;
open(FILE,">",$file);
print FILE $str;
close(FILE);
















###############################
# Subroutines


sub tdyPrp{
	my $p = $_[0];
	return ($p =~ /[^0-9\.]/ ? "\"$p\"":$p);
}


sub getColourScale {
	my ($html,$grad);
	my ($r) = @_;
	$grad = $cs->{'scales'}->{'Viridis'}->{'str'};
	$html = "<div class=\"key\">\n\t\t<div class=\"bar\" style=\"background: -moz-linear-gradient(left, $grad);background: -webkit-linear-gradient(left, $grad);background: linear-gradient(to right, $grad);\"></div>\n\t\t<div class=\"range\"><span class=\"min\">$r->{'min'}$r->{'units'}</span><span class=\"max\">$r->{'max'}$r->{'units'}</span></div>\n\t</div>\n";
	return $html;
}

sub replaceHTMLFragment {
	my $inp = $_[0];
	my $lbl = $_[1];
	my $rep = $_[2];
	my $idt = $_[3];

	$rep = $idt.$rep;
	$rep =~ s/\n/\n$idt/g;
	# Read in the HTML
	if($inp =~ /(\<\!\-\- Start $lbl \-\-\>).*(\<\!\-\- End $lbl \-\-\>)/){
		$inp =~ s/(\<\!\-\- Start $lbl \-\-\>).*(\<\!\-\- End $lbl \-\-\>)/$1\n$rep\n$2/;
	}else{
		print "Error: No area in HTML for $lbl\n";
	}
	return $inp;
}
# Get a colour given an ID
sub getColour {
	my ($id,$ky,$min,$max,$a);
	$id = $_[0];
	$ky = $_[1];
	$min = $_[2];
	$max = $_[3];

	if($min eq "" && $max eq ""){
		# Work out the range of values
		$min = 1e100;
		$max = -1e100;
		foreach $a (sort(keys(%stp))){
			if($stp{$a}{'vaccine'}{$ky} < $min){ $min = $stp{$a}{'vaccine'}{$ky}; }
			if($stp{$a}{'vaccine'}{$ky} > $max){ $max = $stp{$a}{'vaccine'}{$ky}; }
		}
		if($ky =~ / pc$/){
			$min = 0;
			$max = 100;
		}else{
			$min = 0;
		}
		$ranges{$ky} = {'min'=>$min+0,'max'=>$max};
		if($ky =~ / pc$/){
			$ranges{$ky}{'units'} = "%";
		}
	}
	return ('fill'=>$cs->getColourFromScale('Viridis',$stp{$id}{'vaccine'}{$ky},$min,$max),'min'=>$min,'max'=>$max);
}
# Get a colour given an ID
sub getMSOAColour {
	my ($id,$ky,$min,$max,$a);
	$id = $_[0];
	$ky = $_[1];
	$min = $_[2];
	$max = $_[3];

	if(!$msoa{$id}{'vaccine'}){ return ('fill'=>'','min'=>'','max'=>''); }

	if($min eq "" && $max eq ""){
		# Work out the range of values if needed
		$min = 0;
		$max = -1e100;
		foreach $a (sort(keys(%msoa))){
			if($msoa{$a}{'vaccine'}){
				if($msoa{$a}{'vaccine'}{$ky} > $max){ $max = $msoa{$a}{'vaccine'}{$ky}; }
			}
		}
		if($ky =~ / pc$/){
			$max = 100;
		}
		$ranges{$ky} = {'min'=>$min+0,'max'=>$max};
		if($ky =~ / pc$/){
			$ranges{$ky}{'units'} = "%";
		}
	}
	return ('fill'=>$cs->getColourFromScale('Viridis',$msoa{$id}{'vaccine'}{$ky},$min,$max),'min'=>$min,'max'=>$max);
}

sub getProps {
	my $id = $_[0];
	my $str = "";
	my ($p,$p2);
	foreach $p (sort(keys(%{$stp{$id}{'vaccine'}}))){
		$p2 = $p;
		$p2 =~ s/ /-/g;
		$p2 =~ s/[^a-zA-Z0-9\-]//;
		$str .= " data-$p2=\"$stp{$id}{'vaccine'}{$p}\"";
	}
	$str .= " data-stp20nm=\"$stp{$id}{'name'}\"";
	return $str;	
}


sub getPropsMSOA {
	my $id = $_[0];
	my $str = "";
	my ($p,$p2);
	foreach $p (sort(keys(%{$stp{$id}{'vaccine'}}))){
		$p2 = $p;
		$p2 =~ s/ /-/g;
		$p2 =~ s/[^a-zA-Z0-9\-]//;
		$str .= " data-$p2=\"$msoa{$id}{'vaccine'}{$p}\"";
	}
	$str .= " data-msoanm=\"$msoa{$id}{'name'}\"";
	return $str;	
}


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
