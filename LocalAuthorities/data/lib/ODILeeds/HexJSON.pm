package ODILeeds::HexJSON;

use strict;
use warnings;
use JSON::XS;
use Data::Dumper;
use ODILeeds::ColourScale;



sub new {
    my ($class, %args) = @_;
 
    my $self = \%args;
 
    bless $self, $class;
 
    return $self;
}

sub load {
	my ($self, $file) = @_;
	my ($str,%json,%hexes,$minr,$maxr,$minq,$maxq,$hex,$r,$q,@lines);

	if(-e $file){
		# Get a local HexJSON file
		open(FILE,$file);
		@lines = <FILE>;
		close(FILE);
	}elsif($file =~ /^https?\:/){
		# Get a remote HexJSON file
		@lines = `wget -q --no-check-certificate -O- "$file"`;
	}else{
		print "ERROR: No HexJSON file provided.\n";
		return $self;
	}
	$str = join("\n",@lines);
	my $json = JSON::XS->new->utf8->decode($str);
	%hexes = %{$json->{'hexes'}};
	%{$self->{'q'}} = ('min'=>1e6,'max'=>-1e6,'min2'=>1e6,'max2'=>-1e6);
	%{$self->{'r'}} = ('min'=>1e6,'max'=>-1e6,'min2'=>1e6,'max2'=>-1e6);
	foreach $hex (sort(keys(%hexes))){
		$r = $hexes{$hex}{'r'};
		$q = $hexes{$hex}{'q'};

		# Find min/max of r/q
		if($r > $self->{'r'}{'max'}){ $self->{'r'}{'max'} = $r; }
		if($r < $self->{'r'}{'min'}){ $self->{'r'}{'min'} = $r; }
		if($q > $self->{'q'}{'max'}){ $self->{'q'}{'max'} = $q; }
		if($q < $self->{'q'}{'min'}){ $self->{'q'}{'min'} = $q; }

		if($json->{'layout'} eq "odd-r" && $r%2==1){ $q += 0.5; } # Odd rows right
		if($json->{'layout'} eq "even-r" && $r%2==0){ $q += 0.5; } # Even rows right
		if($json->{'layout'} eq "odd-q" && $r%2==1){ $r -= 0.5; } # Odd rows down
		if($json->{'layout'} eq "even-q" && $r%2==0){ $r -= 0.5; } # Even rows down
		$hexes{$hex}{'r2'} = $r;
		$hexes{$hex}{'q2'} = $q;

		if($r > $self->{'r'}{'max2'}){ $self->{'r'}{'max2'} = $r; }
		if($r < $self->{'r'}{'min2'}){ $self->{'r'}{'min2'} = $r; }
		if($q > $self->{'q'}{'max2'}){ $self->{'q'}{'max2'} = $q; }
		if($q < $self->{'q'}{'min2'}){ $self->{'q'}{'min2'} = $q; }
	}

	$self->{'layout'} = $json->{'layout'};
	$self->{'hexes'} = \%hexes;

	return $self;
}

sub setPrimaryKey {
	my ($self, $key) = @_;
	my ($max,$min,$hex);
	$self->{'primarykey'} = $key;
	$max = -1e100;
	$min = 1e100;
	foreach $hex (keys(%{$self->{'data'}})){
		if($self->{'data'}{$hex} && $self->{'data'}{$hex}->{$self->{'primarykey'}}){
			if($self->{'data'}{$hex}->{$self->{'primarykey'}} > $max){ $max = $self->{'data'}{$hex}->{$self->{'primarykey'}}; }
			if($self->{'data'}{$hex}->{$self->{'primarykey'}} < $min){ $min = $self->{'data'}{$hex}->{$self->{'primarykey'}}; }
		}
	}
	$self->{'max'} = $max;
	$self->{'min'} = $min;
	return $self;
}

sub setKeys {
	my ($self, @keys) = @_;
	@{$self->{'keys'}} = @keys;
	return $self;
}

sub addData {
	my ($self, %data) = @_;
	$self->{'data'} = \%data;
	my ($max,$min,$hex);
	if($self->{'primarykey'}){
		$self->{'max'} = 1;
		$self->{'min'} = 0;
	}
	return $self;
}

sub setColourScale {
	my ($self, $scale) = @_;
	$self->{'scale'} = $scale;
	$self->{'colourscale'} = ODILeeds::ColourScale->new();
	
	return $self;
}

sub getColourScale {
	my ($html,$grad);
	my ($self) = @_;

	$grad = $self->{'colourscale'}->{'scales'}->{$self->{'scale'}}->{'str'};

	$html = "<div class=\"key\"><div class=\"bar\" style=\"background: -moz-linear-gradient(left, $grad);background: -webkit-linear-gradient(left, $grad);background: linear-gradient(to right, $grad);\"></div><div class=\"range\"><span class=\"min\">$self->{'min'}</span><span class=\"max\">$self->{'max'}</span></div></div>\n";

	return $html;
}

