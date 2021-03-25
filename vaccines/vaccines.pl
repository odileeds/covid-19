#!/usr/bin/perl
# Weekly vaccine data from https://www.england.nhs.uk/statistics/statistical-work-areas/covid-19-vaccinations/
# Take Clinical Commissioning Group population estimates (mid 2019) and group them into STPs
# Population data from https://www.ons.gov.uk/peoplepopulationandcommunity/populationandmigration/populationestimates/datasets/clinicalcommissioninggroupmidyearpopulationestimates
# CCG April 2020 ultra generalised boundaries at https://geoportal.statistics.gov.uk/datasets/clinical-commissioning-groups-april-2020-ultra-generalised-boundaries-en
# STP April 2020 ultra generalised boundaries at https://geoportal.statistics.gov.uk/datasets/sustainability-and-transformation-partnerships-april-2020-boundaries-en-buc

use lib "../lib/";
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
$vaccinedate = "20210325";
$vaccinedatenice = "25th March 2021";
$vaccineperiod = "8th December 2020 to 21st March 2021";


# Process date
$vdate = $vaccinedate;
$vdate =~ s/([0-9]{4})([0-9]{2})([0-9]{2})/$1-$2-$3/;


@agegroups = (
	{
		'label'=>'0-49',
		'head'=>'Under 50',
		'table'=>1,
		'low'=>0,
		'high'=>50
	},{
		'label'=>'50-54',
		'head'=>'50-54',
		'table'=>1,
		'low'=>50,
		'high'=>54
	},{
		'label'=>'55-59',
		'head'=>'55-59',
		'table'=>1,
		'low'=>55,
		'high'=>59
	},{
		'label'=>'60-64',
		'head'=>'60-64',
		'table'=>1,
		'low'=>60,
		'high'=>64
	},{
		'label'=>'65-69',
		'head'=>'65-69',
		'table'=>1,
		'low'=>65,
		'high'=>69
	},{
		'label'=>'70-74',
		'head'=>'70-74',
		'table'=>1,
		'low'=>70,
		'high'=>74
	},{
		'label'=>'75-79',
		'head'=>'75-79',
		'table'=>1,
		'low'=>75,
		'high'=>79
	},{
		'label'=>'80+',
		'head'=>'80+',
		'table'=>1,
		'low'=>80,
		'high'=>200
	},{
		'label'=>'0-80',
		'head'=>'Under 80',
		'low'=>0,
		'high'=>80
	}
);


# Now process NHS ICS/STP level data

%stp;

%data = getCSV($dir."data/CCG-STP-ages-population.csv",{'id'=>'CCG Code','map'=>{'STP20 Code'=>'stp20cd','STP20 Name'=>'stp20nm'}});
foreach $ccg (keys(%data)){
	$code = $data{$ccg}{'stp20cd'};
	if(!$stp{$code}){
		$stp{$code} = {'name'=>$data{$ccg}{'stp20nm'}};
		$stp{$code}{'pop'} = {'total'=>0};
	}
	foreach $c (sort(keys(%{$data{$ccg}}))){
		$age = int($c);
		if($c eq "All Ages"){
			$stp{$code}{'pop'}{'total'} += $data{$ccg}{$c};
		}
		if($c =~ /^[\d\+]+$/){
			for($ag = 0 ; $ag < @agegroups; $ag++){
				if($age >= $agegroups[$ag]{'low'} && $age < $agegroups[$ag]{'high'}){
					$stp{$code}{'pop'}{$agegroups[$ag]{'label'}} += $data{$ccg}{$c};
				}
			}
		}
	}
}


# Save output to file
open(FILE,">",$dir."data/STP-populations-2019.csv");
print FILE "stp20cd,stp20nm,All";
for($ag = 0 ; $ag < @agegroups; $ag++){
	print FILE ",$agegroups[$ag]{'label'}";
}
print FILE "\n";
foreach $s (sort(keys(%stp))){
	print FILE "$s,$stp{$s}{'name'},$stp{$s}{'pop'}{'total'}";
	for($ag = 0 ; $ag < @agegroups; $ag++){
		print FILE ",$stp{$s}{'pop'}{$agegroups[$ag]{'label'}}";
	}
	print FILE "\n";
}
close(FILE);

$idt = "\t\t\t";
%vaccinations = getCSV($dir."data/vaccinations-$vaccinedate.csv",{'id'=>'stp20nm','map'=>{'ICS/STP of Residence'=>'stp20nm','Cumulative Total Doses to Date'=>'total','Region of Residence'=>'region'}});


