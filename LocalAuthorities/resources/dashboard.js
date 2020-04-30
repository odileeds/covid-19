/*!
 * COVID-19 Dashboard
 */
(function(root){

	Date.prototype.addDays = function(days) {
		var date = new Date(this.valueOf());
		date.setDate(date.getDate() + days);
		return date;
	}
	var G = {};
	G.extend = function(out){
		out = out || {};
		for(var i = 1; i < arguments.length; i++){
			if(!arguments[i]) continue;
			for(var key in arguments[i]){
				if (arguments[i].hasOwnProperty(key)) out[key] = arguments[i][key];
			}
		}
		return out;
	};
	var lookup = {};
	var datasources = {
		'populations':{
			'src':'data/populations.json',
			'dataType':'json'
		},
		'conversion':{
			'src':'data/conversion.json',
			'dataType':'json',
			'preProcess':function(d){
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
			'src':'data/utla.json',
			'dataType':'json',
			'requires': ['conversion','populations'],
			'preProcess': function(dat){
				var data,byid,max,i,name,d,d2,id,id2,v;
				data = dat.data;
				byid = {};
				max = 0;
				for(id in data){

					if(id && id.indexOf('W06')!=0){
						name = data[id].n;

						if(!byid[id]) byid[id] = {'days':{},'dates':{'max':'2000-01-01','min':'3000-01-01'},'name':name,'max':0};
						byid[id].population = (datasources['populations'].data[id]||0);
						byid[id].GSS_CD = id;
						byid[id].GSS_NM = byid[id].name;
						byid[id].country = data[id].c;
						byid[id].cases = 0;


						byid[id].mindate = new Date(data[id].mindate+'T12:00Z');
						byid[id].maxdate = new Date(data[id].maxdate+'T12:00Z');
						
						// Get first date (use midday to avoid daylight savings issues)
						d = new Date(data[id].mindate+'T12:00Z');
						for(v = 0; v < data[id].v.length; v++){
							d2 = d.addDays(v).toISOString().substr(0,10);
							t = data[id].v[v];
							if(t > byid[id].cases){ byid[id].cases = t; }
							if(t > 0){
								byid[id].days[d2] = {'cases':t,'percapita':0};
								if(t > max) max = t;

								// Update the maximum value
								if(t > byid[id].max) byid[id].max = t;

								// Update the maximum date
								if(d2 > byid[id].dates.max) byid[id].dates.max = d2;

								// Update the minimum date
								if(d2 < byid[id].dates.min) byid[id].dates.min = d2;
							}

						}
					}else{
						//console.warn('No ID given for row '+i,data[i]);
					}
				}
				
				for(var id in byid){
					if(byid[id].dates.min=="3000-01-01" || byid[id].dates.max=="2000-01-01") console.error(id,byid[id]);
					byid[id].mindate = new Date(byid[id].dates.min+'T00:00Z');
					byid[id].maxdate = new Date(byid[id].dates.max+'T00:00Z');
					byid[id].ndays = Math.round((byid[id].maxdate.getTime()-byid[id].mindate.getTime())/86400000)+1;
				}

				var LAs = {"E06000001":"Hartlepool","E06000002":"Middlesbrough","E06000003":"Redcar and Cleveland","E06000004":"Stockton-on-Tees","E06000010":"Kingston upon Hull, City of","E06000011":"East Riding of Yorkshire","E06000005":"Darlington","E06000006":"Halton","E06000039":"Slough","E06000007":"Warrington","E06000008":"Blackburn with Darwen","E06000009":"Blackpool","E06000012":"North East Lincolnshire","E06000014":"York","E06000015":"Derby","E06000013":"North Lincolnshire","E06000016":"Leicester","E06000017":"Rutland","E06000018":"Nottingham","E06000019":"Herefordshire, County of","E06000020":"Telford and Wrekin","E06000021":"Stoke-on-Trent","E06000032":"Luton","E06000022":"Bath and North East Somerset","E06000033":"Southend-on-Sea","E06000023":"Bristol, City of","E07000068":"Brentwood","E06000024":"North Somerset","E07000237":"Worcester","E06000025":"South Gloucestershire","E09000005":"Brent","E06000026":"Plymouth","E06000034":"Thurrock","E06000035":"Medway","E06000027":"Torbay","E06000036":"Bracknell Forest","E09000021":"Kingston upon Thames","E06000030":"Swindon","E06000031":"Peterborough","E06000037":"West Berkshire","E06000038":"Reading","E06000040":"Windsor and Maidenhead","E06000041":"Wokingham","E09000022":"Lambeth","E06000042":"Milton Keynes","E06000043":"Brighton and Hove","E09000006":"Bromley","E06000044":"Portsmouth","E06000045":"Southampton","E06000046":"Isle of Wight","E06000047":"County Durham","E06000049":"Cheshire East","E06000050":"Cheshire West and Chester","E06000051":"Shropshire","E06000052":"Cornwall","E06000053":"Isles of Scilly","E06000054":"Wiltshire","E09000007":"Camden","E06000055":"Bedford","E07000005":"Chiltern","E06000056":"Central Bedfordshire","E06000057":"Northumberland","E06000058":"Bournemouth, Christchurch and Poole","E06000059":"Dorset","E07000004":"Aylesbury Vale","E09000008":"Croydon","E07000006":"South Bucks","E07000007":"Wycombe","E07000008":"Cambridge","E07000009":"East Cambridgeshire","E07000066":"Basildon","E07000010":"Fenland","E07000033":"Bolsover","E07000011":"Huntingdonshire","E09000009":"Ealing","E07000012":"South Cambridgeshire","E07000026":"Allerdale","E07000027":"Barrow-in-Furness","E07000028":"Carlisle","E07000029":"Copeland","E07000034":"Chesterfield","E07000035":"Derbyshire Dales","E07000030":"Eden","E07000031":"South Lakeland","E07000032":"Amber Valley","E07000036":"Erewash","E07000037":"High Peak","E07000041":"Exeter","E07000042":"Mid Devon","E07000043":"North Devon","E07000044":"South Hams","E07000038":"North East Derbyshire","E07000061":"Eastbourne","E07000039":"South Derbyshire","E07000062":"Hastings","E07000040":"East Devon","E07000045":"Teignbridge","E07000046":"Torridge","E07000047":"West Devon","E07000063":"Lewes","E09000010":"Enfield","E07000064":"Rother","E07000065":"Wealden","E09000011":"Greenwich","E07000067":"Braintree","E09000012":"Hackney","E07000069":"Castle Point","E07000070":"Chelmsford","E07000071":"Colchester","E07000072":"Epping Forest","E07000073":"Harlow","E07000074":"Maldon","E07000087":"Fareham","E07000075":"Rochford","E07000076":"Tendring","E07000077":"Uttlesford","E07000078":"Cheltenham","E07000079":"Cotswold","E09000013":"Hammersmith and Fulham","E07000080":"Forest of Dean","E07000081":"Gloucester","E07000082":"Stroud","E07000088":"Gosport","E07000083":"Tewkesbury","E09000014":"Haringey","E07000084":"Basingstoke and Deane","E07000089":"Hart","E07000085":"East Hampshire","E07000086":"Eastleigh","E07000090":"Havant","E07000091":"New Forest","E07000092":"Rushmoor","E07000103":"Watford","E07000093":"Test Valley","E09000015":"Harrow","E07000094":"Winchester","E07000095":"Broxbourne","E07000096":"Dacorum","E07000098":"Hertsmere","E07000117":"Burnley","E07000099":"North Hertfordshire","E07000102":"Three Rivers","E07000105":"Ashford","E07000122":"Pendle","E07000106":"Canterbury","E07000107":"Dartford","E07000108":"Dover","E07000109":"Gravesham","E07000110":"Maidstone","E07000123":"Preston","E07000111":"Sevenoaks","E07000241":"Welwyn Hatfield","E07000112":"Folkestone and Hythe","E07000113":"Swale","E07000114":"Thanet","E07000115":"Tonbridge and Malling","E08000005":"Rochdale","E07000116":"Tunbridge Wells","E07000118":"Chorley","E07000126":"South Ribble","E07000119":"Fylde","E07000120":"Hyndburn","E07000121":"Lancaster","E08000006":"Salford","E07000124":"Ribble Valley","E07000125":"Rossendale","E07000127":"West Lancashire","E09000023":"Lewisham","E07000128":"Wyre","E07000129":"Blaby","E07000130":"Charnwood","E07000131":"Harborough","E07000132":"Hinckley and Bosworth","E07000134":"North West Leicestershire","E07000133":"Melton","E07000135":"Oadby and Wigston","E09000024":"Merton","E07000136":"Boston","E07000137":"East Lindsey","E07000138":"Lincoln","E08000013":"St. Helens","E07000139":"North Kesteven","E07000150":"Corby","E07000140":"South Holland","E07000170":"Ashfield","E07000141":"South Kesteven","E07000173":"Gedling","E07000142":"West Lindsey","E07000143":"Breckland","E07000144":"Broadland","E07000145":"Great Yarmouth","E07000146":"King's Lynn and West Norfolk","E07000147":"North Norfolk","E07000148":"Norwich","E07000149":"South Norfolk","E07000151":"Daventry","E07000152":"East Northamptonshire","E07000174":"Mansfield","E07000153":"Kettering","E07000154":"Northampton","E07000155":"South Northamptonshire","E07000156":"Wellingborough","E07000163":"Craven","E07000164":"Hambleton","E07000178":"Oxford","E07000165":"Harrogate","E07000166":"Richmondshire","E07000192":"Cannock Chase","E07000167":"Ryedale","E07000168":"Scarborough","E07000169":"Selby","E07000171":"Bassetlaw","E07000172":"Broxtowe","E07000175":"Newark and Sherwood","E07000202":"Ipswich","E07000176":"Rushcliffe","E07000207":"Elmbridge","E07000208":"Epsom and Ewell","E07000177":"Cherwell","E07000179":"South Oxfordshire","E07000180":"Vale of White Horse","E07000212":"Runnymede","E07000181":"West Oxfordshire","E07000213":"Spelthorne","E07000187":"Mendip","E07000188":"Sedgemoor","E07000189":"South Somerset","E07000193":"East Staffordshire","E07000194":"Lichfield","E07000214":"Surrey Heath","E09000025":"Newham","E07000195":"Newcastle-under-Lyme","E07000215":"Tandridge","E07000196":"South Staffordshire","E09000016":"Havering","E07000197":"Stafford","E09000026":"Redbridge","E07000198":"Staffordshire Moorlands","E07000199":"Tamworth","E07000200":"Babergh","E07000203":"Mid Suffolk","E09000032":"Wandsworth","E07000209":"Guildford","E08000003":"Manchester","E07000210":"Mole Valley","E07000211":"Reigate and Banstead","E09000033":"Westminster","E07000216":"Waverley","E07000217":"Woking","N09000011":"Ards and North Down","E07000218":"North Warwickshire","E07000219":"Nuneaton and Bedworth","E08000004":"Oldham","E07000220":"Rugby","E07000221":"Stratford-on-Avon","E07000234":"Bromsgrove","E07000222":"Warwick","E07000223":"Adur","E07000235":"Malvern Hills","E07000224":"Arun","E07000225":"Chichester","E07000226":"Crawley","E07000227":"Horsham","E07000228":"Mid Sussex","E07000229":"Worthing","E07000236":"Redditch","E07000238":"Wychavon","E07000239":"Wyre Forest","E07000240":"St Albans","E07000242":"East Hertfordshire","E07000243":"Stevenage","E07000244":"East Suffolk","E07000245":"West Suffolk","E07000246":"Somerset West and Taunton","E08000022":"North Tyneside","E08000001":"Bolton","E08000002":"Bury","E08000023":"South Tyneside","E08000007":"Stockport","E08000008":"Tameside","E08000009":"Trafford","E08000010":"Wigan","E08000011":"Knowsley","E08000012":"Liverpool","E08000014":"Sefton","E08000015":"Wirral","E08000016":"Barnsley","E08000024":"Sunderland","E08000017":"Doncaster","E08000018":"Rotherham","E08000019":"Sheffield","E08000021":"Newcastle upon Tyne","E08000025":"Birmingham","E08000026":"Coventry","E09000017":"Hillingdon","E08000027":"Dudley","E08000028":"Sandwell","E09000018":"Hounslow","E09000019":"Islington","E08000029":"Solihull","E08000030":"Walsall","E08000031":"Wolverhampton","E08000032":"Bradford","E08000033":"Calderdale","E08000034":"Kirklees","E08000036":"Wakefield","E08000035":"Leeds","E09000004":"Bexley","E08000037":"Gateshead","E09000001":"City of London","E09000002":"Barking and Dagenham","E09000003":"Barnet","E09000020":"Kensington and Chelsea","E09000027":"Richmond upon Thames","E09000028":"Southwark","E09000029":"Sutton","E09000030":"Tower Hamlets","E09000031":"Waltham Forest","N09000001":"Antrim and Newtownabbey","N09000002":"Armagh City, Banbridge and Craigavon","N09000003":"Belfast","N09000004":"Causeway Coast and Glens","N09000005":"Derry City and Strabane","N09000006":"Fermanagh and Omagh","N09000007":"Lisburn and Castlereagh","N09000008":"Mid and East Antrim","N09000009":"Mid Ulster","N09000010":"Newry, Mourne and Down","S12000005":"Clackmannanshire","S12000006":"Dumfries and Galloway","S12000008":"East Ayrshire","S12000010":"East Lothian","S12000011":"East Renfrewshire","S12000013":"Na h-Eileanan Siar","S12000014":"Falkirk","S12000017":"Highland","S12000018":"Inverclyde","S12000019":"Midlothian","S12000020":"Moray","S12000021":"North Ayrshire","S12000023":"Orkney Islands","S12000026":"Scottish Borders","S12000027":"Shetland Islands","S12000028":"South Ayrshire","S12000029":"South Lanarkshire","S12000030":"Stirling","S12000033":"Aberdeen City","S12000034":"Aberdeenshire","S12000035":"Argyll and Bute","S12000036":"City of Edinburgh","S12000039":"West Dunbartonshire","S12000038":"Renfrewshire","S12000045":"East Dunbartonshire","S12000047":"Fife","S12000040":"West Lothian","S12000041":"Angus","S12000042":"Dundee City","S12000048":"Perth and Kinross","S12000049":"Glasgow City","W06000013":"Bridgend","S12000050":"North Lanarkshire","W06000001":"Isle of Anglesey","W06000002":"Gwynedd","W06000003":"Conwy","W06000004":"Denbighshire","W06000005":"Flintshire","W06000006":"Wrexham","W06000008":"Ceredigion","W06000009":"Pembrokeshire","W06000010":"Carmarthenshire","W06000011":"Swansea","W06000012":"Neath Port Talbot","W06000014":"Vale of Glamorgan","W06000015":"Cardiff","W06000016":"Rhondda Cynon Taf","W06000020":"Torfaen","W06000018":"Caerphilly","W06000019":"Blaenau Gwent","W06000024":"Merthyr Tydfil","W06000021":"Monmouthshire","W06000022":"Newport","W06000023":"Powys"};

				for(var code in byid){
					if(byid[code]){
						byid[code].percapita = (datasources['populations'].data[code]) ? 1e5*byid[code].cases/datasources['populations'].data[code] : 0;
						for(d in byid[code].days){
							byid[code].days[d].percapita = (datasources['populations'].data[code]) ? 1e5*byid[code].days[d].cases/datasources['populations'].data[code] : 0;
						}
						byid[code].desc = '<strong>Total cases:</strong> '+byid[code].cases+(byid[code].date ? ' (as of '+byid[code].date+')':'')+'.<br /><strong>Population ('+(byid[code].GSS_CD.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(datasources['populations'].data[code] ? datasources['populations'].data[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(byid[code].percapita)+'.';

						if(lookup[code]){
							if(!lookup[code].LA) console.error('No LA for '+code,lookup[code]);
							n = Object.keys(lookup[code].LA).length;
							lastring = '';
							for(la in lookup[code].LA){
								if(lookup[code].LA[la]){
									lastring += '<li>'+(LAs[la] ? LAs[la] : '?')+(datasources['populations'].data[la] ? ' ('+datasources['populations'].data[la].toLocaleString()+')':'')+'</li>';
								}
							}
							for(la in lookup[code].LA){
								if(lookup[code].LA[la]){
									// Create a new structure if it doesn't already exist (e.g. Isles of Scilly)
									byid[la] = clone(byid[code]);
									byid[la].added = true;
									byid[la].mindate = new Date(byid[code].mindate);
									byid[la].maxdate = new Date(byid[code].maxdate);
									byid[la].cases = Math.round(byid[code].cases/n);
									byid[la].percapita = byid[code].percapita;
									byid[la].title = datasources['conversion'].data[la].n;
									byid[la].desc = '<strong>Total cases:</strong> '+byid[code].cases+(byid[code].date ? ' (as of '+byid[code].date+')':'')+'.<br /><strong>Population ('+(byid[code].GSS_CD.substr(0,1)=="E" ? '2020':'mid 2018')+'):</strong> '+(datasources['populations'].data[code] ? datasources['populations'].data[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(byid[code].percapita)+'.<br /><strong>Includes:</strong> <ul>'+lastring+'</ul>';
								}
							}
						}else{
							//console.warn('No hex for '+code+' and no UTLA lookup');
						}

						if(!byid[code].days) console.error('bad days early',code,byid[code]);
					}
				}
				
				return byid;
			}
		}
	};
	function clone(d){
		return JSON.parse(JSON.stringify(d));
	}
	function DashboardBuilder(opts){
		this.qs = QueryString();
		this.queue = [];
		this.events = {};
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
				if(e.state && e.state.type) _obj.updateState(e.state);
				else _obj.updateState({'areas':_obj.qs.areas,'hextype':_obj.qs.hextype,'colourscale':_obj.qs.colourscale});
			};
		}

		/**
		 * @desc Attach a handler to an event for the Canvas object
		 * @usage canvas.on(eventType[,eventData],handler(eventObject));
		 * @usage canvas.on("resize",function(e){ console.log(e); });
		 * @usage canvas.on("resize",{me:this},function(e){ console.log(e.data.me); });
		 * @param {string} ev - the event type
		 * @param {object} e - any properties to add to the output as e.data
		 * @param {function} fn - a callback function
		 */
		this.on = function(ev,e,fn){
			if(typeof ev!="string") return this;
			if(typeof fn==="undefined"){
				fn = e;
				e = {};
			}else{
				e = {data:e};
			}
			if(typeof e!="object" || typeof fn!="function") return this;
			if(this.events[ev]) this.events[ev].push({e:e,fn:fn});
			else this.events[ev] = [{e:e,fn:fn}];
			return this;
		};

		/**
		 * @desc Trigger a defined event with arguments. This is for internal-use to be sure to include the correct arguments for a particular event
		 */
		this.trigger = function(ev,args){
			if(typeof ev != "string") return;
			if(typeof args != "object") args = {};
			var o = [];
			if(typeof this.events[ev]=="object"){
				for(var i = 0 ; i < this.events[ev].length ; i++){
					var e = G.extend(this.events[ev][i].e,args);
					if(typeof this.events[ev][i].fn == "function") o.push(this.events[ev][i].fn.call((e['data']['this']||this),e));
				}
			}
			if(o.length > 0) return o;
		};

		this.init = function(){
			this.datatoload = 0;
			this.dataloaded = 0;
			for(id in datasources){
				this.datatoload++;
				if(datasources[id].loaded) this.dataloaded++;
			}
			for(id in datasources){
				if(!datasources[id].loaded){
					S().ajax(datasources[id].src,{
						"dataType": datasources[id].dataType,
						"this": this,
						"id": id,
						"success":function(d,attr){
							datasources[attr.id].data = d;
							datasources[attr.id].processed = false;

							// We've loaded the data
							datasources[attr.id].loaded = true;
							this.dataloaded++;
							if(this.datatoload==this.dataloaded) this.loadedData();
						},
						"error": function(e,attr){
							console.error('Unable to load '+attr.url);
						}
					});
				}
			}
		};

		this.loadedData = function(){
			
			for(id in datasources){
				if(typeof datasources[id].preProcess==="function"){
					// Pre process the data
					datasources[id].data = datasources[id].preProcess.call(this,datasources[id].data);
				}
			}

			this.pluginloaded = 0;
			this.plugintoload = 0;
			for(id in this.panels){
				if(this.panels[id]){
					if(this.panels[id].src) this.plugintoload++;
				}
			}
			for(id in this.panels){
				if(this.panels[id]){
					if(this.panels[id].src) this.loadPlugin(id,this.panels[id].src,{});
				}
			}
			
			// Add events			
			S('#colour-scale').on('change',{me:this},function(e){
				e.data.me.trigger('colourscale',{'colourscale':e.currentTarget.value});
			});

			// Add events to buttons for colour changing
			S('.view-toggle').on('change',{me:this},function(e){
				var el = document.querySelector('input[name="view"]:checked');
				e.data.me.trigger('type',{'hextype':el.id,'d':el.getAttribute('data'),'update':true});
			});
		}
		
		// Add callbacks for type and colourscale
		this.on("type",{me:this},function(e){
			var update = e.update;
			// Have we changed type?
			if(e.hextype==this.qs.hextype) update = false;
			this.qs.hextype = e.hextype;
			// Update the history?
			if(update) this.updateHistory();

			// Update the DOM
			this.updateToggles();
			
			var lbl = '';
			if(this.qs.hextype == "COVID-19-percapita") lbl = 'per capita';
			if(this.qs.hextype == "COVID-19-cases") lbl = 'confirmed cases';
			S('.hextype').html(lbl ? ' ('+lbl+')':'');
			return e.data.me;
		});
		this.on("colourscale",{me:this},function(e){
			var update = (e.colourscale != this.qs.colourscale);
			// Set the value
			this.qs.colourscale = e.colourscale;
			if(update) this.updateHistory();
			return this;
		});


		this.updateToggles = function(){
			S('.view-toggle').parent().removeClass('on').addClass('off');
			S('#'+document.querySelector('input[name="view"]:checked').id).parent().removeClass('off').addClass('on');
			return this;			
		};

		this.loadPlugin = function(id,file){
			if(typeof file!=="string") return this;
			if(this.panels[id] && this.panels[id].loaded) return this;

			// If we are loading an external script we need to make sure we initiate 
			// it first. To do that we will re-write the callback that was provided.
			var config = {};
			config.success = function(data){
				// Initialize this plugin
				if(!this.panels[id]) console.warn('Panel '+id+' does not exist');
				this.panels[id].loaded = true;
				
				this.pluginloaded++;
				
				if(this.pluginloaded==this.plugintoload) this.loadedPlugins();
			};
			config.dataType = 'script';
			config.this = this;
			config.cache = true;
			config.error = function(e,attr){ console.log('Failed to load '+attr.url); }

			// Load the script
			S().ajax(this.base+file,config);
			return this;
		};

		this.loadedPlugins = function(){
			console.log('loadedPlugins');
			for(id in this.plugins){
				// Initiate the plugin
				if(typeof this.plugins[id].init==="function") this.plugins[id].init.call(this);
			}
			this.trigger('load');
			return this;
		}
		
		this.getData = function(id,o){
			
			if(typeof o.loaded==="function") o.loaded.call((o['this']||this),datasources[id].data,o);

			return this;
		}

		this.updateHistory = function(){
			var str,a,h;
			a = (typeof this.qs.areas=="object" ? this.qs.areas.join(";") : this.qs.areas);
			str = a ? 'areas='+a : '';
			h = (this.qs.hextype || "");
			str += (str ? '&':'')+(h ? 'hextype='+h : "");
			c = (this.qs.colourscale || "");
			str += (str ? '&':'')+(c ? 'colourscale='+c : "");
			if(this.pushstate) history.pushState({'areas':a,'hextype':h,'colourscale':c},"COVID-19",(str ? '?'+str : '?'));
		};

		this.updateState = function(opt){
			
			this.updateAreas();

			// See if areas match
			if(opt){
				if(opt.hextype!=this.qs.hextype) this.trigger('type',{'hextype':this.qs.hextype||"COVID-19-percapita"});
				if(opt.colourscale!=this.qs.colourscale){
					// Set the colour scale select box value
					S('#colour-scale')[0].value = (this.qs.colourscale);
					// Update the colour scales
					this.trigger("colourscale",{'colourscale':this.qs.colourscale});
				}
			}
			return this;
		}

		this.updateAreas = function(){

			var a;
			this.qs = QueryString();
			if(typeof this.qs.areas==="object"){
				a = this.qs.areas;
			
			}
			
			// Build a type ahead search
			if(!this.typeahead){
				
				items = [];
				for(id in datasources['uk-historic'].data){
					if(!datasources['uk-historic'].data[id].added) items.push({'name':datasources['uk-historic'].data[id].name,'country':datasources['uk-historic'].data[id].country,'id':id});
				}
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
					'endsearch': function(str){ _obj.trigger('typeahead',{'value':str}); },
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
							_obj.addToggle(d.id,true);
							// Trigger the callback
							_obj.trigger('select',{'id':d.id});
							// Trigger the callback
							_obj.trigger('changeareas',{'areas':_obj.qs.areas});
						}
					},
					'blur': function(){
						// Trigger the callback
						_obj.trigger('typeaheadblur',{'id':d.id});
					}
				});
			}

			// Highlight selected UTLAs
			// Fix type if it is a string
			if(typeof this.qs.areas==="string") this.qs.areas = this.qs.areas.split(/;/);

			// Remove existing toggles
			S('#toggle-holder ul.toggles').remove();

			// Add any missing toggles
			if(this.qs.areas){
				for(i = 0; i < this.qs.areas.length; i++){
					if(S('#toggle-'+this.qs.areas[i]).length == 0) this.addToggle(this.qs.areas[i]);
				}
			}

			// Trigger the callback
			this.trigger('changeareas',{'areas':_obj.qs.areas});

			return this;
		};
		
		
		this.addToggle = function(id,update){

			if(S('#toggle-holder .toggles').length==0) S('#toggle-holder').append('<ul class="toggles padded b5-bg"></ul>');
			var li,match,i;

			// Add to array
			match = -1;
			if(!this.qs.areas) this.qs.areas = [];
			for(i = 0; i < this.qs.areas.length; i++){
				if(this.qs.areas[i]==id) match = i;
			}
			if(match < 0) this.qs.areas.push(id);
			
			// Build toggle
			if(datasources['uk-historic'].data[id] && S('#toggle-'+id).length==0){
				li = document.createElement('li');
				li.setAttribute('class','c12-bg');
				li.setAttribute('title','Toggle '+datasources['uk-historic'].data[id].name);
				li.innerHTML = '<label for="toggle-'+id+'">'+datasources['uk-historic'].data[id].name+'</label><span class="close"><span>&times;</span><input id="toggle-'+id+'" type="checkbox" checked="checked" data="'+id+'"></span>';
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
			var areas,match,i;
			areas = clone(this.qs.areas);

			// Remove toggle from DOM
			S('#toggle-'+id).parent().parent().remove();
			
			// Remove from array
			match = -1;
			for(i = 0; i < areas.length; i++){
				if(areas[i]==id) match = i;
			}
			if(match >= 0){
				areas.splice(match,1);
				update = true;
			}
			
			if(areas.length == 0) S('#toggle-holder ul.toggles').remove();
			this.qs.areas = areas;

			this.trigger('changeareas',{'areas':_obj.qs.areas});

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