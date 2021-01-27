(function(root){

	if(!root.ODI) root.ODI = {};

	root.ODI.ready = function(f){
		if(/in/.test(document.readyState)) setTimeout('ODI.ready('+f+')',9);
		else f();
	};

	if(!root.ODI.ajax){
		function AJAX(url,opt){
			if(!opt) opt = {};
			var req = new XMLHttpRequest();
			var responseTypeAware = 'responseType' in req;
			if(responseTypeAware && opt.dataType) req.responseType = opt.dataType;
			req.open((opt.method||'GET'),url+(opt.cache ? '?'+Math.random() : ''),true);
			req.onload = function(e){
				if(this.status >= 200 && this.status < 400) {
					// Success!
					var resp = this.response;
					if(typeof opt.success==="function") opt.success.call((opt['this']||this),resp,{'data':opt,'originalEvent':e});
				}else{
					// We reached our target server, but it returned an error
					if(typeof opt.error==="function") opt.error.call((opt['this']||this),e);
				}
			};
			if(typeof opt.error==="function"){
				// There was a connection error of some sort
				req.onerror = function(err){ opt.error.call((opt['this']||this),err); };
			}
			req.send();
			return this;
		}
		ODI.ajax = AJAX;
	}

	ODI.ready(function(){
		function parseHTML(str) {
			var tmp = document.implementation.createHTMLDocument();
			tmp.body.innerHTML = str;
			return tmp.body.children;
		}
		var im = document.querySelectorAll('img.svg');
		var img = new Array(im.length);
		for(var i = 0; i < im.length; i++){
			ODI.ajax(im[i].src,{
				"dataType": "xml",
				"el": im[i],
				"success":function(svg,attr){
					// Replace <img> with <svg>
					svg = parseHTML(svg)[0];
					div = document.createElement('div');
					div.classList.add('map');
					div.appendChild(svg);
					attr.data.el.insertAdjacentElement('afterend', div);
					attr.data.el.remove();
					// Now add functions
					paths = svg.querySelectorAll('path');
					for(p = 0; p < paths.length; p++){
						paths[p].addEventListener('mouseover', function(e){
							a = e.target.closest('svg').querySelector('.active');
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
							return true;
						});
					}
				}
			});
		}
	});

})(window || this);
