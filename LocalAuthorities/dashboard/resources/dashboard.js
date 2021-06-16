(function(root){

	var lad = {};

	function Dashboard(opts){
		
		if(!opts) opts = {};
		this.opts = opts;
		if(!this.opts.start) this.opts.start = 2;
		if(this.opts.daystoignore) this.opts.start = this.opts.daystoignore;

		// Define Local Authority Districts
		var str = location.search.substr(1,).replace(/;$/,"");
		
		if(str) las = str.split(/;/);
		else las = [];
		var goodla = [];

		// Only allow IDs that look valid
		if(las.length > 0){
			for(var i = 0; i < las.length; i++){
				if(las[i].indexOf(/^[ENSW][0-9]{8}$/)) goodla.push(las[i]);
			}
		}
		if(goodla.length > 0){
			var container = document.querySelector('#dashboard .grid');
			container.innerHTML = "";
			var i,h2;
			for(var i = 0; i < goodla.length; i++){
				if(goodla[i].indexOf(/^[ENSW][0-9]{8}$/)){
					h2 = document.createElement('h2');
					h2.setAttribute('id',goodla[i]);
					h2.classList.add(goodla[i]);
					h2.classList.add('cell');
					h2.classList.add('row-1');
					h2.classList.add('authority');
					h2.setAttribute("tabindex",0);
					h2.innerHTML = '<a href="https://findthatpostcode.uk/areas/'+goodla[i]+'.html">'+goodla[i]+'</a>';
					container.appendChild(h2);
				}
			}
		}
		var auth = document.querySelectorAll('.authority');

		// Update styles
		var style = document.createElement('style');
		style.innerHTML = ".grid { grid-template-columns: repeat("+auth.length+", 1fr); }";
		for(var i = 0; i < auth.length; i++){
			la = auth[i].getAttribute('id');
			lad[la] = {};
			lad[la].head = auth[i];
			style.innerHTML += '.'+la+' { grid-column: '+(i+1)+' }';
		}
		// Set grid row styling
		i = 0;
		for(var id in this.opts.panel){
			style.innerHTML += '.grid .row-'+(i+2)+' { grid-row: '+(i+2)+'; }';
			i++;
		}
		// Set media styling
		style.innerHTML += '@media only screen and (max-width: 640px) {';
		i = 0;
		for(var i = 0; i < auth.length; i++){
			la = auth[i].getAttribute('id');
			style.innerHTML += '.grid .'+la+' { grid-column: 1; }';
		}
		style.innerHTML += '.grid { grid-template-columns: 1fr;';
		style.innerHTML += '}'
		// append the style to the DOM in <head> section
		document.head.appendChild(style);
		
		// Get death data (from other repo)
		for(var la in lad) this.getDataForLA(la);
		
		return this;
	}

	// Identify panels in DOM and put in loading animations
	Dashboard.prototype.initPanels = function(la){

		var i = 0;
		var existing = document.querySelectorAll('.'+la);

		for(var id in lad[la].panels){
			// Get a copy of the panels
			cpanels = lad[la].panels[id];
			// Update the structure
			lad[la].panels[id] = {'_parent':document.querySelector('.'+la+'.'+id)};

			if(!lad[la].panels[id]._parent){
				// Need to add this panel 
				if(existing.length > 0){
					var panel = document.createElement('div');
					panel.classList.add(la);
					panel.classList.add('cell');
					panel.classList.add('row-'+(i+2));
					panel.classList.add(id);
					panel.classList.add('padded');
					panel.setAttribute('tabindex',0);
					// Append it 
					existing[existing.length-1].insertAdjacentElement('afterend', panel);
					existing = [panel];
					lad[la].panels[id]._parent = panel;
				}
			}
			if(lad[la].panels[id]._parent){
				// Clear any contents
				lad[la].panels[id]._parent.innerHTML = "";
				// Create each area within each panel
				for(var p = 0; p < cpanels.length; p++){
					lad[la].panels[id][cpanels[p].key] = cpanels[p];
					lad[la].panels[id][cpanels[p].key].el = document.createElement(cpanels[p].tagname);
					lad[la].panels[id][cpanels[p].key].el.classList.add(cpanels[p]['key']);
					if(cpanels[p]['class']) lad[la].panels[id][cpanels[p].key].el.classList.add(cpanels[p]['class']);
					if(typeof cpanels[p].html==="string"){
						lad[la].panels[id][cpanels[p].key].el.innerHTML = cpanels[p].html;
					}else if(typeof cpanels[p].html==="function"){
						//lad[la].panels[id][panels[p].key].innerHTML = panels[p].html.call(this,la);
					}
					
					lad[la].panels[id]._parent.append(lad[la].panels[id][cpanels[p].key].el);
					if(cpanels[p]['key'] == "number"){
						// If we have a "number" area, put a loading animation in it
						load = document.createElement('img');
						load.src = "resources/odi.svg";
						load.classList.add('spinner');
						lad[la].panels[id][cpanels[p].key].el.append(load);
					}
				}
			}else{
				console.error("Can't find "+la+"."+id);
			}
			i++;
		}
		return;
	}
	Dashboard.prototype.displayLA = function(la){

		if(!lad[la].data){
			console.error('No JSON for '+la);
			return;
		}
		
		// Work out weekly totals
		if(lad[la].data.cases && lad[la].data.cases.days){
			var latest = new Date(lad[la].data.cases.days[this.opts.start].date);
			var weeks = [{'total':0,'days':0,'upto':lad[la].data.cases.days[this.opts.start].date}];
			for(var i = this.opts.start; i < lad[la].data.cases.days.length; i++){
				d = new Date(lad[la].data.cases.days[i].date);
				w = Math.floor(((latest-d)/86400000)/7);
				if(weeks.length <= w) weeks.push({'total':0,'days':0,'upto':lad[la].data.cases.days[i].date});
				weeks[w].total += lad[la].data.cases.days[i].day;
				weeks[w].days++;
			}
			lad[la].weeks = weeks;
		}

		// Update the panels
		var v,id,bit;
		for(id in lad[la].panels){
			for(bit in lad[la].panels[id]){
				if(bit != "_parent"){
					v = "";
					if(lad[la].panels[id][bit].html){
						if(typeof lad[la].panels[id][bit].html==="string"){
							v = lad[la].panels[id][bit].html;
						}else if(typeof lad[la].panels[id][bit].html==="function"){
							v = lad[la].panels[id][bit].html.call(lad[la],la,{'this':this},function(){ this.header.updateHeaders(); });
						}
					}
					if(bit == "number"){
						if(typeof v==="number"){
							animateNumber(lad[la].panels[id][bit].el,v,300,'','');
						}else{
							lad[la].panels[id][bit].el.innerHTML = v;
						}
					}else{
						lad[la].panels[id][bit].el.innerHTML = v;
					}
					if(lad[la].panels[id][bit].fit) window.fitText(lad[la].panels[id][bit].el,0.7,{'len':(formatNumber(v)+"").length,'minFontSize':12,'minChar':4});
				}
			}
		}

		return this;
	}
	
	Dashboard.prototype.done = function(lad){

		if(typeof this.opts.colour==="function") this.opts.colour.call(this,lad);

		// Create the header
		this.header = new Header('section.grid h2');

		return this;
	}

	Dashboard.prototype.getDataForLA = function(la){
		url = "data/{{LA}}.json";
		url = url.replace(/\{\{LA\}\}/,la);
		lad[la].url = url;
		lad[la].panels = clone(this.opts.panel);

		this.initPanels(la);
		
		console.info('Getting data for '+la+' from '+url);
		return fetch(url,{'method':'GET'})
		.then(response => { return response.json() })
		.then(json => {
			lad[la].data = json;
			lad[la].head.querySelector('a').innerHTML = (this.opts.head ? (typeof this.opts.head.html==="function" ? this.opts.head.html.call(this,lad[la]) : (typeof this.opts.head.html==="string" ? this.opts.head.html : '?')) : json.name);

			this.displayLA(la);
			var i = 0;
			var n = 0;
			for(l in lad){
				if(typeof lad[l].data==="object") i++;
				n++;
			}
			if(i==n) this.done(lad);
		}).catch(error => {
			console.error(error,url);
			lad[la] = {};
		});
	}

	function Header(str){
		var headings = document.querySelectorAll(str);
		this.headings = new Array(headings.length);
		// Create a fake section for the header
		this.header = document.createElement('section');
		this.header.classList.add('fixed');
		this.header.classList.add('grid');
		this.header.classList.add('doublepadded');
		this.header.classList.add('b6-bg');
		this.header.style.setProperty('display','none');
		document.body.insertBefore(this.header, document.body.firstChild);

		var h,id;
		for(h = 0; h < headings.length; h++){
			id = headings[h].getAttribute('id');
			this.headings[h] = {'orig':headings[h],'id':id};
			// Clone the heading and remove the ID
			this.headings[h].el = headings[h].cloneNode(true);
			this.headings[h].el.removeAttribute('id');
			this.headings[h].el.style.setProperty('display','none');
			this.header.appendChild(this.headings[h].el);
		}
		var _obj = this;

		// Detect vertical scroll position
		window.addEventListener('scroll', function(e){ _obj.update(); });
		// Detect vertical scroll position
		window.addEventListener('resize', function(e){
			console.log('resize');
			_obj.updateHeaders();
			_obj.update();
		});
		this.updateHeaders();
		this.update();
		return this;
	}

	Header.prototype.updateHeaders = function(){
		for(var h = 0; h < this.headings.length; h++){
			id = this.headings[h].id
			this.updateHeader(id);
		}
		return this;
	}

	Header.prototype.updateHeader = function(la){
		for(var h = 0; h < this.headings.length; h++){
			id = this.headings[h].id
			if(this.headings[h].id == la){
				panels = document.querySelectorAll('.'+id);
				this.headings[h].top = this.headings[h].orig.offsetTop;
				this.headings[h].bottom = panels[panels.length-1].offsetTop+panels[panels.length-1].offsetHeight;
			}
		}
		return this;
	}

	Header.prototype.update = function(){
		var nvis = 0;
		for(var i = 0; i < this.headings.length; i++){
			// It is in the page if it has a parent
			// this.headings[i].el.parent
			// Should the heading be visible?
			visible = false;
			if(typeof this.headings[i].top==="number" && typeof this.headings[i].bottom==="number"){
				if(window.scrollY > this.headings[i].top && window.scrollY < this.headings[i].bottom){
					visible = true;
				}
			}
			if(visible) nvis++;
			headvis = (window.getComputedStyle(this.headings[i].el).getPropertyValue('display')!="none");
			if(visible && !headvis){
				// Need to show heading
				this.headings[i].el.style.setProperty('display','');
			}else if(!visible && headvis){
				// Need to hide heading
				this.headings[i].el.style.setProperty('display','none');
			}

		}
		// If the header contains nothing we hide it
		this.header.style.setProperty('display',(nvis > 0 ? '':'none'));
		return this;
	}
	// shim layer with setTimeout fallback
	window.requestAnimFrame = (function(){
		return  window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function( callback ){ window.setTimeout(callback, 1000 / 60); };
	})();

	function formatNumber(v){
		if(typeof v !== "number") return v;
		if(v > 1e7) return Math.round(v/1e6)+"M";
		if(v > 1e6) return (v/1e6).toFixed(1)+"M";
		if(v > 1e5) return Math.round(v/1e3)+"k";
		if(v > 1e4) return Math.round(v/1e3)+"k";
		return v;
	}
	function animateNumber(el,val,duration,pre,post,callback){
		if(typeof val!=="number"){
			val = el.innerHTML;
			if(val) val = parseFloat(val);
			el.innerHTML = '';
		}
		el.innerHTML = '';
		if(!pre) pre = "";
		if(!post) post = "";
		var start = new Date();
		var v;
		function frame(){
			var now = new Date();
			// Set the current time in seconds
			var f = (now - start)/duration;
			if(f < 1){
				v = formatNumber(Math.round(val*f));
				el.innerHTML = (pre+v+post);
				requestAnimFrame(frame);
			}else{
				el.innerHTML = (pre+formatNumber(val)+post);
				if(typeof callback==="function") callback.call(el);
			}
		}
		if(typeof val==="number") frame();
		return;			
	}

	window.Dashboard = function(opts){
		return new Dashboard(opts);
	}

})(window || this);