$table = "Area,Name,1st dose,1st dose %,1st dose under 60,1st dose under 60 %,1st dose 80+,1st dose 80+ %,2nd dose Under 60,2nd dose Under 60 %,2nd dose 80+,2nd dose 80+ %\n";
$thtml = "$idt<table class=\"table-sort\">\n$idt<thead><tr><th>Area</th><th>Name</th><th>Pop</th><th>1st<br />Total</th><th>1st<br />%</th>";
for($ag = 0 ; $ag < @agegroups; $ag++){
	if($agegroups[$ag]{'table'}){
		$thtml .= "<th>1st<br />$agegroups[$ag]{'label'}</th><th>1st<br />$agegroups[$ag]{'label'} \%</th>";
	}
}
$thtml .= "<th>2nd<br />Total</th><th>2nd<br />%</th>";
for($ag = 0 ; $ag < @agegroups; $ag++){
	if($agegroups[$ag]{'table'}){
		$thtml .= "<th>2nd<br />$agegroups[$ag]{'label'}</th><th>2nd<br />$agegroups[$ag]{'label'} \%</th>";
	}
}


foreach $a (keys(%vaccinations)){
	foreach $c (keys(%{$vaccinations{$a}})){
		if($c =~ /^[0-9]/ && $c !~ /^(1st|2nd)/){
			delete $vaccinations{$a}{$c};
			
		}
	}
}


foreach $a (sort(keys(%stp))){
	$nm = $stp{$a}{'name'};
	$stp{$a}{'vaccine'} = {'1st dose'=>0,'2nd dose'=>0};
	for($ag = 0 ; $ag < @agegroups; $ag++){
		if($agegroups[$ag]{'table'}){

			$stp{$a}{'vaccine'}{'1st dose'} += $vaccinations{$nm}{'1st dose '.$agegroups[$ag]{'head'}};
			if(!$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}}){ $stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}} = 0; }
			$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}} = $vaccinations{$nm}{'1st dose '.$agegroups[$ag]{'head'}};
			$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}.' pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}}/$stp{$a}{'pop'}{$agegroups[$ag]{'label'}}));

			$stp{$a}{'vaccine'}{'2nd dose'} += $vaccinations{$nm}{'2nd dose '.$agegroups[$ag]{'head'}};
			if(!$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}}){ $stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}} = 0; }
			$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}} = $vaccinations{$nm}{'2nd dose '.$agegroups[$ag]{'head'}};
			$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}.' pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}}/$stp{$a}{'pop'}{$agegroups[$ag]{'label'}}));
		}
	}

	$stp{$a}{'vaccine'}{'1st dose pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'1st dose'}/$stp{$a}{'pop'}{'total'}));
	$stp{$a}{'vaccine'}{'2nd dose pc'} = sprintf("%0.1f",(100*$stp{$a}{'vaccine'}{'2nd dose'}/$stp{$a}{'pop'}{'total'}));

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
	for($ag = 0 ; $ag < @agegroups; $ag++){
		if($agegroups[$ag]{'table'}){
			$thtml .= "<td class=\"num\">".$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}}."</td>";
			$thtml .= "<td class=\"num\">".$stp{$a}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}.' pc'}."</td>";
		}
	}
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose'}</td>";
	$thtml .= "<td class=\"num\">$stp{$a}{'vaccine'}{'2nd dose pc'}</td>";
	for($ag = 0 ; $ag < @agegroups; $ag++){
		if($agegroups[$ag]{'table'}){
			$thtml .= "<td class=\"num\">".$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}}."</td>";
			$thtml .= "<td class=\"num\">".$stp{$a}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}.' pc'}."</td>";
		}
	}


	$thtml .= "</tr>\n";
}
$thtml .= "$idt</table>";

print $thtml;

open(FILE,">",$dir."data/vaccines-by-STP.csv");
print FILE $table;
close(FILE);

# Read in the HTML
open(FILE,$dir."index.html");
@lines = <FILE>;
close(FILE);
$str = join("\n",@lines);
$str =~ s/\n\n/=NEWLINE=/g;



