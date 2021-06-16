/*!
	Dashboard plugin to show a timeline of cases in the style of the one at https://www.ft.com/coronavirus-latest
	Written by Stuart Lowe (ODI Leeds)
 */
(function(S){

	var name = "timeline";
	var _parent;

	function init(){
		_parent = this;
		var timeline = new TimeLine({'id':'timeline'});
		this.plugins[name].obj = timeline;
		timeline.getData();
		if(this.qs.areas) timeline.setAreas(this.qs.areas);
	}
	
	function TimeLine(opts){
		
		this.id = opts.id;
		this.areas = [];

		this.getData = function(){

			_parent.getData('uk-historic',{
				'this': this,
				'loaded': function(data,attr){
					this.data = data;
					return this.draw();
				}
			});

			return this;
		}
		this.key = {'type':'percapita'};

		months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		function getDate(d){ return months[d.getMonth()]+' '+d.getDate(); }

		_parent.on('colourscale',{this:this},function(e){ this.draw(); });
		_parent.on('changeareas',{this:this},function(e){ this.setAreas(e.areas); });
		_parent.on('load',{this:this},function(e){
			// Define a function to display the scalebar
			this.buildScale = function(r){
				var html = "";
				// Update the key
				if(r && r.max > -1e100) html = '<div class="bar" style="background:linear-gradient(to right, '+Colour.getColourScale(_parent.qs.colourscale||"Viridis")+');"></div><div class="range"><span class="min">'+Math.round(r.min)+'</span><span class="max">'+Math.round(r.max)+(_parent.qs.hextype=="COVID-19-percapita" ? '/'+(1e5).toLocaleString() : '')+'</span></div>';
				S('#timeline .key').html(html);
				return this;
			};
			this.draw();
		});
		_parent.on("type",{this:this},function(e){
			if(!e.hextype) e.hextype = "COVID-19-cases";
			if(e.hextype) e.hextype = e.hextype.replace('COVID-19-','');
			this.key.type = e.hextype;
			if(this.key.type=="cases"){
				this.key.yaxis = "Cumulative confirmed cases";
			}else if(this.key.type=="percapita"){
				this.key.yaxis = "Cumulative cases per 100,000";
			}
			this.draw();
			return this;
		});

		this.draw = function(){

			if(this.areas && this.areas.length > 0){
				var data = {};
				for(var a = 0; a < this.areas.length; a++){
					data[this.areas[a]] = this.data[this.areas[a]];
				}
				d = data;
			}else{
				d = this.data;
			}

			var d,id,max,min;
			data = {};
			for(id in d){
				if(d[id] && !d[id].added) data[id] = d[id];
			}

			this.maxdate = new Date('2000-01-01');
			this.mindate = new Date('3000-01-01');
			max = -1e100;
			min = 0;
			
			for(id in data){
				if(data[id]){
					for(d in data[id].days){
						if(data[id].days[d][this.key.type] > max) max = data[id].days[d][this.key.type];
					}
					if(data[id].maxdate > this.maxdate) this.maxdate = data[id].maxdate;
					if(data[id].mindate < this.mindate) this.mindate = data[id].mindate;
				}
			}
			var ndays = (Math.round(this.maxdate-this.mindate)/86400000)+1;
			var html = '<table class="timeline">';
			var mindate = this.mindate.toISOString().substr(0,10)+'T12:00Z';

			var keys = Object.keys(data).sort(function(a,b){
				if(a[0] == b[0]) return data[a].name > data[b].name
				else return a[0] > b[0];
			});

			var nations = {'E':'England','N':'Northern Ireland','S':'Scotland','W':'Wales'};
			previd = "";
			for(var j = 0; j < keys.length; j++){
				id = keys[j];
				
				if(id[0] != previd) html += '<tr class="header-row"><td><h3>'+nations[id[0]]+'</h3></td><td><div class="key">Key</div><div class="daterange">'+getDate(this.mindate)+'<span style="float:right;">'+getDate(this.maxdate)+'</span></div></td></tr>';
				html += '<tr id="timeline-'+id+'" class="timeline-row'+(id[0] != previd ? ' first-row' : '')+'">';
				html += '<td class="ntl">'+data[id].name+'</td><td><div class="tl" style="grid-template-columns: repeat('+ndays+', 1fr); ">';
				for(i = 0, d = new Date(mindate); i < ndays; d.setDate(d.getDate() + 1),i++){
					iso = d.toISOString().substr(0,10);
					if(data[id].days[iso]){
						html += '<div class="c" style="background-color:'+Colour.getColourFromScale((_parent.qs.colourscale||"Viridis"),data[id].days[iso][this.key.type],0,max)+'" title="'+iso+': '+Math.round(data[id].days[iso].percapita)+'/100,000 ('+data[id].days[iso].cases+' cases)"></div>';
					}else{
						html += '<div class="c"></div>'
					}
				}
				html += '</div></td></tr>';
				previd = id[0];
			}
			html += '</table>';
			
			S('#'+this.id).html(html);
			this.table = S('#'+this.id).find('.timeline');
			
			if(typeof this.buildScale==="function") scale = this.buildScale.call(this,{'min':min,'max':max});

			return this;
		}
		

		this.setAreas = function(areas){
			this.areas = areas;
			var tr = this.table.find('.timeline-row');
			this.draw();
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