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
		timeline.getData();
		this.plugins[name].obj = timeline;
		if(this.qs.areas) timeline.setAreas(this.qs.areas);
	}
	
	function TimeLine(opts){
		
		this.id = opts.id;

		this.getData = function(){

			_parent.getData('uk-historic',{
				'this': this,
				'loaded': function(data,attr){
					this.data = data;
					return this.draw(data);
				}
			});

			return this;
		}

		months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
		function getDate(d){ return months[d.getMonth()]+' '+d.getDate(); }

		this.draw = function(data){

			this.maxdate = new Date('2000-01-01');
			this.mindate = new Date('3000-01-01');
			var max = 0;
			var min = 1e100;
			var maxcapita = 0;
			for(var id in data){
				if(data[id]){
					for(d in data[id].days){
						data[id].days[d].percapita = 0;
						if(data[id].population > 0){
							data[id].days[d].percapita = data[id].days[d].cases*1e5/data[id].population;
							if(data[id].days[d].percapita > maxcapita) maxcapita = data[id].days[d].percapita;
						}
					}
					if(data[id].max > max) max = data[id].max;
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
				if(id[0] != previd) html += '<tr style="margin-top:1em;"><td><h3>'+nations[id[0]]+'</h3></td><td>'+getDate(this.mindate)+'<span style="float:right;">'+getDate(this.maxdate)+'</span></td></tr>';
				html += '<tr id="timeline-'+id+'" class="timeline-row">';
				html += '<td class="ntl">'+data[id].name+'</td><td><div class="tl" style="grid-template-columns: repeat('+ndays+', 1fr); ">';
				for(i = 0, d = new Date(mindate); i < ndays; d.setDate(d.getDate() + 1),i++){
					iso = d.toISOString().substr(0,10);
					if(data[id].days[iso]){
						html += '<div class="c" style="background-color:'+Colour.getColourFromScale("Viridis",data[id].days[iso].percapita,0,maxcapita)+'" title="'+iso+': '+Math.round(data[id].days[iso].percapita)+'/100,000 ('+data[id].days[iso].cases+' cases)"></div>';
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
			return this;
		}
		
		this.setAreas = function(areas){
			var tr = this.table.find('.timeline-row');
			if(areas.length > 0){
				var data = {};
				for(var a = 0; a < areas.length; a++){
					data[areas[a]] = this.data[areas[a]];
				}
				this.draw(data);
			}else{
				this.draw(this.data);
			}
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