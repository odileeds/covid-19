/*!
	Dashboard plugin to show a hex map
	Written by Stuart Lowe (ODI Leeds)
 */
(function(S){

	var name = "hexmap";

	// Build hexmap

	// An init function for the plugin
	function init(){

		function render(title,region,data,attr){
			var lbl = "";
			if(!data) data = {};
			lbl = '<h2 class="popup-title">'+(data.title||title)+'</h2>';
			lbl += (data.desc||'<p>Cases: '+data.cases);

			function postRender(title,region,data){
				S('#tooltip').remove();
			}

			return {'label':lbl,'class':'covid-19','color':'','callback': postRender };
		}

		var views = {
			'COVID-19-percapita':{
				'src': 'uk-historic',
				'popup': {
					'render': render
				},
				'property': 'percapita',
				'key': function(filter){
					var _obj = this;
					var min = 0;
					var max = -1e100;
					var type = "COVID-19";
					for(la in this.data[type]){
						if(this.data[type][la]){
							if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
							if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
						}
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale((_parent.qs.colourscale||"Viridis"),_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					};
					return '';
				}
			},
			'COVID-19-cases':{
				'src': 'uk-historic',
				'popup': {
					'render': render
				},
				'property':'cases',
				'key': function(filter){
					var _obj = this;
					var min = 0;
					var max = -1e100;
					var type = "COVID-19";
					for(la in this.data[type]){
						if(this.data[type][la]){
							if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
							if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
						}
					}
					this.hex.setColours = function(region){
						if(_obj.data[type][region]) return Colour.getColourFromScale((_parent.qs.colourscale||"Viridis"),_obj.data[type][region][filter],min,max);
						else return "#dfdfdf";
					};
					return '';
				}
			}
		};

		_parent = this;
		this.plugins[name].obj = new ResultsMap('hexmap',{
			'width':700,
			'height':850,
			'padding':0,
			'file':'resources/uk-local-authority-districts-2019.hexjson',
			'views': views,
			'search':{'id':'search'}
		});
	}


	/*
		Stuquery SVG Builder
	*/
	function SVG(id,w,h){
		if(!id) return this;
		this.version = "0.1.6";
		this.canvas = S('#'+id);
		this.w = parseInt(w || this.canvas[0].offsetWidth);
		this.h = parseInt(h || this.canvas[0].offsetHeight);
		this.id = id;
		this.canvas.html('<svg height="'+this.h+'" version="1.1" width="'+this.w+'" viewBox="0 0 '+this.w+' '+this.h+'" xmlns="http://www.w3.org/2000/svg"><desc>Created by stuQuery SVG</desc></svg>');
		this.paper = S(this.canvas.find('svg')[0]);

		// Initialise
		this.nodes = [];
		this.clippaths = [];
		this.patterns = [];
		
		var _obj = this;
		var counter = 0;
		
		function Path(path){
			this.path = path;
			this.p = path;
			
			if(typeof path==="string"){
				this.path = path;
				this.p = path;
				var c;
				this.p += '0';
				this.p = this.p.match(/(^|[A-Za-z]| )[^ A-Za-z]+/g);
				var a = this.p[this.p.length-1];
				this.p[this.p.length-1] = a.substring(0,a.length-1);
				for(var i = 0; i < this.p.length; i++){
					if(this.p[i].search(/[A-Za-z]/) == 0){
						c = this.p[i][0];
						this.p[i] = this.p[i].substr(1);
					}else{
						if(this.p[i][0] == ' ') this.p[i] = this.p[i].substr(1);
						c = '';
					}
					this.p[i] = [c,this.p[i].split(/\,/)];
					if(this.p[i][1].length == 2){
						for(var j = 0; j < this.p[i][1].length; j++) this.p[i][1][j] = parseFloat(this.p[i][1][j]);
					}else{
						this.p[i][1] = [];
					}
				}
			}else{
				this.p = path;
				this.path = this.string(path);
			}
			return this;
		}
		Path.prototype.string = function(){
			var str = '';
			for(var i = 0; i < this.p.length; i++){
				str += ((this.p[i][0]) ? this.p[i][0] : ' ')+(this.p[i][1].length > 0 ? this.p[i][1].join(',') : ' ');
			}
			return str;
		};
		function copy(o){
			var out, v, key;
			out = Array.isArray(o) ? [] : {};
			for(key in o){
				if(o[key]){
					v = o[key];
					out[key] = (typeof v === "object") ? copy(v) : v;
				}
			}
			return out;
		}
		Path.prototype.copy = function(){
			return new Path(copy(this.p));
		};
		function Node(inp){
			this.transforms = [];
			// Make a structure to hold the original properties
			this.orig = {};
			this.events = [];
			var i;
			for(i in inp){
				if(inp[i]) this[i] = inp[i];
			}
			for(i in inp){
				if(inp[i]) this.orig[i] = inp[i];
			}
			if(this.path){
				this.path = new Path(this.path);
				this.d = this.path.string();
				this.orig.path = this.path.copy();
				this.orig.d = this.d;
			}
			this.id = _obj.id+'-svg-node-'+counter;
			counter++;

			return this;
		}
		Node.prototype.on = function(type,attr,fn){
			if(!fn && typeof attr==="function"){
				fn = attr;
				attr = {};
			}
			this.events.push({'type':type,'attr':attr,'fn':fn});
			return this;
		};
		Node.prototype.attr = function(attr,arg){
			if(arg){ attr = {}; attr[attr] = arg; }
			if(!this.attributes) this.attributes = {};
			if(!this.el || this.el.length == 0) this.el = S('#'+this.id);
			for(var a in attr){
				if(attr[a]){
					if(typeof attr[a]==="string") attr[a] = attr[a].replace(/\"/g,"\'");
					this.attributes[a] = attr[a];
					this.el.attr(a,attr[a]);
					// Update the path on the element's "d" property
					if(a=="path") this.el.attr('d',(new Path(attr[a])).string());
					if(this.type=="text"){
						// Update any tspan elements' x position
						var tspan = this.el.find('tspan');
						for(var i = 0 ; i < tspan.length; i++) tspan[i].setAttribute('x',(this.attributes.x||this.x));
					}
				}
			}
			this.orig.attributes = JSON.parse(JSON.stringify(this.attributes));
			
			if(this.attributes && this.attributes.id) this.id = this.attributes.id;

			return this;
		};
		Node.prototype.transform = function(ts){
			if(typeof ts.length==="undefined" && typeof ts==="object") ts = [ts];
			if(!this.transforms) this.transforms = [];
			for(var t = 0; t < ts.length; t++) this.transforms.push(ts[t]);
			return this;
		};
		Node.prototype.update = function(){
			if(this.transforms && this.transforms.length > 0){
				var t,p,i,j;

				// Reset path
				if(this.orig.path) this.path = this.orig.path.copy();
				
				// Loop over all the transforms and update properties
				for(t = 0; t < this.transforms.length; t++){
					for(p in this.transforms[t].props){
						// Replace the current value with the original
						if(this.orig[p] && this[p]) this[p] = JSON.parse(JSON.stringify(this.orig[p]));
					}
				}
				// Update attributes to the original ones
				if(this.orig.attributes) this.attributes = JSON.parse(JSON.stringify(this.orig.attributes));

				for(t = 0; t < this.transforms.length; t++){
					if(this.transforms[t].type=="scale"){
						if(this.type == "path"){
							for(i = 0; i < this.orig.path.p.length; i++){
								for(j = 0; j < this.orig.path.p[i][1].length; j++){
									this.path.p[i][1][j] *= this.transforms[t].props[(j%2==0 ? "x": "y")];
								}
							}
							this.path.path = this.path.string();
							this.d = this.path.path;
						}else{
							for(p in this.transforms[t].props){
								if(this[p]) this[p] *= this.transforms[t].props[p];
							}
						}
						if(this.attributes){
							for(p in this.transforms[t].props){
								if(this.attributes[p]) this.attributes[p] *= this.transforms[t].props[p];
							}
						}
					}
				}
			}
			return this;
		};
		this.circle = function(x,y,r){
			this.nodes.push(new Node({'cx':x,'cy':y,'r':r,'type':'circle'}));
			return this.nodes[this.nodes.length-1];
		};
		this.rect = function(x,y,w,h,r){
			if(r) this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'r':r,'rx':r,'ry':r,'type':'rect'}));
			else this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'type':'rect'}));
			return this.nodes[this.nodes.length-1];
		};
		this.path = function(path){
			this.nodes.push(new Node({'path':path,'type':'path'}));
			return this.nodes[this.nodes.length-1];
		};
		this.text = function(x,y,text){
			this.nodes.push(new Node({'x':x,'y':y,'type':'text','text':text}));
			return this.nodes[this.nodes.length-1];
		};
		this.clip = function(o){
			this.clippaths.push(new Node(o));
			return this.clippaths[this.clippaths.length-1];
		};
		this.pattern = function(o){
			this.patterns.push(o);
			return this.patterns[this.patterns.length-1];
		};

		return this;
	}
	SVG.prototype.clear = function(){
		this.nodes = [];
		this.clippaths = [];
		this.patterns = [];
		this.draw();
		return this;
	};
	SVG.prototype.draw = function(head){
		var i,j,e;
		var dom = "<desc>Created by stuQuery SVG</desc>";
		if(this.patterns.length > 0){
			for(i = 0; i < this.patterns.length; i++) dom += this.patterns[i];
		}
		if(this.clippaths.length > 0){
			dom += '<defs>';
			for(i = 0; i < this.clippaths.length; i++){
			
				dom += '<clipPath id="'+this.clippaths[i].id+'">';
				if(this.clippaths[i].type){
					// Update node with any transforms
					this.clippaths[i].update();
					dom += '<'+this.clippaths[i].type;
					// Add properties
					for(j in this.clippaths[i]){
						if(j != "type" && typeof this.clippaths[i][j]!=="object" && typeof this.clippaths[i][j]!=="function" && j != "attributes"){
							dom += ' '+j+'="'+this.clippaths[i][j]+'"';
						}
					}
					dom += ' />';
				}
				dom += '</clipPath>';
			}
			dom += '</defs>';
		}

		function buildChunk(nodes,node){
			
			var n = nodes[node];
			var chunk = "";
			var t = n.type;
			var arr = (n.text) ? n.text.split(/\n/) : [];
			var j,a;
			
			if(n.type){
				chunk += '<'+t;
				// Update node with any transforms
				n.update();
				// Add properties
				for(j in n){
					if(j != "type" && typeof n[j]!=="object" && typeof n[j]!=="function" && j != "attributes"){
						if(j=="text" && arr.length > 1) chunk += '';
						else chunk += ' '+j+'="'+n[j]+'"';
					}
				}
				chunk += ' id="'+n.id+'"';
				// Add attributes
				for(a in n.attributes){
					if(n.attributes[a]) chunk += ' '+a+'="'+(a == "clip-path" ? 'url(#':'')+n.attributes[a]+(a == "clip-path" ? ')':'')+'"';
				}
				// Draw internal parts of a text element
				if(n.text){
					var y = 0;
					var lh = 1.2;
					chunk += '>';
					var off = -0.5 + arr.length*0.5;
					for(a = 0; a < arr.length; a++, y+=lh){
						chunk += '<tspan'+(a==0 ? ' dy="-'+(lh*off)+'em"':' x="'+(n.attributes.x||n.x)+'" dy="'+lh+'em"')+'>'+arr[a]+'</tspan>';
					}
					chunk += '</'+t+'>';
				}else{
					chunk += ' />';
				}
			}
			return chunk;
		}

		// Build the SVG chunks for each node
		for(i = 0; i < this.nodes.length; i++) dom += buildChunk(this.nodes,i);

		this.paper.html(dom);

		// Attach events to DOM
		for(i = 0; i < this.nodes.length; i++){
			if(this.nodes[i].events){
				for(e = 0; e < this.nodes[i].events.length; e++){
					S('#'+this.nodes[i].id).on(this.nodes[i].events[e].type,this.nodes[i].events[e].attr,this.nodes[i].events[e].fn);
				}
			}
		}

		return this;
	};

	// Display a hex map
	// Requires stuquery.svg.js to be loaded first
	// Input structure:
	//    id: the ID for the HTML element to attach this to
	//    width: the width of the SVG element created
	//    height: the height of the SVG element created
	//    padding: an integer number of hexes to leave as padding around the displayed map
	//    showgrid: do we show the background grid?
	//    formatLabel: a function to format the hex label
	//    size: the size of a hexagon in pixels
	function HexMap(attr){

		this.version = "0.4";
		if(!attr) attr  = {};
		this._attr = attr;
		if(S('#'+attr.id).length==0){
			console.warn("Can't find the element to draw into (#"+attr.id+")");
			return {};
		}

		this.w = attr.width || 300;
		this.h = attr.height || 150;
		this.maxw = this.w;
		this.maxh = this.h;
		this.s = attr.size || 10;
		this.aspectratio = this.w/this.h;
		this.id = attr.id;
		this.hexes = {};
		this.min = 0;
		this.max = 1;
		this.padding = (typeof attr.padding==="number" ? attr.padding : 0);
		this.properties = { 'size': (typeof attr.size==="number" ? attr.size : 10) };
		
		var fs = (typeof attr.size==="number" ? attr.size : 10)*0.4;

		if(S('#'+this.id+'-inner').length==0) S('#'+this.id).append('<div id="'+this.id+'-inner"></div>');
		this.el = S('#'+this.id+'-inner');

		this.options = {
			'showgrid':(typeof attr.grid==="boolean" ? attr.grid : false),
			'showlabel':(typeof attr.showlabel==="boolean" ? attr.showlabel : true),
			'formatLabel': (typeof attr.formatLabel==="function" ? attr.formatLabel : function(txt,attr){ return txt.substr(0,3); }),
			'minFontSize': (typeof attr.minFontSize==="number" ? attr.minFontSize : 4)
		};

		this.style = {
			'default': { 'fill': '#cccccc','fill-opacity':(this.options.showlabel ? 0.5 : 1),'font-size':fs,'stroke-width':1.5,'stroke-opacity':1,'stroke':'#ffffff' },
			'highlight': { 'fill': '#1DD3A7' },
			'grid': { 'fill': '#aaa','fill-opacity':0.1 }
		};

		for(var s in attr.style){
			if(attr.style[s]){
				if(!this.style[s]) this.style[s] = {};
				if(attr.style[s].fill) this.style[s].fill = attr.style[s].fill;
				if(attr.style[s]['fill-opacity']) this.style[s]['fill-opacity'] = attr.style[s]['fill-opacity'];
				if(attr.style[s]['font-size']) this.style[s]['font-size'] = attr.style[s]['font-size'];
				if(attr.style[s].stroke) this.style[s].stroke = attr.style[s].stroke;
				if(attr.style[s]['stroke-width']) this.style[s]['stroke-width'] = attr.style[s]['stroke-width'];
				if(attr.style[s]['stroke-opacity']) this.style[s]['stroke-opacity'] = attr.style[s]['stroke-opacity'];
			}
		}
		
		this.mapping = {};

		// Can load a file or a hexjson data structure
		this.load = function(file,attr,fn){
			if(typeof attr==="function" && !fn){
				fn = attr;
				attr = "";
			}
			if(typeof fn !== "function") return this;

			if(typeof file==="string"){
				S(document).ajax(file,{
					'complete': function(data){
						this.setMapping(data);
						this.search.init();
						if(typeof fn==="function") fn.call(this,{'data':attr});
					},
					'error': this.failLoad,
					'this': this,
					'dataType':'json'
				});
			}else if(typeof file==="object"){
				this.setMapping(file);
				this.search.init();
				if(typeof fn==="function") fn.call(this,{'data':attr});
			}
			return this;
		};

		var _obj = this;
		// We'll need to change the sizes when the window changes size
		window.addEventListener('resize', function(event){ _obj.resize(); });
		
		function clone(d){
			return JSON.parse(JSON.stringify(d));
		}

		this.setHexStyle = function(r){
			var h = this.hexes[r];
			var style = clone(this.style['default']);
			var cls = "";

			if(h.active){
				style.fill = h.fillcolour;
				//cls += ' active';
			}
			if(h.hover){
				cls += ' hover';
			}
			if(h.selected){
				for(var p in this.style.selected){
					if(this.style.selected[p]) style[p] = this.style.selected[p];
				}
				cls += ' selected';
			}
			if(this.search.active) cls += (h.highlight) ? ' highlighted' : ' not-highlighted';
			style['class'] = 'hex-cell'+cls;
			h.attr(style);

			this.labels[r].attr({'class':'hex-label'+cls});

			return h;
		};
		
		this.toFront = function(r){
			// Simulate a change of z-index by moving elements to the end of the SVG
			
			// Keep selected items on top
			for(var region in this.hexes){
				if(this.hexes[region].selected){
					this.paper.paper[0].appendChild(this.hexes[region].el[0]);
					this.paper.paper[0].appendChild(this.labels[region].el[0]);
				}
			}
			// Simulate a change of z-index by moving this element (hex and label) to the end of the SVG
			this.paper.paper[0].appendChild(this.hexes[r].el[0]);
			this.paper.paper[0].appendChild(this.labels[r].el[0]);
			return this;
		};

		this.regionToggleSelected = function(r,others){
			this.selected = (this.selected==r) ? "" : r;
			var h = this.hexes[r];
			h.selected = !h.selected;
			this.setHexStyle(r);
			var region;

			// If we've deselected a region, deselect any other regions selected
			if(!h.selected){
				if(others){
					for(region in this.hexes){
						if(this.hexes[region].selected){
							this.hexes[region].selected = false;
							this.setHexStyle(region);
						}
					}
				}
			}
			return this;
		};

		this.regionFocus = function(r){
			var h = this.hexes[r];
			h.hover = true;
			this.setHexStyle(r);
			this.toFront(r);
			return this;
		};

		this.regionBlur = function(r){
			var h = this.hexes[r];
			h.hover = false;
			this.setHexStyle(r);
			return this;
		};

		this.regionActivate = function(r){
			var h = this.hexes[r];
			h.active = true;
			this.setHexStyle(r);
		};

		this.regionDeactivate = function(r){
			var h = this.hexes[r];
			h.active = false;
			this.setHexStyle(r);
		};

		this.regionToggleActive = function(r){
			var h = this.hexes[r];
			h.active = !h.active;
			this.setHexStyle(r);
		};

		this.selectRegion = function(r){
			this.selected = r;
			var h;
			for(var region in this.hexes){
				if(this.hexes[region]){
					h = this.hexes[region];
					if(r.length > 0 && region.indexOf(r)==0){
						h.selected = true;
						this.setHexStyle(region);
					}else{
						h.selected = false;
						this.setHexStyle(region);
					}
				}
			}
			return this;
		};

		// Add events (mouseover, mouseout, click)	
		this.on = function(type,attr,fn){
			if(typeof attr==="function" && !fn){
				fn = attr;
				attr = "";
			}
			if(typeof fn !== "function") return this;
			if(!this.callback) this.callback = {};
			this.callback[type] = { 'fn': fn, 'attr': attr };
			return this;
		};

		// Move the selected hex to the new coordinates
		this.moveTo = function(q,r){
			if(this.selected){
				var dq = q - this.mapping.hexes[this.selected].q;
				var dr = r - this.mapping.hexes[this.selected].r;

				for(var region in this.hexes){
					if(this.hexes[region]){
						if(region.indexOf(this.selected)==0){
							this.hexes[region].selected = true;
						}
						if(this.hexes[region].selected){
							this.mapping.hexes[region].q += dq;
							this.mapping.hexes[region].r += dr;
							var h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
							this.hexes[region].attr({'path':h.path}).update();
							if(this.options.showlabel && this.labels[region]){
								this.labels[region].attr({'x':h.x,'y':h.y+this.style['default']['font-size']/2,'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r}).update();
							}
							this.hexes[region].selected = false;
							this.setHexStyle(region);
						}
					}
				}
				this.selected = "";
			}
		};

		this.size = function(w,h){
			this.el.css({'height':'','width':''});
			w = Math.min(this.w,S('#'+this.id)[0].offsetWidth);
			this.el.css({'height':(w/this.aspectratio)+'px','width':w+'px'});
			this.paper = new SVG(this.id+'-inner',this.maxw,this.maxh);
			w = this.paper.w;
			h = this.paper.h;
			var scale = w/this.w;
			this.properties.size = this.s*scale;
			this.w = w;
			this.h = h;
			this.transform = {'type':'scale','props':{x:w,y:h,cx:w,cy:h,r:w,'stroke-width':w}};
			this.el.css({'height':'','width':''});

			return this;
		};
		
		function Search(attr){

			if(!attr) attr = {};
			this.attr = attr;
			this.el = '';
			this.active = false;
			this.selected = -1;
			this.regions = {};
			
			this.init = function(){
				for(var region in _obj.hexes){
					if(_obj.hexes[region]) this.regions[region] = _obj.hexes[region].attributes.title.toLowerCase();
				}
			};
			this.key = function(str){
				str = str.toLowerCase();
				var regions = {};
				if(str.length > 2){
					for(var region in this.regions){
						if(this.regions[region].indexOf(str)>=0){
							regions[region] = true;
						}
					}
				}
				this.highlight(regions);
			};
			this.pick = function(value){
				// Trigger the click event on the appropriate hex
				if(_obj.hexes[value]) _obj.hexes[value].el.trigger('click');
				else console.warn('No hex for '+value);
			};
			this.highlight = function(rs){
				this.n = 0;
				var region;
				for(region in rs){
					if(rs[region]) this.n++;
				}
				for(region in _obj.hexes){
					if(this.n>0){
						if(rs[region]){
							_obj.hexes[region].highlight = true;//(rs[region]);
							_obj.hexes[region].attr({'class':'hex-cell highlighted'});
						}else{
							_obj.hexes[region].highlight = false;
							_obj.hexes[region].attr({'class':'hex-cell not-highlighted'});
						}
					}else{
						_obj.hexes[region].highlight = false;
						_obj.hexes[region].attr({'class':'hex-cell'});
					}
				}

				return this;
			};

			return this;
		}

		this.resize = function(){
			return this;
		};

		this.initialized = function(){
			this.create().draw();
			S('.spinner').remove();
			return this;
		};

		this.create = function(){
			this.paper.clear();
			this.constructed = false;
			return this;
		};

		this.setMapping = function(mapping){
			this.mapping = mapping;
			if(!this.properties) this.properties = { "x": 100, "y": 100 };
			this.properties.x = this.w/2;
			this.properties.y = this.h/2;
			this.setSize();
			var p = mapping.layout.split("-");
			this.properties.shift = p[0];
			this.properties.orientation = p[1];

			return this.initialized();
		};

		this.setSize = function(size){
			if(size) this.properties.size = size;
			this.properties.s = { 'cos': this.properties.size*Math.sqrt(3)/2, 'sin': this.properties.size*0.5 };
			this.properties.s.c = this.properties.s.cos.toFixed(2);
			this.properties.s.s = this.properties.s.sin.toFixed(2);
			return this;
		};

		this.drawHex = function(q,r,scale){
			if(this.properties){
				if(typeof scale!=="number") scale = 1;
				scale = Math.sqrt(scale);

				var x = this.properties.x + (q * this.properties.s.cos * 2);
				var y = this.properties.y - (r * this.properties.s.sin * 3);

				if(this.properties.orientation == "r"){
					if(this.properties.shift=="odd" && (r&1) == 1) x += this.properties.s.cos;
					if(this.properties.shift=="even" && (r&1) == 0) x += this.properties.s.cos;
				}
				if(this.properties.orientation == "q"){
					if(this.properties.shift=="odd" && ((q&1) == 1)) y += this.properties.s.cos;
					if(this.properties.shift=="even" && ((q&1) == 0)) y += this.properties.s.cos;
				}

				var path = [['M',[x,y]]];
				var cs = this.properties.s.c * scale;
				var ss = this.properties.s.s * scale;
				if(this.properties.orientation == "r"){
					// Pointy topped
					path.push(['m',[cs,-ss]]);
					path.push(['l',[-cs,-ss,-cs,ss,0,(this.properties.size*scale).toFixed(2),cs,ss,cs,-ss]]);
					path.push(['z',[]]);
				}else{
					// Flat topped
					path.push(['m',[-ss,cs]]);
					path.push(['l',[-ss,-cs,ss,cs,(this.properties.size*scale).toFixed(2),0,ss,cs,-ss,cs]]);
					path.push(['z',[]]);
				}
				return { 'path':path, 'x':x, 'y': y };
			}
			return this;
		};

		this.updateColours = function(){
			var fn = (typeof this.setColours==="function") ? this.setColours : function(){ return this.style['default'].fill; };
			for(var region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					this.hexes[region].fillcolour = fn.call(this,region);
					this.setHexStyle(region);
				}
			}

			return this;
		};
		
		this.draw = function(){

			var r,q,h,region;

			var range = { 'r': {'min':1e100,'max':-1e100}, 'q': {'min':1e100,'max':-1e100} };
			for(region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					q = this.mapping.hexes[region].q;
					r = this.mapping.hexes[region].r;
					if(q > range.q.max) range.q.max = q;
					if(q < range.q.min) range.q.min = q;
					if(r > range.r.max) range.r.max = r;
					if(r < range.r.min) range.r.min = r;
				}
			}
			
			// Add padding to range
			range.q.min -= this.padding;
			range.q.max += this.padding;
			range.r.min -= this.padding;
			range.r.max += this.padding;
		
			// q,r coordinate of the centre of the range
			var qp = (range.q.max+range.q.min)/2;
			var rp = (range.r.max+range.r.min)/2;
			
			this.properties.x = (this.w/2) - (this.properties.s.cos * 2 *qp);
			this.properties.y = (this.h/2) + (this.properties.s.sin * 3 *rp);
			
			// Store this for use elsewhere
			this.range = range;
			
			var events = {
				'mouseover': function(e){
					var t = 'mouseover';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				},
				'mouseout': function(e){
					var t = 'mouseout';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				},
				'click': function(e){
					var t = 'click';
					if(e.data.hexmap.callback[t]){
						for(var a in e.data.hexmap.callback[t].attr){
							if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
						}
						if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
					}
				}
			};
			
			if(this.options.showgrid){
				this.grid = [];
			
				for(q = range.q.min; q <= range.q.max; q++){
					for(r = range.r.min; r <= range.r.max; r++){
						h = this.drawHex(q,r);
						this.grid.push(this.paper.path(h.path).attr({'class':'hex-grid','data-q':q,'data-r':r,'fill':(this.style.grid.fill||''),'fill-opacity':(this.style.grid['fill-opacity']||0.1),'stroke':(this.style.grid.stroke||'#aaa'),'stroke-opacity':(this.style.grid['stroke-opacity']||0.2)}));
						this.grid[this.grid.length-1].on('mouseover',{type:'grid',hexmap:this,data:{'r':r,'q':q}},events.mouseover)
							.on('mouseout',{type:'grid',hexmap:this,me:_obj,data:{'r':r,'q':q}},events.mouseout)
							.on('click',{type:'grid',hexmap:this,region:region,me:_obj,data:{'r':r,'q':q}},events.click);
							
						// Make all the clipping areas
						this.paper.clip({'path':h.path,'type':'path'}).attr({'id':'hex-clip-'+q+'-'+r});
					}
				}
			}

			var min = 50000;
			var max = 80000;
			this.values = {};

			for(region in this.mapping.hexes){
				if(this.mapping.hexes[region]){
					this.values[region] = (this.mapping.hexes[region].p - min)/(max-min);
					if(this.values[region].value < 0) this.values[region] = 0;
					if(this.values[region].value > 1) this.values[region] = 1;

					h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
					
					if(!this.constructed){
						this.hexes[region] = this.paper.path(h.path).attr({'class':'hex-cell','data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r});
						this.hexes[region].selected = false;
						this.hexes[region].active = true;
						this.hexes[region].attr({'id':'hex-'+region});

						// Attach events
						this.hexes[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
							.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.hexes[region]},events.mouseout)
							.on('click',{type:'hex',hexmap:this,region:region,me:this.hexes[region],data:this.mapping.hexes[region]},events.click);


						if(this.options.showlabel){
							if(!this.labels) this.labels = {};
							if(this.style['default']['font-size'] > this.options.minFontSize){
								this.labels[region] = this.paper.text(h.x,h.y+this.style['default']['font-size']/2,this.options.formatLabel(this.mapping.hexes[region].n,{'size':this.properties.size,'font-size':this.style['default']['font-size']})).attr({'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r,'data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r,'class':'hex-label','text-anchor':'middle','font-size':this.style['default']['font-size']+'px','title':(this.mapping.hexes[region].n || region)});
								this.labels[region].attr({'id':'hex-'+region+'-label'});
							}
						}

						// Attach events
						this.labels[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
							.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.labels[region]},events.mouseout)
							.on('click',{type:'hex',hexmap:this,region:region,me:this.labels[region],data:this.mapping.hexes[region]},events.click);

					}
					this.setHexStyle(region);
					this.hexes[region].attr({'stroke':this.style['default'].stroke,'stroke-opacity':this.style['default']['stroke-opacity'],'stroke-width':this.style['default']['stroke-width'],'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
					this.hexes[region].update();
				}
			}

			if(!this.constructed) this.paper.draw();

			this.constructed = true;

			return this;
		};
		
		S(document).on('keypress',{me:this},function(e){
			e.stopPropagation();
			if(e.originalEvent.charCode==99) e.data.me.selectBySameColour(e);		// C
		});
			

		this.selectBySameColour = function(){
			if(this.selected){
				for(var region in this.hexes){
					if(this.hexes[region].fillcolour==this.hexes[this.selected].fillcolour){
						this.hexes[region].selected = true;
						this.setHexStyle(region);
						//this.hexes[region].attr({'fill':this.style.selected.fill||this.hexes[region].fillcolour,'fill-opacity':this.style.selected['fill-opacity']});
					}
				}
			}
			return this;
		};
			
		this.size();
		if(attr.file) this.load(attr.file);
		
		this.search = new Search(attr.search);

		return this;
	}

	var _parent;

	function ResultsMap(id,attr){
		if(!attr) attr = {};
		if(!attr.padding) attr.padding = 0;
		if(!attr.width || !attr.height || !attr.file || !attr.views) return {};

		this.w = attr.width;
		this.h = attr.height;
		this.aspectratio = attr.width/attr.height;
		this.id = id;
		this.type = "";
		this.files = {};
		this.views = attr.views;
		var _obj = this;

		if(S('#data-selector').length > 0) this.type = S('#data-selector')[0].value;
		if(S('.view-toggle').length > 0) this.type = document.querySelector('input[name="view"]:checked').id;

		this.defaulttype = this.type;


		function updateToggles(){
			S('.view-toggle').parent().removeClass('on').addClass('off');
			S('#'+document.querySelector('input[name="view"]:checked').id).parent().removeClass('off').addClass('on');
			return this;
		}
		
		var t = _parent.qs.hextype;

		if(t){
			// Check if this is in the list
			var options = S('#data-selector option');
			var v,i,ok;
			if(options.length > 0){
				ok = false;
				v = "";
				for(i = 0; i < options.length; i++){
					if(options[i].getAttribute('value')==t){
						ok = true;
					}
				}
				if(ok){
					S('#data-selector')[0].value = t;
					this.type = t;
				}
			}else{
				// Check if this is in the list
				options = S('.view-toggle');

				if(options.length > 0){
					v = "";
					for(i = 0; i < options.length; i++){
						if(options[i].getAttribute('id')==t){
							options[i].checked = true;
							this.type = t;
						}
					}
				}
			}
			updateToggles();
		}

		// Create a hex map
		var attrhex = JSON.parse(JSON.stringify(attr));
		attrhex.id = id;
		attrhex.size = 16;

		this.hex = new HexMap(attrhex);

		this.hex.load(attr.file,{me:this},function(e){
			var el = document.querySelector('input[name="view"]:checked');
			e.data.me.setType(e.data.me.type,el.getAttribute('data'),(e.data.me.type!=e.data.me.defaulttype ? true : false));
		});

		
		// Listen for resizing information
		window.addEventListener('message', function(event){
			_obj.iframe = event.data;
			_obj.positionBubble();
		}, false);

		this.positionBubble = function(){
			if(this.iframe && S('.infobubble').length > 0) S('.infobubble').css({'top':'calc('+(this.iframe.top > 0 ? this.iframe.top : 0)+'px + 1em)','max-height':(this.iframe.height)+'px'});
		};

		this.setType = function(t,d,update){
			// Have we changed type?
			if(t==this.by){
				console.log('no change');
				return this;
			}

			_parent.qs.hextype = t;
			_parent.updateHistory();

			this.updateData(t,d);

			return this;
		};

		this.updateData = function(type,dtype){
			if(!dtype) dtype = document.querySelector('input[name="view"]:checked').getAttribute('data');
			if(!this.data || !this.data[type]){
				return this.loadResults(type,dtype,function(type,dtype){
					// Set the colours of the map
					this.setColours(type,dtype);
				});
			}else{

				// Set the colours
				this.setColours(type,dtype);
			}
			
			return this;
		};

		// Add events to map
		this.hex.on('mouseover',{'builder':this},function(e){

			e.data.hexmap.regionFocus(e.data.region);

			if(S('#tooltip').length==0) S('#'+e.data.builder.id+'-inner').append('<div id="tooltip"></div>');
			var tooltip = S('#tooltip');
			var v = (_obj.by.indexOf('percapita') > 0) ? Math.round(_obj.data[_obj.bysrc][e.data.region].percapita)+'/100,000' : _obj.data[_obj.bysrc][e.data.region].cases;
			tooltip.html(e.data.builder.hex.hexes[e.data.region].attributes.title+' ('+v+')</div>');
			var bb = e.data.builder.hex.hexes[e.data.region].el[0].getBoundingClientRect();
			tooltip.css({'position':'absolute','left':''+Math.round(bb.left+(bb.width/2)-S('#'+e.data.builder.id)[0].offsetLeft)+'px','top':''+Math.round(bb.y+bb.height+window.scrollY-S('#'+e.data.builder.id)[0].offsetTop)+'px'});

		}).on('mouseout',{'builder':this},function(e){

			e.data.hexmap.regionBlur(e.data.region);
			S('#tooltip').remove();

		}).on('click',{'builder':this},function(e){

			e.data.builder.openActive(e.data.region);

		});
		
		this.closeActive = function(){
			this.hex.selected = "";
			this.hex.selectRegion('');
			this.hex.search.active = false;
			S('.infobubble').remove();
			S('body').removeClass('modal');
			return this;
		};
		
		this.openActive = function(region){

			var previous = this.hex.selected;
			var current = region;

			this.label(region,previous!=current);
			this.hex.selectRegion(region);

			return this;
		};

		this.label = function(region,reopen){

			var view = this.views[this.by];
			if(!view) return this;
			var popup = view.popup;

			var title = this.hex.hexes[region].el[0].getAttribute('title');

			if(reopen){
				S('.infobubble').remove();
				S('#'+this.id+'').append('<div class="infobubble generalelection"><div class="infobubble_inner"><div class="spinner"><svg width="64" height="64" viewBox="-32 -32 64 64" xmlns="http://www.w3.org/2000/svg" style="transform-origin: center center;"><style>#odilogo-starburst rect2 { transform-origin: center center; -webkit-transform-origin: center center; }</style><g id="odilogo-starburst"><rect width="4" height="25" x="-2" transform="rotate(7)" fill="#2254F4"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(27)" fill="#F9BC26"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(47)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(67)" fill="#D60303"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(87)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(107)" fill="#1DD3A7"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(127)" fill="#EF3AAB"><animate attributeName="height" begin="0s" dur="2s" values="25;20;22;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(147)" fill="#FF6700"><animate attributeName="height" begin="0s" dur="4s" values="25;24;18;23;27;23;29;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(167)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="4s" values="25;15;27;25;24;32;16;24;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(187)" fill="#178CFF"><animate attributeName="height" begin="0s" dur="5s" values="25;18;23;21;31;20;24;21;28;31;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(207)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="3s" values="25;32;16;24;19;27;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(227)" fill="#D73058"><animate attributeName="height" begin="0s" dur="5s" values="25;23;25;28;18;27;24;30;31;28;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(247)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(267)" fill="#67E767"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(287)" fill="#E6007C"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(307)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(327)" fill="#D60303"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(347)" fill="#08DEF9"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect></g><g id="odilogo"><circle cx="-12.8" cy="0" r="6.4" style="fill:black;"></circle><path d="M-7 -6.4 l 6.4 0 c 0 0 6.4 0 6.4 6.4 c 0 6.4 -6.4 6.4 -6.4 6.4 L -7 6.4Z" style="fill:black;"></path><rect width="6.4" height="12.5" x="5.5" y="-6.25" style="fill:black;"></rect></g></svg></div></div></div>');
			}

			function callback(title,region,data,attr){

				if(!attr) attr = {};

				//var lbl = this.hex.mapping.hexes[region].label;
				var l = {};
				if(popup && typeof popup.render==="function"){
					l = popup.render.call(this,title,region,data,attr);
				}else{
					console.warn('No view for '+this.by+'/'+this.bysrc);
					l = {'label':title,'class':'','color':''};
				}
				var c = (l.color||'');
				var t = (l.color ? Colour.getColour(c).text : 'black');
				var txt = l.label;
				txt = txt.replace(/%COLOR%/g,t);
				S('.infobubble_inner').html(txt).css({'width':(l.w ? l.w+'px':''),'height':(l.h ? l.h+'px':'')});
				S('.infobubble').attr('class','infobubble'+(l['class'] ? " "+l['class'] : ''));
				S('.infobubble .close').remove();
				S('.infobubble').prepend('<button class="close button" title="Close constituency information">&times;</button>');
				S('.infobubble .close').on('click',{me:this},function(e){ e.data.me.closeActive(); });
				if(typeof l.callback==="function") l.callback.call(this,title,region,data,attr);
				return this;
			}
			callback.call(this,title,region,this.data[this.bysrc][region]);
			
			S('body').addClass('modal');

			return this;
		};


		// Add events to buttons for colour changing
		S('.view-toggle').on('change',{me:this},function(e){
			updateToggles();
			var el = document.querySelector('input[name="view"]:checked');
			var id = el.id;
			e.data.me.setType(id,el.getAttribute('data'),true);
		});

		S(document).on('keypress',function(e){
			//if(e.originalEvent.charCode==109) S('#savesvg').trigger('click');     // M
			//if(e.originalEvent.charCode==104) S('#save').trigger('click');     // H
		});

		this.loadResults = function(type,dtype,callback){
			
			if(!type) type = "COVID-19-percapita";

			if(!this.data) this.data = {};
			this.data[dtype] = {};
			if(!this.hex.data) this.hex.data = {};
			this.hex.data[dtype] = {};

			if(this.views[type]){
				_parent.getData(this.views[type].src,{
					'this': this,
					'type':type,
					'dtype':dtype,
					'property':this.views[type].property,
					'callback':callback,
					'loaded': function(data,attr){
						if(!this.data[attr.type]) this.data[attr.dtype] = {};
						for(r in this.hex.hexes){
							if(this.hex.hexes[r]) this.data[attr.dtype][r] = {};
						}
						for(r in data){
							if(this.hex.hexes[r]){
								this.data[attr.dtype][r].cases = data[r].cases;
								this.data[attr.dtype][r].title = data[r].title;
								this.data[attr.dtype][r].percapita = data[r].percapita;
								this.data[attr.dtype][r].desc = data[r].desc;
							}
						}

						if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
					}
				});

			}
			return this;
		};

		this.setColours = function(type,dtype){
			var i,p,key;
			if(!type) type = "";
			
			if(S('#data-selector').length > 0) S('#data-selector')[0].value = type;
			if(S('.view-toggle').length > 0){
				var options = S('.view-toggle');
				for(i = 0; i < options.length; i++){
					p = S(options[i].parentNode);
					if(options[i].getAttribute('id')==type){
						options[i].checked = true;
						p.addClass('on').removeClass('off');
					}else{
						p.addClass('off').removeClass('on');
					}
				}
			}

			this.by = type;
			this.bysrc = dtype;

			key = "";

			// Set the function for changing the colours and creating the key
			if(this.views[type] && typeof this.views[type].key==="function") key = this.views[type].key.call(this,this.views[type].property);

			// Update the key
			S('#key').html(key);

			// Update the map colours
			this.hex.updateColours();

			// Re-render the popup?
			if(this.hex.selected) this.label(this.hex.selected); //re-render

			return this;
		};


		return this;
	}


	if(!Dashboard.plugins[name]){
		Dashboard.plugins[name] = {
			init: init,
			version: '1.0'
		};
	}

})(S);