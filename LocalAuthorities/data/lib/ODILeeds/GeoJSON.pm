package ODILeeds::GeoJSON;

use strict;
use warnings;
use Data::Dumper;
use ODILeeds::DateTime;
use List::Util qw[min max];
use JSON::XS;
use Math::Trig;


sub new {
    my ($class, %args) = @_;
 
    my $self = \%args;
 
    bless $self, $class;
	
	$self->{'layerorder'} = ();

	if($self->{'file'}){ $self->addLayer('first',$self->{'file'}); }
	if(!$self->{'width'}){ $self->{'width'} = 640; }
 
    return $self;
}


# Add a layer:
# addLayer('id-of-layer','filepath',{extra properties})
sub addLayer {
	my ($self, $id, $file, $props) = @_;
	my (@lines,%data);
	
	if(-e $file){
		# Get the populations data
		open(FILE,$file);
		@lines = <FILE>;
		close(FILE);
		%data = %{JSON::XS->new->utf8->decode(join("\n",@lines))};
		if(!$self->{'layers'}){ $self->{'layers'} = {}; }
		if(!$self->{'layers'}{$id}){ $self->{'layers'}{$id} = {}; }
		$self->{'layers'}{$id}{'file'} = $file;
		$self->{'layers'}{$id}{'data'} = \%data;
		$self->{'layers'}{$id}{'options'} = $props;
		push(@{$self->{'layerorder'}},$id);
	}else{
		print "File $file does not seem to exist.\n";
	}

	return $self;
}

sub setBounds {
	my ($self, $props) = @_;
	
	$self->{'bounds'} = $props;

	return $self;
}

sub getBounds {
	my ($self,$data) = @_;
	my ($mxlat,$mxlon,$mnlat,$mnlon,@order,$l,%layer,$n,$f,@c,$nc,$i,$j,$k,$p,%feature);

	$mxlat = -90;
	$mxlon = -180;
	$mnlat = 90;
	$mnlon = 180;
	
	@order = @{$self->{'layerorder'}};
	
	for($l = 0; $l < @order; $l++){
		%layer = %{$self->{'layers'}{$order[$l]}};
		if($layer{'data'}){
			$n = @{$layer{'data'}{'features'}};
			for($f = 0; $f < $n; $f++){
				if($layer{'data'}{'features'}[$f]){
					%feature = %{$layer{'data'}{'features'}[$f]};
					@c = $layer{'data'}{'features'}[$f]{'geometry'}{'coordinates'};
					$nc = @c;
					if($layer{'data'}{'features'}[$f]{'geometry'}{'type'} eq "Polygon"){
						for($i = 0; $i < $nc; $i++){
							for($j = 0; $j < @{$c[$i]}; $j++){
								for($k = 0; $k < @{$c[$i][$j]}; $k++){
									if($c[$i][$j][$k][0] > $mxlon){ $mxlon = $c[$i][$j][$k][0]; }
									if($c[$i][$j][$k][0] < $mnlon){ $mnlon = $c[$i][$j][$k][0]; }
									if($c[$i][$j][$k][1] > $mxlat){ $mxlat = $c[$i][$j][$k][1]; }
									if($c[$i][$j][$k][1] < $mnlat){ $mnlat = $c[$i][$j][$k][1]; }
								}
							}
						}
					}elsif($layer{'data'}{'features'}[$f]{'geometry'}{'type'} eq "MultiPolygon"){
						for($i = 0; $i < $nc; $i++){
							for($j = 0; $j < @{$c[$i]}; $j++){
								for($k = 0; $k < @{$c[$i][$j]}; $k++){
									for($p = 0; $p < @{$c[$i][$j][$k]}; $p++){
										if($c[$i][$j][$k][$p][0] > $mxlon){ $mxlon = $c[$i][$j][$k][$p][0]; }
										if($c[$i][$j][$k][$p][0] < $mnlon){ $mnlon = $c[$i][$j][$k][$p][0]; }
										if($c[$i][$j][$k][$p][1] > $mxlat){ $mxlat = $c[$i][$j][$k][$p][1]; }
										if($c[$i][$j][$k][$p][1] < $mnlat){ $mnlat = $c[$i][$j][$k][$p][1]; }
									}
								}
							}
						}
					}
				}
			}
		}	
	}
	return ('_northEast'=>{'lat'=>$mxlat,'lng'=>$mxlon},'_southWest'=>{'lat'=>$mnlat,'lng'=>$mnlon});
}

