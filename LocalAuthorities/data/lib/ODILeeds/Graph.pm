package ODILeeds::Graph;

use strict;
use warnings;
use Data::Dumper;
use ODILeeds::Colour;
use ODILeeds::DateTime;
use List::Util qw[min max];


sub new {
    my ($class, %args) = @_;
 
    my $self = \%args;
 
    bless $self, $class;
 
    return $self;
}

# Set the properties of the series
sub addSeries {
	my ($self, $series) = @_;
	my ($i,$n);
	if(!$self->{'series'}){ @{$self->{'series'}} = (); }
	push(@{$self->{'series'}},$series);

	if(!$self->{'xmin'}){ $self->{'xmin'} = 1e100; }
	if(!$self->{'ymin'}){ $self->{'ymin'} = 1e100; }
	if(!$self->{'xmax'}){ $self->{'xmax'} = -1e100; }
	if(!$self->{'ymax'}){ $self->{'ymax'} = -1e100; }
	$n = @{$series->{'data'}};
	for($i = 0; $i < $n; $i++){
		$self->{'xmin'} = min($self->{'xmin'},$series->{'data'}[$i]{'x'});
		$self->{'ymin'}= min($self->{'ymin'},$series->{'data'}[$i]{'y'});
		$self->{'xmax'} = max($self->{'xmax'},$series->{'data'}[$i]{'x'});
		$self->{'ymax'} = max($self->{'ymax'},$series->{'data'}[$i]{'y'});
	}

	return $self;
}

