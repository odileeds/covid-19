#!/usr/bin/perl

use Data::Dumper;
use POSIX qw(strftime);
use JSON::XS;
use lib "./lib/";
#use vars qw($lib);
#BEGIN {$lib = $0; $lib =~ s/[^\/\\]+$//}
#use lib $lib . 'lib';
use ODILeeds::Graph;
use ODILeeds::DateTime;


logIt("Started");

# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1\//g; }
else{ $dir = "./"; }
if($ARGV[0] eq "debug"){
	$debug = 1;
}else{
	$debug = 0;
}

logIt("Using directory: $dir");

# Create a DateTime object
$datetime = ODILeeds::DateTime->new();


# Load coordinates for LADs
open(FILE,$dir."lad20-coordinates.csv");
@lines = <FILE>;
close(FILE);
%coords;
foreach $line (@lines){
	$line =~ s/[\n\r]//g;
	($la,$lon,$lat) = split(/\,/,$line);
	$coords{$la} = {'lat'=>$lat,'lon'=>$lon};
}



$deathurl = "https://www.ons.gov.uk/peoplepopulationandcommunity/healthandsocialcare/causesofdeath/datasets/deathregistrationsandoccurrencesbylocalauthorityandhealthboard";
@las;
%names;
open(FILE,$dir."la.csv");
@lines = <FILE>;
close(FILE);
foreach $line (@lines){
	chomp($line);
	push(@las,$line);
}

# Get the populations data
open(FILE,$dir."populations.json");
@lines = <FILE>;
close(FILE);
%pop = %{JSON::XS->new->utf8->decode(join("\n",@lines))};



