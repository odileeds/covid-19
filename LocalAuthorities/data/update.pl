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

%areas;
%LA;
%headers;
%LAlast;
%LAweek;
%updates;
%conv;
$updates{'cases-date'} = "2000-01-01";
$updates{'deaths-date'} = "2000-01-01";
$mindate = "3000-01-01";
$maxdate = "2000-01-01";


$hj = ODILeeds::HexJSON->new();






# Get the conversion file from UTLA to LA
open(FILE,$dir."conversion.json");
@lines = <FILE>;
close(FILE);
$jsonblob = JSON::XS->new->utf8->decode(join("\n",@lines));
%conv = %{$jsonblob};
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
$jsonblob = JSON::XS->new->utf8->decode(join("\n",@lines));
%pop = %{$jsonblob};





getCases("https://raw.githubusercontent.com/odileeds/covid-19-uk-datasets/master/data/england-cases.csv");
getCases("https://raw.githubusercontent.com/odileeds/covid-19-uk-datasets/master/data/scotland-cases.csv");
saveLAJSON();

%svg;

###########################
# Read in the HTML
open(FILE,$dir."../hexmap.html");
@html = <FILE>;
close(FILE);


#################
# Create hexmaps


####################################
# Make the cases/per-capita hexmaps
# Load the HexJSON
$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
# Add the data
$hj->addData(%LAlast);
# Set primary value keys
$hj->setPrimaryKey('percapita');
$hj->setKeys('percapita','UTLA','update');
# Set the colour scale to use
$hj->setColourScale('Viridis');
# Create the SVG output
$svg{'percapita'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-percapita','date'=>$updates{'cases-date'}));

# Set primary value keys
$hj->setPrimaryKey('cases');
$hj->setKeys('cases','casesUTLA','UTLA','update');
# Create the SVG output
$svg{'cases'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-cases','date'=>$updates{'cases-date'}));

# Set primary value keys
$hj->setPrimaryKey('daily');
$hj->setKeys('daily','dailyUTLA','UTLA','update');
# Create the SVG output
$svg{'cases-daily'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-cases-daily','date'=>$updates{'cases-date'}));

# Add the data
$hj->addData(%LAweek);
# Set primary value keys
$hj->setPrimaryKey('cases');
$hj->setKeys('cases','casesUTLA','days','update','d');
# Set the colour scale to use
$hj->setColourScale('Viridis');
# Create the SVG output
$svg{'cases-7day'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-percapita','date'=>$updates{'cases-date'}));



#########################
# Read in ONS death data
%deaths;
$latestversion = "0";
@lines = `wget -q --no-check-certificate -O- "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions"`;
foreach $line (@lines){
	if($line =~ /<a href="\/datasets\/weekly-deaths-local-authority\/editions\/time-series\/versions\/([0-9]*)"><h2 [^\>]*>([^\)]*) \(latest\)<\/h2>/){
		if($1 gt $latestversion){
			$latestversion = $1;
			$updates{'deaths-date'} = tidyDate($2);
		}
	}
}
$file = $dir."temp/deaths-version-$latestversion.csv";
print "File: $file\n";
if(!-e $file){
	$url = "https://download.ons.gov.uk/downloads/datasets/weekly-deaths-local-authority/editions/time-series/versions/$latestversion.csv";
	print "Getting deaths data as of $updates{'deaths-date'} from $url\n";
	`wget -q --no-check-certificate -O "$file" "$url"`;
}



open(FILE,$file);
$i = 0;
while (my $line = <FILE>) {
    chomp $line;
	if($i == 0){
		%headers = getHeaders($line);
	}
	if($i > 0 && $i < 160000 && $line =~ /\,/){
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
		#v4_1,Data Marking,calendar-years,time,admin-geography,geography,week-number,week,cause-of-death,causeofdeath,place-of-death,placeofdeath,registration-or-occurrence,registrationoroccurrence
		if(!$deaths{$cols[$headers{'admin-geography'}]}){
			$deaths{$cols[$headers{'admin-geography'}]} = { 'all-causes'=>0,'covid-19'=>0 };
		}
		if($cols[$headers{'registration-or-occurrence'}] eq "registrations"){
			if($cols[$headers{'cause-of-death'}] eq "all-causes"){
				$deaths{$cols[$headers{'admin-geography'}]}{'all-causes'} += $cols[$headers{'v4_1'}];
			}elsif($cols[$headers{'cause-of-death'}] eq "covid-19"){
				$deaths{$cols[$headers{'admin-geography'}]}{'covid-19'} += $cols[$headers{'v4_1'}];
			}
		}
	}
	$i++;
}
foreach $id (keys(%deaths)){
	$deaths{$id}{'deaths-percent'} = 0;
	if($deaths{$id}{'all-causes'} > 0){
		$deaths{$id}{'deaths-percent'} = 100*$deaths{$id}{'covid-19'}/$deaths{$id}{'all-causes'};
	}
	if($pop{$id}){
		# Normalise the numbers to per capita figures
		$deaths{$id}{'covid-19-percapita'} = int($deaths{$id}{'covid-19'}*1e5/$pop{$id} + 0.5);
		$deaths{$id}{'all-causes-percapita'} = int($deaths{$id}{'all-causes'}*1e5/$pop{$id} + 0.5);
	}else{
		$deaths{$id}{'covid-19-percapita'} = 0;
		$deaths{$id}{'all-causes-percapita'} = 0;
	}

}

# Set to 2020 Local Authority layout
$hj->load('../resources/uk-local-authority-districts-2020.hexjson');


# Add the data
$hj->addData(%deaths);
# Set primary value keys
$hj->setPrimaryKey('covid-19-percapita');
$hj->setKeys('covid-19','covid-19-percapita');
# Create the SVG output
$svg{'deaths-covid'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-deaths-covid','date'=>$updates{'deaths-date'}));



# Set primary value keys
$hj->setPrimaryKey('all-causes-percapita');
$hj->setKeys('all-causes','all-causes-percapita');
# Create the SVG output
$svg{'deaths-all'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-deaths-all','date'=>$updates{'deaths-date'}));
#$svg{'deaths-all'} .= $hj->getColourScale();


# Set primary value keys
$hj->setPrimaryKey('deaths-percent');
$hj->setKeys('deaths-percent');
# Create the SVG output
$svg{'deaths-percent'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-deaths-percent','date'=>$updates{'deaths-date'}));




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
$svg{'keyworkers'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-keyworkers','date'=>'2020-05-15'));




#################################################
# Read in job retention data from HMRC https://www.gov.uk/government/statistics/coronavirus-job-retention-scheme-statistics-june-2020
%jobs;
%employment;
# First get NOMIS figures on employment-income-support-scheme-statistics-june-2020
open(FILE,$dir."nomis-employment.csv");
@lines = <FILE>;
close(FILE);
#"Area","mnemonic","Numerator","Denominator","Employment rate - aged 16-64","Conf"
for($i = 9; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
	$cols[1] =~ s/(^\"|\"$)//g;
	$employment{$cols[1]} = $cols[2];
}
# Calculate UTLA employment figures 
foreach $id (sort(keys(%utla))){
	if(!$employment{$id}){
		$nla = @{$utla{$id}->{'la'}};
		$employment{$id} = 0;
		foreach $convla (@{$utla{$id}->{'la'}}){
			if($employment{$convla}){
				$employment{$id} += $employment{$convla};
			}else{
				print "No employment for $convla so can't add to total for $id\n";
			}
		}
		#print "Calculated employment from $nla authorities as $employment{$id}\n";
	}else{
		#print "Already got an employment figure for this group - $id - $employment{$id}\n";
	}
}
# Manual fix for old ONS code
$employment{'E10000002'} = $employment{'E06000060'};
# Now get the HMRC data
$updates{'jobs-date'} = "2020-06-11";
open(FILE,$dir."hmrc-job-retention-scheme-statistics-june-2020.csv");
@lines = <FILE>;
close(FILE);
# Split the headers and tidy
$lines[0] =~ s/[\n\r]//g;
#ONS code,County and district / unitary authority,Total number of employments furloughed
for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
	$id = $cols[0];
	$cols[1] =~ s/(^\"|\"$)//g;
	$jobs{$id} = { 'furloughed'=>$cols[2], 'total'=>$cols[2], 'name'=>$cols[1], 'pc'=>0, 'UTLA'=>'','pop'=>0, 'employment'=>$employment{$id} };
	if(!$employment{$id}){
		#print "No employment figure for $id\n";
	}else{
		$jobs{$id}{'pc'} = int($jobs{$id}{'furloughed'}*100/$employment{$id} + 0.5);
		$jobs{$id}{'pop'} = $pop{$id};
	}

	# If we have a UTLA with this code we'll populate the associated LAs unless they have been done
	if($utla{$id}){
		$nla = @{$utla{$id}->{'la'}};
		foreach $convla (@{$utla{$id}->{'la'}}){
			if(!$jobs{$convla}){
				if(!$employment{$id}){
					print "$convla - $id missing employment figure\n";
				}
				$jobs{$convla}{'employment'} = $employment{$id};			# LA gets total employment for the UTLA
				$jobs{$convla}{'furloughed'} = $jobs{$id}{'furloughed'};	# LA gets total furloughed for the UTLA
				$jobs{$convla}{'total'} = $jobs{$id}{'furloughed'}/$nla;	# LA gets the portion of the UTLA furloughed
				$jobs{$convla}{'name'} = $cols[1];
				$jobs{$convla}{'UTLA'} = $jobs{$id}{'name'};
				if($employment{$id}){
					$jobs{$convla}{'pc'} = int($jobs{$id}{'furloughed'}*100/$employment{$id} + 0.5);
				}else{
					print "No employment for $id - $convla\n";
				}
				if($pop{$id}){
					$jobs{$convla}{'pop'} = $pop{$id};
				#}elsif($pop{$convla}){
					#$jobs{$convla}{'pc'} = int($jobs{$id}{'furloughed'}*100/$pop{$convla} + 0.5);
					#$jobs{$convla}{'pop'} = $pop{$convla};
				#	print "Using $pop{$convla}\n";
				}else{
					print "No population for $id - $convla - $employment{$convla} - $jobs{$id}{'furloughed'}\n";
				}
			}else{
#				print "UTLA ($nla) $id - $convla\n";
			}
		}
	}
}
# Create furloughed worker map - the data are for 
$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
$hj->addData(%jobs);
$hj->setPrimaryKey('total');
$hj->setKeys('furloughed','total','UTLA');
$hj->setColourScale('Viridis');
$svg{'furloughed-total'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-furloughed-total','date'=>$updates{'jobs-date'}));


# Create furloughed worker map - the data are for 
$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
$hj->addData(%jobs);
$hj->setPrimaryKey('pc');
$hj->setKeys('pc','furloughed','employment','pop','UTLA');
$hj->setColourScale('Viridis');
$svg{'furloughed-percent'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-furloughed-percapita','date'=>$updates{'jobs'}));




#################################################
# Read in self-employed data from HMRC https://www.gov.uk/government/statistics/self-employment-income-support-scheme-statistics-june-2020
%selfemployed;
$updates{'self-employed-date'} = "2020-06-11";
open(FILE,$dir."hmrc-self-employment-income-support-scheme-statistics-june-2020.csv");
@lines = <FILE>;
close(FILE);
# Split the headers and tidy
$lines[0] =~ s/[\n\r]//g;
#ONS code,Authority name,Total potentially eligible population,Total no. of claims made to 31/5/20,Total value of claims made to 31/5/20 (£),Average value of claims made to 31/5/20 (£),Take-Up Rate
for($i = 1; $i < @lines; $i++){
	$lines[$i] =~ s/[\n\r]//g;
	(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
	$id = $cols[0];
	$cols[1] =~ s/(^\"|\"$)//g;
	$selfemployed{$id} = { 'name'=>$cols[1],'potential'=>$cols[2],'claims'=>$cols[3],'claimsav'=>$cols[3],'value'=>$cols[4],'valueav'=>$cols[4],'average'=>$cols[5],'UTLA'=>'' };
	if($pop{$id}){
		$selfemployed{$id}{'pop'} = $pop{$id};
	}

	# If we have a UTLA with this code we'll populate the associated LAs unless they have been done
	if($utla{$id}){
		$nla = @{$utla{$id}->{'la'}};
		foreach $convla (@{$utla{$id}->{'la'}}){
			if(!$selfemployed{$convla}){
#				print "UTLA ($nla) $id - $convla - $selfemployed{$id}{'furloughed'} - $pop{$id} - YES\n";
				$selfemployed{$convla}{'valueav'} = $selfemployed{$id}{'value'}/$nla;
				$selfemployed{$convla}{'claimsav'} = $selfemployed{$id}{'claims'}/$nla;
				$selfemployed{$convla}{'average'} = $selfemployed{$id}{'average'};
				$selfemployed{$convla}{'name'} = $cols[1];
				$selfemployed{$convla}{'UTLA'} = $selfemployed{$id}{'name'};
			}else{
#				print "UTLA ($nla) $id - $convla\n";
			}
		}
	}
	#print "$id = $selfemployed{$id}{'average'} - $pop{$id}\n";
}
# Create self-employed maps
$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
$hj->addData(%selfemployed);
$hj->setPrimaryKey('average');
$hj->setKeys('average','UTLA');
$hj->setColourScale('Viridis');
$svg{'self-employed-average'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-self-employed-average','date'=>$updates{'self-employed-date'}));


$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
$hj->addData(%selfemployed);
$hj->setPrimaryKey('valueav');
$hj->setKeys('value','valueav','UTLA');
$hj->setColourScale('Viridis');
$svg{'self-employed-value'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-self-employed-value','date'=>$updates{'self-employed-date'}));


$hj->load('../resources/uk-local-authority-districts-2019.hexjson');
$hj->addData(%selfemployed);
$hj->setPrimaryKey('claimsav');
$hj->setKeys('claims','claimsav','UTLA');
$hj->setColourScale('Viridis');
$svg{'self-employed-claims'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-self-employed-claims','date'=>$updates{'self-employed-date'}));





###############################
# Read in the 360 Giving data
$file = "$dir/temp/grants.json";
$dl = (-e $file ? 0 : 1);
# If the file is older than a day (86400 seconds) we want to get a new copy
$updates{'grants-date'} = "2000-01-01";#strftime('%%Y-%m-%d',(stat $file)[9]);
if(time() - (stat $file)[9] >= 86400){ $dl = 1; }
if($dl){
	print "Getting 360 Giving data from https://covidtracker.threesixtygiving.org/data/grants.json\n";
	`wget -q --no-check-certificate -O $file "https://covidtracker.threesixtygiving.org/data/la.json"`
}
$updates{'grants-date'} = strftime('%Y-%m-%d',localtime((stat $file)[9]));
open(FILE,$file);
@lines = <FILE>;
close(FILE);
$giving = JSON::XS->new->utf8->decode(join("\n",@lines));
%threesixtygiving;
$updates{'grants-noarea'} = 0;
$updates{'grants-area'} = 0;
for($i = 0; $i < @{$giving}; $i++){
	$la = $giving->[$i]->{'lacd'};
	if($la ne "unknown"){
		$threesixtygiving{$la} = {'amountAwardedExcl'=>$giving->[$i]->{'grant_amount_gbp_excluding_grantmakers'},'amountAwarded'=>$giving->[$i]->{'grant_amount_gbp'},'grants'=>$giving->[$i]->{'grant_count'},'grantsExcl'=>$giving->[$i]->{'grant_count_excluding_grantmakers'}};
		$updates{'grants-area'} += $giving->[$i]->{'grant_amount_gbp_excluding_grantmakers'};
	}else{
		$updates{'grants-noarea'} = $giving->[$i]->{'grant_amount_gbp_excluding_grantmakers'};
	}
}


#for($g = 0; $g < @grants; $g++){
#	#print "$g - $grants[$g]->{'title'}\n";
#	@geos = sort(keys(%{$grants[$g]->{'geo'}}));
#	if($grants[$g]->{'awardDate'} =~ /([0-9]{4}-[0-9]{2}-[0-9]{2})/){
#		if($1 gt $updates{'grants-date'}){ $updates{'grants-date'} = $1; }
#	}
#	if($grants[$g]->{'dateModified'} =~ /([0-9]{4}-[0-9]{2}-[0-9]{2})/){
#		if($1 gt $updates{'grants-date'}){ $updates{'grants-date'} = $1; }
#	}
#	if(@geos == 0){
#		$updates{'grants-noarea'} += $grants[$g]->{'amountAwarded'};
#		#print "\tNo geo - $g $grants[$g]->{'amountAwarded'}\n";
#	}else{
#		if(@geos > 1){
#			print "\tMultiple geographies\n";
#		}
#		foreach $geo (sort(keys(%{$grants[$g]->{'geo'}}))){
#			#print "\t".$geo."\n";
#			if($geo !~ /^[EWSN][0-9]*/){
#				print "Bad Geo $geo\n";
#			}
#			if($grants[$g]->{'geo'}{$geo}{'LAD20CD'} && $geo =~ /^[EWSN][0-9]*/){
#				if(!$threesixtygiving{$grants[$g]->{'geo'}{$geo}{'LAD20CD'}}){
#					$threesixtygiving{$grants[$g]->{'geo'}{$geo}{'LAD20CD'}} = {'amountAwarded'=>0,'blah'=>0};
#				}
#				$threesixtygiving{$grants[$g]->{'geo'}{$geo}{'LAD20CD'}}{'amountAwarded'} += $grants[$g]->{'amountAwarded'};
#				$updates{'grants-area'} += $grants[$g]->{'amountAwarded'};
#				if(!$grants[$g]->{'amountAwarded'}){
#					print "No amount awarded $g\n";
#				}
#			}else{
#				print "NO LAD!!!!!! $g\n";
#				$updates{'grants-noarea'} += $grants[$g]->{'amountAwarded'};
#			}
#		}
#	}
#}
$updates{'grants-noarea'} = niceSize($updates{'grants-noarea'});
$updates{'grants-area'} = niceSize($updates{'grants-area'});
print $updates{'grants-noarea'}." no area vs $updates{'grants-area'} area\n";
$hj->load('../resources/uk-local-authority-districts-2020.hexjson');
$hj->addData(%threesixtygiving);
$hj->setPrimaryKey('amountAwardedExcl');
$hj->setKeys('amountAwarded','amountAwardedExcl');
$hj->setColourScale('Viridis');
$svg{'grantnav-awarded'} = $hj->map(('width'=>'480','scalebar'=>'scalebar-grantnav-awarded','date'=>$updates{'grants-date'}));








################################
# Build HTML page
@htmloutput;
$inhexmap = 0;
for($i = 0; $i < @html; $i++){
	foreach $dstr (keys(%updates)){
		$html[$i] =~ s/(<span class="$dstr">)[^\<]*(<\/span>)/$1$updates{$dstr}$2/g;
	}
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
















###################################
# SUBROUTINES

sub getArea {
	my ($id,$d,$url,$json,$f);
	$id = $_[0];
	$d = $dir."areas/";
	$f = "$id.json";
	$url = "https://findthatpostcode.uk/areas/";
	if(!-d $d){ `mkdir $d`; }
	if(!-e $d.$f || -s $d.$f == 0){
		`wget -q --no-check-certificate -O "$d$f" "$url$id.json"`;
	}
	open(FILE,"$d$id.json");
	@lines = <FILE>;
	close(FILE);
	$json = JSON::XS->new->utf8->decode(join("\n",@lines));
	$areas{$id} = $json;
	return %{$json};
}

sub niceSize {
	my $v = $_[0];
	my $out = sprintf("%0.2f",$v);
	if($v > 1e7){ $out = sprintf("%0.1f",$v/1e6)."M"; }
	elsif($v > 1e6){ $out = sprintf("%0.1f",$v/1e6)."M"; }
	elsif($v > 1e5){ $out = sprintf("%0f",$v/1e3)."k"; }
	elsif($v > 1e4){ $out = sprintf("%0.1f",$v/1e3)."k"; }
	elsif($v > 1e3){ $out = sprintf("%0.1f",$v/1e3)."k"; }
	$out =~ s/\.0([A-Za-z])$/$1/g;
	return $out;
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

sub getCases {
	my ($url,@lines,@header,$c,$cc,%headers,$i,@cols,$d,$id,$oid,$name,@dates,$min,$max,$dt,$json,$n,%json);

	# Get the CSV from Giles
	$url = $_[0];
	@lines = `wget -q --no-check-certificate -O- "$url"`;
	if(@lines > 0){

		# Split the headers and tidy
		$lines[0] =~ s/[\n\r]//g;
		(@header) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[0]);
		for($c = 0; $c < @header; $c++){
			$header[$c] =~ s/(^\"|\"$)//g;
			$headers{$header[$c]} = $c;
		}

		# Loop over rows
		for($i = 1 ; $i < @lines; $i++){
			chomp($lines[$i]);
			(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
			$cols[$headers{'Area'}] =~ s/(^\"|\"$)//g;
			$cols[$headers{'TotalCases'}] =~ s/(^\"|\"$)//g;
			$cols[$headers{'Date'}] =~ s/(^\"|\"$)//g;
			$cols[$headers{'DailyCases'}] =~ s/(^\"|\"$)//g;
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
			
			if(!$LA{$id}){ $LA{$id} = {'name'=>'','country'=>'','dates'=>{}}; }
			# Only add the date if it has a value
			if(!$LA{$id}{'dates'}{$d}){ $LA{$id}{'dates'}{$d} = { 'total'=>0,'daily'=>0 }; }
			# Only count the first entry for this day
			if($cols[$headers{'TotalCases'}] ne "" && $LA{$id}{'dates'}{$d}{'total'}==0){ $LA{$id}{'dates'}{$d}{'total'} = $cols[$headers{'TotalCases'}]; }
			if($cols[$headers{'DailyCases'}] ne "" && $LA{$id}{'dates'}{$d}{'daily'}==0){ $LA{$id}{'dates'}{$d}{'daily'} = $cols[$headers{'DailyCases'}]; }

			$cc = substr($id,0,1);
			if($cc eq "E"){ $LA{$id}{'country'} = "England"; }
			elsif($cc eq "S"){ $LA{$id}{'country'} = "Scotland"; }
			elsif($cc eq "W"){ $LA{$id}{'country'} = "Wales"; }
			elsif($cc eq "N"){ $LA{$id}{'country'} = "Northern Ireland"; }

			if(!$LA{$id}{'name'}){
				if($name ne $id){
					print "Using $name for $id\n";
					$LA{$id}{'name'} = $name;
				}else{
					%json = getArea($id);
					$LA{$id}{'name'} = $json{'data'}{'attributes'}{'name'};
					print "Got name for $id - $LA{$id}{'name'}\n";
				}
			}

			if($cols[$headers{'Date'}] gt $updates{'cases-date'}){ $updates{'cases-date'} = $cols[$headers{'Date'}]; }
		}

	}else{
		print "Empty file";
	}
	return;
}

sub saveLAJSON {
	my (@dates,$min,$max,$dt,$id,$n,$json,$i,$d,$nla,$jsonla);

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
			$jsonla = "\t\t\"$id\":{";
			$jsonla .= "\"n\":\"$LA{$id}{'name'}\",";
			$jsonla .= "\"c\":\"$LA{$id}{'country'}\",";
			$jsonla .= "\"mindate\":\"$dates[0]\",";
			$jsonla .= "\"maxdate\":\"".$dates[$n-1]."\",";
			$jsonla .= "\"v\":[";

			$min = getJulianFromISO($dates[0]);
			$max = getJulianFromISO($dates[$n-1]);
			$dt = getJulianFromISO($dates[0]);
			$week = $max-7;


			
			for($i = 0; $dt <= $max; $i++, $dt++){
				if($i > 0){
					$jsonla .= ",";
				}
				$d = getDate($dt,"%Y-%m-%d");
				$jsonla .= ($LA{$id}{'dates'}{$d}{'total'} ? $LA{$id}{'dates'}{$d}{'total'} : "null");
#				if($utla{$id}){
#					$nla = @{$utla{$id}->{'la'}};
#					foreach $convla (@{$utla{$id}->{'la'}}){
#						if($pop{$id}){
#							$LAlast{$convla} = {'percapita'=>int($LA{$id}{'dates'}{$d}{'total'}*1e5/$pop{$id} + 0.5),'casesUTLA'=>$LA{$id}{'dates'}{$d}{'total'},'cases'=>$LA{$id}{'dates'}{$d}{'total'}/$nla,'UTLA'=>$LA{$id}{'name'},'dailyUTLA'=>$LA{$id}{'dates'}{$d}{'daily'},'daily'=>$LA{$id}{'dates'}{$d}{'daily'}/$nla,'update'=>$d};
#							if($dt > $week){
#								if(!$LAweek{$convla}){ $LAweek{$convla} = {'casesUTLA'=>0,'cases'=>0,'days'=>0,'update'=>''}; }
#								$LAweek{$convla}{'casesUTLA'} += $LA{$id}{'dates'}{$d}{'daily'};
#								$LAweek{$convla}{'cases'} += $LA{$id}{'dates'}{$d}{'daily'}/$nla;
#								$LAweek{$convla}{'days'}++;
#								$LAweek{$convla}{'update'} = $d;
#							}
#						}else{
#							print "No population for $id\n";
#						}
#					}
#				}else{
					if($pop{$id}){
						$LAlast{$id} = {'percapita'=>int($LA{$id}{'dates'}{$d}{'total'}*1e5/$pop{$id} + 0.5),'cases'=>$LA{$id}{'dates'}{$d}{'total'},'casesUTLA'=>$LA{$id}{'dates'}{$d}{'total'},'daily'=>$LA{$id}{'dates'}{$d}{'daily'},'update'=>$d};
						if($dt > $week){
							if(!$LAweek{$id}){ $LAweek{$id} = {'cases'=>0,'days'=>0,'update'=>'','d'=>''}; }
							$LAweek{$id}{'cases'} += $LA{$id}{'dates'}{$d}{'daily'};
							$LAweek{$id}{'days'}++;
							$LAweek{$id}{'d'} .= ", $d";
							$LAweek{$id}{'update'} = $d;
						}
					}else{
						print "No population for $id\n";
					}
#				}
			}

			$jsonla .= $dates."]";
			$jsonla .= "}";
			$json .= $jsonla;
		}
	}
	print "Save to $dir/utla.json\n";
	open(FILE,">","$dir/utla.json");
	print FILE "{\n";
	print FILE "\t\"src\":{\"name\":\"ODI Leeds\",\"url\":\"https://github.com/odileeds/covid-19-uk-datasets/tree/master/data\"},\n";
#	print FILE "\t\"src\":{\"name\":\"Tom White\",\"url\":\"https://github.com/tomwhite/covid-19-uk-data/blob/master/data/covid-19-cases-uk.csv\"},\n";
	print FILE "\t\"lastupdate\":\"".$updates{'cases-date'}."\",\n";
	print FILE "\t\"data\": {\n";
	print FILE $json."\n";
	print FILE "\t}\n";
	print FILE "}";
	close(FILE);

	return;
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

sub tidyDate {
	my ($m,$mm,$dd,$yy);
	my $str = $_[0];
	my @months = ('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	my @monthslong = ('January','February','March','April','May','June','July','August','September','October','November','December');
	
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
		$str = "$yy-$mm-$dd";
	}
	return $str;
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