# Draw the graph
sub draw {
	my ($self, $props) = @_;
	my ($n,$r,$w,$h,@lines,$svg,@header,%headers,$c,@cols,@rows,$i,$s,$series,$safeseries,$minx,$maxx,$miny,$maxy,$path,$y,$xrange,$yrange,$xpos,$ypos,$t,@pos,$circles,%ticks,@a,@b,$left,$right,$top,$bottom,$style);

	$w = ($props->{'width'}||400);
	$h = ($props->{'height'}||300);
	
	$minx = $self->{'xmin'};
	$maxx = $self->{'xmax'};
	$miny = $self->{'ymin'};
	$maxy = $self->{'ymax'};

	if(!$h){ $h = $w*0.5; }

	$miny = 0;

	if($props->{'xaxis-max'}){ $maxx = $props->{'xaxis-max'}; }
	if($props->{'xaxis-min'}){ $minx = $props->{'xaxis-min'}; }
	if($props->{'yaxis-max'}){ $maxy = $props->{'yaxis-max'}; }
	if($props->{'yaxis-min'}){ $miny = $props->{'yaxis-min'}; }

	$xrange = $maxx-$minx;
	$yrange = $maxy-$miny;
	
	if(!$props->{'tick'} || $props->{'tick'} eq ""){ $props->{'tick'} = 5; }

	# Build SVG
	$svg = "<svg width=\"".sprintf("%d",$w)."\" height=\"".sprintf("%d",$h)."\" viewBox=\"0 0 $w $h\" xmlns=\"http://www.w3.org/2000/svg\" style=\"overflow:display\" preserveAspectRatio=\"xMinYMin meet\" overflow=\"visible\">\n";
	$svg .= "<defs>\n";
	$svg .= "\t<style>\n";
	$svg .= "\t.data-series path.line { fill-opacity: 0; stroke: black; }\n";
	$svg .= "\t.data-series path.line.dotted { stroke-dasharray: 12 20 }\n";
	$svg .= "\t.data-series:hover path.line, .data-series.on path.line { stroke-width: ".($props->{'strokehover'}||1)."; }\n";
	$svg .= "\t.data-series:hover circle, .data-series.on circle { display: inline; }\n";
	$svg .= "\t.graph-grid { font-family: \"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif; }\n";
	$svg .= "\t.graph-grid line { stroke: black; stroke-width: ".($props->{'line'}||1)."; stroke-linecap: round; }\n";
	$svg .= "\t.graph-grid.graph-grid-x text { text-anchor: middle; dominant-baseline: hanging; transform: translateY(".($props->{'tick'}*2)."px); }\n";
	$svg .= "\t.graph-grid.graph-grid-y text { text-anchor: end; dominant-baseline: ".($props->{'axis'}{'y'}{'labels'}{'baseline'}||"middle")."; transform: translateX(-".($props->{'tick'}*2)."px); }\n";
	$svg .= "\t</style>\n";
	$svg .= "</defs>\n";

	$left = $props->{'left'}||100;
	$right = $props->{'right'}||10;
	$top = $props->{'top'}||10;
	$bottom = $props->{'bottom'}||50;


	# Draw grid lines
	$svg .= buildAxis('y',$props->{'axis'}{'y'},{'n'=>3,'left'=>$left,'right'=>$right,'bottom'=>$bottom,'top'=>$top,'width'=>$w,'height'=>$h,'xmin'=>$minx,'xmax'=>$maxx,'ymin'=>$miny,'ymax'=>$maxy});
	$svg .= buildAxis('x',$props->{'axis'}{'x'},{'type'=>'date','left'=>$left,'right'=>$right,'bottom'=>$bottom,'top'=>$top,'spacing'=>10,'width'=>$w,'height'=>$h,'xmin'=>$minx,'xmax'=>$maxx,'ymin'=>$miny,'ymax'=>$maxy});

	$n = @{$self->{'series'}};

	for($s = 0; $s < $n; $s++){
		$series = ($self->{'series'}[$s]{'title'}||"Title");
		$safeseries = safeXML($series);

		$path = "";
		$svg .= "<g data-series=\"".($self->{'series'}[$s]{'css'}||safeID($series))."\" class=\"data-series\">";
		$circles = "";
		$style = "";
		for($i = 0; $i < @{$self->{'series'}[$s]{'data'}}; $i++){
			if($self->{'series'}[$s]{'data'}[$i]){
				@pos = getXY(('x'=>$self->{'series'}[$s]{'data'}[$i]{'x'},'y'=>$self->{'series'}[$s]{'data'}[$i]{'y'},'width'=>$w,'height'=>$h,'left'=>$left,'right'=>$right,'bottom'=>$bottom,'top'=>$top,'xmin'=>$minx,'xmax'=>$maxx,'ymin'=>$miny,'ymax'=>$maxy));
				$xpos = $pos[0];
				$ypos = $pos[1];
				$path .= ($i == 0 ? "M":"L")." ".sprintf("%0.2f",$xpos).",".sprintf("%0.2f",$ypos);
				if($self->{'series'}[$s]{'point'} && $self->{'series'}[$s]{'point'} > 0){
					$circles .= "\t<circle cx=\"".sprintf("%0.2f",$xpos)."\" cy=\"".sprintf("%0.2f",$ypos)."\" data-y=\"".sprintf("%0.".($self->{'series'}[$s]{'pointprec'}||2)."f",$self->{'series'}[$s]{'data'}[$i]{'y'})."\" data-x=\"".$self->{'series'}[$s]{'data'}[$i]{'x'}."\" r=\"".$self->{'series'}[$s]{'point'}."\" fill=\"".($self->{'series'}[$s]{'color'}||"#cc0935")."\">";
					if($self->{'series'}[$s]{'data'}[$i]{'title'}){
						$circles .= "<title>".($self->{'series'}[$s]{'data'}[$i]{'title'})."</title>";
					}else{
						$circles .= "<title>".($self->{'series'}[$s]{'data'}[$i]{'x'}.": ".$self->{'series'}[$s]{'data'}[$i]{'y'})."</title>";
					}
					$circles .= "</circle>\n";
				}
			}
		}

		$svg .= "\n\t<path d=\"".$path."\" id=\"".($self->{'series'}[$s]{'id'}||$safeseries)."\" class=\"line\"";
		if($self->{'series'}[$s]{'stroke'}){
			$svg .= " stroke-width=\"".$self->{'series'}[$s]{'stroke'}."\"";
		}
		if($self->{'series'}[$s]{'fill'}){ $style .= " fill=\"".$self->{'series'}[$s]{'fill'}."\""; }
		if($self->{'series'}[$s]{'fill-opacity'}){ $style .= " fill-opacity=\"".$self->{'series'}[$s]{'fill-opacity'}."\""; }
		if($self->{'series'}[$s]{'opacity'}){ $style .= " opacity=\"".$self->{'series'}[$s]{'opacity'}."\""; }
		$svg .= " stroke-linecap=\"round\"";
		if($self->{'series'}[$s]{'stroke-dasharray'}){ $svg .= " stroke-dasharray=\"".$self->{'series'}[$s]{'stroke-dasharray'}."\""; }
		$svg .= $style."><title>".$safeseries."</title></path>\n";
		if($self->{'series'}[$s]{'tag'}){
			$svg .= '<text><textPath href="#'.($self->{'series'}[$s]{'id'}||$safeseries).'"'.$style.'>'.$series.'</textPath></text>';
		}
		$svg .= $circles;
		$svg .= "</g>\n";
	}

	$svg .= "</svg>\n";
	
	return $svg;
}