$geojson = ODILeeds::GeoJSON->new();
$geojson->addLayer("stp","data/Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson",{'key'=>'stp20cd','shape-rendering'=>'crispedges','fill'=>\&getColour,'fillOpacity'=>1,'props'=>\&getProps});
%ranges;
@svgs;
for($ag = 0 ; $ag < @agegroups; $ag++){
	$agegroups[$ag]{'safe'} = safeLabel($agegroups[$ag]{'label'});
}
for($ag = 0 ; $ag < @agegroups; $ag++){
	if($agegroups[$ag]{'table'}){
		push(@svgs,{'title'=>'1st dose '.$agegroups[$ag]{'label'}.' (total)','key'=>'1st dose '.$agegroups[$ag]{'label'},'file'=>'vaccine-1st-dose-'.$agegroups[$ag]{'safe'}.'.svg'});
		push(@svgs,{'title'=>'1st dose '.$agegroups[$ag]{'label'}.' (%)','key'=>'1st dose '.$agegroups[$ag]{'label'}.' pc','file'=>'vaccine-1st-dose-'.$agegroups[$ag]{'safe'}.'-pc.svg'});
	}
}
for($ag = 0 ; $ag < @agegroups; $ag++){
	if($agegroups[$ag]{'table'}){
		push(@svgs,{'title'=>'2nd dose '.$agegroups[$ag]{'label'}.' (total)','key'=>'2nd dose '.$agegroups[$ag]{'label'},'file'=>'vaccine-2nd-dose-'.$agegroups[$ag]{'safe'}.'.svg'});
		push(@svgs,{'title'=>'2nd dose '.$agegroups[$ag]{'label'}.' (%)','key'=>'2nd dose '.$agegroups[$ag]{'label'}.' pc','file'=>'vaccine-2nd-dose-'.$agegroups[$ag]{'safe'}.'-pc.svg'});
	}
}

$maps = "";
# Replace each SVG/key area
for($s = 0; $s < @svgs; $s++){
	$t = $svgs[$s]{'key'};
	$svg = $geojson->drawSVG({'padding'=>10,'data'=>$t,'indent'=>"\t","debug"=>($t =~ /80/ ? 1 : 0)});

	# Save SVG
	open(SVG,">",$dir."inc/".$svgs[$s]{'file'});
	print SVG $svg;
	close(SVG);
	$f = $svgs[$s]{'file'};
	$f =~ s/\.svg$/\.html/g;

	# Save HTML fragment for colour scale
	open(FRAG,">",$dir."inc/".$f);
	print FRAG "\n\t".getColourScale($ranges{$t})."\n";
	close(FRAG);

	# Save HTML for grid
	$maps .= "				<figure class=\"b5-bg doublepadded ".($svgs[$s]{'title'} =~ /\(total\)/ ? "total":"pc")."\">\n";
	$maps .= "					<h2>".($svgs[$s]{'title'})."</h2>\n";
	$maps .= "					<div class=\"map jekyll-parse\">\n";
	$maps .= "{\% include_relative inc/$svgs[$s]{'file'} \%}\n";
	$maps .= "{\% include_relative inc/$f \%}\n";
	$maps .= "					</div>\n";
	$maps .= "					<a href=\"inc/$svgs[$s]{'file'}\">Download map (SVG)</a>\n";
	$maps .= "				</figure>\n";
}

$str =~ s/(<!-- Start maps -->).*?(<!-- End maps -->)/$1$maps$2/g;

# Replace the table
$str = replaceHTMLFragment($str,"table",$thtml);
# Replace dates
$str =~ s/(<!-- Start update -->).*?(<!-- End update -->)/$1$vaccinedatenice$2/g;
$str =~ s/(<!-- Start period -->).*?(<!-- End period -->)/$1$vaccineperiod$2/g;
# Save the output
$str =~ s/=NEWLINE=/\n/g;
open(FILE,">",$dir."index.html");
print FILE $str;
close(FILE);

# Build GeoJSON for NHS ICS/STP
open(FILE,$dir."data/Sustainability_and_Transformation_Partnerships__April_2020__Boundaries_EN_BUC.geojson");
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
			for($ag = 0 ; $ag < @agegroups; $ag++){
				if($agegroups[$ag]{'table'}){
					$props .= ",\"1st dose ".$agegroups[$ag]{'label'}."\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}});
					$props .= ",\"1st dose ".$agegroups[$ag]{'label'}." %\":".tdyPrp($stp{$id}{'vaccine'}{'1st dose '.$agegroups[$ag]{'label'}.' pc'});
				}
			}
			for($ag = 0 ; $ag < @agegroups; $ag++){
				if($agegroups[$ag]{'table'}){
					$props .= ",\"2nd dose ".$agegroups[$ag]{'label'}."\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}});
					$props .= ",\"2nd dose ".$agegroups[$ag]{'label'}." %\":".tdyPrp($stp{$id}{'vaccine'}{'2nd dose '.$agegroups[$ag]{'label'}.' pc'});
				}
			}

			$line =~ s/(\}, ?"geometry")/$props$1/;
			$str .= $line;
		}
	}else{
		$str .= $line;
	}
}
$str =~ s/\,([\n\r]\])/$1/g;
open(FILE,">",$dir."inc/vaccine-nhs-stp.geojson");
print FILE $str;
close(FILE);
$file = $dir."inc/covid-19-vaccine-nhs-stp.json";
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
%data = getCSV($dir."data/NIMS-MSOA-population.csv",{'id'=>'msoa11cd','map'=>{'MSOA Code'=>'msoa11cd','MSOA Name'=>'msoa11nm'}});

