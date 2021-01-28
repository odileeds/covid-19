(function(root){

	if(!root.ODI) root.ODI = {};

	root.ODI.ready = function(f){
		if(/in/.test(document.readyState)) setTimeout('ODI.ready('+f+')',9);
		else f();
	};

	ODI.ready(function(){
		function parseHTML(str) {
			var tmp = document.implementation.createHTMLDocument();
			tmp.body.innerHTML = str;
			return tmp.body.children;
		}
		function highlight(e){
			a = document.querySelector('svg .active');
			if(a) a.classList.remove('active');
			// Simulate z-index by moving target
			e.target.closest('svg').appendChild(e.target);
			e.target.classList.add('active');
			
			container = e.target.closest('.map');
			tooltips = document.querySelectorAll('.tooltip');
			if(tooltips){
				for(i = 0 ; i < tooltips.length; i++) tooltips[i].parentNode.removeChild(tooltips[i]);
			}
			data = e.target.closest('svg').getAttribute('data');
			key = "data-"+data.replace(/ /g,"-").replace(/[^a-zA-Z0-9\-]/g,"").toLowerCase();
			tooltip = document.createElement('div');
			tooltip.id = "tooltip";
			tooltip.innerHTML = e.target.getAttribute('data-stp20nm')+"<br />"+parseFloat(e.target.getAttribute(key)).toLocaleString()+(key.indexOf('pc')>0 ? '%' : '');
			tooltip.classList.add('tooltip');
			e.target.closest('div').appendChild(tooltip);
			bb = e.target.getBoundingClientRect();
			sv = e.target.closest('svg').getBoundingClientRect();
			tooltip.style.position = "absolute";
			tooltip.style.left = Math.round(bb.left+(bb.width/2)-sv.left)+'px';
			tooltip.style.top = Math.round(bb.top+bb.height-sv.top)+'px';
		}
		var im = document.querySelectorAll('svg');
		var img = new Array(im.length);
		for(var i = 0; i < im.length; i++){
			// Now add functions
			paths = im[i].querySelectorAll('path');
			for(p = 0; p < paths.length; p++){
				paths[p].addEventListener('mouseover', highlight);
				paths[p].addEventListener('click', highlight);
			}
		}
	});

})(window || this);