sub buildAxis {

	my ($axis,$props,$conf) = @_;
	my (%ticks,$svg,$t,@a,@b,$label,$temp,$tick);
	if(!$props){ $props = {}; }
	$tick = ($props->{'tick'}||5);

	%ticks = makeTicks($conf->{($axis eq "y" ? "ymin":"xmin")},$conf->{($axis eq "y" ? "ymax":"xmax")},%{$conf});

	$svg = "<g class=\"graph-grid graph-grid-".$axis."\">\n";
	
	if($ticks{'length'}){

		for($t = 0; $t < $ticks{'length'}; $t++){

			if($axis eq "x"){
				$conf->{'x'} = $ticks{'data-'.$t};
				$conf->{'y'} = $conf->{'ymin'};
			}else{
				$conf->{'x'} = $conf->{'xmin'};
				$conf->{'y'} = $ticks{'data-'.$t};		
			}
			@a = getXY(%{$conf});

			if($axis eq "x"){
				$conf->{'x'} = $ticks{'data-'.$t};
				$conf->{'y'} = $conf->{'ymax'};
			}else{
				$conf->{'x'} = $conf->{'xmax'};
				$conf->{'y'} = $ticks{'data-'.$t};		
			}
			@b = getXY(%{$conf});
			if($a[1] >= 0 && $a[0] >= $conf->{'left'}){
				if($a[0] < $conf->{'width'}){
					if(($t == 0 && $props->{'line'} > 0) || $props->{'lines'}){
						$svg .= "\t<line x1=\"".sprintf("%0.2f",$a[0])."\" y1=\"".sprintf("%0.2f",$a[1])."\" x2=\"".sprintf("%0.2f",$b[0])."\" y2=\"".sprintf("%0.2f",$b[1])."\" data-left=\"".$conf->{'left'}."\"></line>\n";
					}
					if($props->{'ticks'}){
						$svg .= "\t<line class=\"tick\" x1=\"".sprintf("%0.2f",$a[0])."\" y1=\"".sprintf("%0.2f",$a[1])."\" x2=\"".sprintf("%0.2f",($a[0]-($axis eq "y" ? $tick : 0)))."\" y2=\"".sprintf("%0.2f",($a[1]+($axis eq "y" ? 0 : $tick)))."\"></line>\n";
					}
					$label = $ticks{'data-'.$t};
					if($ticks{'label-'.$t}){
						$label = $ticks{'label-'.$t};
					}
					#if($props->{'format'} && $props->{'format'} eq "commify"){
					#	label = label.toLocaleString();
					#}
					$svg .= "\t<text x=\"".($a[0]+($props->{'labels'} && $props->{'labels'}{'left'} ? $props->{'labels'}{'left'} : 0))."\" y=\"$a[1]\" text-anchor=\"".($axis eq "y" ? "end":"middle")."\">".$label."</text>\n";
				}
			}
		}
	}
	$svg .= "\t<text style=\"text-anchor:middle;dominant-baseline:hanging;font-weight:bold;transform: translateY(".($conf->{'top'} + ($conf->{'height'}-$conf->{'top'}-$conf->{'bottom'})/2)."px) rotate(-90deg);\">".($props->{'label'}||"")."</text>\n";
	$svg .= "</g>\n";
	return $svg;
}



# "Private" functions (they aren't technically private)
sub safeID {
	my ($str) = $_[0];
	$str =~ s/ \& / and /g;
	$str =~ s/\s/-/g;
	$str =~ tr/[A-Z]/[a-z]/;
	return $str;
}

sub safeXML {
	my ($str) = $_[0];
	$str =~ s/ \& / \&amp; /g;
	return $str;
}

sub getXY {
	my (%props) = @_;
	my ($x,$y,$xf,$yf);
	if(!$props{'left'}){ $props{'left'} = 0; }
	if(!$props{'top'}){ $props{'top'} = 0; }
	if(!$props{'right'}){ $props{'right'} = 0; }
	if(!$props{'bottom'}){ $props{'bottom'} = 0; }
	$x = $props{'left'} + (($props{'x'}-$props{'xmin'})/($props{'xmax'}-$props{'xmin'}))*($props{'width'}-$props{'left'}-$props{'right'});
	$y = $props{'top'} + (1-($props{'y'}-$props{'ymin'})/($props{'ymax'}-$props{'ymin'}))*($props{'height'}-$props{'bottom'}-$props{'top'});
	return ($x,$y);
}