sub map {
	my ($self, %props) = @_;
	my ($hex,%hexes,$prop,$d,$svg,$dr,$dq,$q,$r,$w,$h,$path,$x,$y,$y2,$dx,$dy,$dy2,$hexpath,$oq,$or,$ratio,$f,$colour,$k,$ks,$ky,$scalebar,@stops,$s);

	$w = $props{'width'};
	$h = $props{'height'};
	$scalebar = $props{'scalebar'};

	$dr = ($self->{'r'}{'max2'} - $self->{'r'}{'min2'});
	$dq = ($self->{'q'}{'max2'} - $self->{'q'}{'min2'});

	if($self->{'layout'} eq "odd-r" || $self->{'layout'} eq "even-r"){
		# Pointy topped

		$oq = 0.5;
		$or = 2/3;

		$dr += 2*$or;
		$dq += 2*$oq;
		
		$ratio = ($dr/$dq);
		$f = 1.5/sqrt(3);

		$x = 1/$dq;
		$dx = sprintf("%0.3f",0.5*$x);
		$y = $x*$f;
		$dy = sprintf("%0.3f",$y/3);
		$dy2 = sprintf("%0.3f",$y*2/3);

		$hexpath = " m -".($dx).",-".($dy)." l 0,".($dy2)." ".($dx).",".($dy)." ".($dx).",-".($dy)." 0,-".($dy2)." -".($dx).",-".($dy)."z";
		if(!$h){
			$h = $w*$ratio*$f;
		}
	}elsif($self->{'layout'} eq "odd-q" || $self->{'layout'} eq "even-q"){
		# Flat topped


	}


	# Build SVG
	$svg = "<svg width=\"".sprintf("%d",$w)."\" height=\"".sprintf("%d",$h)."\" viewBox=\"0 0 1 ".sprintf("%0.3f",$f)."\" xmlns=\"http://www.w3.org/2000/svg\" style=\"overflow:display\" preserveAspectRatio=\"xMinYMin meet\" overflow=\"visible\">\n";
	$svg .= "<defs>";
	if($scalebar){
		@stops = @{$self->{'colourscale'}->{'scales'}->{$self->{'scale'}}->{'stops'}};
		$svg .= "<linearGradient id=\"$scalebar\" x1=\"0\" x2=\"0\" y1=\"1\" y2=\"0\">\n";
		for($s = 0; $s < @stops; $s++){
			$svg .= "\t<stop offset=\"".($stops[$s]->{'v'})."%\" stop-color=\"$stops[$s]->{'c'}->{'hex'}\"/>\n";
		}
		$svg .= "</linearGradient>\n";
	}
	$svg .= "<style>path.hex { vector-effect: non-scaling-stroke; stroke: white; stroke-width: 1; } path.hex:hover { stroke: black; stroke-width: 4; }</style>\n";
	$svg .= "</defs>";
	
	foreach $hex (sort(keys(%{$self->{'hexes'}}))){
		$q = ($self->{'hexes'}{$hex}{'q2'} - $self->{'q'}{'min2'} + $oq)/$dq;
		$r = ($self->{'r'}{'max2'} - $self->{'hexes'}{$hex}{'r2'} + $or)*$ratio*$f/$dr;
		$path = "M".sprintf("%0.3f",$q).",".sprintf("%0.3f",$r).$hexpath;
		$colour = $self->{'colourscale'}->getColourFromScale($self->{'scale'},$self->{'data'}{$hex}->{$self->{'primarykey'}},$self->{'min'},$self->{'max'});
		$svg .= "<path d=\"$path\" class=\"hex\" data-id=\"$hex\"";
		if($self->{'keys'}){
			$ks = @{$self->{'keys'}};
			for($k = 0; $k < $ks; $k++){
				$ky = $self->{'keys'}[$k];
				if($self->{'data'}{$hex}->{$ky}){
					$svg .= " data-$ky=\"".$self->{'data'}{$hex}->{$ky}."\"";
				}
			}
		}
		$svg .= " fill=\"".$colour."\"><title>$self->{'hexes'}{$hex}{'n'}</title></path>\n";
	}
	if($scalebar){
		$svg .= "<rect x=\"0.96\" y=\"0\" width=\"0.04\" height=\"".sprintf("%.2f",$f*0.3)."\" fill=\"url(\#$scalebar)\" />";
	}
	$svg .= "</svg>\n";
	
	return $svg;
}


# "Private" functions (they aren't technically private)

1;