# ============
# Colour v0.2
package ODILeeds::Colour;

use Data::Dumper;
use List::Util qw( min max );
use strict;
use warnings;


sub new {
	my ($class, %args) = @_;
	my $self = \%args;
	if($self->{'colour'}){
		$self = colour($self,$self->{'colour'},$self->{'name'});
	}
	bless $self, $class;
	return $self;
}

sub colour {

	my ($self, $c, $n) = @_;
	my (@bits,$r,$sat);
	
	$self->{'alpha'} = 1;
	$self->{'hex'} = "";
	$self->{'rgb'} = [0,0,0];

	# Let's deal with a variety of input
	if($c =~ /^\#/){
		$self->{'hex'} = $c;
		$self->{'rgb'} = [h2d(substr($c,1,2)),h2d(substr($c,3,2)),h2d(substr($c,5,2))];
	}elsif($c =~ /^rgb/){
		$c =~ s/[^\d\,]//g;
		@bits = split(',',$c);
		$n = @bits;
		if($n == 4){
			$self->{'alpha'} = $bits[3];
		}
		if($n >= 3){
			$self->{'rgb'} = [int($bits[0]),int($bits[1]),int($bits[2])];
		}
		$self->{'hex'} = "#".d2h($self->{'rgb'}[0]).d2h($self->{'rgb'}[1]).d2h($self->{'rgb'}[2]);
	}else{
		return $self;
	}

	$self->{'hsv'} = rgb2hsv($self->{'rgb'}[0],$self->{'rgb'}[1],$self->{'rgb'}[2]);
	$self->{'name'} = ($n || "Name");
	for($r = 0, $sat = 0; $r < @{$self->{'rgb'}} ; $r++){
		if($self->{'rgb'}[$r] > 200){
			$sat++;
		}
	}
	$self->{'text'} = ($self->{'rgb'}[0] + $self->{'rgb'}[1] + $self->{'rgb'}[2] > 500 || $sat > 1) ? "black" : "white";
 
	return $self;
}

sub d2h {
	my $c = sprintf("%02X", $_[0]);

	
	return $c;
}
sub h2d {
	return hex($_[0]);
}

sub rgb2hsv {
	my ($r, $g, $b) = @_;
	my ($min,$max,$h,$s,$v,$d);

	# Converts an RGB color value to HSV. Conversion formula
	# adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	# Assumes r, g, and b are contained in the set [0, 255] and
	# returns h, s, and v in the set [0, 1].
	#
	# @param	Number  r		 The red color value
	# @param	Number  g		 The green color value
	# @param	Number  b		 The blue color value
	# @return  Array			  The HSV representation
	$r /= 255;
	$g /= 255;
	$b /= 255;
	$max = max([$r, $g, $b]);
	$min = min([$r, $g, $b]);
	$v = $max;
	$d = $max - $min;
	$s = ($max == 0) ? 0 : $d / $max;
	$h = 0;
	if($max == $min){
		$h = 0; # achromatic
	}else{
		if($max eq "r"){ $h = ($g - $b) / $d + ($g < $b ? 6 : 0); }
		elsif($max eq "g"){ $h = ($b - $r) / $d + 2; }
		elsif($max eq "b"){ $h = ($r - $g) / $d + 4; }
		$h /= 6;
	}
	return [$h, $s, $v];
}

1;