##########################
# Make the tick marks.
# @param {number} mn - the minimum value
# @param {number} mx - the maximum value
sub makeTicks(){
	my ($mn,$mx,%opts) = @_;
	my ($v,$l,$i,$d,$vmx,%ticks,$ss,$mm,$hh,$dom,$m,$yy,$sow,$soy,$dst,$sm,$em,$t,$dt,$jd);
	my @months = ('J','F','M','A','M','J','J','A','S','O','N','D');

	# If the range is negative we cowardly quit
	if($mn > $mx){ return (); }
	# If the min or max are not numbers we quit
	#if(isNaN(mn) || isNaN(mx)) return ticks;

	%ticks = ('length'=>0);
	$dt = ODILeeds::DateTime->new();

	if($opts{'type'} && $opts{'type'} eq "date"){
		($ss,$mm,$hh,$dom,$m,$yy,$sow,$soy,$dst) = localtime($mn);
		$sm = $yy*12 + $m;
		($ss,$mm,$hh,$dom,$m,$yy,$sow,$soy,$dst) = localtime($mx);
		$em = $yy*12 + $m;
		$m = $sm;
		$i = 0;
		while($m <= $em){
			$t = ($m % 12);
			$jd = $dt->getJulianDate(1900+int($m/12),$t+1,1,0,0);
			$ticks{'data-'.$i} = $dt->convertJulianToUnix($jd);
			$ticks{'label-'.$i} = $months[$t];
			$ticks{'length'}++;
			$m++;
			$i++;
		}
	}else{
		if($opts{'spacing'}){ $ticks{'inc'} = $opts{'spacing'}; }
		else{ $ticks{'inc'} = defaultSpacing($mn,$mx,$opts{'n'}||5); }
		
		$vmx = $mx + $ticks{'inc'};
		for($v = ($ticks{'inc'}*int($mn/$ticks{'inc'})), $i = 0; $v <= $vmx; $v += $ticks{'inc'}, $i++){
			# If formatLabel is set we use that to format the label
			$ticks{'data-'.$i} = $v;
			$ticks{'length'}++;
		}
	}

	if($ticks{'length'} == 0){
		print "No ticks";
		return %ticks;
	}

	$ticks{'range'} = $ticks{'data-'.($ticks{'length'}-1)} - $ticks{'data-'.0};

	return %ticks;
}

sub log10 {
	my $n = shift;
	return log($n)/log(10);
}

####################################
# Get some spacing given a minimum and maximum value
# @param {number} mn - the minimum value
# @param {number} mx - the maximum value
# @param {number} n - the minimum number of steps
sub defaultSpacing { 
	my ($mn, $mx, $n) = @_;

	my ($dv, $log10_dv, $base, $frac, @options, @distance, $imin, $tmin, $i);

	# Start off by finding the exact spacing
	$dv = abs($mx - $mn) / $n;
	
	# In any given order of magnitude interval, we allow the spacing to be
	# 1, 2, 5, or 10 (since all divide 10 evenly). We start off by finding the
	# log of the spacing value, then splitting this into the integer and
	# fractional part (note that for negative values, we consider the base to
	# be the next value 'down' where down is more negative, so -3.6 would be
	# split into -4 and 0.4).
	$log10_dv = log10($dv);
	$base = int($log10_dv);
	$frac = $log10_dv - $base;

	# We now want to check whether frac falls closest to 1, 2, 5, or 10 (in log
	# space). There are more efficient ways of doing this but this is just for clarity.
	@options = (1, 2, 5, 10);
	@distance = ();
	$imin = -1;
	$tmin = 1e100;
	for($i = 0; $i < @options; $i++) {
		if(!$distance[$i]){ push(@distance,""); }
		$distance[$i] = abs($frac - log10($options[$i]));
		if($distance[$i] < $tmin) {
			$tmin = $distance[$i];
			$imin = $i;
		}
	}

	# Now determine the actual spacing
	return (10 ** $base) * $options[$imin];
}

sub commify {
	my $text = reverse $_[0];
	$text =~ s/(\d\d\d)(?=\d)(?!\d*\.)/$1,/g;
	return scalar reverse $text;
}

1;
