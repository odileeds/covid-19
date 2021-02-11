# ============
# Colour v0.2
package ODILeeds::ColourScale;

use ODILeeds::Colour;
use Data::Dumper;
use strict;
use warnings;

sub new {
	my ($class, %args) = @_;
	my $self = \%args;
	bless $self, $class;

	$self->{'scales'} = {
		'Viridis'=> {'str'=>'rgb(68,1,84) 0%, rgb(72,35,116) 10%, rgb(64,67,135) 20%, rgb(52,94,141) 30%, rgb(41,120,142) 40%, rgb(32,143,140) 50%, rgb(34,167,132) 60%, rgb(66,190,113) 70%, rgb(121,209,81) 80%, rgb(186,222,39) 90%, rgb(253,231,36) 100%'},
		'ODI'=> {'str'=>'rgb(114,46,165) 0%, rgb(230,0,124) 50%, rgb(249,188,38) 100%'},
		'Heat'=> {'str'=>'rgb(0,0,0) 0%, rgb(128,0,0) 25%, rgb(255,128,0) 50%, rgb(255,255,128) 75%, rgb(255,255,255) 100%'},
		'Planck'=> {'str'=>'rgb(0,0,255) 0, rgb(0,112,255) 16.666%, rgb(0,221,255) 33.3333%, rgb(255,237,217) 50%, rgb(255,180,0) 66.666%, rgb(255,75,0) 100%'},
		'EPC'=> {'str'=>'#ef1c3a 1%, #ef1c3a 20.5%, #f78221 20.5%, #f78221 38.5%, #f9ac64 38.5%, #f9ac64 54.5%, #ffcc00 54.5%, #ffcc00 68.5%, #8cc63f 68.5%, #8cc63f 80.5%, #1bb35b 80.5%, #1bb35b 91.5%, #00855a 91.5%, #00855a 120%'},
		'Plasma'=> {'str'=>'rgb(12,7,134) 0%, rgb(64,3,156) 10%, rgb(106,0,167) 20%, rgb(143,13,163) 30%, rgb(176,42,143) 40%, rgb(202,70,120) 50%, rgb(224,100,97) 60%, rgb(241,130,76) 70%, rgb(252,166,53) 80%, rgb(252,204,37) 90%, rgb(239,248,33) 100%'},
		'Referendum'=> {'str'=>'#4BACC6 0, #B6DDE8 50%, #FFF380 50%, #FFFF00 100%'},
		'Leodis'=> {'str'=>'#2254F4 0%, #F9BC26 50%, #ffffff 100%'},
		'Longside'=> {'str'=>'#801638 0%, #addde6 100%'}
	};
	
	my ($c,$id);

	# Process existing scales
	foreach $id (keys(%{$self->{'scales'}})){
		processScale($self,$id);
	}

	return $self;
}

sub col {
	return ODILeeds::Colour->new('colour'=>$_[0]);
}

sub getColourPercent {
	my ($pc,$a,$b) = @_;
	$pc /= 100;
	return "rgb(".int($a->{'rgb'}[0] + ($b->{'rgb'}[0] - $a->{'rgb'}[0])*$pc).",".int($a->{'rgb'}[1] + ($b->{'rgb'}[1] - $a->{'rgb'}[1])*$pc).",".int($a->{'rgb'}[2] + ($b->{'rgb'}[2] - $a->{'rgb'}[2])*$pc).")";
}

sub makeGradient {
	my ($a,$b) = @_;
	print "makeGradient - $a,$b\n";
	$a = col($a);
	$b = col($b);
	return 'background: '.$a->{'hex'}.'; background: -moz-linear-gradient(left, '.$a->{'hex'}.' 0%, '.$b->{'hex'}.' 100%);background: -webkit-linear-gradient(left, '.$a->{'hex'}.' 0%,'.$b->{'hex'}.' 100%);background: linear-gradient(to right, '.$a->{'hex'}.' 0%,'.$b->{'hex'}.' 100%);';
}

sub processScale {
	my ($self,$id) = @_;
	if(!$self->{'scales'}{$id}->{'stops'}){
		$self->{'scales'}{$id}->{'stops'} = extractColours($self->{'scales'}{$id}{'str'});
	}

	return $self;
}

sub extractColours {
	my ($str) = $_[0];
	my (@stops,@cs,$i,$c,@bits);

	if(!$str){
		return [];
	}

	$str =~ s/^\s+//g;
	$str =~ s/\s+$//g;
	$str =~ s/\s\s/ /g;
	@stops = split(', ',$str);
	for($i = 0; $i < @stops; $i++){

		@bits = split(/ /,$stops[$i]);

		if(@bits==2){
			push(@cs,{'v'=>$bits[1],'c'=>col($bits[0])});
		}elsif(@bits==1){
			push(@cs,{'c'=>col($bits[0])});
		}

	}
	
	for($c = 0; $c < @cs; $c++){
		if($cs[$c] && $cs[$c]{'v'}){
			# If a colour-stop has a percentage value provided, 
			if($cs[$c]->{'v'} =~ /\%/){
				$cs[$c]->{'aspercent'} = 1;
			}
			$cs[$c]->{'v'} =~ s/\D//;
		}
	}

	return \@cs;
}

# Return a Colour object for a string
sub getColour {
	return ODILeeds::Colour->new('colour'=>$_[0]);
}

# Return the colour scale string
sub getColourScale {
	my ($self,$id) = @_;
	if(!$id){ $id = $self->{'scale'}; }
	return $self->{'scales'}{$id}{'str'};
}

sub getColourFromScale {
	my ($self,$s,$v,$min,$max) = @_;
	my (@cs,$v2,$pc,$c,$colour,$match,$len);
	
	$colour = "";

	if(!$self->{'scales'}{$s}){

		print "No colour scale $s exists";
		return '';
	}

	if(!$v){ $v = 0; }
	if(!$min){
		$min = 0;
	}

	if(!$max){
		$max = 1;
	}

	@cs = @{$self->{'scales'}{$s}{'stops'}};
	
	$v2 = 100*($v-$min)/($max-$min);

	$match = -1;
	$len = @cs;

	# Fix for anything that goes above the colour scale
	if($v2 > 100){
		$v2 = 100;
	}
	if($v==$max){
		$colour = 'rgba('.$cs[$len-1]->{'c'}->{'rgb'}[0].', '.$cs[$len-1]->{'c'}{'rgb'}[1].', '.$cs[$len-1]->{'c'}{'rgb'}[2].', '.($v2/100).")";
	}else{
		

		if($len == 1){
			$colour = 'rgba('.$cs[0]{'c'}->{'rgb'}[0]+', '+$cs[0]{'c'}->{'rgb'}[1]+', '+$cs[0]{'c'}->{'rgb'}[2]+', ' + ($v2/100) + ")";
		}else{
			for($c = 0; $c < $len-1; $c++){
				if($v2 >= $cs[$c]{'v'} && $v2 <= $cs[$c+1]{'v'}){
					# On this colour stop
					$pc = 100*($v2 - $cs[$c]{'v'})/($cs[$c+1]{'v'}-$cs[$c]{'v'});
					if($v2 >= $max){
						$pc = 100;	# Don't go above colour range
					}
					$colour = getColourPercent($pc,$cs[$c]->{'c'},$cs[$c+1]->{'c'});
					last;
				}
			}
		}
	}

	return $colour;	
}

1;