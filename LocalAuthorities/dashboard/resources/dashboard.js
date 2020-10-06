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
						if(typeof lad[la].panels[id][bit].html==="string") v = lad[la].panels[id][bit].html;
						else if(typeof lad[la].panels[id][bit].html==="function") v = lad[la].panels[id][bit].html.call(lad[la],la);
					}
					if(bit == "number"){
						if(typeof v==="number"){
							animateNumber(lad[la].panels[id][bit].el,v,300,'','');
						}else{
							lad[la].panels[id][bit].el.innerHTML = v;
							//if(lad[la].panels[id][bit].fit) window.fitText(lad[la].panels[id][bit].el,0.7,{'len':v.length,'minFontSize':12,'minChar':4});
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
			lad[la].head.querySelector('a').innerHTML = json.name;

			this.displayLA(la);
			var i = 0;
			var n = 0;
			for(l in lad){
				if(typeof lad[l].data==="object") i++;
				n++;
			}
			if(i==n && typeof this.opts.colour==="function") this.opts.colour.call(this,lad);
		}).catch(error => {
			console.error(error,url);
			lad[la] = {};
		});
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
	var start = 5;
	var dashboard = Dashboard({
		'daystoignore': start,
		'panel':{
			'population': [
				{'tagname':'h3','key':'title','html':'Population'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.population||'?'); },'fit':true}
			],
			'total': [
				{'tagname':'h3','key':'title','html':'Total cases'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.data.cases.days){ return ""; } return this.data.cases.days[0].tot; },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return this.data.cases.days[0].date; }}
			],
			'total-percapita': [
				{'tagname':'h3','key':'title','html':'Total cases/100,000'},
				{'tagname':'div','key':'number','html':function(la){ if(!this.data.cases.days){ return ""; } return (this.data.population && this.data.cases.days ? Math.round(this.data.cases.days[0].tot*1e5/this.data.population) : '?'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return this.data.cases.days[0].date; }}
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
			'daily-percapita-graph': [
				{'tagname':'h3','key':'title','html':'Daily cases/100,000<br /><span class="small">Rolling 7-day average. Recent days are under-estimates.</span>'},
				{'tagname':'div','key':'graph','html':function(la){
					url = "svg/"+la+".svg"
					fetch(url,{'method':'GET'})
					.then(response => { return response.text() })
					.then(text => {
						document.querySelector('.'+la+' .graph').innerHTML = text;
					}).catch(error => {
						console.error(error,url);
					});
					
					return "";
				}},
				{'tagname':'div','key':'updated','html':function(la){ if(!this.data.cases.days){ return ""; } return this.data.cases.days[0].date; }}
			],
			'weekly-deaths': [
				{'tagname':'h3','key':'title','html':'Weekly COVID-19 deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.weeks[0].cov : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.weeks[0].txt : '?'); }}
			],
			'total-deaths-covid': [
				{'tagname':'h3','key':'title','html':'Total COVID-19 deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.cov : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.updated : '?'); }}
			],
			'total-deaths-all': [
				{'tagname':'h3','key':'title','html':'Total deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.all : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.weeks.length > 0 ? this.data.deaths.updated : ''); }}
			],
			'total-deaths-pc': [
				{'tagname':'h3','key':'title','html':'Total COVID-19 deaths as a percent of total deaths'},
				{'tagname':'div','key':'number','html':function(la){ return (this.data.deaths.cov > 0 ? Math.round(100*this.data.deaths.cov/this.data.deaths.all)+'%' : '-'); },'fit':true},
				{'tagname':'div','key':'updated','html':function(la){ return (this.data.deaths.cov > 0 ? this.data.deaths.updated : ''); }}
			]
		},
		'colour': function(lad){
			var v,i,cls,la;
			for(la in lad){
				// Use smoothed value
				v = 0;
				if(lad[la].weeks){
					v = (lad[la].data.population ? Math.round((lad[la].weeks[0].total*1e5/lad[la].data.population)/7) : 0);
				}
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
