/*!
 * COVID-19 Dashboard
 */
(function(root){

	var lookup = {};
	var datasources = {
		'populations':{
			'src':'data/populations.json',
			'dataType':'json'
		},
		'conversion':{
			'src':'data/conversion.json',
			'dataType':'json',
			'preProcess':function(d,attr){
				for(la in d){
					if(d[la]){
						id = d[la].id;
						if(!lookup[id]) lookup[id] = {'n': d[la].n, 'LA':{} };
						lookup[id].LA[la] = true;
					}
				}
				return d;
			}
		},
		'uk-historic':{
			'src':'https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv',
			'dataType':'csv',
			'requires': ['conversion','populations'],
			'preProcess': function(d,attr){
				var data = CSV.toJSON(d);
				var byid = {};
				var max = 0;
				for(var i = 0; i < data.length; i++){
					id = data[i].AreaCode;
					if(id){
						t = parseInt(data[i].TotalCases);
						if(t > 0){
							if(!byid[id]) byid[id] = {'days':{},'country':data[i].Country,'name':data[i].Area,'mindate':'3000-01-01','maxdate':'2000-01-01','max':0};
							byid[id].days[data[i]['Date']] = t;
							byid[id].population = (datasources['populations'].data[id]||0);
							if(t > max) max = t;
							if(t > byid[id].max) byid[id].max = t;
							if(data[i]['Date'] > byid[id].maxdate) byid[id].maxdate = data[i]['Date'];
							if(data[i]['Date'] < byid[id].mindate) byid[id].mindate = data[i]['Date'];
						}
					}else{
						console.warn('No ID given for row '+i,data[i]);
					}
				}
				
				for(var id in byid){
					byid[id].mindate = new Date(byid[id].mindate+'T00:00Z');
					byid[id].maxdate = new Date(byid[id].maxdate+'T00:00Z');
					byid[id].ndays = Math.round((byid[id].maxdate.getTime()-byid[id].mindate.getTime())/86400000)+1;
				}
				return byid;
			}
		},
		'england-latest':{
			'src':'https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data',
			'dataType':'csv',
			'requires': ['conversion','populations','uk-historic'],
			'preProcess': function(d,attr){
				var i,r,la,total,code,cases,percapita,n,lastring,now,odata,cases,percapita,n,lastring,la,output,code,data;
				data = CSV.toJSON(d);
				odata = {};

				if(data.length > 0){
					for(i = 0; i < data.length; i++){
						code = data[i].GSS_CD;
						// Fix for Cornwall and Hackney in the PHE data
						if(code && code == "E06000052") data[i].GSS_CD = "E06000052-3";
						if(code && code == "E09000012") data[i].GSS_CD = "E09000001-12";
						// Update the code
						code = data[i].GSS_CD;
						if(typeof data[i].TotalCases==="string") data[i].TotalCases = parseInt(data[i].TotalCases.replace(/\,/g,""));
						if(code){
							odata[code] = {'TotalCases':data[i].TotalCases,'GSS_CD':code,'GSS_NM':data[i].GSS_NM};
						}
					}
				}else{
					console.error('No data loaded for England');
				}
				
				// Add in UK Historic data (which should be loaded at this point)
				if(datasources['uk-historic'].data){
					for(var id in datasources['uk-historic'].data){
						if(datasources['uk-historic'].data[id]){
							// Ignore English and Welsh Local Authorities (we will be using Welsh Health Boards)
							if(!odata[id] && id.indexOf('E')!=0 && id.indexOf('W06')!=0){
								// Build item
								odata[id] = {'GSS_CD':id,'GSS_NM':datasources['uk-historic'].data[id].name,'TotalCases':datasources['uk-historic'].data[id].max,'date':datasources['uk-historic'].data[id].maxdate.toISOString().substr(0,10)};
							}
						}
					}
				}
				
				if(!this.plugins.hexmap.obj){
					console.error('No hexmap loaded');
				}
				for(var code in odata){
					if(code){
						//console.log(code,clone(odata[code]));
						odata[code].cases = odata[code].TotalCases;
						odata[code].percapita = (datasources['populations'].data[code]) ? 1e5*odata[code].TotalCases/datasources['populations'].data[code] : 0;

						// If the Local Authority doesn't exist
						if(!this.plugins.hexmap.obj.hex.hexes[code]){
							
							if(lookup[code]){
								if(!lookup[code].LA) console.error('No LA for '+code,lookup[code]);
								n = Object.keys(lookup[code].LA).length;
								lastring = '';
								for(la in lookup[code].LA){
									if(lookup[code].LA[la]){
										lastring += '<li>'+(this.plugins.hexmap.obj.hex.hexes[la] ? this.plugins.hexmap.obj.hex.hexes[la].attributes.title : '?')+(datasources['populations'].data[la] ? ' ('+datasources['populations'].data[la].toLocaleString()+')':'')+'</li>';
									}
								}
								for(la in lookup[code].LA){
									if(lookup[code].LA[la]){
										odata[la] = {};
										odata[la].cases = Math.round(odata[code].TotalCases/n);
										odata[la].percapita = odata[code].percapita;
										odata[la].title = datasources['conversion'].data[la].n;
										odata[la].desc = '<strong>Total cases:</strong> '+odata[code].cases+(odata[code].date ? ' (as of '+odata[code].date+')':'')+'.<br /><strong>Population ('+(odata[code].GSS_CD.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(datasources['populations'].data[code] ? datasources['populations'].data[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(odata[code].percapita)+'.<br /><strong>Includes:</strong> <ul>'+lastring+'</ul>';
//										console.log(code,la,odata[la],odata[code],n,Math.round(odata[code].TotalCases/n),lookup[code].LA,this.plugins.hexmap.obj.hex.hexes[la].attributes.title,datasources['conversion'].data[la].n);
									}
								}
							}else{
								console.warn('No hex for '+code+' and no UTLA lookup');
							}
						}else{
							//console.log(code,odata[code])
							odata[code].title = odata[code].GSS_NM;
							odata[code].desc = '<strong>Total cases:</strong> '+odata[code].cases+'.<br /><strong>Population ('+(code.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(datasources['populations'].data[code] ? datasources['populations'].data[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(odata[code].percapita)+'.';
						}
					}
				}
				
				return odata;
			}
		}
	};
	function clone(d){
		return JSON.parse(JSON.stringify(d));
	}
	function DashboardBuilder(opts){
		this.qs = QueryString();
		this.cache = {};
		this.queue = [];
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
		
		this.getData = function(id,o){
			
			if(!datasources[id]){
				console.error('Data source '+id+' is unknown');
				return this;
			}
			
			// Find out which datasets are required
			var required,req,r,r2;
			required = {};
			required[id] = true;
			req = clone(datasources[id].requires);
			while(req.length > 0){
				r = req.pop();
				if(r){
					if(datasources[r]){
						if(datasources[r].requires) req.concat(datasources[r].requires);
						required[r] = true;
					}else{
						console.error('Data source '+r+' is unknown. (2)');
					}
				}
			}

			// Work out if we've loaded everything already
			loaded = 0;
			loading = 0;
			n = 0;
			for(r in required){
				n++;
				if(datasources[r].loaded) loaded++;
			}

			if(loaded == n){

				// We have everything so trigger the callback straight away
				console.log('straight away',o);
				if(typeof o.loaded==="function") o.loaded.call((o['this']||this),datasources[id].data,o);

			}else{

				// Add details of this request to a queue
				this.queue.push({'id':id,'requires':required,'o':o});

				// Now loop through getting anything that hasn't been requested
				for(r in required){
					if(!datasources[r].loaded && !datasources[r].loading){
						console.info('Getting '+datasources[r].src);
						datasources[r].loading = true;
						S().ajax(datasources[r].src,{
							"dataType": datasources[r].dataType,
							"this": this,
							"o": o,
							"id": r,
							"success":function(d,attr){
								// Pre process the data
								if(typeof datasources[attr.id].preProcess==="function"){
									datasources[attr.id].data = datasources[attr.id].preProcess.call(this,d,attr);
								}else{
									datasources[attr.id].data = d;
								}

								// We've loaded the data
								datasources[attr.id].loading = false;
								datasources[attr.id].loaded = true;

								if(!this.queue.length) this.queue = [this.queue];
								for(var q = 0; q < this.queue.length; q++){
									var n = 0;
									var got = 0;
									for(var r in this.queue[q].requires){
										if(datasources[r].loaded) got++;
										n++;
									}
									if(got==n){
										// Can now do callback
										if(typeof this.queue[q].o.loaded==="function"){
											this.queue[q].o.loaded.call((this.queue[q].o['this']||this),datasources[this.queue[q].id].data,this.queue[q].o);
										}
										// Remove from the queue
										this.queue.splice(q,1);
									}
								}
							},
							"error": function(e,attr){
								console.error('Unable to load '+attr.url);
							}
						});
					}
				}
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
			'plot':{'src':'dashboard.plot.js'},
			'timeline':{'src':'dashboard.timeline.js'}
		}
	});
});