foreach $m (keys(%data)){
	if(!$msoa{$m}){
		$msoa{$m} = {'name'=>$data{$m}{'msoa11nm'}};
		$msoa{$m}{'pop'} = {'total'=>0};
	}
	foreach $c (sort(keys(%{$data{$m}}))){
		$age = "";
		# Only keep the age groups that we want
		if($c eq "Under 16"){
			$age = "0";
		}elsif($c eq "16+"){
			$age = "";
		}elsif($c =~ /^([0-9]+)/){
			$age = int($1);
		}
		if($age){
			for($ag = 0 ; $ag < @agegroups; $ag++){
				if($agegroups[$ag]{'table'}){
					if($age >= $agegroups[$ag]{'low'} && $age < $agegroups[$ag]{'high'}){
						if(!$msoa{$m}{'pop'}{$agegroups[$ag]{'label'}}){ $msoa{$m}{'pop'}{$agegroups[$ag]{'label'}} = 0; }
						$msoa{$m}{'pop'}{$agegroups[$ag]{'label'}} += $data{$m}{$c};
					}
					$msoa{$m}{'pop'}{'total'} += $data{$m}{$c};
				}
			}
		}
	}
}

%vaccinemsoa = getCSV($dir."data/vaccinations-MSOA-$vaccinedate.csv",{'id'=>'msoa11cd','map'=>{'MSOA Code'=>'msoa11cd','MSOA Name'=>'msoa11nm'}});


foreach $m (sort(keys(%msoa))){
	if($vaccinemsoa{$m}{'msoa11cd'}){
		# Update name with better one from NHS England
		if($vaccinemsoa{$m}{'msoa11nm'}){
			$msoa{$m}{'name'} = $vaccinemsoa{$m}{'msoa11nm'};
		}
		$msoa{$m}{'vaccine'} = {'all'=>0};

		for($ag = 0 ; $ag < @agegroups; $ag++){
			if($agegroups[$ag]{'table'}){
				$msoa{$m}{'vaccine'}{$agegroups[$ag]{'label'}} = $vaccinemsoa{$m}{$agegroups[$ag]{'head'}}+0;
				$msoa{$m}{'vaccine'}{$agegroups[$ag]{'label'}.' pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{$agegroups[$ag]{'label'}}/$msoa{$m}{'pop'}{$agegroups[$ag]{'label'}}));
				$msoa{$m}{'vaccine'}{'all'} += $vaccinemsoa{$m}{$agegroups[$ag]{'head'}};
			}
			
		}
		$msoa{$m}{'vaccine'}{'all pc'} = sprintf("%0.1f",(100*$msoa{$m}{'vaccine'}{'all'}/$msoa{$m}{'pop'}{'total'}));

	}else{
		print "No vaccine data for $m\n";
		delete $msoa{$m};
	}
}


$geojson = ODILeeds::GeoJSON->new();
$geojson->addLayer("stp","data/Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson",{'key'=>'MSOA11CD','precision'=>1,'shape-rendering'=>'crispedges','fill'=>\&getMSOAColour,'props'=>\&getPropsMSOA});
undef %ranges;
undef @svgs;
%ranges;
@svgs;
for($ag = 0 ; $ag < @agegroups; $ag++){
	if($agegroups[$ag]{'table'}){
		push(@svgs,{'title'=>$agegroups[$ag]{'label'}.' (total)','key'=>$agegroups[$ag]{'label'},'file'=>'vaccine-msoa-'.$agegroups[$ag]{'safe'}.'.svg'});
		push(@svgs,{'title'=>$agegroups[$ag]{'label'}.' (%)','key'=>$agegroups[$ag]{'label'}.' pc','file'=>'vaccine-msoa-'.$agegroups[$ag]{'safe'}.'-pc.svg'});
	}
}

# Replace each SVG/key area
for($s = 0; $s < @svgs; $s++){
	$t = $svgs[$s]{'key'};
	print "$s - $svgs[$s]{'title'} / $t\n";
	$svg = $geojson->drawSVG({'padding'=>10,'data'=>$t,'indent'=>"\t","debug"=>($t =~ /^80/ ? 1 : 0)});
	open(SVG,">",$dir."inc/".$svgs[$s]{'file'});
	print SVG $svg;
	close(SVG);
}


# Build GeoJSON for MSOAs
open(FILE,$dir."data/Middle_Layer_Super_Output_Areas_(December_2011)_Boundaries_Super_Generalised_Clipped_(BSC)_EW_V3.geojson");
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
		if($id eq "E02003836" || $id eq "E02003835"){
			print Dumper $msoa{$id};
		}
		if($msoa{$id}{'vaccine'}){
			# Need to add the data as properties
			$property = ",\"MSOA11NM\":\"$msoa{$id}{'name'}\",\"period\":\"$vaccineperiod\"";
			for($ag = 0 ; $ag < @agegroups; $ag++){
				if($agegroups[$ag]{'table'}){
					$property .= ",\"$agegroups[$ag]{'label'}\":".($msoa{$id}{'vaccine'}{$agegroups[$ag]{'label'}}||0).",\"$agegroups[$ag]{'label'} %\":".($msoa{$id}{'vaccine'}{$agegroups[$ag]{'label'}.' pc'}||0);
				}
			}
			$line =~ s/(\},"geometry")/$property$1/;
			$str .= $line;
		}else{
			
		}
	}else{
		$str .= $line;
	}
}