sub drawSVG {
	my ($self, $props) = @_;
	my($w,$h,%b,$ratio,$i,$j,$k,$p,@order,$dlat,$dlon,$mlat,$corr,$slat,$slon,$l,%layer,$n,$nc,$f,%feature,@c,$svg,$path,$lat,$lon,$pad,$idt);

	$w = $self->{'width'};
	if($props->{'bounds'}){
		%b = %{$props->{'bounds'}};
	}else{
		%b = $self->getBounds();
	}
	
	$pad = $props->{'padding'}||5;
	$idt = "\t".($props->{'indent'}||"");

	$dlat = ($b{'_northEast'}{'lat'} - $b{'_southWest'}{'lat'});
	$dlon = ($b{'_northEast'}{'lng'} - $b{'_southWest'}{'lng'});


	$mlat = ($b{'_northEast'}{'lat'} + $b{'_southWest'}{'lat'})/2;
	$corr = cos(pi()*($mlat)/180);

	$ratio = $dlon*$corr/$dlat;
	$h = $w/$ratio;
	
	$slat = ($h-$pad*2)/$dlat;
	$slon = ($w-$pad*2)/$dlon;

	@order = @{$self->{'layerorder'}};
	$svg = "";

	for($l = 0; $l < @order; $l++){
		
		%layer = %{$self->{'layers'}{$order[$l]}};

		if(!$layer{'data'}){
			print "ERROR: No data for layer $order[$l]\n";
			return $self;
		}
		
		$n = @{$layer{'data'}{'features'}};
		for($f = 0; $f < $n; $f++){
			if($layer{'data'}{'features'}[$f]){
				%feature = %{$layer{'data'}{'features'}[$f]};
				@c = $layer{'data'}{'features'}[$f]{'geometry'}{'coordinates'};
				$nc = @c;
				$path = "";
				if($layer{'data'}{'features'}[$f]{'geometry'}{'type'} eq "Polygon"){
					for($i = 0; $i < $nc; $i++){
						for($j = 0; $j < @{$c[$i]}; $j++){
							for($k = 0; $k < @{$c[$i][$j]}; $k++){
								$lat = sprintf("%0.0f",$h - $pad - (($c[$i][$j][$k][1] - $b{'_southWest'}{'lat'})*$slat));
								$lon = sprintf("%0.0f",$pad + (($c[$i][$j][$k][0] - $b{'_southWest'}{'lng'})*$slon));
								if($k==0){
									$path .= "M $lon $lat";
								}elsif($k==1){
									$path .= "L $lon $lat";
								}else{
									$path .= " $lon $lat";
								}
							}
						}
					}
				}elsif($layer{'data'}{'features'}[$f]{'geometry'}{'type'} eq "MultiPolygon"){
					for($i = 0; $i < $nc; $i++){
						for($j = 0; $j < @{$c[$i]}; $j++){
							for($k = 0; $k < @{$c[$i][$j]}; $k++){
								for($p = 0; $p < @{$c[$i][$j][$k]}; $p++){
									$lat = sprintf("%0.0f",$h - $pad - (($c[$i][$j][$k][$p][1] - $b{'_southWest'}{'lat'})*$slat));
									$lon = sprintf("%0.0f",$pad + (($c[$i][$j][$k][$p][0] - $b{'_southWest'}{'lng'})*$slon));
									if($p==0){
										$path .= "M $lon $lat";
									}elsif($p==1){
										$path .= "L $lon $lat";
									}else{
										$path .= " $lon $lat";
									}
								}
							}
						}
					}
				}
				if($path){
					$svg .= "$idt<path d=\"$path\"";
					if($layer{'options'}{'stroke'}){ $svg .= " stroke=\"$layer{'options'}{'stroke'}\""; }
					if($layer{'options'}{'strokeWidth'}){ $svg .= " stroke-width=\"$layer{'options'}{'strokeWidth'}\""; }
					if($layer{'options'}{'strokeLinecap'}){ $svg .= " stroke-linecap=\"$layer{'options'}{'strokeLinecap'}\""; }
					if($layer{'options'}{'fill'}){
						$svg .= " fill=\"";
						if(defined($layer{'options'}{'fill'})){
							$svg .= $layer{'options'}{'fill'}->($layer{'data'}{'features'}[$f]{'properties'}{$layer{'options'}{'key'}||'id'});
							
						}else{
							$svg .= $layer{'options'}{'fill'};
						}
						$svg .= "\"";
					}
					if($layer{'options'}{'fillOpacity'}){ $svg .= " fill-opacity=\"$layer{'options'}{'fillOpacity'}\""; }
					foreach $p (sort(keys(%{$layer{'data'}{'features'}[$f]{'properties'}}))){
						$svg .= " data-$p=\"$layer{'data'}{'features'}[$f]{'properties'}{$p}\"";
					}
					if(defined($layer{'options'}{'props'})){
						$svg .= $layer{'options'}{'props'}->($layer{'data'}{'features'}[$f]{'properties'}{$layer{'options'}{'key'}||'id'})
					}
					$svg .= "></path>\n";
				}
#				map.ctx.fillStyle = hex2rgba(this.options.color,this.options.fillOpacity);
#				map.ctx.strokeStyle = hex2rgba(this.options.color,this.options.opacity);
#				map.ctx.lineWidth = this.options.weight;

			}
		}
		
	}
	$svg = "<svg width=\"$w\" height=\"$h\" viewBox=\"0 0 $w $h\" xmlns=\"http://www.w3.org/2000/svg\" preserveAspectRatio=\"xMinYMin meet\" overflow=\"visible\"".($props->{'data'} ? " data=\"".$props->{'data'}."\"" : "").">\n$svg\t</svg>";
	return $svg;
}

1;