function ready(f){
	if(/in/.test(document.readyState)) setTimeout('ready('+f+')',9);
	else f();
};

ready(function(){

	function getDateOfONSWeek(s){
		var a = s.split('-W');
		y = parseInt(a[0]);
		w = parseInt(a[1]);
		var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week
		d = new Date(y,0,d,12);	// Use midday to avoid timezone issues with BST/GMT
		dow = d.getDay();
		if(dow < 5) d.setDate(d.getDate() - d.getDay() + 5)
		else d.setDate(d.getDate() + 7 - d.getDay() + 5);
		return d;
	}
	function getDateOfWeek(w, y){
		var d = (1 + (w - 1) * 7); // 1st of January + 7 days for each week
		return new Date(y, 0, d);
	}
	function getDateOfISOWeek(w, y) {
		var simple = new Date(y, 0, 1 + (w - 1) * 7);
		console.log(simple)
		var dow = simple.getDay();
		var ISOweekStart = simple;
		if(dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
		else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
		return ISOweekStart;
	}
	var start = 5;
	var dashboard = Dashboard({
		'daystoignore': start,
		'panel':{
			'daily-percapita-graph': [
				{'tagname':'h3','key':'title','html': 'Daily cases/100,000<br /><span class="small">Rolling 7-day average</span>'},
				{'tagname':'div','key':'number','html':function(la){
					var v = 0;
					// Smooth the value using a 7-day rolling average
					for(var i = start-3; i <= start+3; i++) v += this.data.cases.days[i].day;
					return Math.round((v/7)*1e5/this.data.population);
				},'fit':true},
				{'tagname':'div','key':'graph','html':function(la,props,callback){
					url = "svg/"+la+".svg";
					if(this.data.cases.days){
						fetch(url,{'method':'GET'})
						.then(response => { return response.text() })
						.then(text => {
							document.querySelector('.'+la+' .graph').innerHTML = text;
							if(typeof callback==="function") callback.call((props['this']||this),props);
						}).catch(error => {
							console.error(error,url);
						});
					}else{
						if(typeof callback==="function") callback.call((props['this']||this),props);
					}
					
					return "";
				}},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return 'Value as of '+this.data.cases.days[start].date+'. Data last updated on '+this.data.cases.updated+'. <a href="svg/'+la+'.svg">Graph for '+this.data.name+'</a>. <a href="#notes">See notes</a>.'; }}
			],
			'total': [
				{'tagname':'h3','key':'title','html':'Total cases'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.data.cases.days){ return ""; } return this.data.cases.days[0].tot; },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return 'Up to '+this.data.cases.days[0].date; }}
			],
			'total-percapita': [
				{'tagname':'h3','key':'title','html':'Total cases/100,000'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.data.cases.days){ return ""; } return (this.data.population && this.data.cases.days ? Math.round(this.data.cases.days[0].tot*1e5/this.data.population) : '?'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return 'Up to '+this.data.cases.days[0].date; }}
			],
			'weekly': [
				{'tagname':'h3','key':'title','html':'Weekly cases<br/><span class="small">Ignoring most recent '+start+' days</small>'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.weeks){ return ""; } return (this.weeks && this.weeks[0].days == 7 ? this.weeks[0].total : ''); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.weeks){ return ""; } return (this.weeks ? 'Up to '+this.weeks[0].upto : ''); }}
			],
			'weekly-change': [
				{'tagname':'h3','key':'title','html':'Change on previous week<br/><span class="small">Ignoring most recent '+start+' days</small>'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.weeks){ return ""; } var diff = (this.weeks ? this.weeks[0].total - this.weeks[1].total : 0); return (this.weeks && this.weeks[0].days==7 && this.weeks[1].days==7 ? (diff < 0 ? '':'+')+diff : ''); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.weeks){ return ""; } return (this.weeks[0].days==7 && this.weeks[1].days==7 ? this.weeks[0].upto+' vs '+this.weeks[1].upto : "Missing data"); }}
			],
			'weekly-percapita': [
				{'tagname':'h3','key':'title','html':'Weekly cases/100,000<br/><span class="small">Ignoring most recent '+start+' days</small>'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.weeks){ return ""; } return (this.weeks && this.weeks[0].days == 7 && this.data.population ? Math.round(this.weeks[0].total*1e5/this.data.population) : ''); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.weeks){ return ""; } return (this.weeks ? 'Up to '+this.weeks[0].upto : '?'); }}
			],
			'vaccines-all': [
				{'tagname':'h3','key':'title','html':'Vaccines<br /><span class="small">1st dose / 2nd dose</span>'},
				{'tagname':'div','key':'number','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					return (this.data.population && this.data.vaccines.totals ? Math.round(this.data.vaccines.totals[0].ages['all']['1st %'])+'% / '+Math.round(this.data.vaccines.totals[0].ages['all']['2nd %'])+'%' : '?');
				},'fit':true},
				{'tagname':'div','key':'graph','html':function(la){
					console.log(this.data.vaccines.totals[0]);
					var n = 0;
					for(var a in this.data.vaccines.totals[0].ages) n++;
					var str = '<div class="progress">';
					for(var a in this.data.vaccines.totals[0].ages){
						w = this.data.vaccines.totals[0].ages[a];
						str += '<span class="label">'+(a)+'</span><div class="bar"><div style="height:1em;width:'+this.data.vaccines.totals[0].ages[a]['1st %']+'%" title="1st dose: '+this.data.vaccines.totals[0].ages[a]['1st %']+'%" tabindex="0"></div><div style="height:1em;opacity:0.8;width:'+this.data.vaccines.totals[0].ages[a]['2nd %']+'%" title="2nd dose: '+this.data.vaccines.totals[0].ages[a]['2nd %']+'%" tabindex="0"></div></div>';
					}
					str += '</div>';
					return str;
				},'fit':true},
				{'tagname':'div','key':'updated','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					var d = new Date(this.data.vaccines.totals[0].date); d.setDate(d.getDate() - 4);
					return 'Up to '+d.toISOString().substr(0,10);
				}}
			],
			'vaccines-65': [
				{'tagname':'h3','key':'title','html':'Vaccines (65+)<br/><span class="small">1st dose</span>'},
				{'tagname':'div','key':'number','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					var t = 0;
					var p = 0;
					if(this.data.vaccines.totals && this.data.vaccines.totals.length > 0){
						for(a in this.data.vaccines.totals[0].ages){
							if(a.match(/[0-9]/)){
								a.replace(/^([0-9]+)-([0-9]+)/,function(m,p1,p2){ s = p1; e = p2; });
								if(s >= 65){
									t += this.data.vaccines.totals[0].ages[a]['1st'];
									p += this.data.vaccines.totals[0].ages[a].pop;
								}
							}
						}
					}
					return (this.data.vaccines.totals ? Math.round(100*t/p)+'%' : '?');
				},'fit':true},
				{'tagname':'div','key':'updated','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					var d = new Date(this.data.vaccines.totals[0].date); d.setDate(d.getDate() - 4);
					return 'Up to '+d.toISOString().substr(0,10);
				}}
			],
			'vaccines-under65': [
				{'tagname':'h3','key':'title','html':'Vaccines (under 65)<br/><span class="small">1st dose</span>'},
				{'tagname':'div','key':'number','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					var t = 0;
					var p = 0;
					if(this.data.vaccines.totals){
						for(a in this.data.vaccines.totals[0].ages){
							if(a.match(/[0-9]/)){
								a.replace(/^([0-9]+)-([0-9]+)/,function(m,p1,p2){ s = p1; e = p2; });
								if(s < 65){
									t += this.data.vaccines.totals[0].ages[a]['1st'];
									p += this.data.vaccines.totals[0].ages[a].pop;
								}
							}
						}
					}
					return (this.data.vaccines.totals ? Math.round(100*t/p)+'%' : '?');
				},'fit':true},
				{'tagname':'div','key':'updated','html':function(la){
					if(!this.data.vaccines.totals || this.data.vaccines.totals.length == 0){ return ""; }
					var d = new Date(this.data.vaccines.totals[0].date); d.setDate(d.getDate() - 4);
					return 'Up to '+d.toISOString().substr(0,10);
				}}
			],
			'weekly-deaths': [
				{'tagname':'h3','key':'title','html':'Weekly COVID-19 deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.weeks[0].cov : '-'); },'fit':true},
				{'tagname':'div','key':'graph','html':function(la){
					var str = '<div class="barchart" style="grid-template-columns: repeat('+this.data.deaths.weeks.length+', 1fr);">';
					var mx = -1e100;
					for(var i = 0; i < this.data.deaths.weeks.length; i++) mx = Math.max(mx,this.data.deaths.weeks[i].cov);

					var tall = 150;
					for(var i = this.data.deaths.weeks.length-1; i >= 0 ; i--){
						wk = parseInt(this.data.deaths.weeks[i].txt.replace(/Week 0?/,""));
						h = Math.round(tall*this.data.deaths.weeks[i].cov/mx);
						h2 = tall-h;
						d = getDateOfONSWeek(this.data.deaths.weeks[i].txt);
						str += '<div class="col" style="height:'+tall+'px;"><div class="antibar" style="height:'+h2+'px;"></div><div class="bar" style="height:'+h+'px;"><span class="label" style="">'+(this.data.deaths.weeks[i].txt)+': '+this.data.deaths.weeks[i].cov+'<br />(week ending '+d.toISOString().substr(0,10)+')</span></div></div>';
					}
					str += '</div>';
					return str;
				},'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return 'Weekly totals up to '+(this.data.deaths.weeks.length > 0 ? getDateOfONSWeek(this.data.deaths.weeks[0].txt).toISOString().substr(0,10) : '?'); }}
			],
			'weekly-deaths-percapita': [
				{'tagname':'h3','key':'title','html':'Weekly COVID-19 deaths/100,000'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? (this.data.deaths.weeks[0].cov*(this.data.population ? 1e5/this.data.population : 1)).toFixed(1) : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return 'Weekly totals up to '+(this.data.deaths.weeks.length > 0 ? getDateOfONSWeek(this.data.deaths.weeks[0].txt).toISOString().substr(0,10) : '?'); }}
			],
			'total-deaths-covid': [
				{'tagname':'h3','key':'title','html':'Total COVID-19 deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.cov : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.weeks.length > 0 ? 'Up to '+getDateOfONSWeek(this.data.deaths.updated).toISOString().substr(0,10) : '?'); }}
			],
			'total-deaths-all': [
				{'tagname':'h3','key':'title','html':'Deaths from all causes'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.all : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.weeks.length > 0 ? 'Up to '+getDateOfONSWeek(this.data.deaths.updated).toISOString().substr(0,10) : ''); }}
			],
			'total-deaths-pc': [
				{'tagname':'h3','key':'title','html':'Total COVID-19 deaths as a percent of total deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.cov > 0 ? Math.round(100*this.data.deaths.cov/this.data.deaths.all)+'%' : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.cov > 0 ? 'Up to '+getDateOfONSWeek(this.data.deaths.updated).toISOString().substr(0,10) : ''); }}
			],
			'population': [
				{'tagname':'h3','key':'title','html':'Population'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.population||'?'); }}
			],
			'src': [
				{'tagname':'h3','key':'title','html':'Data'},
				{'tagname':'div','key':'number','html':function(la){ return '<a href="data/'+la+'.json">JSON file</a>'; }}
			]
		},
		'head': {'html':function(lad){
			return lad.data.name;
		}},
		'colour': function(lad){
			var v,i,cls,la;
			for(la in lad){
				// Smooth the value using a 7-day rolling average
				var v = 0;
				for(var i = start-3; i <= start+3; i++) v += lad[la].data.cases.days[i].day;
				v = Math.round((v/7)*1e5/lad[la].data.population);

				panels = document.querySelectorAll('.'+la);
				for(i = 0; i < panels.length; i++){
					cls = "";
					// Definitions from https://covid19.ca.gov/safer-economy/
					if(v >= 7) cls = "widespread";
					else if(v >= 4 && v < 7) cls = "substantial";
					else if(v >= 1 && v < 4) cls = "moderate";
					else cls = "minimal";
					if(cls) panels[i].classList.add(cls);
				}
			}
			return;
		}
	});
});
