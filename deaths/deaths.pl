#!/usr/bin/perl

use lib "./lib/";
use Data::Dumper;
use ODILeeds::Graph;
use POSIX qw(strftime);

# Get directory
$dir = $0;
if($dir =~ /\//){ $dir =~ s/^(.*)\/([^\/]*)/$1\//g; }
else{ $dir = "./"; }

%colours = ('2021'=>'#2254F4','2020'=>'#1DD3A7','baseline'=>'silver');
%data;
%baseline;

getBaselineData($dir."2015-2019.tsv");
getDeathData($dir."deaths-all-2020.tsv","all","2020");
getDeathData($dir."deaths-all-2021.tsv","all","2021");
getDeathData($dir."deaths-covid-2020.tsv","covid","2020");
getDeathData($dir."deaths-covid-2021.tsv","covid","2021");


%out;

foreach $year (sort(keys(%data))){
	if($year eq "2020"){
		$i = 0;
		foreach $wk (sort(keys(%{$data{$year}}))){
			if($wk){
				$dt = ($data{$year}{$wk}{'ended'} ? " (".$data{$year}{$wk}{'ended'}.")":"");
				$out{'total2020'}[$i] = {'x'=>$i,'y'=>$data{$year}{$wk}{'all'}{'total'},'label'=>$wk.$dt.": ".$data{$year}{$wk}{'all'}{'total'}};
				$out{'covid2020'}[$i] = {'x'=>$i,'y'=>$data{$year}{$wk}{'covid'}{'total'},'label'=>$wk.$dt.": ".$data{$year}{$wk}{'covid'}{'total'}};
				$t = $data{$year}{$wk}{'all'}{'ages'}{'80-84'}{'People'} + $data{$year}{$wk}{'all'}{'ages'}{'85-89'}{'People'} + $data{$year}{$wk}{'all'}{'ages'}{'90+'}{'People'};
				$out{'total2020-over80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = $data{$year}{$wk}{'covid'}{'ages'}{'80-84'}{'People'} + $data{$year}{$wk}{'covid'}{'ages'}{'85-89'}{'People'} + $data{$year}{$wk}{'covid'}{'ages'}{'90+'}{'People'};
				$out{'covid2020-over80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = 0;
				foreach $ag (keys(%{$data{$year}{$wk}{'all'}{'ages'}})){
					if($ag =~ /^([0-9]+)/){
						$age = $1;
						if($age < 80){ $t += $data{$year}{$wk}{'all'}{'ages'}{$ag}{'People'}; }
					}
				}
				$out{'total2020-under80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = 0;
				foreach $ag (keys(%{$data{$year}{$wk}{'covid'}{'ages'}})){
					if($ag =~ /^([0-9]+)/){
						$age = $1;
						if($age < 80){ $t += $data{$year}{$wk}{'covid'}{'ages'}{$ag}{'People'}; }
					}
				}
				$out{'covid2020-under80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$i++;
			}
		}
	}
	if($year eq "2021"){
		$i = 0;
		foreach $wk (sort(keys(%{$data{$year}}))){
			if($wk){
				$dt = ($data{$year}{$wk}{'ended'} ? " (".$data{$year}{$wk}{'ended'}.")":"");
				$out{'total2021'}[$i] = {'x'=>$i,'y'=>$data{$year}{$wk}{'all'}{'total'},'label'=>$wk.$dt.": ".$data{$year}{$wk}{'all'}{'total'}};
				$out{'covid2021'}[$i] = {'x'=>$i,'y'=>$data{$year}{$wk}{'covid'}{'total'},'label'=>$wk.$dt.": ".$data{$year}{$wk}{'covid'}{'total'}};
				$t = $data{$year}{$wk}{'all'}{'ages'}{'80-84'}{'People'} + $data{$year}{$wk}{'all'}{'ages'}{'85-89'}{'People'} + $data{$year}{$wk}{'all'}{'ages'}{'90+'}{'People'};
				$out{'total2021-over80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = $data{$year}{$wk}{'covid'}{'ages'}{'80-84'}{'People'} + $data{$year}{$wk}{'covid'}{'ages'}{'85-89'}{'People'} + $data{$year}{$wk}{'covid'}{'ages'}{'90+'}{'People'};
				$out{'covid2021-over80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = 0;
				foreach $ag (keys(%{$data{$year}{$wk}{'all'}{'ages'}})){
					if($ag =~ /^([0-9]+)/){
						$age = $1;
						if($age < 80){ $t += $data{$year}{$wk}{'all'}{'ages'}{$ag}{'People'}; }
					}
				}
				$out{'total2021-under80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$t = 0;
				foreach $ag (keys(%{$data{$year}{$wk}{'covid'}{'ages'}})){
					if($ag =~ /^([0-9]+)/){
						$age = $1;
						if($age < 80){ $t += $data{$year}{$wk}{'covid'}{'ages'}{$ag}{'People'}; }
					}
				}
				$out{'covid2021-under80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.$dt.": ".$t};
				$i++;
			}
		}
	}
}

$i = 0;
foreach $wk (sort(keys(%baseline))){
	if($wk){
		$out{'average'}[$i] = {'x'=>$i,'y'=>$baseline{$wk}{'total'},'label'=>$wk.": ".$baseline{$wk}{'total'}};
		$t = $baseline{$wk}{'ages'}{'80-84'}{'People'} + $baseline{$wk}{'ages'}{'85-89'}{'People'} + $baseline{$wk}{'ages'}{'90+'}{'People'};
		$out{'average-over80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.": ".$t};
		$t = 0;
		foreach $ag (keys(%{$baseline{$wk}{'ages'}})){
			if($ag =~ /^([0-9]+)/){
				$age = $1;
				if($age < 80){ $t += $baseline{$wk}{'ages'}{$ag}{'People'}; }
			}
		}
		$out{'average-under80'}[$i] = {'x'=>$i,'y'=>$t,'label'=>$wk.": ".$t};
		$i++;
	}
}




# Make graph of all deaths
$file = "deaths-allages-total.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Av deaths 2015-19',
	'id'=>'baseline',
	'key'=>1,
	'data'=>\@{$out{'average'}},
	'colour'=>$colours{'baseline'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2020',
	'id'=>'all-deaths-2020',
	'key'=>1,
	'data'=>\@{$out{'total2020'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2021',
	'id'=>'all-deaths-2021',
	'key'=>1,
	'data'=>\@{$out{'total2021'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>200,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);




# Make graph of covid deaths
$file = "deaths-allages-covid.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Covid deaths 2020',
	'id'=>'covid-deaths-2020',
	'key'=>1,
	'data'=>\@{$out{'covid2020'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'Covid deaths 2021',
	'id'=>'covid-deaths-2021',
	'key'=>1,
	'data'=>\@{$out{'covid2021'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>200,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);




# Make graph of all deaths by age
$file = "deaths-over80-total.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Av deaths 2015-19 (80+)',
	'id'=>'baseline',
	'key'=>1,
	'data'=>\@{$out{'average-over80'}},
	'colour'=>$colours{'baseline'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2020 (80+)',
	'id'=>'all-deaths-2020-over80',
	'key'=>1,
	'data'=>\@{$out{'total2020-over80'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2021 (80+)',
	'id'=>'all-deaths-2021-over80',
	'key'=>1,
	'data'=>\@{$out{'total2021-over80'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>230,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);





# Make graph of all deaths by age
$file = "deaths-over80-covid.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Covid deaths 2020 (80+)',
	'id'=>'covid-deaths-2020-over80',
	'key'=>1,
	'data'=>\@{$out{'covid2020-over80'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'Covid deaths 2021 (80+)',
	'id'=>'covid-deaths-2021-over80',
	'key'=>1,
	'data'=>\@{$out{'covid2021-over80'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>230,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);



# Make graph of all deaths by age
$file = "deaths-under80-total.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Av deaths 2015-19 (<80)',
	'id'=>'baseline-under80',
	'key'=>1,
	'data'=>\@{$out{'average-under80'}},
	'colour'=>$colours{'baseline'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2020 (<80)',
	'id'=>'all-deaths-2020-under80',
	'key'=>1,
	'data'=>\@{$out{'total2020-under80'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'All deaths 2021 (80+)',
	'id'=>'all-deaths-2021-under80',
	'key'=>1,
	'data'=>\@{$out{'total2021-under80'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>230,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);





# Make graph of all deaths by age
$file = "deaths-under80-covid.svg";
$graph = ODILeeds::Graph->new();
$graph->addSeries({
	'title'=>'Covid deaths 2020 (80+)',
	'id'=>'covid-deaths-2020-under80',
	'key'=>1,
	'data'=>\@{$out{'covid2020-under80'}},
	'colour'=>$colours{'2020'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$graph->addSeries({
	'title'=>'Covid deaths 2021 (80+)',
	'id'=>'covid-deaths-2021-under80',
	'key'=>1,
	'data'=>\@{$out{'covid2021-under80'}},
	'colour'=>$colours{'2021'},
	'stroke-width'=>3,
	'stroke-width-hover'=>5,
	'point'=>5,
	'line'=>1
});
$svg = $graph->draw({'width'=>1024,'height'=>500,'left'=>50,'bottom'=>30,'axis'=>{'y'=>{'labels'=>{'left'=>10,'baseline'=>'middle'},'line'=>1},'x'=>{'line'=>0,'ticks'=>true}},'key'=>{'width'=>230,'padding'=>10,'border'=>'fill:transparent;stroke-width:1;stroke:black;','text'=>'text-anchor:start;dominant-baseline:hanging;font-weight:bold;fill:black;stroke-width:0;font-family:sans-serif;'}});
open(FILE,">",$dir.$file);
print FILE "$svg";
close(FILE);








##########################
# SUBROUTINES

sub getBaselineData {
	my $file = $_[0];
	my (@lines,$i,@weeks,$type,$c,@cols,$wk,$typ,$cat);
	
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	for($i = 0; $i < @lines; $i++){
		$lines[$i] =~ s/[\n\r]//g;	# remove newlines
		$lines[$i] =~ s/\,//g;	# remove commas from numbers
		@{$lines[$i]} = split(/\t/,$lines[$i]);
	}
	@weeks = ();
	$type = "";
	$baseline = {};
	for($i = 0; $i < @lines; $i++){
		@cols = @{$lines[$i]};
		if($i==0){
			for($c = 2; $c < @cols ;$c++){
				$wk = $cols[$c];
				$wk =~ s/Week ([0-9])$/Week 0$1/;
				if(!$baseline{$wk}){
					$baseline{$wk} = {'total'=>0,'ages'=>{}};
				}
				push(@weeks,$wk);
			}
		}elsif($i==21){
			for($c = 2; $c < @cols ;$c++){
				$baseline{$weeks[$c-2]}{'total'} = $cols[$c];
			}
		}elsif($i > 0){
			if(@cols == 1){
				$typ = $cols[0];
			}else{
				$cat = $cols[1];
				if($cat eq "<1" || $cat eq "1-4"){
					$cat = "0-4";
				}
				if($typ && $cat =~ /^[0-9\-\+]+$/){
					if(!$baseline{$weeks[$c-2]}{'ages'}{$cat}){
						$baseline{$weeks[$c-2]}{'ages'}{$cat} = ('Male'=>0,'Female'=>0,'People'=>0);
					}
					for($c = 2; $c < @cols ;$c++){
						$baseline{$weeks[$c-2]}{'ages'}{$cat}{$typ} += $cols[$c];
					}
				}
			}
		}
	}
}

sub getDeathData {
	
	my $file = $_[0];
	my $g = $_[1];
	my $year = $_[2];
	my (@lines,$i,@weeks,$type,$c,@cols,$wk,$typ,$cat);
	
	open(FILE,$file);
	@lines = <FILE>;
	close(FILE);
	for($i = 0; $i < @lines; $i++){
		$lines[$i] =~ s/[\n\r]//g;	# remove newlines
		$lines[$i] =~ s/\,//g;	# remove commas from numbers
		@{$lines[$i]} = split(/\t/,$lines[$i]);
	}
	@weeks = ();
	$type = "";
	for($i = 0; $i < @lines; $i++){
		@cols = @{$lines[$i]};
		if($i==0){
			for($c = 2; $c < @cols ;$c++){
				$wk = "Week ".sprintf("%02d",$cols[$c]);
				if(!$data{$year}){
					$data{$year} = {};
				}
				if(!$data{$year}{$wk}){
					$data{$year}{$wk} = {'ended'=>''};
				}
				if(!$data{$year}{$wk}{$g}){
					$data{$year}{$wk}{$g} = {'total'=>0,'ages'=>{}};
				}
				push(@weeks,$wk);
			}
		}elsif($i==1){
			for($c = 2; $c < @cols ;$c++){
				$data{$year}{$weeks[$c-2]}{'ended'} = $cols[$c];
			}
		}elsif($i==2){
			for($c = 2; $c < @cols ;$c++){
				$data{$year}{$weeks[$c-2]}{$g}{'total'} = $cols[$c];
			}
		}elsif($i > 0){
			if(@cols == 1){
				$typ = $cols[0];
			}else{
				$cat = $cols[1];
				if($cat eq "<1" || $cat eq "1-4"){
					$cat = "0-4";
				}
				if($typ){
					if(!$data{$year}{$weeks[$c-2]}{$g}{'ages'}{$cat}){
						$data{$year}{$weeks[$c-2]}{$g}{'ages'}{$cat} = ('Male'=>0,'Female'=>0,'People'=>0);
					}
					for($c = 2; $c < @cols ;$c++){
						$data{$year}{$weeks[$c-2]}{$g}{'ages'}{$cat}{$typ} += $cols[$c];
					}
				}
			}
		}
	}
}