# Get population data from NIMS
%nims;
open(FILE,$dir."../../vaccines/data/NIMS-LTLA-population.csv");
@lines = <FILE>;
close(FILE);
$i = 0;
foreach $line (@lines){
	if($i == 0){
		%header = getHeaders($line);
	}elsif($i > 0){
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
		$latmp = $cols[$header{'LTLA Code'}];
		if(!$nims{$latmp}){
			$nims{$latmp} = {};
			foreach $h (keys(%header)){
				if($h =~ /[0-9]/){
					$h2 = $h;
					if($h2 =~ /Under ([0-9]+)/i){
						$h2 = "0-".($1-1);
					}
					$cols[$header{$h}] =~ s/(^\"|\"$)//g;
					$cols[$header{$h}] =~ s/[\,\s]//g;
					$cols[$header{$h}] =~ s/\"//g;
					$nims{$latmp}{$h2} = $cols[$header{$h}];
				}
			}
			$nims{$latmp}{'0-17'} = $nims{$latmp}{'0-17'};
			$nims{$latmp}{'0-24'} = $nims{$latmp}{'0-17'}+$nims{$latmp}{'18-24'};
			$nims{$latmp}{'0-29'} = $nims{$latmp}{'0-24'}+$nims{$latmp}{'25-29'};
			$nims{$latmp}{'0-34'} = $nims{$latmp}{'0-29'}+$nims{$latmp}{'30-34'};
			$nims{$latmp}{'0-39'} = $nims{$latmp}{'0-34'}+$nims{$latmp}{'35-39'};
			$nims{$latmp}{'0-44'} = $nims{$latmp}{'0-39'}+$nims{$latmp}{'40-44'};
			$nims{$latmp}{'0-49'} = $nims{$latmp}{'0-44'}+$nims{$latmp}{'45-49'};
			$nims{$latmp}{'0-54'} = $nims{$latmp}{'0-49'}+$nims{$latmp}{'50-54'};
			$nims{$latmp}{'0-59'} = $nims{$latmp}{'0-54'}+$nims{$latmp}{'55-59'};
			$nims{$latmp}{'0-64'} = $nims{$latmp}{'0-59'}+$nims{$latmp}{'60-64'};
			$nims{$latmp}{'0-69'} = $nims{$latmp}{'0-64'}+$nims{$latmp}{'65-69'};
			$nims{$latmp}{'all'} = $nims{$latmp}{'0-69'}+$nims{$latmp}{'70-74'}+$nims{$latmp}{'75-79'}+$nims{$latmp}{'80+'};
		}
	}
	$i++;
}


# Get the vaccine data
%vaccines = processVaccines();
logIt("Processed vaccines");

# Get the names data
open(FILE,$dir."names.json");
@lines = <FILE>;
close(FILE);
%names = %{JSON::XS->new->utf8->decode(join("\n",@lines))};





# Get the death data
%deaths = processDeaths();
logIt("Processed deaths");

$start = 5;
%LAD;
@pulsarplot;

$url = "https://api.coronavirus.data.gov.uk/v2/data?areaType=ltla&metric=cumCasesBySpecimenDate&metric=newCasesBySpecimenDate&format=csv";
$file = $dir."raw/ltla.csv";
$head = $dir."raw/ltla.head";
$lastupdated = "";
# Find the file age in hours
if(-e $head){
	open(FILE,$head);
	@headlines = <FILE>;
	close(FILE);
	$strhead = join("===",@headlines);
	$now = $datetime->getJulianDate();
	$strhead =~ /(^|===)Last-Modified: ([^\n]*)\n/i;
	$lastupdated = $datetime->parseISO($2);
	$jd = $datetime->getJulianFromISO($lastupdated);
	
	$diff = (($now-$jd)*24);
	# Get the last check date
	if($strhead =~ /(^|===)date: ([^\n]*)\n/i){
		$jd = $datetime->getJulianFromISO($datetime->parseISO($2));
		$diff = (($now-$jd)*24);
	}
	if($diff == 0){
		print "$la - $jd\n";
	}
}else{
	$diff = 24;
}


print "Here - $diff\n";
if($diff > 6 || -s $head==0 || !-e $file){
	logIt("\tGetting URL $url");
	`curl -sI "$url" > $head`;
	`curl -s --compressed "$url" > $file`;

	# Find the file age in hours
	open(FILE,$head);
	@headlines = <FILE>;
	close(FILE);
	$strhead = join("===",@headlines);
	$now = $datetime->getJulianDate();
	$strhead =~ /(^|===)Last-Modified: ([^\n]*)\n/i;
	$lastupdated = $datetime->parseISO($2);
	$jd = $datetime->getJulianFromISO($lastupdated);
	
	$diff = (($now-$jd)*24);
	# Get the last check date
	if($strhead =~ /(^|===)date: ([^\n]*)\n/i){
		$jd = $datetime->getJulianFromISO($datetime->parseISO($2));
		$diff = (($now-$jd)*24);
	}
	if($diff == 0){
		print "$la - $jd\n";
	}

}

%casedata;
open(FILE,$file);
$i = 0;
while (my $line = <FILE>){
	$line =~ s/[\n\r]//g;
	if($i == 0){
		%header = getHeaders($line);
	}elsif($i > 0){
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
		$id = $cols[$header{'areaCode'}];
		$dt = $cols[$header{'date'}];
		if(!$casedata{$id}){ $casedata{$id} = {'name'=>$cols[$header{'areaName'}],'dates'=>{}}; }
		$casedata{$id}{'name'} =~ s/(^\"|\"$)//g;
		if(!$casedata{$id}{'dates'}{$dt}){
			$casedata{$id}{'dates'}{$dt} = {'cumCases'=>$cols[$header{'cumCasesBySpecimenDate'}],'newCases'=>$cols[$header{'newCasesBySpecimenDate'}]};
		}else{
			print "WARNING: $dt already exists for $id\n";
		}
	}
	$i++;
}
close(FILE);


foreach $la (sort(keys(%casedata))){

	@dates = reverse(sort(keys(%{$casedata{$la}{'dates'}})));
	
	$file = $dir."../dashboard/data/$la.json";
	$names{$la} = $casedata{$la}{'name'};
	print "$la = $names{$la}\n";

	$txt = "";
	$txt .= "{\n";
	$txt .= "\t\"name\":\"$names{$la}\",\n";
	$txt .= "\t\"population\": ".($nims{$la}{'all'}||$pop{$la}||0).",\n";
	if($vaccines{$la}){
		$txt .= "\t\"vaccines\":{\n";
		$txt .= "\t\t\"src\": \"https://www.england.nhs.uk/statistics/statistical-work-areas/covid-19-vaccinations/\",\n";
		$vdate = "";
		foreach $wk (sort(keys(%{$vaccines{$la}}))){
			if($wk gt $vdate){
				$vdate = $wk;
			}
		}
		$txt .= "\t\t\"updated\": \"$vdate\",\n";
		$txt .= "\t\t\"totals\":[\n";
		$w = 0;
		foreach $wk (reverse(sort(keys(%{$vaccines{$la}})))){
			if($w > 0){ $txt .= "\,\n"; }
			$txt .= "\t\t\t{\"date\":\"$wk\",\"ages\":{";
			$k = 0;
			foreach $ky (sort(keys(%{$vaccines{$la}{$wk}}))){
				if($k > 0){ $txt .= "\,"; }
				$n = ($vaccines{$la}{$wk}{$ky}{'n'}||0);
				$p = ($vaccines{$la}{$wk}{$ky}{'pop'}||0);
				$pc = ($vaccines{$la}{$wk}{$ky}{'%'}||0);
				$secn = ($vaccines{$la}{$wk}{$ky}{'2nd'}||0);
				$secpc = ($vaccines{$la}{$wk}{$ky}{'2nd %'}||0);
				$n =~ s/\"//g;	# Extra tidy
				if($secn > 0){
					$txt .= "\"$ky\":{\"pop\":$p,\"1st\":$n,\"1st %\":$pc";
					$txt .= ",\"2nd\":$secn,\"2nd %\":$secpc";
				}else{
					$txt .= "\"$ky\":{\"n\":$n,\"pop\":$p,\"%\":$pc";
				}
				$txt .= "}";
				$k++;
			}
			$txt .= "}}";
			$w++;
		}
		$txt .= "\n\t\t]\n";
		$txt .= "\t},\n";
	}
	if($deaths{$la}){
		#"E06000001": {"total":{"date":"2020-09-24","all":819,"covid-19":110},"week":{"text":"Week 37","all":16,"covid-19":0}},
		$txt .= "\t\"deaths\":{\n";
		$txt .= "\t\t\"src\": \"$deathurl\",\n";
		$txt .= "\t\t\"updated\": \"$deaths{$la}{'date'}\",\n";
		$txt .= "\t\t\"all\": $deaths{$la}{'all-causes'},\n";
		$txt .= "\t\t\"cov\": $deaths{$la}{'covid-19'},\n";
		$txt .= "\t\t\"weeks\":[\n";
		$w = 0;
		foreach $wk (reverse(sort(keys(%{$deaths{$la}{'weeks'}})))){
			if($w > 0){ $txt .= "\,\n"; }
			$txt .= "\t\t\t{\"txt\":\"$wk\",\"all\":$deaths{$la}{'weeks'}{$wk}{'all-causes'},\"cov\":$deaths{$la}{'weeks'}{$wk}{'covid-19'}}";
			$w++;
		}
		$txt .= "\n\t\t]\n";
		$txt .= "\t},\n";
	}
	$txt .= "\t\"cases\": {\n";
	$recentday = "";
	$len = @dates;
	if($len > 0){
		$txt .= "\t\t\"src\":\"$url\",\n";
		$txt .= "\t\t\"updated\":\"$lastupdated\",\n";
		$txt .= "\t\t\"type\":\"SpecimenDate\",\n";
		$txt .= "\t\t\"n\": $len,\n";
		$txt .= "\t\t\"days\":[\n";
		$j = 0;
		foreach $dt (@dates){
			#e.g. {"date":"2021-06-22","day":12,"tot":9126},
			$txt .= ($j > 0 ? ",\n":"");
			$txt .= "\t\t\t\{\"date\":\"$dt\",\"day\":$casedata{$la}{'dates'}{$dt}{'newCases'},\"tot\":$casedata{$la}{'dates'}{$dt}{'cumCases'}\}";
			$j++;
		}
		$txt .= "\n";
		$txt .= "\t\t]\n";
	}
	$txt .= "\t}\n";
	$txt .= "}\n";


	updateFile($file,$txt);

	@smooth = makeGraph($la);

	# Work out the latest (as of 5 days ago in the data) 7-day-smoothed values for each LA
	# Load the data back in
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	%lajson = %{JSON::XS->new->utf8->decode(join("\n",@lines))};
	$LAD{$la} = { %lajson };
	$t = 0;
	for($d = 2; $d <= 8; $d++){
		$t += $LAD{$la}{"cases"}{"days"}[$d]{"day"};
	}
	$LAD{$la}{'cases'}{'latest_smoothed_100k'} = int(($t/7)*1e5/$LAD{$la}{'population'} + 0.5);
	$LAD{$la}{'deaths'}{'latest_100k'} = sprintf("%0.1f",$LAD{$la}{'deaths'}{'weeks'}[0]{'cov'}*1e5/$LAD{$la}{'population'});
	$start = 5;
	$w = 0;
	$w2 = 0;
	for($d = $start; $d < $start+7; $d++){
		$w += $LAD{$la}{"cases"}{"days"}[$d]{"day"};
	}
	for($d = $start+7; $d < $start+14; $d++){
		$w2 += $LAD{$la}{"cases"}{"days"}[$d]{"day"};
	}
	$LAD{$la}{'cases'}{'weekly'} = int($w*1e5/$LAD{$la}{'population'} + 0.5);
	$LAD{$la}{'cases'}{'weekly_change'} = int(($w-$w2)*1e5/$LAD{$la}{'population'} + 0.5);
	
	$updateday = $LAD{$la}{"cases"}{"days"}[$start]{"date"};
	
	if(@smooth > 1){
		# Only include if there is data
		push(@pulsarplot,{'id'=>$la,'name'=>$names{$la},'data'=>[]});
		@{$pulsarplot[@pulsarplot - 1]->{'data'}} = @smooth;
	}
}

makePulsarPlot(2024,200,4,200,"cases-plot.svg",@pulsarplot);

# Sort by latitude
@pulsarplot = (sort{ $coords{$a->{'id'}}->{'lat'} <=> $coords{$b->{'id'}}->{'lat'} }(@pulsarplot));
@dates = makePulsarPlot(2024,200,4,200,"cases-plot-by-latitude.svg",@pulsarplot);

$sdate = strftime('%A %e %B %Y',gmtime($dates[0]));
$edate = strftime('%A %e %B %Y',gmtime($dates[1]));
$siso = strftime('%Y-%m-%d',gmtime($dates[0]));
$eiso = strftime('%Y-%m-%d',gmtime($dates[1]));
open(FILE,$dir."../cases.html");
@lines = <FILE>;
close(FILE);
$str = join("",@lines);
$str =~ s/(<!-- begin -->).*(<!-- end begin -->)/$1<time datetime="$siso">$sdate<\/time>$2/g;
$str =~ s/(<!-- upto -->).*(<!-- end upto -->)/$1<time datetime="$eiso">$edate<\/time>$2/g;
open(FILE,">",$dir."../cases.html");
print FILE $str;
close(FILE);




open(FILE,">",$dir."processed/index.json");
print FILE "{\n";
$i = 0;
foreach $la (sort(keys(%names))){
	if($i > 0){ print FILE ",\n"; }
	print FILE "\t\"$la\":\"$names{$la}\"";
	$i++;
}
print FILE "\n\}\n";
close(FILE);



$table = "\t\t\t<p>As of: $updateday</p>\n\t\t\t<table class=\"js-sort-table\">\n\t\t\t\t<tr><th>Local Authority</th><th class=\"js-sort-number\">Cases/100k</th><th class=\"js-sort-number\">Weekly cases/100k</th><th class=\"js-sort-number\">Weekly change/100k</th><th class=\"js-sort-number\">Weekly deaths/100k</th></tr>\n";
foreach $la (reverse(sort{ $LAD{$a}{'cases'}{'latest_smoothed_100k'} <=> $LAD{$b}{'cases'}{'latest_smoothed_100k'} || $LAD{$b}{'name'} cmp $LAD{$a}{'name'} }keys(%LAD))){
	$lvl = "0";
	if($LAD{$la}{'restrictions'}{'tier'} eq "Stay at home"){
		$lvl = 4;
	}elsif($LAD{$la}{'restrictions'}{'tier'} eq "Very High"){
		$lvl = 3;
	}elsif($LAD{$la}{'restrictions'}{'tier'} eq "High"){
		$lvl = 2;
	}elsif($LAD{$la}{'restrictions'}{'tier'} eq "Medium"){
		$lvl = 1;
	}else{
		$lvl = $LAD{$la}{'restrictions'}{'tier'};
	}
	$cls = "";
	$v = $LAD{$la}{'cases'}{'latest_smoothed_100k'};
	# Definitions from https://covid19.ca.gov/safer-economy/
	if($v >= 7){ $cls = "widespread"; }
	elsif($v >= 4 && $v < 7){ $cls = "substantial"; }
	elsif($v >= 1 && $v < 4){ $cls = "moderate"; }
	else{ $cls = "minimal"; }
	$table .= "\t\t\t\t<tr class=\"$cls\"><td><a href=\"data/$la.json\">$LAD{$la}{'name'}</a></td><td>$LAD{$la}{'cases'}{'latest_smoothed_100k'}</td><td>$LAD{$la}{'cases'}{'weekly'}</td><td>$LAD{$la}{'cases'}{'weekly_change'}</td><td>$LAD{$la}{'deaths'}{'latest_100k'}</td></tr>\n";
}
$table .= "\t\t\t</table>\n";
open(FILE,">",$dir."../dashboard/table.txt");
print FILE $table;
close(FILE);




#####################
# SUBROUTINES

sub updateFile {
	my $file = $_[0];
	my $txt = $_[1];
	my ($fh,$safei,$safeo);

	open($fh,$file);
	$safei = do { local $/; <$fh> };
	close($fh);
	$safeo = $txt;
	# Remove newlines and tabs before checking if they match
	$safei =~ s/[\n\r\t]//g;
	$safeo =~ s/[\n\r\t]//g;
	# If the existing file and the replacement text don't match then save it
	if($safei ne $safeo){
		print "\tUpdated $file\n";
		open(FILE,">",$file);
		print FILE $txt;
		close(FILE);
	}
	return;	
}
sub logIt {
	my $msg = $_[0];
	my $file = "/home/slowe/tmp/update-covid.log";
	my $t = strftime("%FT%T",gmtime);
	print "$t $msg\n";
	if(-e $file){
		open(LOG,">>","/home/slowe/tmp/update-covid.log");
		print LOG "$t $msg\n";
		close(LOG);
	}
}

sub makeGraph {
	my $la = $_[0];
	my ($file,%ladata,@lines,$i,$j,$n,@smooth,@raw,@recent,@recentraw,$graph,@output);

	@raw = [];
	@smooth = [];
	
	$file = $dir."../dashboard/data/$la.json";
	# Get the populations data
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	%ladata = %{JSON::XS->new->utf8->decode(join("\n",@lines))};

	$n = @{$ladata{'cases'}{'days'}};
	
	for($i = $n-1, $j = 0; $i>= 0; $i--,$j++){
		$raw[$j] = {'x'=>(($datetime->getJulianFromISO($ladata{'cases'}{'days'}[$i]{'date'}) + 0  - 2440587.5)*86400),'y'=>($ladata{'cases'}{'days'}[$i]{'day'}||0),'date'=>$ladata{'cases'}{'days'}[$i]{'date'}};
	}
	if($la eq "E06000053"){
		print Dumper %ladata;
	}
	if($n > 0){
		# Calculate 7-day rolling average
		for($i = 0; $i < @raw; $i++){
			$smooth[$i] = {'x'=>$raw[$i]{'x'},'y'=>0};
			$n = 0;
			for($j = $i-3; $j <= $i+3; $j++){
				if($j >=0 && $j < @raw){
					$smooth[$i]{'y'} += $raw[$j]{'y'};
					$n++;
				}
			}
			$smooth[$i]{'y'} /= $n;
			if($ladata{'population'}){
				$smooth[$i]{'y'} *= 1e5/$ladata{'population'};
			}
			$smooth[$i]{'title'} = $raw[$i]{'date'}.": ".sprintf("%0.0f",$smooth[$i]{'y'});
			push(@output,[$smooth[$i]{'x'},$smooth[$i]{'y'}]);
		}
		
		@recent = splice(@smooth,@smooth-$start,$start);
		@recentraw = splice(@raw,@raw-$start,$start);
		# Add first point back
		unshift(@recent,@smooth[@smooth-1]);
		unshift(@recentraw,$raw[@raw-1]);
		# Create the SVG output
		$file = $dir."../dashboard/svg/$la.svg";
		$graph = ODILeeds::Graph->new();
		
		# Add lines denoting levels
		@levels = ({'v'=>7,'title'=>'Widespread'},{'v'=>4,'title'=>'Substantial'},{'v'=>1,'title'=>'Moderate'});
		for($l = 0; $l < @levels; $l++){
			$graph->addSeries({'title'=>$levels[$l]{'title'},
					'id'=>$la.'-level-'.$l,
					'data'=>[{'x'=>$smooth[0]{'x'},'y'=>$levels[$l]{'v'}},{'x'=>$recent[@recent-1]{'x'},'y'=>$levels[$l]{'v'}}],
					'raw'=>[{'x'=>$smooth[0]{'x'},'y'=>$levels[$l]{'v'}},{'x'=>$recent[@recent-1]{'x'},'y'=>$levels[$l]{'v'}}],
					'color'=>'#fff',
					'stroke'=>1,
					'strokehover'=>3,
					'stroke-dasharray'=>'3,3',
					'opacity'=>0.3,
					'fill-opacity'=>0.3,
					'line'=>1
			});
		}
		$graph->addSeries({'title'=>'New cases',
					'data'=>\@smooth,
					'raw'=>\@raw,
					'color'=>'white',
					'stroke'=>1,
					'strokehover'=>3,
					'point'=>1,
					'line'=>1
		});
		$graph->addSeries({'title'=>'Recent cases',
					'data'=>\@recent,
					'raw'=>\@recentraw,
					'color'=>'white',
					'stroke'=>1,
#					'strokehover'=>3,
					'stroke-dasharray'=>'4,6',
					'stroke-dashoffset'=>4,
					'point'=>2.5,
					'pointhover'=>5,
					'line'=>1
		});
		$svg = $graph->draw({'width'=>480,'height'=>400,'left'=>25,'bottom'=>25,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>1,'ticks'=>true}}});
		updateFile($file,$svg);
	}
	return @output;
}

