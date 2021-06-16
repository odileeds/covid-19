(function(root){

	function Graph(opts){

		if(!opts) opts = {};
		// Set some dummy min/max values
		this.xmin = 1e100;
		this.xmax = -1e100;
		this.ymin = 1e100;
		this.ymax = -1e100;
		
		
		this.series = [];
		this.addSeries = function(series){
			this.series.push(series);

			for(var i = 0; i < series.data.length; i++){
				this.xmin = Math.min(this.xmin,series.data[i].x);
				this.ymin = Math.min(this.ymin,series.data[i].y);
				this.xmax = Math.max(this.xmax,series.data[i].x);
				this.ymax = Math.max(this.ymax,series.data[i].y);
			}

			return this;
		}

		this.draw = function(props){
			var r,w,h,lines,svg,header,headers,c,cols,rows,i,scenariolookup,s,scenarios,scenario,safescenario,minyr,maxyr,miny,maxy,path,y,yrs,yrange,xpos,ypos,t,pos,circles,ticks,a,b,left,right,topp,bottom;
	
			w = props.width;
			h = props.height;
	
			minx = this.xmin;
			maxx = this.xmax;
			miny = this.ymin;
			maxy = this.ymax;

			if(!h){ h = w*0.5; }

			miny = 0;
			if(!props.axis) props.axis = {};
			if(!props.axis.x) props.axis.x = {};
			if(!props.axis.y) props.axis.y = {};

			if(props.axis.x.max) maxx = props.axis.x.max;
			if(props.axis.x.min) minx = props.axis.x.min;
			if(props.axis.y.max) maxy = props.axis.y.max;
			if(props.axis.y.min) miny = props.axis.y.min;

			xrange = maxx - minx;
			yrange = maxy - miny;
			
			if(!props.tick || props.tick=="") props.tick = 5;

			// Build SVG
			svg = "<svg width=\""+Math.round(w)+"\" height=\""+Math.round(h)+"\" viewBox=\"0 0 "+w+" "+h+"\" xmlns=\"http://www.w3.org/2000/svg\" style=\"overflow:display\" preserveAspectRatio=\"xMinYMin meet\" overflow=\"visible\">\n";
			svg += "<defs>\n";
			svg += "\t<style>\n";
			svg += "\t.data-series path.line { fill-opacity: 0; }\n";
			svg += "\t.data-series path.line.dotted { stroke-dasharray: 12 20 }\n";
			svg += "\t.data-series circle { display: none; }\n";
			svg += "\t.data-series:hover path.line, .data-series.on path.line { stroke-width: "+props['strokehover']+"; }\n";
			svg += "\t.data-series:hover circle, .data-series.on circle { display: inline; }\n";
			svg += "\t.data-series circle:hover, .data-series circle.on { r: "+props['pointhover']+"px!important; }\n";
			svg += "\t.graph-grid { font-family: \"Helvetica Neue\",Helvetica,Arial,\"Lucida Grande\",sans-serif; }\n";
			svg += "\t.graph-grid line { stroke-width: "+(props['line']||1)+"; stroke-linecap: round; }\n";
			svg += "\t.graph-grid.graph-grid-x text { text-anchor: middle; dominant-baseline: hanging; transform: translateY("+(props.tick*2)+"px); }\n";
			svg += "\t.graph-grid.graph-grid-y text { text-anchor: end; dominant-baseline: "+(props.axis.y.labels.baseline||"middle")+"; transform: translateX(-"+(props['tick']*2)+"px); }\n";
			svg += "\t</style>\n";
			svg += "</defs>\n";

			left = props.left||0;
			right = props.right||0;
			topp = props.top||0;
			bottom = props.bottom||0;

			// Draw grid lines
			svg += buildAxis('y',props.axis.y,{'n':3,'left':left,'right':right,'bottom':bottom,'top':topp,'width':w,'height':h,'xmin':minx,'xmax':maxx,'ymin':miny,'ymax':maxy});
			svg += buildAxis('x',props.axis.x,{'type':'date','left':left,'right':right,'bottom':bottom,'top':topp,'spacing':10,'width':w,'height':h,'xmin':minx,'xmax':maxx,'ymin':miny,'ymax':maxy});

			for(s = 0; s < this.series.length; s++){
				series = this.series[s].title;
				safeseries = safeXML(series);
				t = series;
				path = "";
				svg += "<g data-series=\""+(this.series[s].css||safeID(series))+"\" class=\"data-series\">";
				circles = "";
				for(i = 0; i < this.series[s].data.length; i++){
					if(this.series[s].data[i]){
						pos = getXY({'x':this.series[s].data[i].x,'y':this.series[s].data[i].y,'width':w,'height':h,'left':left,'right':right,'bottom':bottom,'top':topp,'xmin':minx,'xmax':maxx,'ymin':miny,'ymax':maxy});
						xpos = pos[0];
						ypos = pos[1];
						path += (i == 0 ? "M":"L")+" "+xpos.toFixed(2)+","+ypos.toFixed(2);
						if(props['point']>0){
							circles += "\t<circle cx=\""+xpos.toFixed(2)+"\" cy=\""+ypos.toFixed(2)+"\" data-y=\""+this.series[s].data[i].y+"\" data-x=\""+this.series[s].data[i].x+"\" r=\""+props['point']+"\" fill=\""+(this.series[s].color||"#cc0935")+"\"><title>"+(typeof this.series[s].formatLabel==="function" ? this.series[s].formatLabel.call(this.series[s],this.series[s].data[i].x,this.series[s].data[i].y,i) : this.series[s].data[i].x+": "+this.series[s].data[i].y)+"</title></circle>\n";
						}
					}
				}
				console.log(props);
				svg += "\t<path d=\""+path+"\" id=\""+safeID(series)+"\" class=\"line\"";
				if(this.series[s].stroke) svg += " stroke-width=\""+this.series[s].stroke+"\"";
				svg += " stroke-linecap=\"round\"";
				if(this.series[s]['stroke-dasharray']) svg += " stroke-dasharray=\""+this.series[s]['stroke-dasharray']+"\"";
				svg += "><title>"+safeseries+"</title></path>\n";
				svg += circles;
				svg += "</g>\n";
			}

			svg += "</svg>\n";
		
			return svg;
		}

		function buildAxis(axis,props,conf){
			var ticks,svg,t,a,b,axis,label,temp,tick;
			if(!props) props = {};
			tick = (props.tick||5);
			
			ticks = makeTicks(conf[(axis=="y" ? "ymin":"xmin")],conf[(axis=="y" ? "ymax":"xmax")],conf);

			svg = "<g class=\"graph-grid graph-grid-"+axis+"\">\n";

			for(t = 0; t < ticks.length; t++){

				if(axis=="x"){
					conf['x'] = ticks['data-'+t];
					conf['y'] = conf['ymin'];
				}else{
					conf['x'] = conf['xmin'];
					conf['y'] = ticks['data-'+t];		
				}
				a = getXY(conf);

				if(axis=="x"){
					conf['x'] = ticks['data-'+t];
					conf['y'] = conf['ymax'];
				}else{
					conf['x'] = conf['xmax'];
					conf['y'] = ticks['data-'+t];		
				}
				b = getXY(conf);
				if(axis=="y"){
					if(props.labels && props.labels.left){
						//a[0] = props.labels.left;
					}
				}
				if(a[1] >= 0 && a[0] >= conf['left']){
					if(a[0] < conf['width']){
						if((t == 0 && props.line > 0) || props['lines']){
							svg += "\t<line x1=\""+a[0]+"\" y1=\""+a[1]+"\" x2=\""+b[0]+"\" y2=\""+b[1]+"\" data-left=\""+conf['left']+"\"></line>\n";
						}
						if(props['ticks']){
							svg += "\t<line class=\"tick\" x1=\""+a[0]+"\" y1=\""+a[1]+"\" x2=\""+(a[0]-(axis=="y" ? tick : 0))+"\" y2=\""+(a[1]+(axis=="y" ? 0 : tick))+"\"></line>\n";
						}
						label = ticks['data-'+t];
						if(ticks['label-'+t]) label = ticks['label-'+t];
						if(props['format'] && props['format']=="commify") label = label.toLocaleString();
						svg += "\t<text x=\""+(a[0]+(props.labels && props.labels.left ? props.labels.left : 0))+"\" y=\""+a[1]+"\" text-anchor=\""+(axis=="y" ? "end":"middle")+"\">"+label+"</text>\n";
					}
				}
			}
			svg += "\t<text style=\"text-anchor:middle;dominant-baseline:hanging;font-weight:bold;transform: translateY("+(conf['top'] + (conf['height']-conf['top']-conf['bottom'])/2)+"px) rotate(-90deg);\">"+(props['label']||"")+"</text>\n";
			svg += "</g>\n";
			return svg;
		}


		function safeID(str) {
			return str.replace(/ \& /g," and ").replace(/\s/g,"-").replace(/([A-Z])/g,function(m,p1){ return p1.toLowerCase(); });
		}

		function safeXML(str){
			return str.replace(/ \& /g," and ");
		}

		function getXY(props){
			var x,y,xf,yf;
			if(!props['left']) props['left'] = 0;
			if(!props['top']) props['top'] = 0;
			if(!props['right']) props['right'] = 0;
			if(!props['bottom']) props['bottom'] = 0;
			x = props['left'] + ((props['x']-props['xmin'])/(props['xmax']-props['xmin']))*(props['width']-props['left']-props['right']);
			y = props['top'] + (1-(props['y']-props['ymin'])/(props['ymax']-props['ymin']))*(props['height']-props['bottom']-props['top']);
			return [x,y];
		}


		/*##########################
		# Make the tick marks.
		# @param {number} mn - the minimum value
		# @param {number} mx - the maximum value
		*/
		function makeTicks(mn,mx,opts){
			var v,l,i,d,vmx,ticks;
			var months = ['J','F','M','A','M','J','J','A','S','O','N','D'];

			// If the range is negative we cowardly quit
			if(mn > mx) return;
			// If the min or max are not numbers we quit
			//if(isNaN(mn) || isNaN(mx)) return ticks;

			ticks = {'length':0};

			if(opts['type']=="date"){
				d = new Date(mn);
				d.setDate(1);
				i = 0;
				// Make month markers
				while(d <= mx){
					ticks['data-'+i] = d.getTime();
					ticks['label-'+i] = months[d.getMonth()];
					ticks.length++;
					d.setMonth(d.getMonth()+1);
					i++;
				}
			}else{

				ticks.inc = (opts['spacing']) ? opts.spacing : defaultSpacing(mn,mx,opts.n||5);
				vmx = mx + ticks.inc;
				for(v = (ticks.inc*Math.floor(mn/ticks.inc)), i = 0; v <= vmx; v += ticks.inc, i++){
					// If formatLabel is set we use that to format the label
					ticks['data-'+i] = v;
					ticks.length++;
				}

				if(ticks.length == 0){
					console.error("No ticks");
					return ticks;
				}
			}

			ticks.range = ticks['data-'+(ticks.length-1)] - ticks['data-'+0];

			return ticks;
		}

		function log10(n){
			return Math.log(n)/Math.log(10);
		}

		/*####################################
		# Get some spacing given a minimum and maximum value
		# @param {number} mn - the minimum value
		# @param {number} mx - the maximum value
		# @param {number} n - the minimum number of steps
		*/
		function defaultSpacing(mn,mx,n){

			var dv, log10_dv, base, frac, options, distance, imin, tmin, i;

			// Start off by finding the exact spacing
			dv = Math.abs(mx - mn) / n;
			
			// In any given order of magnitude interval, we allow the spacing to be
			// 1, 2, 5, or 10 (since all divide 10 evenly). We start off by finding the
			// log of the spacing value, then splitting this into the integer and
			// fractional part (note that for negative values, we consider the base to
			// be the next value 'down' where down is more negative, so -3.6 would be
			// split into -4 and 0.4).
			log10_dv = log10(dv);
			base = Math.floor(log10_dv);
			frac = log10_dv - base;

			// We now want to check whether frac falls closest to 1, 2, 5, or 10 (in log
			// space). There are more efficient ways of doing this but this is just for clarity.
			options = [1, 2, 5, 10];
			distance = [];
			imin = -1;
			tmin = 1e100;
			for(i = 0; i < options.length; i++) {
				if(!distance[i]) distance.push("");
				distance[i] = Math.abs(frac - log10(options[i]));
				if(distance[i] < tmin) {
					tmin = distance[i];
					imin = i;
				}
			}

			// Now determine the actual spacing
			return Math.pow(10,base) * options[imin];
		}

		return this;
	}

	window.Graph = function(opts){
		return new Graph(opts);
	}

})(window || this);
