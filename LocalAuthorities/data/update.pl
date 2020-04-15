#!/usr/bin/perl

$url = "https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv";
@lines = `wget -q --no-check-certificate -O- "$url"`;
#$csv = join("",@lines);

%LA;
%headers;
$mostrecent = "2000-01-01";

if(@lines > 0){


	# Split the headers and tidy
	$lines[0] =~ s/[\n\r]//g;
	(@header) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[0]);
	for($c = 0; $c < @header; $c++){
		$header[$c] =~ s/(^\"|\"$)//g;
		$headers{$header[$c]} = $c;
	}

	for($i = 1 ; $i < @lines; $i++){
		chomp($lines[$i]);
		(@cols) = split(/,(?=(?:[^\"]*\"[^\"]*\")*(?![^\"]*\"))/,$lines[$i]);
		$cols[$headers{'Area'}] =~ s/(^\"|\"$)//g;
		if($cols[$headers{'TotalCases'}] =~ /[\s\D]/){ $cols[$headers{'TotalCases'}] = "\"$cols[$headers{'TotalCases'}]\""; }
		$d = $cols[$headers{'Date'}];
		$d =~ s/\-//g;
		
		$id = $cols[$headers{'AreaCode'}];
		$name = $cols[$headers{'Area'}];
		
		if($id eq "E06000052" || $id eq "E06000053"){ $id = "E06000052-3"; $name = "Cornwall and Isles of Scilly" }
		if($id eq "E09000001" || $id eq "E09000012"){ $id = "E09000001-12"; $name = "Hackney and City of London"; }
		
		
		if(!$LA{$id}){ $LA{$id} = {'name'=>'','country'=>$cols[$headers{'Country'}],'dates'=>{}}; }
		# Only add the date if it has a value
		if($cols[$headers{'TotalCases'}] ne ""){
			$LA{$id}{'dates'}{$d} = $cols[$headers{'TotalCases'}];
		}
		$LA{$id}{'name'} = $name;
		
		if($cols[$headers{'Date'}] gt $mostrecent){ $mostrecent = $cols[$headers{'Date'}]; }
	}
	
	$json = "";
	for $id (sort(keys(%LA))){
		if($id ne ""){
			if($json){ $json .= ",\n";}
			$json .= "\t\t\"$id\":{";
			$json .= "\"n\":\"$LA{$id}{'name'}\",";
			$json .= "\"c\":\"$LA{$id}{'country'}\",";
			$json .= "\"v\":{";
			@dates = sort(keys(%{$LA{$id}{'dates'}}));
			for($d = 0; $d < @dates; $d++){
				if($d > 0){
					$json .= ",";
				}
				$json .= "\"$dates[$d]\":$LA{$id}{'dates'}{$dates[$d]}";
			}
			$json .= $dates."}";
			$json .= "}";
		}
	}
	open(FILE,">","utla.json");
	print FILE "{\n";
	print FILE "\t\"lastupdate\":\"".$mostrecent."\",\n";
	print FILE "\t\"data\": {\n";
	print FILE $json."\n";
	print FILE "\t}\n";
	print FILE "}";
	close(FILE);
}else{
	print "Empty file";
}


#Date,Country,AreaCode,Area,TotalCases
#2020-03-01,Scotland,S08000015,Ayrshire and Arran,0
#2020-03-01,Scotland,S08000016,Borders,0
#2020-03-01,Scotland,S08000017,Dumfries and Galloway,0
#2020-03-01,Scotland,S08000029,Fife,0
#2020-03-01,Scotland,S08000019,Forth Valley,0