sub makePulsarPlot {
	my ($w,$p,$offset,$dy,$file,@output) = @_;
	my($minx,$miny,$maxx,$maxy,$la,$rangex,$rangey,$h,$n,$nd,$svg,$x,$y,$sdate,$edate);
	$minx = 1e100;
	$maxx = -1e100;
	$miny = 1e100;
	$maxy = -1e100;
	$n = 0;
	for($l = 0; $l < @output; $l++){
		$la = $output[$l]->{'id'};
		for($i = 0; $i < @{$output[$l]->{'data'}}; $i++){
			if($output[$l]->{'data'}[$i][0] < $minx){ $minx = $output[$l]->{'data'}[$i][0]; }
			if($output[$l]->{'data'}[$i][0] > $maxx){ $maxx = $output[$l]->{'data'}[$i][0]; }
			if($output[$l]->{'data'}[$i][1] < $miny){ $miny = $output[$l]->{'data'}[$i][1]; }
			if($output[$l]->{'data'}[$i][1] > $maxy){ $maxy = $output[$l]->{'data'}[$i][1]; }
		}
		$n++;
	}
	# Hardcode a more sensible start of 1st March February (few LTLAs have much data before this) 
	$minx = 1583020800;
	$rangex = $maxx-$minx;
	$rangey = $maxy-$miny;
	$h = $dy + ($n-1)*$offset + 1.5*$p;

	$svg = "<svg width=\"".sprintf("%d",$w)."\" height=\"".sprintf("%d",$h)."\" viewBox=\"0 0 $w $h\" xmlns=\"http://www.w3.org/2000/svg\" style=\"overflow:display\" preserveAspectRatio=\"xMinYMin meet\" overflow=\"visible\">\n";
	$svg .= "\t<rect x=\"0\" y=\"0\" width=\"$w\" height=\"$h\" fill=\"black\"></rect>\n";
	$svg .= "<defs>\n";
	$svg .= "\t<style>\n";
	#$svg .= "\tpath.line { stroke: white; stroke-width: 1px; }\n";
	$svg .= "\tpath.area:hover { stroke: #1DD3A7; stroke-width: 3px; }\n";
	$svg .= "\ttext { fill: white; font-family: sans-serif; text-anchor: end; }\n";
	$svg .= "\tg text { display: none; text-anchor: start; }\n";
	$svg .= "\tg:hover text {display: block;}\n";
	$svg .= "\t</style>\n";
	$svg .= "</defs>\n";

	$n = 0;
	for($l = @output - 1; $l >= 0; $l--){
		$path = "";
		$j = 0;
		$x = $p + 0;
		$y = 0.5*$p + $dy + ($n-1)*$offset;
		$path .= "M".sprintf("%0.1f",$x).",".sprintf("%0.1f",$y - $dy*($output[$l]->{'data'}[$i][1])/$maxy);
		$nd = @{$output[$l]->{'data'}};
		for($i = 0; $i < $nd; $i++){
			if($output[$l]->{'data'}[$i][0] >= $minx){
				$x = $p + ($w-2*$p)*($output[$l]->{'data'}[$i][0]-$minx)/$rangex;
				$y = 0.5*$p + $dy + ($n-1)*$offset;
				$path .= "L".sprintf("%0.1f",$x).",".sprintf("%0.1f",$y - $dy*($output[$l]->{'data'}[$i][1])/$maxy);
				$j++;
			}
		}
		if($j < 2){
			print "WARNING: Little data for $output[$l]->{'id'} in pulsar plot.\n";
		}
		$svg .= "\t<g>\n";
		$svg .= "\t\t<path d=\"$path L$x,$y\" class=\"area\" stroke=\"white\" stroke-width=\"1px\" fill=\"black\" fill-opacity=\"0.8\"><title id=\"$output[$l]->{'id'}\">$output[$l]->{'name'}</title></path>\n";
		#$svg .= "\t\t<path d=\"$path\" class=\"line\" stroke=\"white\" fill=\"transparent\" stroke-width=\"1\"><title id=\"$output[$l]->{'id'}\">$output[$l]->{'name'}</title></path>\n";
		$svg .= "\t\t<text x=\"$p\" y=\"".($y - $offset*0.2)."\">$output[$l]->{'name'}</text>\n";
		$svg .= "\t</g>\n";
		$n++;
	}
	$svg =~ s/\.0([L\,])/$1/g;
	$svg .= "\t<text x=\"".($w-20)."\" y=\"".($h-20)."\">Credit: Data from PHE, Visualisation by ODI Leeds</text>\n";

	$svg .= "</svg>";
	
	updateFile($dir.$file,$svg);
	
	return ($minx,$maxx);
}

