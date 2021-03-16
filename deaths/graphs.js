function highlightLine(svg,id){

	if(svg && id){
		lines = svg.querySelectorAll('.data-series');
		var match = -1;
		for(i = 0; i < lines.length; i++){
			if(lines[i].getAttribute('id')==id){ lines[i].classList.add('on'); match = i; }
			else lines[i].classList.remove('on');
		}
		// Move series to top
		if(match >= 0){
			lines[match].closest('svg').appendChild(lines[match]);
		}
	}
	return this;
}

function ready(){

	// Add leave events for graphs
	document.querySelectorAll('.graph').forEach(function(e){ e.addEventListener('mouseleave',function(e){ clearTooltip(); }); });

	// Add hover events to circles
	document.querySelectorAll('circle').forEach(function(e){ e.addEventListener('mouseover',function(e){ showTooltip(e.currentTarget); }); });
	
	hi = document.querySelectorAll('svg .key g');
	hi.forEach(function(e){
		e.addEventListener('mouseover',function(e){
			id = e.target.closest('g').getAttribute('id').replace(/-key/,"");
			highlightLine(e.target.closest('svg'),id);
		});
	});

	function clearTooltip(){
		var tooltip = document.getElementById('tooltip');
		if(tooltip) tooltip.remove();
	}

	function showTooltip(el){
		graph = el.closest('.graph');
		var tooltip = document.getElementById('tooltip');
		if(!tooltip){
			tooltip = document.createElement('div');
			tooltip.setAttribute('id','tooltip');
			graph.appendChild(tooltip);
			var _obj = this;
			tooltip.addEventListener('mouseout',function(e){
				//_obj.hideTooltip(e.currentTarget,false);
			});
		}
		// Set the contents
		tooltip.innerHTML = (el.querySelector('title').innerHTML);
		tooltip.setAttribute('class',el.querySelector('title').getAttribute('action'));
		// Position the tooltip
		var bb = el.getBoundingClientRect();	// Bounding box of SVG element
		var bbo = graph.getBoundingClientRect(); // Bounding box of SVG holder
		tooltip.setAttribute('style','position:absolute;left:'+Math.round(bb.left + bb.width/2 - bbo.left + this.graph.scrollLeft)+'px;top:'+Math.round(bb.top + bb.height/2 - bbo.top)+'px;transform:translate3d(-50%,-100%,0);');
		
		return this;
	}

}

function getResource(res){
	var src = res.getAttribute('data');
	fetch(src).then(response => response.text()).then((data) => {

		// Remove the comments
		data = data.replace(/<\!--\?[^>]*\?-->/g,"");
		
		if(src.indexOf('html') >= 0){
			res.innerHTML = data;
		}else{

			// Parse the document
			let parser = new DOMParser();
			doc = parser.parseFromString(data,"application/xml");

			// Get the document
			var dom = doc.activeElement;

			// Add the XML
			res.insertAdjacentElement('beforebegin', dom);

			// Remove original image
			res.parentNode.removeChild(res);
		}
		loaded++;
		if(loaded==toload) ready();
	})
	return;
}

// Parse Jekyll bits if on local filesystem
var blocks = document.getElementsByClassName('jekyll-parse');
for(var i = 0; i < blocks.length; i++){
	html = blocks[i].innerHTML;
	html = html.replace(/\{\% include_relative (.*\.[a-zA-Z]*) \%\}/g,function(m,p1){ return "<div class=\"jekyll-resource\" data=\""+p1+"\"></div>"; });
	blocks[i].innerHTML = html;
}
var rs = document.getElementsByClassName('jekyll-remove');
for(var i = 0; i < rs.length; i++) rs[i].parentNode.removeChild(rs[i]);

var res = document.getElementsByClassName('jekyll-resource');
var toload = res.length;
var loaded = 0;
if(toload == 0) ready();
else{
	for(var i = 0; i < toload; i++) getResource(res[i]);
}