$str =~ s/\,([\n\r]\])/$1/g;
open(FILE,">",$dir."inc/vaccine-msoa.geojson");
print FILE $str;
close(FILE);
$file = $dir."inc/covid-19-vaccine-msoa.json";
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

sub safeLabel {
	my $str = $_[0];
	$str =~ s/[\+\/]//g;
	return $str;
}
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
	my ($id,$ky,$min,$max,$a,$debug);
	$id = $_[0];
	$ky = $_[1];
	$min = $_[2];
	$max = $_[3];
	$debug = $_[4];

	if($max && !$min){ $min = 0; }
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
	my ($id,$ky,$min,$max,$a,$debug);
	$id = $_[0];
	$ky = $_[1];
	$min = $_[2];
	$max = $_[3];
	$debug = $_[4];

	if(!$msoa{$id}{'vaccine'}){ return ('fill'=>'','min'=>'','max'=>''); }

	if($max && !$min){ $min = 0; }
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
	my $ky = $_[1];
	my $str = "";
	my $p2;
	if($ky){
		if($stp{$id}{'vaccine'}{$ky} ne ""){
			$p2 = $ky;
			$p2 =~ s/ /-/g;
			$p2 =~ s/[^a-zA-Z0-9\-]//;
			$str .= " data-$p2=\"$stp{$id}{'vaccine'}{$ky}\"";
		}
	}else{
		foreach $ky (sort(keys(%{$stp{$id}{'vaccine'}}))){
			$p2 = $ky;
			$p2 =~ s/ /-/g;
			$p2 =~ s/[^a-zA-Z0-9\-]//;
			$str .= " data-$p2=\"$stp{$id}{'vaccine'}{$ky}\"";
		}
	}
	$str .= " data-stp20nm=\"$stp{$id}{'name'}\"";
	return $str;	
}


sub getPropsMSOA {
	my $id = $_[0];
	my $ky = $_[1];
	my $str = "";
	my ($p2,$nm);
	if($ky){
		if($msoa{$id}{'vaccine'}{$ky} ne ""){
			$p2 = $ky;
			$p2 =~ s/ /-/g;
			$p2 =~ s/[^a-zA-Z0-9\-]//;
			$str .= " data-$p2=\"$msoa{$id}{'vaccine'}{$ky}\"";
		}
	}else{
		foreach $ky (sort(keys(%{$stp{$id}{'vaccine'}}))){
			$p2 = $ky;
			$p2 =~ s/ /-/g;
			$p2 =~ s/[^a-zA-Z0-9\-]//;
			$str .= " data-$p2=\"$msoa{$id}{'vaccine'}{$ky}\"";
		}
	}
	$nm = $msoa{$id}{'name'};
	$nm =~ s/\&/\&amp;/g;
	$str .= " data-msoanm=\"$nm\"";
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
