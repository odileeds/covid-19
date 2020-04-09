/*!
	Dashboard plugin to show a log/linear plot of cases
	Written by Stuart Lowe (ODI Leeds)
 */
(function(S){

	name = "plot";
	var _parent;

	function init(){
		_parent = this;
		graph = new PandemicGraph({'id':'graph'});
		graph.getData();
		this.plugins[name].obj = graph;
	}
		
	function PandemicGraph(o){

		if(!o) o = {};

		this.id = o.id || "graph";
		this.title = o.title || "Graph";

		var graph = {
			'view':{
				'x':{'min':-30,'max':200},
				'y':{'min':-12.5,'max':100}
			},
			'x': {'min':0,'max':14},
			'y': {'min':0,'max':10000,'log':true},
			'width': 300,
			'height': 500,
			'el':{},
			'mincases': 3
		};

		this.graph = graph;
		this.el = S('#logplot')[0];
		this.info = new InfoBubbles(graph,{'line':'#2254F4','background':'','color':''});

		months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		function getDate(d){ return months[d.getMonth()]+' '+d.getDate(); } //toISOString().substr(0,10);

		var _obj = this;

		// We'll need to change the sizes when the window changes size
		window.addEventListener('resize', function(event){ _obj.resize(); });

		this.width = function(v){
			if(typeof v==="number"){
				graph.width = v;
				return this;
			}else return graph.width;
		}

		this.height = function(v){
			if(typeof v==="number"){
				graph.height = v;
				return this;
			} else { return graph.height; }
		}

		function getY(v){
			var h = graph.heightinner;
			return h-h*(v-graph.y.min)/(graph.y.max-graph.y.min);
		}
		function getX(v){
			var w = graph.widthinner;
			var xoff = (graph.width - w);
			return xoff + w*(v-graph.x.min)/(graph.x.max-graph.x.min);
		}
		
		this.resize = function(){

			var s,i,w,h,hf,wf;

			w = this.el.offsetWidth;
			h = graph.height;//this.el.offsetHeight||graph.height;
			this.width(w).height(h);
			
			hf = Math.abs(graph.view.y.min/(graph.view.y.max-graph.view.y.min));
			wf = Math.abs(graph.view.x.min/(graph.view.x.max-graph.view.x.min));
			graph.heightinner = h*(1-hf);
			graph.widthinner = w*(1-wf);
			
			graph.el.svg.setAttribute('viewBox','0 0 '+(w)+' '+(h));
			graph.el.holder.setAttribute('width',Math.round(graph.widthinner));
			graph.el.holder.setAttribute('height',Math.round(graph.heightinner));
			graph.el.holder.setAttribute('x',Math.ceil(getX(0)));

			// Build the x-axis
			if(!graph.el.xaxis) graph.el.xaxis = graph.el.svg.querySelectorAll('#'+this.id+'-axis-x')[0];

			// Build the y-axis
			if(!graph.el.yaxis) graph.el.yaxis = graph.el.svg.querySelectorAll('#'+this.id+'-axis-y')[0];


			// Set font size
			var style = window.getComputedStyle(graph.el.svg, null).getPropertyValue('font-size');
			this.fs = parseFloat(style);
			graph.el.svg.style['font-size'] = this.fs+'px';


			this.updateLabels();
			this.draw();
			
			this.info.update();

			return this;
		}

		this.updateLabels = function(){

			this.info.remove();

			graph.el.axes.innerHTML = "";
			
			if(typeof this.maxcases=="undefined") return this;


			w = this.el.offsetWidth;
			h = this.el.offsetHeight;
			xoff = w*Math.abs(graph.view.x.min/(graph.view.x.max-graph.view.x.min));


			// Update x-axis labels and lines
			y = graph.heightinner+5;
			ticks = makeTicks(graph.x.min,graph.x.max,5);
			graph.el.xaxis.innerHTML = "";
			for(i = 0; i < ticks.length; i++){
				x = getX(ticks[i].value);
				if(x < w) graph.el.xaxis.appendChild(createElement('text',{'html':ticks[i].value.toLocaleString(),'x':x,'y':y,'style':{'text-anchor':'middle','dominant-baseline':'hanging'}}));
			}
			graph.el.xaxis.appendChild(createElement('text',{'html':'Number of days since '+graph.mincases+' confirmed cases','x':getX(graph.x.max/2),'y':(y+this.fs*1.5),'style':{'text-anchor':'middle','dominant-baseline':'hanging','font-weight':'bold'}}));


			// Update the y-axis labels and lines
			graph.el.yaxis.innerHTML = "";
			ticks = makeTicks(graph.mincases,this.maxcases,5,{'log':graph.y.log});
			if(graph.y.log){
				logmin = Math.log10(graph.mincases);
				logmax = Math.log10(this.maxcases);
			}
			for(i = 0; i < ticks.length; i++){
				if(graph.y.log) v = (Math.log10(ticks[i].value)-logmin)/(logmax-logmin);
				else v = ticks[i].value/this.maxcases;
				y = graph.heightinner * (1 - v);
				if(y > 0){
					if(!ticks[i].minor){
						graph.el.yaxis.appendChild(createElement('text',{'html':ticks[i].value.toLocaleString(),'x':(xoff-5).toFixed(2),'y':y.toFixed(2),'style':{'text-anchor':'end','dominant-baseline':'middle'}}));
					}
					if(ticks[i].value > 0) graph.el.axes.appendChild(createElement('path',{'d':'M '+(xoff-3).toFixed(2)+','+y+' l '+(w - xoff + 3).toFixed(2)+',0','style':{'stroke':'#999','stroke-width':(ticks[i].minor ? '0.8px':'1.5px'),'fill':'transparent','opacity':(ticks[i].minor ? 0.2 : 0.3)}}));
				}
			}
			graph.el.yaxis.appendChild(createElement('text',{'html':'Total confirmed cases','style':{'text-anchor':'middle','dominant-baseline':'hanging','font-weight':'bold'},'transform':'translate(0 '+(graph.heightinner/2)+') rotate(-90 0 0)'}));

			return this;
		}
		function createElement(t,o){
			if(!o) o = {};
			if(!o.style) o.style = {};
			if(t=="path"){
				if(!o['stroke-linecap']) o['stroke-linecap'] = 'round';
				if(!o['vector-effect']) o['vector-effect'] = 'non-scaling-stroke';
			}
			var el,i,j;
			el = document.createElementNS("http://www.w3.org/2000/svg", t);
			if(t=="text") el.innerHTML = o.html;
			for(i in o){
				if(i=="style"){
					for(j in o[i]){
						el.style[j] = o[i][j];
						if(el.style[j] != o[i][j]) console.warn('Unable to set style '+j);
					}
				}else el.setAttribute(i,o[i]);
			}
			return el;		
		}

		
		this.init = function(){
			// Create the graph if necessary
			if(!graph.el.svg){			
				svg = '<svg id="'+this.id+'" width="100%" height="'+graph.height+'px" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMax meet">';
				svg += '	<desc>Created by ODI Leeds</desc>';
				svg += '	<title>'+this.title+'</title>';
				svg += '	<g id="'+this.id+'-axis-y"></g>';
				svg += '	<g id="'+this.id+'-axis-x"></g>';
				svg += '	<g id="'+this.id+'-axis-lines"></g>';
				svg += '	<svg x="0" y="0" id="'+this.id+'-holder" viewBox="0 0 100 100" preserveAspectRatio="none">';
				svg += '		<g id="'+this.id+'-chart-furniture" transform="translate(0,100) scale(1,-1)"></g>';
				svg += '		<g id="'+this.id+'-chart" transform="translate(0,100) scale(1,-1)"></g>';
				svg += '	</svg>';
				svg += '</svg><time>Updated: ?</time>';
				this.el.innerHTML = svg;
				graph.el.svg = this.el.querySelectorAll('svg')[0];
				graph.el.holder = graph.el.svg.querySelectorAll('#'+this.id+'-holder')[0];
				graph.el.chart = graph.el.svg.querySelectorAll('#'+this.id+'-chart')[0];
				graph.el.chartfurniture = graph.el.svg.querySelectorAll('#'+this.id+'-chart-furniture')[0];
				graph.el.chartfurniture.appendChild(createElement('path',{'id':'graph-axis-x-line','d':'M 0 0 l 100,0','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
				graph.el.chartfurniture.appendChild(createElement('path',{'id':'graph-axis-y-line','d':'M 0 0 l 0 100','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
				graph.el.axes = graph.el.svg.querySelectorAll('#'+this.id+'-axis-lines')[0];
			}

			graph.y.log = S('.switch input')[0].checked;
			S('.switch input').on('change',{me:this},function(e){
				graph.y.log = e.currentTarget.checked;
				e.data.me.updateLabels();
				e.data.me.draw();
				e.data.me.info.update();
			});
			return this;
		}

		this.draw = function(){

			var id,d,logmin,logmax,x,y;

			if(graph.y.log){
				logmin = Math.log10(graph.mincases);
				logmax = Math.log10(this.maxcases);
			}

			if(this.maxdateformat){
				t = this.el.querySelectorAll('time')[0];
				t.innerHTML = "Updated: "+this.maxdateformat;
				t.setAttribute('datetime',this.maxdate.toISOString().substr(0,10));
			}

			var now = new Date();
			var endtime = new Date();
			endtime.setUTCHours(24);
			endtime.setUTCMinutes(0);
			endtime.setUTCSeconds(0);

			// Loop through the data and draw or redraw the lines
			for(id in this.data){
				if(id.indexOf('W06')!=0){
					data = [];
					v = 1;
					mindate = new Date(this.data[id].mindate.toISOString().substr(0,10)+'T12:00Z');
					//this.data[id].mindate.setUTCHours(0);
					
					for(d = mindate; d < endtime; d.setDate(d.getDate() + 1)){
						iso = d.toISOString().substr(0,10);
						if(this.data[id].days[iso] >= graph.mincases) data.push(this.data[id].days[iso]);
					}
					x = 0;
					y = (100*(graph.y.log ? (Math.log10(graph.mincases)-logmin)/(logmax-logmin) : graph.mincases/this.maxcases));
					path = 'M '+x.toFixed(2)+' '+y.toFixed(2);
					for(i = 0; i < data.length; i++){
						x = (100*(i+1)/this.maxdays);
						y = (100*(graph.y.log ? (Math.log10(data[i])-logmin)/(logmax-logmin) : data[i]/this.maxcases));
						path += ' L '+x.toFixed(2)+','+y.toFixed(2);
					}
					if(!this.data[id].el){
						this.data[id].el = createElement('g',{'id':'area-'+id});
						this.data[id].line = createElement('path',{'style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3},'class':'line'});
						this.data[id].area = createElement('path',{'style':{'fill':'#999','opacity':0.3,'fillOpacity':0.2},'class':'area'});
						this.data[id].el.appendChild(this.data[id].line);
						this.data[id].el.appendChild(this.data[id].area);
						graph.el.chart.appendChild(this.data[id].el);
						S('#area-'+id+' .line').on('mouseover',{me:this,g:graph,id:id},function(e){

							// Remove existing strokes if they aren't keep
							S(e.data.g.el.svg).find('.active:not(.keep) .line').css({'stroke':''});
							
							S(e.data.g.el.svg).find('.active').removeClass('active');

							// Remove old infobubbles
							e.data.me.info.remove();

							// Add an info bubble
							e.data.me.selectLine(e.data.id,'',{'class':'label'});

							// Simulate z-index
							//e.data.g.el.chart.appendChild(el);
						}).on('mouseout',{me:this,id:id},function(e){

							// Deselect the line
							e.data.me.deselectLine(e.data.id);

						});
					}
					if(this.data[id].line) this.data[id].line.setAttribute('d',path);
					if(this.data[id].area) this.data[id].area.setAttribute('d',path+' L '+x.toFixed(2)+',0Z');
				}else{
					console.warn('Not including '+id,this.data[id]);
				}
			}
			return this;
		}
		
		this.selectLine = function(id,txt,opts){

			// Add a fixed info bubble
			if(this.data[id]){

				if(!this.data[id].opts) this.data[id].opts = {};
				if(opts.keep){
					S(this.data[id].el).addClass('keep');
					if(typeof opts.background==="string") this.data[id].opts.background = opts.background;
					if(typeof opts.color==="string") this.data[id].opts.color = opts.color;
					if(typeof opts.line==="string") this.data[id].opts.line = opts.line;
					if(opts['class']) this.data[id].opts['class'] = opts['class'];
				}
				if(typeof this.data[id].opts.background==="string") opts.background = this.data[id].opts.background;
				if(typeof this.data[id].opts.color==="string") opts.color = this.data[id].opts.color;
				if(typeof this.data[id].opts.line==="string") opts.line = this.data[id].opts.line;
				if(!opts.line) opts.line = opts.background;
				if(this.data[id].opts['class']) opts['class'] = this.data[id].opts['class'];

				el = S('#area-'+id);
				if(!opts.keep) el.addClass('active');
				el.find('.line').css({'stroke': opts.line||this.info.opts.line});
				el.find('.area').css({'fill': opts.line||this.info.opts.line});

				if(!txt){
					// Build label text
					d = getDate(this.data[id].maxdate);
					txt = this.data[id].name+' ('+this.data[id].max.toLocaleString()+')'+(d==this.maxdateformat ? '':' '+d);
				}
				this.info.add('area-'+id,(txt ? txt : 'Hi there'),this.data[id].el,opts);
			}
			return this;
		}
		
		this.deselectLine = function(id,override){
			el = S('#area-'+id);
			el.removeClass('active');
			if(el.hasClass('keep') && override){
				this.info.unprotect('area-'+id);
				delete this.data[id].opts;
				el.removeClass('keep');
			}
			if(!el.hasClass('keep')){
				el.find('.line').css({'stroke':''});
				el.find('.area').css({'fill':''});
			}
			this.info.remove();
			return this;
		}

		this.getData = function(){

			_parent.getData('uk-historic',{
				'this':this,
				'loaded': function(data,attr){

					var max = 0;
					var ndays = 0;
					this.maxdate = new Date('2000-01-01');
					for(var id in data){
						if(data[id]){
							if(data[id].max > max) max = data[id].max;
							if(data[id].maxdate > this.maxdate) this.maxdate = data[id].maxdate;
							if(data[id].ndays > ndays) ndays = data[id].ndays;
						}
					}
					this.data = data;
					this.maxcases = max;
					this.maxdays = ndays+5;
					this.maxdateformat = getDate(this.maxdate);
					graph.x.max = this.maxdays;

					this.updateLabels();
					this.draw();
					_parent.updateAreas();

					return this;
				}
			});

			return this;
		}


		// Build initial elements
		this.init();

		this.resize();
		

		return this;
	}

	/**
	 * @desc Create logarithmic tick marks that span the range
	 * @param {number} min - the minimum value to include
	 * @param {number} max - the maximum value to include
	 */
	function logTicks(min,max){
		var mn,mx,val,major,minor,i,j,ticks,vis,inc,n,show,o,r;
		ticks = {'length':0,'min':min,'max':max};
		if(min > max) return ticks;

		// Get the log range
		r = Math.log10(max)-Math.log10(min);
		mn = Math.floor(Math.log10(min));
		mx = Math.ceil(Math.log10(max));
		o = Math.ceil(r/(3*6))*3;

		// The major tick marks
		major = [];

		// First we make the major tick marks
		for(i = mn; i <= mx ; i++){
			val = Math.pow(10,i);
			major.push(val);
			if(val >= min && val < max){
				// The tick mark is in the range of the graph
				show = true;
				// If the range is big, only show every 'o' orders
				if(r > 8 && Math.log10(val)%o!=0) show = false;
				ticks[''+ticks.length] = {'value':val,'label':(show ? val.toString() : ''),'length':1};
				ticks.length++;
			}
		}

		// Now create the minor tick marks
		if(ticks.length < 10){
			minor = [];
			n = ticks.length;
			for(i = 0; i < major.length; i++){
				minor.push(major[i]);
				for(j = 2; j <= 9; j++){
					val = major[i] * j;
					vis = (val > min && val < max);
					minor.push(val);
					if(vis){
						ticks[''+ticks.length] = {'value':val,'label':(n <= 2 ? val.toString() : ''),'length':1,'minor':true};
						ticks.length++;
					}
				}
			}
		}

		return ticks;
	}
	/**
	 * @desc Make the tick marks.
	 * @param {number} mn - the minimum value
	 * @param {number} mx - the maximum value
	 */
	function makeTicks(mn,mx,n,opts){

		var v,l,i,d,vmx,ticks;
		ticks = {};
		if(!opts) opts = {};

		// If the range is negative we cowardly quit
		if(mn > mx) return ticks;
		// If the min or max are not numbers we quit
		if(isNaN(mn) || isNaN(mx)) return ticks;


		if(opts.log){
			ticks = logTicks(mn,mx);
		}else{
			ticks.length = 0;
			ticks.inc = defaultSpacing(mn,mx,n);
			vmx = mx + ticks.inc;
			for(v = Math.floor(mn/ticks.inc), i = 0; v <= vmx; v += ticks.inc, i++){
				// If formatLabel is set we use that to format the label
				ticks[i] = {'value':v,'label':(typeof opts.formatLabel==="function" ? opts.formatLabel.call(ticks[i].value,opts) : v.toString())};
				ticks.length++;
			}
		}

		if(ticks.length == 0){
			console.warn('No ticks');
			return ticks;
		}

		ticks.range = ticks[ticks.length-1].value - ticks[0].value;

		return ticks;
	}


	/**
	 * @desc Get some spacing given a minimum and maximum value
	 * @param {number} mn - the minimum value
	 * @param {number} mx - the maximum value
	 * @param {number} n - the minimum number of steps
	 */
	function defaultSpacing(mn, mx, n) {

		var dv, log10_dv, base, frac, options, distance, imin, tmin, i;

		// Start off by finding the exact spacing
		dv = Math.abs(mx - mn) / n;

		// In any given order of magnitude interval, we allow the spacing to be
		// 1, 2, 5, or 10 (since all divide 10 evenly). We start off by finding the
		// log of the spacing value, then splitting this into the integer and
		// fractional part (note that for negative values, we consider the base to
		// be the next value 'down' where down is more negative, so -3.6 would be
		// split into -4 and 0.4).
		log10_dv = Math.log10(dv);
		base = Math.floor(log10_dv);
		frac = log10_dv - base;

		// We now want to check whether frac falls closest to 1, 2, 5, or 10 (in log
		// space). There are more efficient ways of doing this but this is just for clarity.
		options = [1, 2, 5, 10];
		distance = new Array(options.length);
		imin = -1;
		tmin = 1e100;
		for (i = 0; i < options.length; i++) {
			distance[i] = Math.abs(frac - Math.log10(options[i]));
			if (distance[i] < tmin) {
				tmin = distance[i];
				imin = i;
			}
		}

		// Now determine the actual spacing
		return Math.pow(10, (base)) * options[imin];
	}

	function InfoBubbles(graph,opts){
		var msg = {};
		this.msg = msg;
		this.opts = opts;
		function getXY(el){
			var r,r2,xoff;
			r = el.getBoundingClientRect();
			r2 = el.parentNode.getBoundingClientRect();
			xoff = parseFloat(el.nearestViewportElement.getAttribute('x'));
			return {'x':(xoff+r.width).toFixed(2),'y':(r.top-r2.top).toFixed(2)};
		}
		this.update = function(){
			var r,r2,xoff,id;
			for(id in msg){
				if(msg[id].el){
					xy = getXY(msg[id].original);
					S(msg[id].el).css({'left':xy.x+'px','top':xy.y+'px','position':'absolute'});
				}
			}
			return this;
		}
		this.unprotect = function(id){
			if(msg[id]){
				msg[id].keep = false;
				msg[id].el.remove();
			}
			return this;
		}
		this.add = function(id,txt,el,opts){
			if(!msg[id] || !msg[id].el){
				if(!msg[id]) msg[id] = {'original':el };
				var xy = getXY(el);
				info = document.createElement('div');
				info.setAttribute("style",'left:'+xy.x+'px; top:'+xy.y+'px;position:absolute;');
				info.setAttribute("id","label-"+id);
				msg[id].el = info;
				graph.el.svg.insertAdjacentElement('afterend',msg[id].el);
			}
			
			el = S(msg[id].el);
			bg = opts.background || this.opts.background;
			c = opts.color || this.opts.color;
			if(bg) el.css({'background':bg,'border-color':bg});
			if(c) el.css({'color':c});
			if(opts.keep) msg[id].keep = opts.keep;
			if(opts['class']) el.addClass(opts['class']);
			el.html(txt+'<div class="after"></div>');
			return this;
		}
		this.remove = function(id){
			if(typeof id==="string"){
				if(!msg[id]) return this;
				if(!msg[id].keep){
					if(msg[id].el && msg[id].el.parentNode) msg[id].el.parentNode.removeChild(msg[id].el);
					delete msg[id];
				}
			}else{
				for(id in msg){
					if(msg[id] && !msg[id].keep){
						if(msg[id].el && msg[id].el.parentNode) msg[id].el.parentNode.removeChild(msg[id].el);
						delete msg[id];
					}
				}
			}
			return this;
		}
		return this;
	}

	if(!Dashboard.plugins[name]){
		Dashboard.plugins[name] = {
			init: init,
			version: '1.0'
		};
	}

})(S);