sub getArea {
	my $la = $_[0];
	my $file = $dir."areas/$la.json";
	my (%data,@lines,$jsonblob);
	
	if(!-e $file){
		print "Downloading JSON for $la\n";
		`wget -q --no-check-certificate -O "$file" "https://findthatpostcode.uk/areas/$la.json"`;
		sleep 1;
	}

	# Get the conversion file from UTLA to LA
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	$jsonblob = JSON::XS->new->utf8->decode(join("\n",@lines));
	return %{$jsonblob};
}

sub processVaccines {
	
	my ($vdir,@files,$file,$h,$h2,$f,$y,$c,$filename,$sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst,$ofile,$i,@lines,$line,$latmp,$wk,%headers,$json,$id,$v,$date,%deaths,@cols,$latestversion,$latestdate,$la,$tempdate,$tempdate2);

	$vdir = $dir."../../vaccines/data/";

	print "Processing vaccines...\n";
	# Set default values
	%vaccines = {};
	for($i = 0; $i < @las; $i++){
		$la = $las[$i];
		if(!$vaccines{$la}){
			$vaccines{$la} = { };
		}
	}

	opendir ( DIR, $vdir ) || die "Error in opening dir ".$dir."vaccines/\n";
	while(($filename = readdir(DIR))){
		if($filename =~ /vaccinations-LTLA-([0-9]{4})([0-9]{2})([0-9]{2})/){
			$wk = "$1-$2-$3";
			print "$filename ($wk)\n";
			open(FILE,$vdir.$filename);
			$i = 0;
			while (my $line = <FILE>){
				if($i == 0){
					%header = getHeaders($line);
				}elsif($i > 0){
					(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
					for($c = 0; $c < @cols; $c++){
						# Remove trailing/leading spaces or quotation marks
						$cols[$c] =~ s/(^\"|\"$)//g;
						$cols[$c] =~ s/(^\s|\s$)//g;
					}
					$latmp = $cols[$header{'LTLA Code'}];
					if($latmp){
						if(!$vaccines{$latmp}{$wk}){
							$vaccines{$latmp}{$wk} = {'all'=>{}};
							foreach $h (sort(keys(%header))){
								if($h =~ /[0-9]/ && $h !~ /Cumulative/){
									$h2 = $h;
									$h2 =~ s/1st dose //g;
									if($h2 =~ /Under ([0-9]+)/i){
										$h2 = "0-".($1-1);
									}

									if($h !~ /2nd dose/){

										if($nims{$latmp}{$h2} <= 0){
											print "No population for $latmp=$wk=$h2.\n";
										}
										if(!$vaccines{$latmp}{$wk}{$h2}){ $vaccines{$latmp}{$wk}{$h2} = {}; }
										if(!$vaccines{$latmp}{$wk}{'all'}){ $vaccines{$latmp}{$wk}{'all'} = {}; }

										$cols[$header{$h}] =~ s/(^\"|\"$)//g;
										$cols[$header{$h}] =~ s/[\,\s]//g;
										$cols[$header{$h}] =~ s/(^ *| *$)//g;
										$vaccines{$latmp}{$wk}{$h2}{'n'} = $cols[$header{$h}];
										$vaccines{$latmp}{$wk}{$h2}{'pop'} = $nims{$latmp}{$h2};
										if($nims{$latmp}{$h2} > 0){
											$vaccines{$latmp}{$wk}{$h2}{'%'} = sprintf("%0.1f",100*$cols[$header{$h}]/$nims{$latmp}{$h2});
										}else{
											$vaccines{$latmp}{$wk}{$h2}{'%'} = "0";
										}
										$vaccines{$latmp}{$wk}{'all'}{'n'} += $cols[$header{$h}];
										$vaccines{$latmp}{$wk}{'all'}{'pop'} += $nims{$latmp}{$h2};
										if($nims{$latmp}{$h2} > 0){
											$vaccines{$latmp}{$wk}{'all'}{'%'} = sprintf("%0.1f",100*$vaccines{$latmp}{$wk}{'all'}{'n'}/$vaccines{$latmp}{$wk}{'all'}{'pop'});
										}else{
											$vaccines{$latmp}{$wk}{$h2}{'%'} = "0";											
										}
									}
									if($h =~ /2nd dose/){
										$h2 = $h;
										$h2 =~ s/2nd dose //g;
										if($h2 =~ /Under ([0-9]+)/i){
											$h2 = "0-".($1-1);
										}

										if($nims{$latmp}{$h2} <= 0){
											print "No population for $latmp=$wk=$h2 (2).\n";
										}
										$cols[$header{$h}] =~ s/(^\"|\"$)//g;
										$cols[$header{$h}] =~ s/[\,\s]//g;
										$vaccines{$latmp}{$wk}{$h2}{'2nd'} = $cols[$header{$h}];
										if($nims{$latmp}{$h2} > 0){
											$vaccines{$latmp}{$wk}{$h2}{'2nd %'} = sprintf("%0.1f",100*$cols[$header{$h}]/$nims{$latmp}{$h2});
										}else{
											$vaccines{$latmp}{$wk}{$h2}{'2nd %'} = "0";
										}
										$vaccines{$latmp}{$wk}{'all'}{'2nd'} += $cols[$header{$h}];
										if($nims{$latmp}{$h2} > 0){
											$vaccines{$latmp}{$wk}{'all'}{'2nd %'} = sprintf("%0.1f",100*$vaccines{$latmp}{$wk}{'all'}{'2nd'}/$vaccines{$latmp}{$wk}{'all'}{'pop'});
										}else{
											$vaccines{$latmp}{$wk}{'all'}{'2nd %'} = "0";
										}
										
									}
								}
							}
							
						}
					}
				}
				$i++;
			}
			close(FILE);
		}
	}
	closedir(DIR);
	return %vaccines;
}


sub processDeaths {
	
	my (@files,$file,$f,$y,$filename,$sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst,$ofile,$i,@lines,$line,$latmp,$wk,%headers,$json,$id,$v,$date,%deaths,@cols,$latestversion,$latestdate,$la,$tempdate,$tempdate2);

	print "Processing deaths...\n";
	# Set default values
	%deaths = {};
	for($i = 0; $i < @las; $i++){
		$la = $las[$i];
		if(!$deaths{$la}){
			$deaths{$la} = { 'date'=>'','all-causes'=>0,'covid-19'=>0,'weeks'=>{} };
		}
	}
	($sec,$min,$hour,$mday,$mon,$year,$wday,$yday,$isdst) = gmtime();
	$year = $year+1900;

	for($y = 2020; $y <= $year; $y++){
		$filename = "deaths/deaths-$y-registrations.csv";
		if(-e $filename && -s $filename > 0){
			print "\t$filename\n";
			open(FILE,$filename);
			$i = 0;
			$hi = -1;
			while (my $line = <FILE>){
				$line =~ s/[\n\r]//g;
				if($line =~ /^\,+$/){
					$commas = 1;
				}else{
					$commas = 0;
				}
				if($hi < 0 && $commas){
					$hi = $i + 1;
				}
				if($hi == $i){
					%headers = getHeaders($line);
				}
				if($i > $hi && !$commas){
					(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
					$latmp = $cols[$headers{'Area code'}];
					$wk = $y."-W".sprintf("%02d",$cols[$headers{'Week number'}]);
					if($wk gt $deaths{$latmp}{'date'}){ $deaths{$latmp}{'date'} = $wk; }
					if(!$deaths{$latmp}{'weeks'}{$wk}){
						$deaths{$latmp}{'weeks'}{$wk} = {'covid-19'=>0,'all-causes'=>0};
					}
					if($cols[$headers{'Cause of death'}] eq "All causes"){
						$deaths{$latmp}{'all-causes'} += $cols[$headers{'Number of deaths'}];
						$deaths{$latmp}{'weeks'}{$wk}{'all-causes'} += $cols[$headers{'Number of deaths'}];
					}elsif($cols[$headers{'Cause of death'}] eq "COVID 19"){
						$deaths{$latmp}{'covid-19'} += $cols[$headers{'Number of deaths'}];
						$deaths{$latmp}{'weeks'}{$wk}{'covid-19'} += $cols[$headers{'Number of deaths'}];
					}
					#print "$latmp - $wk - $line\n";
				}
				$i++;
			}
			close(FILE);
		}
		
	}

	return %deaths;
}

sub processDeathsOld {
	
	my ($file,$filename,$ofile,$i,@lines,$line,$latmp,$wk,%headers,$json,$id,$v,$date,%deaths,@cols,$latestversion,$latestdate,$la,$tempdate,$tempdate2);
	$latestversion = 0;
	$latestdate = "";
	print "Processing deaths...";

	@lines = `wget -q --no-check-certificate -O- "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions"`;
	foreach $line (@lines){
		if($line =~ /<a href="\/datasets\/weekly-deaths-local-authority\/editions\/time-series\/versions\/([0-9]*)"><h2 [^\>]*>([^\)]*)([^\<]*)<\/h2>/){
			$v = $1+0;
			$tempdate = $2;
			$tempdate2 = $datetime->parseISO($tempdate);

			if($tempdate2 gt $latestdate){

				$ofile = $dir."temp/deaths-$tempdate2.csv";

				$latestdate = $tempdate2;
				$date = $tempdate2;

				$latestversion = $v;
				$date = $latestdate;
				$file = $ofile;
			}
		}
		if($line =~ /<a href="([^\"]*\/time-series\/versions\/$latestversion\.csv)">/){
			$deathurl = $1;
		}
	}

	if($latestversion eq "0"){
		print "Unlikely version for deaths\n";
		exit;
	}

	if(!-e $file || -s $file == 0){
		print "Getting latest deaths from $deathurl\n";
		`wget -q --no-check-certificate -O $file "$deathurl"`;
	}

	# Set default values
	%deaths = {};
	for($i = 0; $i < @las; $i++){
		$la = $las[$i];
		if(!$deaths{$la}){
			$deaths{$la} = { 'date'=>$date,'all-causes'=>0,'covid-19'=>0,'weeks'=>{} };
		}
	}

	if(-e $file && -s $file > 0){
		print "Open $file\n";
		open(FILE,$file);
		$i = 0;
		while (my $line = <FILE>) {
			chomp $line;
			if($i == 0){
				%headers = getHeaders($line);
			}
			if($i > 0 && $line =~ /\,/){
				(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
				$latmp = $cols[$headers{'administrative-geography'}];
				
				#{"date":"2020-09-24","week":{"label":"Week 37","all":16,"covid-19":0},"total":{"all":819,"covid-19":110}
				$wk = $cols[$headers{'Week'}];


				#v4_1,Data Marking,calendar-years,time,admin-geography,geography,week-number,week,cause-of-death,causeofdeath,place-of-death,placeofdeath,registration-or-occurrence,registrationoroccurrence
				if($cols[$headers{'registration-or-occurrence'}] eq "registrations"){
					if(!$deaths{$latmp}{'weeks'}{$wk}){
						$deaths{$latmp}{'weeks'}{$wk} = {'covid-19'=>0,'all-causes'=>0};
					}
					if($cols[$headers{'cause-of-death'}] eq "all-causes"){
						$deaths{$latmp}{'all-causes'} += $cols[$headers{'v4_1'}];
						$deaths{$latmp}{'weeks'}{$wk}{'all-causes'} += $cols[$headers{'v4_1'}];
					}elsif($cols[$headers{'cause-of-death'}] eq "covid-19"){
						$deaths{$latmp}{'covid-19'} += $cols[$headers{'v4_1'}];
						$deaths{$latmp}{'weeks'}{$wk}{'covid-19'} += $cols[$headers{'v4_1'}];
					}
				}

			}
			$i++;
		}
		close(FILE);
	}
	print "done\n";
	
	return %deaths;
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

sub getISOFromString {
	my (%monthmap,$y,$m,$mon,$str,$lmon);
	%monthmap = ('January'=>"01",'February'=>'02','March'=>'03','April'=>'04','May'=>'05','June'=>'06','July'=>'07','August'=>'08','September'=>'09','October'=>'10','November'=>'11','December'=>'12','Sept'=>'09','Jan'=>"01",'Feb'=>'02','Mar'=>'03','Apr'=>'04','May'=>'05','Jun'=>'06','Jul'=>'07','Aug'=>'08','Sep'=>'09','Oct'=>'10','Nov'=>'11','Dec'=>'12');
	$str = $_[0];
	$y = "";
	$m = "00";
	$d = "00";

	# Sometimes we might get a filename that contains multiple dates (e.g. Cabinet Office's 2019_01_31_Annex_B_Expenditure_over__25000_31-10-2018__Oct18_.csv)
	# In this case, the text-based months are more likely to be the subject of the file than the YYYY_MM_DD datestamp so we check those first
	foreach $mon (keys(%monthmap)){
		$lmon = lc($mon);
		if(lc($str) =~ /(^| |[^a-z])$lmon( |[^a-z]|$)/){
			$m = $monthmap{$mon};
			if(lc($str) =~ /$lmon\D?([0-9]{4})/){
				$y = $1;
			}
			if(lc($str) =~ /(^|\D)([0-9]{1,2})\D/){
				$d = "20".sprintf("%02d",$1);
			}
		}
	}

	# Does it seem to contain a YYYY-MM-DD type number?
	if($str =~ /(^|\D)([0-9]{4})-([0-9]{2})-([0-9]{2})(\D|$)/){
		# Double check that the month is in range
		if($3 lt "13" && $3 gt "00"){
			return $2."-".$3."-".$4;
		}
	}
	
	# Does it seem to contain a YYYY-MM type number?
	if($str =~ /(^|\D)([0-9]{4})-([0-9]{2})(\D|$)/){
		# Double check that the month is in range
		if($3 lt "13" && $3 gt "00"){
			return $2."-".$3;
		}
	}

	# Does it seem to contain a DD-MM-YYYY type number?
	if($str =~ /(^|\D)([0-9]{2})-([0-9]{2})-([0-9]{4})(\D|$)/){
		# Double check that the month is in range
		if($3 lt "13" && $3 gt "00"){
			return $4."-".$3."-".$2;
		}
	}
	
	if($str =~ /(^|\D)([0-9]{1,2})\D/){
		$d = $2;
	}
	if($str =~ /(^| |[^0-9])([0-9]{4})(\.|[^0-9]|$)/){
		$y = $2;
	}
	if(!$y && $str =~ /(^| |[^0-9])([0-9]{2})\-([0-9]{2})\./){
		$y = "20".$2;
	}
	if($m eq "00"){
		print "Failed to find month for $str\n";
		return "";
	}
	return "$y-$m-".sprintf("%02d",$d);
}
