/*!
 * COVID-19 Dashboard
 */
(function(root){

	var lookup = {};
	var datasources = {
		'populations':{
			'src':'data/populations.json',
			//'loaded': true,
			'dataType':'json'
			//'data': { "E06000001":93458,"E06000002":140423,"E06000003":137879,"E06000004":198253,"E06000005":106828,"E06000006":129523,"E06000007":210625,"E06000008":149190,"E06000009":139173,"E06000010":261184,"E06000011":342195,"E06000012":159996,"E06000013":173143,"E06000014":211099,"E06000015":258710,"E06000016":360557,"E06000017":40387,"E06000018":333963,"E06000019":195189,"E06000020":181769,"E06000021":257871,"E06000022":195691,"E06000023":471344,"E06000024":217015,"E06000025":289478,"E06000026":264280,"E06000027":137496,"E06000028":194882,"E06000029":152359,"E06000030":225353,"E06000031":205764,"E06000032":213099,"E06000033":184882,"E06000034":176625,"E06000035":279310,"E06000036":123206,"E06000037":158474,"E06000038":164129,"E06000039":150353,"E06000040":151530,"E06000041":172104,"E06000042":271238,"E06000043":293917,"E06000044":216910,"E06000045":255383,"E06000046":143140,"E06000047":531947,"E06000049":384888,"E06000050":346192,"E06000051":326692,"E06000052":577727,"E06000052-3":579794,"E06000053":2067,"E06000054":509964,"E06000055":174720,"E06000056":290053,"E06000057":322852,"E06000058":397716,"E06000059":430378,"E07000004":205426,"E07000005":96274,"E07000006":70083,"E07000007":174143,"E07000008":125473,"E07000009":90623,"E07000010":103621,"E07000011":178911,"E07000012":159205,"E07000026":97960,"E07000027":66720,"E07000028":108682,"E07000029":67923,"E07000030":53164,"E07000031":105351,"E07000032":128575,"E07000033":80938,"E07000034":105012,"E07000035":72332,"E07000036":116230,"E07000037":92932,"E07000038":102071,"E07000039":108164,"E07000040":148493,"E07000041":132228,"E07000042":83533,"E07000043":97703,"E07000044":87706,"E07000045":135846,"E07000046":69352,"E07000047":56249,"E07000048":50475,"E07000049":90662,"E07000050":70931,"E07000051":47867,"E07000052":104094,"E07000053":66348,"E07000061":103866,"E07000062":92984,"E07000063":103925,"E07000064":97304,"E07000065":162447,"E07000066":187964,"E07000067":152370,"E07000068":76383,"E07000069":90500,"E07000070":180245,"E07000071":197246,"E07000072":132284,"E07000073":87425,"E07000074":65305,"E07000075":88232,"E07000076":148624,"E07000077":91604,"E07000078":117416,"E07000079":91983,"E07000080":88006,"E07000081":130515,"E07000082":120685,"E07000083":96277,"E07000084":176563,"E07000085":122560,"E07000086":134262,"E07000087":117070,"E07000088":85168,"E07000089":97493,"E07000090":127786,"E07000091":180498,"E07000092":94623,"E07000093":127425,"E07000094":125809,"E07000095":96976,"E07000096":155839,"E07000098":104850,"E07000099":134049,"E07000102":93152,"E07000103":97077,"E07000105":132420,"E07000106":166305,"E07000107":113887,"E07000108":119640,"E07000109":106722,"E07000110":174062,"E07000111":121415,"E07000112":114211,"E07000113":151965,"E07000114":143349,"E07000115":133233,"E07000116":118848,"E07000117":89278,"E07000118":119522,"E07000119":81343,"E07000120":81251,"E07000121":146127,"E07000122":92041,"E07000123":142620,"E07000124":60954,"E07000125":71887,"E07000126":111051,"E07000127":114479,"E07000128":112428,"E07000129":103703,"E07000130":187556,"E07000131":94635,"E07000132":115023,"E07000133":51281,"E07000134":105669,"E07000135":57250,"E07000136":71202,"E07000137":143102,"E07000138":99548,"E07000139":118349,"E07000140":95886,"E07000141":143347,"E07000142":95898,"E07000143":142019,"E07000144":131671,"E07000145":100097,"E07000146":152654,"E07000147":105800,"E07000148":142790,"E07000149":142705,"E07000150":73307,"E07000151":87464,"E07000152":96251,"E07000153":103649,"E07000154":226702,"E07000155":94907,"E07000156":80721,"E07000163":57173,"E07000164":91480,"E07000165":160644,"E07000166":53189,"E07000167":55846,"E07000168":109422,"E07000169":91149,"E07000170":129825,"E07000171":118634,"E07000172":115012,"E07000173":119267,"E07000174":110247,"E07000175":123532,"E07000176":120396,"E07000177":151724,"E07000178":152996,"E07000179":141881,"E07000180":138229,"E07000181":111060,"E07000187":116606,"E07000188":124482,"E07000189":169316,"E07000190":121889,"E07000191":35369,"E07000192":101594,"E07000193":120212,"E07000194":104858,"E07000195":130792,"E07000196":112757,"E07000197":138122,"E07000198":98723,"E07000199":76454,"E07000200":92538,"E07000201":66673,"E07000202":137012,"E07000203":104153,"E07000204":113773,"E07000205":131963,"E07000206":119789,"E07000207":137027,"E07000208":80555,"E07000209":148940,"E07000210":87095,"E07000211":149936,"E07000212":89096,"E07000213":99813,"E07000214":88983,"E07000215":88285,"E07000216":126137,"E07000217":101087,"E07000218":66440,"E07000219":130406,"E07000220":109181,"E07000221":131536,"E07000222":144062,"E07000223":64298,"E07000224":162919,"E07000225":122616,"E07000226":113531,"E07000227":145250,"E07000228":151785,"E07000229":111283,"E07000234":100512,"E07000235":79657,"E07000236":85118,"E07000237":102160,"E07000238":131412,"E07000239":102244,"E07000240":147895,"E07000241":124585,"E07000242":149828,"E07000243":88214,"E08000001":286952,"E08000002":191841,"E08000003":553905,"E08000004":238525,"E08000005":223372,"E08000006":260804,"E08000007":294053,"E08000008":227556,"E08000009":238813,"E08000010":328790,"E08000011":151092,"E08000012":502326,"E08000013":181622,"E08000014":276782,"E08000015":324533,"E08000016":248707,"E08000017":313762,"E08000018":267215,"E08000019":589710,"E08000021":302680,"E08000022":208486,"E08000023":151394,"E08000024":277540,"E08000025":1152785,"E08000026":378966,"E08000027":323692,"E08000028":331717,"E08000029":217713,"E08000030":287476,"E08000031":265809,"E08000032":540909,"E08000033":210958,"E08000034":441772,"E08000035":795565,"E08000036":352983,"E08000037":202829,"E09000001":8712,"E09000001-12":294433,"E09000002":214681,"E09000003":399641,"E09000004":249590,"E09000005":335439,"E09000006":334612,"E09000007":271803,"E09000008":387684,"E09000009":340940,"E09000010":335481,"E09000011":292964,"E09000012":285721,"E09000013":189193,"E09000014":271984,"E09000015":250751,"E09000016":261922,"E09000017":309310,"E09000018":272978,"E09000019":244497,"E09000020":156243,"E09000021":177731,"E09000022":329631,"E09000023":308582,"E09000024":206431,"E09000025":358969,"E09000026":305599,"E09000027":198843,"E09000028":324164,"E09000029":206866,"E09000030":332101,"E09000031":280316,"E09000032":331971,"E09000033":264039,"E10000002":545925,"E10000003":657833,"E10000006":499800,"E10000007":806253,"E10000008":811109,"E10000009":430378,"E10000011":560525,"E10000012":1498181,"E10000013":644882,"E10000014":1389256,"E10000015":1192465,"E10000016":1596058,"E10000017":1222979,"E10000018":715117,"E10000019":767332,"E10000020":917736,"E10000021":763001,"E10000023":618904,"E10000024":836913,"E10000025":695890,"E10000027":567662,"E10000028":883511,"E10000029":765899,"E10000030":1196953,"E10000031":581624,"E10000032":871682,"E10000034":601103,"E11000001":2844612,"E11000002":1436356,"E11000003":1419395,"E11000005":2958158,"E11000006":2342186,"E11000007":1142928,"E12000001":2674568,"E12000002":7363337,"E12000003":5528103,"E12000004":4882232,"E12000005":5985916,"E12000006":6277257,"E12000007":9039390,"E12000008":9235982,"E12000009":5691687,"E92000001":56678470,"N09000001":142492,"N09000002":214090,"N09000003":341877,"N09000004":144246,"N09000005":150679,"N09000006":116835,"N09000007":144381,"N09000008":138773,"N09000009":147392,"N09000010":180012,"N09000011":160864,"S08000015":369670,"S08000016":115270,"S08000017":148790,"S08000019":306070,"S08000020":584550,"S08000022":321800,"S08000024":897770,"S08000025":22190,"S08000026":22990,"S08000028":26830,"S08000029":371910,"S08000030":416080,"S08000031":1174980,"S08000032":659200,"S12000005":51400,"S12000006":148790,"S12000008":121840,"S12000010":105790,"S12000011":95170,"S12000013":26830,"S12000014":160340,"S12000017":235540,"S12000018":78150,"S12000019":91340,"S12000020":95520,"S12000021":135280,"S12000023":22190,"S12000026":115270,"S12000027":22990,"S12000028":112550,"S12000029":319020,"S12000030":94330,"S12000033":227560,"S12000034":261470,"S12000035":86260,"S12000036":518500,"S12000038":177790,"S12000039":89130,"S12000040":182140,"S12000041":116040,"S12000042":148750,"S12000045":108330,"S12000047":371910,"S12000048":151290,"S12000049":626410,"S12000050":340180,"W06000001":69961,"W06000002":124178,"W06000003":117181,"W06000004":95330,"W06000005":155593,"W06000006":136126,"W06000008":72992,"W06000009":125055,"W06000010":187568,"W06000011":246466,"W06000012":142906,"W06000013":144876,"W06000014":132165,"W06000015":364248,"W06000016":240131,"W06000018":181019,"W06000019":69713,"W06000020":93049,"W06000021":94142,"W06000022":153302,"W06000023":132447,"W06000024":60183,"W11000023":698369,"W11000024":132447,"W11000025":385615,"W11000028":591225,"W11000029":496413,"W11000030":445190,"W11000031":389372 }
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
						//console.warn('No ID given for row '+i,data[i]);
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
									}
								}
							}else{
								console.warn('No hex for '+code+' and no UTLA lookup');
							}
						}else{
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
			required[id] = true;

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
										q2 = this.queue.splice(q,1);
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