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

$deathurl = "";
@las;
%names;
open(FILE,"la.csv");
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


# Get the death data
%deaths = processDeaths();



for($i = 0; $i < @las; $i++){
	$la = $las[$i];
	$url = "https://api.coronavirus.data.gov.uk/v1/data?filters=areaType=ltla;areaCode=$la&structure=%7B%22date%22:%22date%22,%22areaName%22:%22areaName%22,%22areaCode%22:%22areaCode%22,%22newCasesBySpecimenDate%22:%22newCasesBySpecimenDate%22,%22cumCasesBySpecimenDate%22:%22cumCasesBySpecimenDate%22,%22cumCasesBySpecimenDateRate%22:%22cumCasesBySpecimenDateRate%22%7D&format=json";
	$file = $dir."raw/$la.json";
	$head = $dir."raw/$la.head";
	print "$la:\n";
	# If it is older than 12 hours we grab a new copy
	if(time() - (stat $file)[9] >= 43200){
		print "\tGetting URL\n";
		`curl -sI "$url" > $head`;
		@lines = `curl -s --compressed "$url"`;
		$str = join("",@lines);
		# Add new lines before every day
		$str =~ s/(\{"date")/\n\t$1/g;
		# Add a new line before the pagination object
		$str =~ s/(\],"pagination")/\n$1/g;
		# If it seems to be valid JSON we save it over the previous version
		if($str =~ /\{"date\"/){
			open(FILE,">",$file);
			print FILE $str;
			close(FILE);
		}else{
			print "Opening previous\n";
			# Open the previous version
			open(FILE,$file);
			@lines = <FILE>;
			close(FILE);
			$str = join("",@lines);
		}
		sleep rand(3) + 1;
	}else{
		open(FILE,$file);
		@lines = <FILE>;
		close(FILE);
		$str = join("",@lines);
	}
	open(FILE,$head);
	@headlines = <FILE>;
	close(FILE);
	$strhead = join("",@headlines);
	
	$strhead =~ /Last-Modified: (.*)\n/;
	$casesdate = tidyDate($1);
	
	
	# Find number of lines
	if($str =~ /"length":([0-9]+)/){
		$len = $1;
		print "\t$1 days\n";
	}else{
		$len = 0;
		print "\tERROR: No lines\n";
	}
	%data = getArea($la);

	
	$file = $dir."processed/$la.json";
	$names{$la} = $data{'data'}{'attributes'}{'name'};

	open(FILE,">",$file);
	print FILE "{\n";
	print FILE "\t\"name\":\"$names{$la}\",\n";
	print FILE "\t\"population\": ".($pop{$la}||0).",\n";
	if($deaths{$la}){
		#"E06000001": {"total":{"date":"2020-09-24","all":819,"covid-19":110},"week":{"text":"Week 37","all":16,"covid-19":0}},
		print FILE "\t\"deaths\":{\n";
		print FILE "\t\t\"src\": \"$deathurl\",\n";
		print FILE "\t\t\"updated\": \"$deaths{$la}{'date'}\",\n";
		print FILE "\t\t\"all\": $deaths{$la}{'all-causes'},\n";
		print FILE "\t\t\"cov\": $deaths{$la}{'covid-19'},\n";
		print FILE "\t\t\"weeks\":[\n";
		$w = 0;
		foreach $wk (reverse(sort(keys(%{$deaths{$la}{'weeks'}})))){
			if($w > 0){ print FILE "\,\n"; }
			print FILE "\t\t\t{\"txt\":\"$wk\",\"all\":$deaths{$la}{'weeks'}{$wk}{'all-causes'},\"cov\":$deaths{$la}{'weeks'}{$wk}{'covid-19'}}";
			$w++;
		}
		print FILE "\n\t\t]\n";
		print FILE "\t},\n";
	}
	print FILE "\t\"cases\": {\n";
	$recentday = "";
	if($len > 0){
		print FILE "\t\t\"src\":\"$url\",\n";
		print FILE "\t\t\"updated\":\"$casesdate\",\n";
		print FILE "\t\t\"type\":\"SpecimenDate\",\n";
		print FILE "\t\t\"n\": $len,\n";
		print FILE "\t\t\"days\":[\n";
		for($l = 0; $l < @lines; $l++){
			chomp($lines[$l]);
			if($lines[$l] =~ /\"date\"/){
				$lines[$l] =~ s/\,"(areaName|areaCode)":"[^\"]*"//g;
				# Remove rate (as we can calculate it
				$lines[$l] =~ s/\,\"cumCasesBySpecimenDateRate\":[0-9\.]*//g;
				$lines[$l] =~ s/newCasesBySpecimenDate/day/g;
				$lines[$l] =~ s/cumCasesBySpecimenDate/tot/g;
				print FILE "\t\t$lines[$l]\n";
			}
		}
		print FILE "\t\t]\n";
	}
	print FILE "\t}\n";
	print FILE "}\n";
	close(FILE);
	
	
}

open(FILE,">","processed/index.json");
print FILE "{\n";
$i = 0;
foreach $la (sort(keys(%names))){
	if($i > 0){ print FILE ",\n"; }
	print FILE "\t\"$la\":\"$names{$la}\"";
	$i++;
}
print FILE "\n\}\n";
close(FILE);




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


sub processDeaths {
	
	my ($file,$ofile,$i,@lines,$line,$latmp,$wk,%headers,$json,$id,$v,$date,%deaths,@cols,$latestversion,$la);
	$latestversion = 0;
	print "Processing deaths...";
	@lines = `wget -q --no-check-certificate -O- "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions"`;
	foreach $line (@lines){
		if($line =~ /<a href="\/datasets\/weekly-deaths-local-authority\/editions\/time-series\/versions\/([0-9]*)"><h2 [^\>]*>([^\)]*)([^\<]*)<\/h2>/){
			$v = $1+0;
			$ofile = $dir."temp/deaths-version-$v.csv";
			if($v > $latestversion && -s $ofile > 0){
				$latestversion = $v;
				$date = tidyDate($2);
				$file = $ofile;
			}
		}
	}
	print " version $latestversion ";
	$deathurl = "https://www.ons.gov.uk/datasets/weekly-deaths-local-authority/editions/time-series/versions/$latestversion";
	# Set default values
	%deaths = {};
	for($i = 0; $i < @las; $i++){
		$la = $las[$i];
		if(!$deaths{$la}){
			$deaths{$la} = { 'date'=>$date,'all-causes'=>0,'covid-19'=>0,'weeks'=>{} };
		}
	}
	
	
	if(-e $file && -s $file > 0){
		open(FILE,$file);
		$i = 0;
		while (my $line = <FILE>) {
			chomp $line;
			if($i == 0){
				%headers = getHeaders($line);
			}
			if($i > 0 && $line =~ /\,/){
				(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$line);
				$latmp = $cols[$headers{'admin-geography'}];
				
				#{"date":"2020-09-24","week":{"label":"Week 37","all":16,"covid-19":0},"total":{"all":819,"covid-19":110}
				$wk = $cols[$headers{'week'}];


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


sub tidyDate {
	my ($m,$mm,$dd,$yy,$ts);
	my $str = $_[0];
	my @months = ('Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec');
	my @monthslong = ('January','February','March','April','May','June','July','August','September','October','November','December');
	
	if($str =~ /([0-9]{2}:[0-9]{2}:[0-9]{2}) GMT/){
		$ts = "T".$1."Z";
	}else{
		$ts = "";
	}
	
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
	
	return $str.$ts;
}


