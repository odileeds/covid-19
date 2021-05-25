(function(root){

	var ODI = root.ODI || {};
	if(!ODI.ready){
		ODI.ready = function(fn){
			// Version 1.1
			if(document.readyState != 'loading') fn();
			else document.addEventListener('DOMContentLoaded', fn);
		};
	}

	var loaded = 0;
	var toload = 0;

	// For local versions
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

	var g;
	ODI.ready(function(){
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
		toload = res.length;
		if(toload == loaded) ready();
		else{
			for(var i = 0; i < toload; i++) getResource(res[i]);
		}

	});


	function highlightLines(v){
		for(i = 0; i < g.length; i++) g[i].classList.remove('on');
		if(v.length > 2){
			for(i = 0; i < g.length; i++){
				txt = g[i].querySelector('text').textContent.toLowerCase();
				if(txt.indexOf(v.toLowerCase())>=0) g[i].classList.add('on');
			}
		}
	}

	function ready(){
		g = document.querySelectorAll('svg g');
		search = document.getElementById('search');
		search.addEventListener('keyup',function(e){ highlightLines(e.target.value); });
		highlightLines(search.value);
	};

	root.ODI = ODI;
})(window || this);
