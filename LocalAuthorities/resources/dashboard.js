/*!
 * COVID-19 Dashboard
 */
(function(root){

	
	function DashboardBuilder(opts){
		this.qs = QueryString();
		this.cache = {};
		this.panels = opts.panels||{};
		this.plugins = opts.plugins||{};
		this.base = (typeof opts.base==="string") ? opts.base : 'resources/';
		
		
		// Do we update the address bar?
		this.pushstate = !!(window.history && history.pushState);
		// Add "back" button functionality
		var _obj = this;
		if(this.pushstate){
			window[(this.pushstate) ? 'onpopstate' : 'onhashchange'] = function(e){
				console.log('change',e.state);
				if(e.state && e.state.type) _obj.updateAreas(e.state.type);
				else _obj.updateAreas(_obj.defaulttype);
			};
		}

		this.loadPlugin = function(id,file,opt){
			//console.log('Dashboard.loadPlugin',id,file,opt);
			if(!opt) opt = {};
			if(typeof file!=="string") return this;
			if(this.panels[id] && this.panels[id].loaded) return this;

			// If we are loading an external script we need to make sure we initiate 
			// it first. To do that we will re-write the callback that was provided.
			var config = {};
			config.success = function(data){
				// Initialize this plugin
				if(!this.panels[id]) console.warn('Panel '+id+' does not exist');
				this.panels[id].loaded = true;
				// Initiate the plugin
				if(typeof this.plugins[id].init==="function") this.plugins[id].init.call(this);
				// Run any callback
				if(typeof opt.success==="function") opt.success.call(this,data);
			};
			config.dataType = 'script';
			config.this = this;
			config.cache = true;
			if(typeof opt.complete==="function") config.complete = opt.complete;
			if(typeof opt.progress==="function") config.progress = opt.progress;
			if(typeof opt.error==="function") config.error = opt.error;
			else config.error = function(e,attr){ console.log('Failed to load '+attr.url); }

			// Load the script
			S().ajax(this.base+file,config);
			return this;
		};
		
		this.init = function(){
			for(id in this.panels){
				if(this.panels[id]){
					if(this.panels[id].src){
						this.loadPlugin(id,this.panels[id].src,{});
					}
				}
			}
		};
		
		this.getData = function(url,o){

			if(this.cache[url]){
				if(!this.cache[url].loading){
					// Got the data and processed it so call the "loaded" function
					for(id in this.cache[url].callback){
						if(typeof this.cache[url].callback[id].loaded==="function") this.cache[url].callback[id].loaded.call((o['this']||this),this.cache[url].data,o);
					}
				}
			}else{
				this.cache[url] = {'loading':true,'callback':{}};
				if(o['process']) this.cache[url].process = o['process'];
				if(o['name'] && o['loaded']) this.cache[url].callback[o['name']] = {'loaded':o['loaded'],'attr':o};
				console.info('Getting '+url);
				S().ajax(url,{
					"dataType":"text",
					"this": this,
					"o": o,
					"success": function(d,attr){
						this.cache[url].loading = false;
						if(attr.o.process) this.cache[attr.url].data = attr.o.process.call((attr.o['this']||this),d,attr);
						// Got the data and processed it so call the "loaded" function
						for(id in this.cache[attr.url].callback){
							if(typeof this.cache[attr.url].callback[id].loaded==="function") this.cache[attr.url].callback[id].loaded.call((attr.o['this']||this),this.cache[attr.url].data,attr.o);
						}
					},
					"error": function(e,attr){
						console.error('Unable to load '+attr.url);
					}		
				});
			}
			return this;
		}

		this.updateHistory = function(){
			var str,a,h;
			a = (typeof this.qs.areas=="object" ? this.qs.areas.join(";") : this.qs.areas);
			str = a ? 'areas='+a : '';
			h = (this.qs.hextype || "");
			str += (str ? '&':'')+(h ? 'hextype='+h : "");
			if(this.pushstate) history.pushState({'areas':a,'hexes':h},"COVID-19",(str ? '?'+str : '?'));
		};

		this.updateAreas = function(){

			var a;
			this.qs = QueryString();
			if(typeof this.qs.areas==="object") a = this.qs.areas;


			/* Update the Plot */
			
			var plot = this.plugins.plot.obj;
			var plugins = this.plugins;

			// Build a type ahead search
			if(!this.typeahead){
				
				items = [];
				for(id in plot.data) items.push({'name':plot.data[id].name,'country':plot.data[id].country,'id':id});
				
				this.typeahead = TypeAhead.init('#typeahead',{
					'items': items,
					'inline': true,	// The results are shown inline so as not to hide any existing DOM
					'rank': function(d,str){
						// Calculate a weighting
						var r = 0;
						// If the name starts with the string
						if(d.name.toUpperCase().indexOf(str.toUpperCase())==0) r += 3;
						// If the name includes the string
						if(d.name.toUpperCase().indexOf(str.toUpperCase())>0) r += 1;
						// If the country starts with the string
						if(d.country.toUpperCase().indexOf(str.toUpperCase())==0) r += 2;
						// If the country includes the string
						if(d.country.toUpperCase().indexOf(str.toUpperCase())>0) r += 0.5;
						// If the code starts with the string
						if(d.id.toUpperCase().indexOf(str.toUpperCase())==0) r += 3;
						// If the code matches
						if(d.id.toUpperCase() == str.toUpperCase()) r += 3;

						return r;
					},
					'endsearch': function(str){
						// Highlight on map
						if(plugins.hexmap.obj){
							plugins.hexmap.obj.hex.search.key(str);
							plugins.hexmap.obj.hex.search.active = true;
						}
					},
					'render': function(d){
						// Render the drop down list item for each airport.
						// This can be HTML. It will be wrapped in <a>
						return d.name+', '+d.country;
					},
					'process': function(d){
						this.input.value = "";
						var match = false;
						if(_obj.qs.areas){
							for(var i = 0; i < _obj.qs.areas.length; i++){
								if(_obj.qs.areas[i] == d.id) match = true;
							}
						}
						if(!match){
							//_obj.qs.areas.push(d.id);
							_obj.addToggle(d.id,true);
						}
						if(plugins.hexmap.obj){
							plugins.hexmap.obj.hex.search.pick(d.id);
							console.log(d.id,plugins.hexmap.obj.hex)
							plugins.hexmap.obj.hex.search.active = false;
						}
					}
				});
			}

			// Highlight selected UTLAs
			if(typeof this.qs.areas==="string") this.qs.areas = this.qs.areas.split(/;/);

			// Add any missing toggles
			if(this.qs.areas){
				for(i = 0; i < this.qs.areas.length; i++){
					if(S('#toggle-'+this.qs.areas[i]).length == 0) this.addToggle(this.qs.areas[i]);
				}
			}

			if(a){
				// Find out which toggles no longer exist
				for(j = 0; j < a.length; j++){
					match = false;
					for(i = 0; i < this.qs.areas.length; i++){
						if(a[j]==this.qs.areas[i]){ match = true; continue; }
					}
					// It no longer exists so remove it (but don't update the history)
					if(!match) this.removeToggle(a[j]);
				}
			}


			/* Update the hexmap */
			if(this.plugins.hexmap && this.plugins.hexmap.obj) this.plugins.hexmap.obj.updateData(this.qs.hextype);

			return this;
		};
		
		this.addToggle = function(id,update){

			if(S('#toggle-holder .toggles').length==0) S('#toggle-holder').append('<ul class="toggles padded b5-bg"></ul>');

			var li;

			// Add to array
			var match = -1;
			if(!this.qs.areas) this.qs.areas = [];
			for(var i = 0; i < this.qs.areas.length; i++){
				if(this.qs.areas[i]==id) match = i;
			}
			if(match < 0) this.qs.areas.push(id);

			var plot = this.plugins.plot.obj;
			// Select the line
			if(this.plugins.plot) plot.selectLine(id,'',{'keep':true,'line':'#D60303','background':'','color':'black','class':'label'});

			// Build toggle
			if(plot.data[id] && S('#toggle-'+id).length==0){
				li = document.createElement('li');
				li.setAttribute('class','c12-bg');
				li.setAttribute('title','Toggle '+plot.data[id].name);
				li.innerHTML = '<label for="toggle-'+id+'">'+plot.data[id].name+'</label><span class="close"><span>&times;</span><input id="toggle-'+id+'" type="checkbox" checked="checked" data="'+id+'"></span>';
				S('#toggle-holder .toggles')[0].appendChild(li);
				S(li).find('input').on('change',{me:this},function(e){
					e.preventDefault();
					e.stopPropagation();
					e.data.me.removeToggle(e.currentTarget.getAttribute('data'),true);
				});
			}

			if(update) this.updateHistory();

			return this;
		};

		this.removeToggle = function(id,update){
			var plot = this.plugins.plot.obj;

			if(plot.info.msg['area-'+id]) plot.deselectLine(id,true);

			// Remove toggle from DOM
			S('#toggle-'+id).parent().parent().remove();
			
			// Remove from array
			var match = -1;
			for(var i = 0; i < this.qs.areas.length; i++){
				if(this.qs.areas[i]==id) match = i;
			}
			if(match >= 0) this.qs.areas.splice(match,1);
			
			if(this.qs.areas.length == 0){
				S('#toggle-holder ul.toggles').remove();
			}

			console.log('ready to updatehistory',update);
			if(update) this.updateHistory();

			return this;
		};

		this.init();

		return this;
	}

	root.Dashboard = function(input){
		if(!input) input = {};
		input.plugins = Dashboard.plugins;
		return new DashboardBuilder(input);
	};

	Dashboard.plugins = {};

})(window || this);

var dashboard;
S(document).ready(function(){
	dashboard = Dashboard({
		'base':'resources/',
		'panels':{
			'hexmap':{'src':'dashboard.hexmap.js'},
			'plot':{'src':'dashboard.plot.js'}
		}
	});
});