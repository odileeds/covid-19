/*!
 * stuQuery
 */
(function(root){

	var eventcache = {};

	function stuQuery(els){
		// Make our own fake, tiny, version of jQuery simulating the parts we need
		this.stuquery = "1.0.26";

		this.getBy = function(e,s){
			var i,m,k;
			i = -1;
			var result = [];
			if(s.indexOf(':eq') > 0){
				m = s.replace(/(.*)\:eq\(([0-9]+)\)/,'$1 $2').split(" ");
				s = m[0];
				i = parseInt(m[1]);
			}
			if(s[0] == '.') els = e.getElementsByClassName(s.substr(1));
			else if(s[0] == '#') els = e.getElementById(s.substr(1));
			else els = e.getElementsByTagName(s);
			if(!els) els = [];
			// If it is a select field we don't want to select the options within it
			if(els.nodeName && els.nodeName=="SELECT") result.push(els);
			else{
				if(typeof els.length!=="number") els = [els];
				for(k = 0; k < els.length; k++){ result.push(els[k]); }
				if(i >= 0 && result.length > 0){
					if(i < result.length) result = [result[i]];
					else result = [];
				}
			}
			return result;
		};
		this.matchSelector = function(e,s){
			// Does this one element match the s
			if(s[0] == '.'){
				s = s.substr(1);
				for(var i = 0; i < e.classList.length; i++) if(e.classList[i] == s) return true;
			}else if(s[0] == '#'){
				if(e.id == s.substr(1)) return true;
			}else{
				if(e.tagName == s.toUpperCase()) return true;
			}
			return false;
		};
		if(typeof els==="string") this.e = this.querySelector(document,els);
		else if(typeof els==="object") this.e = (typeof els.length=="number") ? els : [els];
		for(var it in this.e){
			if(this.e[it]) this[it] = this.e[it];
		}
		this.length = (this.e ? this.e.length : 0);

		return this;
	}
	stuQuery.prototype.querySelector = function(els,selector){
		var result = [];
		var a,els2,i,j,k,tmp;
		if(selector.indexOf(':eq') >= 0){
			a = selector.split(' ');
			for(i = 0; i < a.length; i++){
				if(i==0){
					tmp = this.getBy(els,a[i]);
				}else{
					els2 = [];
					for(j = 0; j < tmp.length; j++) els2 = els2.concat(this.getBy(tmp[j],a[i]));
					tmp = els2.splice(0);
				}
			}
		}else tmp = els.querySelectorAll(selector);					// We can use the built-in selector
		for(k = 0; k < tmp.length; k++){ result.push(tmp[k]); }
		return result;
	};
	stuQuery.prototype.ready = function(f){
		if(/in/.test(document.readyState)) setTimeout('S(document).ready('+f+')',9);
		else f();
	};
	stuQuery.prototype.html = function(html){
		// Return HTML or set the HTML
		if(typeof html==="number") html = ''+html;
		if(typeof html!=="string" && this.length == 1) return this[0].innerHTML;
		if(typeof html==="string") for(var i = 0; i < this.length; i++) this[i].innerHTML = html;
		return this;
	};
	stuQuery.prototype.append = function(html){
		if(!html && this.length == 1) return this[0].innerHTML;
		if(html){
			for(var i = 0; i < this.length; i++){
				var d = document.createElement('template');
				d.innerHTML = html;
				var c = (typeof d.content==="undefined" ? d : d.content);
				if(c.childNodes.length > 0) while(c.childNodes.length > 0) this[i].appendChild(c.childNodes[0]);
				else this[i].append(html);
			}
		}
		return this;	
	};
	stuQuery.prototype.prepend = function(t){
		var i,j,d,e;
		if(!t && this.length==1) return this[0].innerHTML;
		for(i = 0 ; i < this.length ; i++){
			d = document.createElement('div');
			d.innerHTML = t;
			e = d.childNodes;
			for(j = e.length-1; j >= 0; j--) this[i].insertBefore(e[j], this[i].firstChild);
		}
		return this;
	};
	stuQuery.prototype.before = function(t){
		var i,d,e,j;
		for(i = 0 ; i < this.length ; i++){
			d = document.createElement('div');
			d.innerHTML = t;
			e = d.childNodes;
			for(j = 0; j < e.length; j++) this[i].parentNode.insertBefore(e[j], this[i]);
		}
		return this;
	};
	stuQuery.prototype.after = function(t){
		for(var i = 0 ; i < this.length ; i++) this[i].insertAdjacentHTML('afterend', t);
		return this;
	};
	function NodeMatch(a,el){
		if(a && a.length > 0){
			for(var i = 0; i < a.length; i++){
				if(a[i].node == el) return {'success':true,'match':i};
			}
		}
		return {'success':false};
	}
	function storeEvents(e,event,fn,fn2,data){
		if(!eventcache[event]) eventcache[event] = [];
		eventcache[event].push({'node':e,'fn':fn,'fn2':fn2,'data':data});
	}
	function getEvent(e){
		if(eventcache[e.type]){
			var m = NodeMatch(eventcache[e.type],e.currentTarget);
			if(m.success){
				if(m.match.data) e.data = eventcache[e.type][m.match].data;
				return {'fn':eventcache[e.type][m.match].fn,'data':e};
			}
		}
		return function(){ return {'fn':''}; };
	}
	stuQuery.prototype.off = function(event){
		// Try to remove an event with attached data and supplied function, fn.

		// If the remove function doesn't exist, we make it
		if(typeof Element.prototype.removeEventListener !== "function"){
			Element.prototype.removeEventListener = function (sEventType, fListener /*, useCapture (will be ignored!) */) {
				if (!oListeners.hasOwnProperty(sEventType)) { return; }
				var oEvtListeners = oListeners[sEventType];
				for (var nElIdx = -1, iElId = 0; iElId < oEvtListeners.aEls.length; iElId++) {
					if (oEvtListeners.aEls[iElId] === this) { nElIdx = iElId; break; }
				}
				if (nElIdx === -1) { return; }
				for (var iLstId = 0, aElListeners = oEvtListeners.aEvts[nElIdx]; iLstId < aElListeners.length; iLstId++) {
					if (aElListeners[iLstId] === fListener) { aElListeners.splice(iLstId, 1); }
				}
			};
		}
		for(var i = 0; i < this.length; i++){
			var m = NodeMatch(eventcache[event],this.e[i]);
			if(m.success){
				this[i].removeEventListener(event,eventcache[event][m.match].fn2,false);
				eventcache[event].splice(m.match,1);
			}
		}
		return this;
	};
	stuQuery.prototype.on = function(event,data,fn){
		// Add events
		var events = (event || window.event).split(/ /);
		if(typeof data==="function" && !fn){
			fn = data;
			data = "";
		}
		if(typeof fn !== "function") return this;

		if(this.length > 0){
			var _obj = this;
			var f;
			for(var ev = 0; ev < events.length; ev++){
				event = events[ev];
				f = function(b){
					var e = getEvent({'currentTarget':this,'type':event,'data':data,'originalEvent':b,'preventDefault':function(){ if(b.preventDefault) b.preventDefault(); },'stopPropagation':function(){
						if(b.stopImmediatePropagation) b.stopImmediatePropagation();
						if(b.stopPropagation) b.stopPropagation();
						if(b.cancelBubble!=null) b.cancelBubble = true;
					}});
					if(typeof e.fn === "function") return e.fn.call(_obj,e.data);
				};
				for(var i = 0; i < this.length; i++){
					storeEvents(this[i],event,fn,f,data);
					if(this[i].addEventListener) this[i].addEventListener(event, f, false); 
					else if(this[i].attachEvent) this[i].attachEvent(event, f);
				}
			}
		}
		return this;
	};
	stuQuery.prototype.trigger = function(e){
		var event; // The custom event that will be created
		var events = e.split(/ /);

		for(var ev = 0; ev < events.length; ev++){
			if(document.createEvent) {
				event = document.createEvent("HTMLEvents");
				event.initEvent(events[ev], true, true);
			}else{
				event = document.createEventObject();
				event.eventType = events[ev];
			}

			event.eventName = e;

			for(var i = 0 ;  i < this.length ; i++){
				if(document.createEvent) this[i].dispatchEvent(event);
				else this[i].fireEvent("on" + event.eventType, event);
			}
		}

		return this;
	};
	stuQuery.prototype.focus = function(){
		// If there is only one element, we trigger the focus event
		if(this.length == 1) this[0].focus();
		return this;
	};
	stuQuery.prototype.blur = function(){
		// If there is only one element, we trigger the blur event
		if(this.length == 1) this[0].blur();
		return this;
	};
	stuQuery.prototype.remove = function(){
		// Remove DOM elements
		if(this.length < 1) return this;
		for(var i = this.length-1; i >= 0; i--){
			if(!this[i]) return;
			if(typeof this[i].remove==="function") this[i].remove();
			else if(typeof this[i].parentElement.removeChild==="function") this[i].parentElement.removeChild(this[i]);
		}
		return this;
	};
	stuQuery.prototype.hasClass = function(cls){
		// Check if a DOM element has the specified class
		var i,c;
		var result = true;
		for(i = 0; i < this.length; i++){
			c = this[i].getAttribute('class');
			if(c && !c.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) result = false;
		}
		return result;
	};
	stuQuery.prototype.toggleClass = function(cls){
		// Toggle a class on a DOM element
		var i,c;
		for(i = 0; i < this.length; i++){
			c = this[i].getAttribute('class');
			if(c){
				if(c.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) c = c.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)", "g")," ").replace(/ $/,'');
				else c = (cls+' '+cls).replace(/^ /,'');
			}
			this[i].setAttribute('class',c);
		}
		return this;
	};
	stuQuery.prototype.addClass = function(cls){
		// Add a class on a DOM element
		var c,i;
		for(i = 0; i < this.length; i++){
			c = this[i].getAttribute('class');
			if(c){
				if(!c.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) c = (c+' '+cls).replace(/^ /,'');
			}else c = cls;
			this[i].setAttribute('class',c);
		}
		return this;
	};
	stuQuery.prototype.removeClass = function(cls){
		// Remove a class on a DOM element
		var i,c;
		for(i = 0; i < this.length; i++){
			c = this[i].getAttribute('class');
			if(c!=""){
				while(c.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) c = c.replace(new RegExp("(\\s|^)" + cls + "(\\s|$)", "g")," ").replace(/ $/,'').replace(/^ /,'');
				this[i].setAttribute('class',c||"");
			}
		}
		return this;
	};
	stuQuery.prototype.css = function(css){
		var styles,i,key;
		if(this.length==1 && typeof css==="string"){
			styles = window.getComputedStyle(this[0]);
			return styles[css];
		}
		for(i = 0; i < this.length; i++){
			// Read the currently set style
			styles = {};
			var style = this[i].getAttribute('style');
			if(style){
				var bits = this[i].getAttribute('style').split(";");
				for(var b = 0; b < bits.length; b++){
					var pairs = bits[b].split(":");
					if(pairs.length==2) styles[pairs[0]] = pairs[1];
				}
			}
			if(typeof css==="object"){
				// Add the user-provided style to what was there
				for(key in css){
					if(typeof css[key]!=="undefined") styles[key] = css[key];
				}
				// Build the CSS string
				var newstyle = '';
				for(key in styles){
					if(typeof styles[key]!=="undefined"){
						if(newstyle) newstyle += ';';
						if(styles[key]) newstyle += key+':'+styles[key];
					}
				}
				// Update style
				this[i].setAttribute('style',newstyle);
			}
		}
		return this;
	};
	stuQuery.prototype.parent = function(){
		var tmp = [];
		for(var i = 0; i < this.length; i++) tmp.push(this[i].parentElement);
		return S(tmp);
	};
	stuQuery.prototype.children = function(c){
		var i;
		// Only look one level down
		if(typeof c==="string"){
			// We are using a selector
			var result = [];
			for(i = 0; i < this.length; i++){
				for(var ch = 0; ch < this[i].children.length; ch++){
					if(this.matchSelector(this[i].children[ch],c)) result.push(this[i].children[ch]);
				}
			}
			return S(result);
		}else{
			// We are using an index
			for(i = 0; i < this.length; i++) this[i] = (this[i].children.length > c ? this[i].children[c] : this[i]);
			return this;
		}
	};
	stuQuery.prototype.find = function(selector){
		var result = [];
		for(var i = 0; i < this.length; i++) result = result.concat(this.querySelector(this[i],selector));
		// Return a new instance of stuQuery
		return S(result);
	};
	function getset(s,attr,val,typs){
		var tmp = [];
		for(var i = 0; i < s.length; i++){
			tmp.push(s[i].getAttribute(attr));
			var ok = false;
			for(var j in typs){ if(typeof val===typs[j]) ok = true; }
			if(ok){
				if(val) s[i].setAttribute(attr,val);
				else s[i].removeAttribute(attr);
			}
		}
		if(tmp.length==1) tmp = tmp[0];
		if(typeof val==="undefined") return tmp;
		else return s;
	}
	stuQuery.prototype.attr = function(attr,val){
		return getset(this,attr,val,["string","number"]);
	};
	stuQuery.prototype.prop = function(attr,val){
		return getset(this,attr,val,["boolean"]);
	};
	stuQuery.prototype.clone = function(){
		var span = document.createElement('div');
		span.appendChild(this[0].cloneNode(true));
		return span.innerHTML;
	};
	stuQuery.prototype.replaceWith = function(html){
		var tempDiv;
		var clone = S(this.e);
		for(var i = 0; i < this.length; i++){
			tempDiv = document.createElement('div');
			tempDiv.innerHTML = html;
			clone[i] = tempDiv.cloneNode(true);
			this[i].parentNode.replaceChild(clone[i], this[i]);
		}
		return clone;
	};
	stuQuery.prototype.width = function(){
		if(this.length > 1) return;
		return this[0].offsetWidth;
	};
	stuQuery.prototype.height = function(){
		if(this.length > 1) return;
		return this[0].offsetHeight;
	};
	stuQuery.prototype.outerWidth = function(){
		if(this.length > 1) return;
		var s = getComputedStyle(this[0]);
		return this[0].offsetWidth + parseInt(s.marginLeft) + parseInt(s.marginRight);
	};
	stuQuery.prototype.outerHeight = function(){
		if(this.length > 1) return;
		var s = getComputedStyle(this[0]);
		return this[0].offsetHeight + parseInt(s.marginTop) + parseInt(s.marginBottom);
	};
	stuQuery.prototype.offset = function(){
		var rect = this[0].getBoundingClientRect();
	
		return {
		  top: rect.top + document.body.scrollTop,
		  left: rect.left + document.body.scrollLeft
		};
	};
	stuQuery.prototype.position = function(){
		if(this.length > 1) return;
		return {left: this[0].offsetLeft, top: this[0].offsetTop};
	};
	stuQuery.prototype.ajax = function(url,attrs){
		//=========================================================
		// ajax(url,{'complete':function,'error':function,'dataType':'json'})
		// complete: function - a function executed on completion
		// error: function - a function executed on an error
		// cache: break the cache
		// dataType: json - will convert the text to JSON
		//           jsonp - will add a callback function and convert the results to JSON

		if(typeof url!=="string") return false;
		if(!attrs) attrs = {};
		var cb = "",qs = "";
		var oReq,urlbits;
		// If part of the URL is query string we split that first
		if(url.indexOf("?") > 0){
			urlbits = url.split("?");
			if(urlbits.length){
				url = urlbits[0];
				qs = urlbits[1];
			}
		}
		if(attrs.dataType=="jsonp"){
			cb = 'fn_'+(new Date()).getTime();
			window[cb] = function(rsp){
				if(typeof attrs.success==="function") attrs.success.call((attrs['this'] ? attrs['this'] : this), rsp, attrs);
			};
		}
		if(typeof attrs.cache==="boolean" && !attrs.cache) qs += (qs ? '&':'')+(new Date()).valueOf();
		if(cb) qs += (qs ? '&':'')+'callback='+cb;
		if(attrs.data) qs += (qs ? '&':'')+attrs.data;

		// Build the URL to query
		if(attrs.method=="POST") attrs.url = url;
		else attrs.url = url+(qs ? '?'+qs:'');

		if(attrs.dataType=="jsonp"){
			var script = document.createElement('script');
			script.src = attrs.url;
			document.body.appendChild(script);
			return this;
		}

		// code for IE7+/Firefox/Chrome/Opera/Safari or for IE6/IE5
		oReq = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
		oReq.addEventListener("load", window[cb] || complete);
		oReq.addEventListener("error", error);
		oReq.addEventListener("progress", progress);
		var responseTypeAware = 'responseType' in oReq;
		if(attrs.beforeSend) oReq = attrs.beforeSend.call((attrs['this'] ? attrs['this'] : this), oReq, attrs);

		function complete(evt) {
			attrs.header = oReq.getAllResponseHeaders();
			var rsp;
			if(oReq.status == 200 || oReq.status == 201 || oReq.status == 202) {
				rsp = oReq.response;
				if(oReq.responseType=="" || oReq.responseType=="text") rsp = oReq.responseText;
				if(attrs.dataType=="json"){
					try {
						if(typeof rsp==="string") rsp = JSON.parse(rsp.replace(/[\n\r]/g,"\\n").replace(/^([^\(]+)\((.*)\)([^\)]*)$/,function(e,a,b,c){ return (a==cb) ? b:''; }).replace(/\\n/g,"\n"));
					} catch(e){ error(e); }
				}

				// Parse out content in the appropriate callback
				if(attrs.dataType=="script"){
					var fileref=document.createElement('script');
					fileref.setAttribute("type","text/javascript");
					fileref.innerHTML = rsp;
					document.head.appendChild(fileref);
				}
				attrs.statusText = 'success';
				if(typeof attrs.success==="function") attrs.success.call((attrs['this'] ? attrs['this'] : this), rsp, attrs);
			}else{
				attrs.statusText = 'error';
				error(evt);
			}
			if(typeof attrs.complete==="function") attrs.complete.call((attrs['this'] ? attrs['this'] : this), rsp, attrs);
		}

		function error(evt){
			if(typeof attrs.error==="function") attrs.error.call((attrs['this'] ? attrs['this'] : this),evt,attrs);
		}

		function progress(evt){
			if(typeof attrs.progress==="function") attrs.progress.call((attrs['this'] ? attrs['this'] : this),evt,attrs);
		}

		if(responseTypeAware && attrs.dataType){
			try { oReq.responseType = attrs.dataType; }
			catch(err){ error(err); }
		}

		try{ oReq.open((attrs.method||'GET'), attrs.url, true); }
		catch(err){ error(err); }

		if(attrs.method=="POST") oReq.setRequestHeader('Content-type','application/x-www-form-urlencoded');

		try{ oReq.send((attrs.method=="POST" ? qs : null)); }
		catch(err){ error(err); }

		return this;
	};
	stuQuery.prototype.loadJSON = function(url,fn,attrs){
		if(!attrs) attrs = {};
		attrs.dataType = "json";
		attrs.complete = fn;
		this.ajax(url,attrs);
		return this;
	};

	root.stuQuery = stuQuery;
	root.S = function(e){ return new stuQuery(e); };

})(window || this);


function qs() {
	var r = {length:0};
	var q = location.search;
	if(q && q != '#'){
		// remove the leading ? and trailing &
		q.replace(/^\?/,'').replace(/\&$/,'').split('&').forEach(function(e){
			var key = e.split('=')[0];
			var val = e.split('=')[1];
			// convert floats
			if(/^-?[0-9.]+$/.test(val)) val = parseFloat(val);
			if(val == "true") val = true;
			if(val == "false") val = false;
			if(/^\?[0-9\.]+$/.test(val)) val = parseFloat(val);	// convert floats
			r[key] = val;
		});
	}
	return r;
};

/**
 * @desc Get some spacing given a minimum and maximum value
 * @param {number} mn - the minimum value
 * @param {number} mx - the maximum value
 * @param {number} n - the minimum number of steps
 */
function defaultSpacing(mn, mx, n) {

	var dv, log10_dv, base, frac, options, distance, imin, tmin, i;

	// Start off by finding the exact spacing
	dv = Math.abs(mx - mn) / n;

	// In any given order of magnitude interval, we allow the spacing to be
	// 1, 2, 5, or 10 (since all divide 10 evenly). We start off by finding the
	// log of the spacing value, then splitting this into the integer and
	// fractional part (note that for negative values, we consider the base to
	// be the next value 'down' where down is more negative, so -3.6 would be
	// split into -4 and 0.4).
	log10_dv = Math.log10(dv);
	base = Math.floor(log10_dv);
	frac = log10_dv - base;

	// We now want to check whether frac falls closest to 1, 2, 5, or 10 (in log
	// space). There are more efficient ways of doing this but this is just for clarity.
	options = [1, 2, 5, 10];
	distance = new Array(options.length);
	imin = -1;
	tmin = 1e100;
	for (i = 0; i < options.length; i++) {
		distance[i] = Math.abs(frac - Math.log10(options[i]));
		if (distance[i] < tmin) {
			tmin = distance[i];
			imin = i;
		}
	}

	// Now determine the actual spacing
	return Math.pow(10, (base)) * options[imin];
}

function PandemicGraph(o){

	if(!o) o = {};

	this.id = o.id || "graph";
	this.title = o.title || "Graph";

	var graph = {
		'view':{
			'x':{'min':-20,'max':200},
			'y':{'min':-12.5,'max':100}
		},
		'x': {'min':0,'max':14},
		'y': {'min':0,'max':10000,'log':true},
		'width': 300,
		'height': 500,
		'el':{},
		'mincases': 3
	};
	this.graph = graph;
	this.el = S('#logplot')[0];
	this.info = new InfoBubbles(graph);
	this.qs = qs();
	
	var _obj = this;
	// We'll need to change the sizes when the window changes size
	window.addEventListener('resize', function(event){ _obj.resize(); });

	this.width = function(v){
		if(typeof v==="number"){
			graph.width = v;
			return this;
		}else return graph.width;
	}

	this.height = function(v){
		if(typeof v==="number"){
			graph.height = v;
			return this;
		} else { return graph.height; }
	}

	function getY(v){
		var h = graph.heightinner;
		return h-h*(v-graph.y.min)/(graph.y.max-graph.y.min);
	}
	function getX(v){
		var w = graph.widthinner;
		var xoff = (graph.width - w);
		return xoff + w*(v-graph.x.min)/(graph.x.max-graph.x.min);
	}
	
	this.resize = function(){

		var s,i,w,h,hf,wf;

		w = this.el.offsetWidth;
		h = graph.height;//this.el.offsetHeight||graph.height;
		this.width(w).height(h);
		
		hf = Math.abs(graph.view.y.min/(graph.view.y.max-graph.view.y.min));
		wf = Math.abs(graph.view.x.min/(graph.view.x.max-graph.view.x.min));
		graph.heightinner = h*(1-hf);
		graph.widthinner = w*(1-wf);
		
		graph.el.svg.setAttribute('viewBox','0 0 '+(w)+' '+(h));
		graph.el.holder.setAttribute('width',Math.round(graph.widthinner));
		graph.el.holder.setAttribute('height',Math.round(graph.heightinner));
		graph.el.holder.setAttribute('x',Math.ceil(getX(0)));

		// Build the x-axis
		if(!graph.el.xaxis) graph.el.xaxis = graph.el.svg.querySelectorAll('#'+this.id+'-axis-x')[0];

		// Build the y-axis
		if(!graph.el.yaxis) graph.el.yaxis = graph.el.svg.querySelectorAll('#'+this.id+'-axis-y')[0];


		// Set font size
		var style = window.getComputedStyle(graph.el.svg, null).getPropertyValue('font-size');
		this.fs = parseFloat(style);
		graph.el.svg.style['font-size'] = this.fs+'px';


		this.updateLabels();
		this.draw();
		
		this.info.update();

		return this;
	}

	this.updateLabels = function(){

		this.info.remove();

		graph.el.axes.innerHTML = "";
		
		if(typeof this.maxcases=="undefined") return this;


		w = this.el.offsetWidth;
		h = this.el.offsetHeight;
		xoff = w*Math.abs(graph.view.x.min/(graph.view.x.max-graph.view.x.min));


		// Update x-axis labels and lines
		y = graph.heightinner+5;
		ticks = makeTicks(graph.x.min,graph.x.max,5);
		graph.el.xaxis.innerHTML = "";
		for(i = 0; i < ticks.length; i++){
			x = getX(ticks[i].value);
			if(x < w) graph.el.xaxis.appendChild(createText(ticks[i].value.toLocaleString(),{'x':x,'y':y,'style':{'text-anchor':'middle','dominant-baseline':'hanging'}}));
		}
		graph.el.xaxis.appendChild(createText('Number of days since '+graph.mincases+' confirmed cases',{'x':getX(graph.x.max/2),'y':(y+this.fs*1.5),'style':{'text-anchor':'middle','dominant-baseline':'hanging','font-weight':'bold'}}));


		// Update the y-axis labels and lines
		graph.el.yaxis.innerHTML = "";
		ticks = makeTicks(graph.mincases,this.maxcases,5,{'log':graph.y.log});
		if(graph.y.log){
			logmin = Math.log10(graph.mincases);
			logmax = Math.log10(this.maxcases);
		}
		for(i = 0; i < ticks.length; i++){
			if(graph.y.log) v = (Math.log10(ticks[i].value)-logmin)/(logmax-logmin);
			else v = ticks[i].value/this.maxcases;
			y = graph.heightinner * (1 - v);
			if(y > 0){
				if(!ticks[i].minor){
					graph.el.yaxis.appendChild(createText(ticks[i].value.toLocaleString(),{'x':(xoff-5).toFixed(2),'y':y.toFixed(2),'style':{'text-anchor':'end','dominant-baseline':'middle'}}));
				}
				if(ticks[i].value > 0) graph.el.axes.appendChild(createPath({'d':'M '+(xoff-3).toFixed(2)+','+y+' l '+(w - xoff + 3).toFixed(2)+',0','style':{'stroke':'#999','stroke-width':(ticks[i].minor ? '0.8px':'1.5px'),'fill':'transparent','opacity':(ticks[i].minor ? 0.2 : 0.3)}}));
			}
		}

		return this;
	}

	function createPath(o){
		if(!o) o = {};
		if(!o['stroke-linecap']) o['stroke-linecap'] = 'round';
		if(!o['vector-effect']) o['vector-effect'] = 'non-scaling-stroke';
		var el,t,i,j;
		el = document.createElementNS("http://www.w3.org/2000/svg", 'path');
		for(i in o){
			if(i=="style"){
				for(j in o[i]) el.style[j] = o[i][j];
			}else el.setAttribute(i,o[i]);
		}
		return el;
	}
	function createGroup(o){
		if(!o) o = {};
		var el,t,i,j;
		el = document.createElementNS("http://www.w3.org/2000/svg", 'g');
		for(i in o){
			if(i=="style"){
				for(j in o[i]) el.style[j] = o[i][j];
			}else el.setAttribute(i,o[i]);
		}
		return el;
	}
	function createText(txt,o){
		if(!o) o = {};
		if(!o.style) o.style = {};
		var el,t,i,j;
		el = document.createElementNS("http://www.w3.org/2000/svg", 'text');
		el.innerHTML = txt;
		for(i in o){
			if(i=="style"){
				for(j in o[i]){
					el.style[j] = o[i][j];
					if(el.style[j] != o[i][j]) console.warn('Unable to set style '+j);
				}
			}else el.setAttribute(i,o[i]);
		}
		return el;		
	}
	
	this.init = function(){
		// Create the graph if necessary
		if(!graph.el.svg){			
			svg = '<svg id="'+this.id+'" width="100%" height="'+graph.height+'px" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMinYMax meet">';
			svg += '	<desc>Created by ODI Leeds</desc>';
			svg += '	<title>'+this.title+'</title>';
			svg += '	<g id="'+this.id+'-axis-y"></g>';
			svg += '	<g id="'+this.id+'-axis-x"></g>';
			svg += '	<g id="'+this.id+'-axis-lines"></g>';
			svg += '	<svg x="0" y="0" id="'+this.id+'-holder" viewBox="0 0 100 100" preserveAspectRatio="none">';
			svg += '		<g id="'+this.id+'-chart-furniture" transform="translate(0,100) scale(1,-1)"></g>';
			svg += '		<g id="'+this.id+'-chart" transform="translate(0,100) scale(1,-1)"></g>';
			svg += '	</svg>';
			svg += '</svg>';
			this.el.innerHTML = svg;
			graph.el.svg = this.el.querySelectorAll('svg')[0];
			graph.el.holder = graph.el.svg.querySelectorAll('#'+this.id+'-holder')[0];
			graph.el.chart = graph.el.svg.querySelectorAll('#'+this.id+'-chart')[0];
			graph.el.chartfurniture = graph.el.svg.querySelectorAll('#'+this.id+'-chart-furniture')[0];
			graph.el.chartfurniture.appendChild(createPath({'id':'graph-axis-x-line','d':'M 0 0 l 100,0','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
			graph.el.chartfurniture.appendChild(createPath({'id':'graph-axis-y-line','d':'M 0 0 l 0 100','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
			graph.el.axes = graph.el.svg.querySelectorAll('#'+this.id+'-axis-lines')[0];
		}

		graph.y.log = S('.switch input')[0].checked;
		S('.switch input').on('change',{me:this},function(e){
			console.log(e.currentTarget.checked);
			graph.y.log = e.currentTarget.checked;
			e.data.me.updateLabels();
			e.data.me.draw();
			e.data.me.info.update();
		});
		return this;
	}

	this.draw = function(){

		var id,d,logmin,logmax,x,y;

		if(graph.y.log){
			logmin = Math.log10(graph.mincases);
			logmax = Math.log10(this.maxcases);
		}

		// Loop through the data and draw or redraw the lines
		for(id in this.data){
			if(id.indexOf('W06')!=0){
				data = [];
				v = 1;
				var now = new Date();
				for(d = new Date(this.data[id].mindate); d <= now; d.setDate(d.getDate() + 1)){
					iso = d.toISOString().substr(0,10);
					if(this.data[id].days[iso] >= graph.mincases) data.push(this.data[id].days[iso]);
				}
				x = 0;
				y = (100*(graph.y.log ? (Math.log10(graph.mincases)-logmin)/(logmax-logmin) : graph.mincases/this.maxcases));
				path = 'M '+x.toFixed(2)+' '+y.toFixed(2);
				for(i = 0; i < data.length; i++){
					x = (100*(i+1)/this.maxdays);
					y = (100*(graph.y.log ? (Math.log10(data[i])-logmin)/(logmax-logmin) : data[i]/this.maxcases));
					path += ' L '+x.toFixed(2)+','+y.toFixed(2);
				}
				if(!this.data[id].el){
					this.data[id].el = createGroup({'id':'area-'+id});
					this.data[id].line = createPath({'style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3},'class':'line'});
					this.data[id].area = createPath({'style':{'fill':'#999','opacity':0.3,'fillOpacity':0.2},'class':'area'});
					this.data[id].el.appendChild(this.data[id].line);
					this.data[id].el.appendChild(this.data[id].area);
					//this.data[id].text = createText(this.data[id].name,{'x':(100*(data.length)/this.maxdays).toFixed(2),'y':(100*data[data.length-1]/this.maxcases).toFixed(2),'style':{'text-anchor':'middle','dominant-baseline':'hanging'},'transform':'scale(1,-1)'});
					//this.data[id].el.appendChild(this.data[id].text);
					graph.el.chart.appendChild(this.data[id].el);
					S('#area-'+id+' .line').on('mouseover',{me:this,g:graph,id:id},function(e){

						// Remove existing strokes if they aren't keep
						S(e.data.g.el.svg).find('.active:not(.keep) .line').css({'stroke':''});
						
						S(e.data.g.el.svg).find('.active').removeClass('active');

						// Remove old infobubbles
						e.data.me.info.remove();

						// Add an info bubble
						e.data.me.selectLine(e.data.id,'',{'line':'#2254F4','background':'','color':'','class':'label'});

						// Simulate z-index
						//e.data.g.el.chart.appendChild(el);
					}).on('mouseout',{me:this,id:id},function(e){

						//el = document.getElementById('area-'+e.data.id);
						//el.setAttribute('class','');

						// Remove the info bubble
						//e.data.me.info.remove(e.data.id);

					});
				}
				this.data[id].line.setAttribute('d',path);
				this.data[id].area.setAttribute('d',path+' L '+x.toFixed(2)+',0Z');
			}else{
				console.warn('Not including '+id,this.data[id]);
			}
		}
		return this;
	}
	
	this.selectLine = function(id,txt,opts){

		// Add a fixed info bubble
		if(this.data[id]){

			if(opts.keep){
				S(this.data[id].el).addClass('keep');
				if(typeof opts.background==="string") this.data[id].background = opts.background;
				if(typeof opts.color==="string") this.data[id].color = opts.color;
				if(typeof opts.line==="string") this.data[id].line = opts.line;
				if(opts['class']) this.data[id]['class'] = opts['class'];
			}
			if(typeof this.data[id].background==="string") opts.background = this.data[id].background;
			if(typeof this.data[id].color==="string") opts.color = this.data[id].color;
			if(typeof this.data[id].line==="string") opts.line = this.data[id].line;
			if(!opts.line) opts.line = opts.background;
			if(this.data[id]['class']) opts['class'] = this.data[id]['class'];

			el = S('#area-'+id);
			if(!opts.keep) el.addClass('active');
			el.find('.line').css({'stroke': opts.line});
			el.find('.area').css({'fill': opts.line});

			if(!txt){
				// Build label text
				//txt = this.data[id].name+', '+this.data[id].country+' ('+this.data[id].max.toLocaleString()+')';
				txt = this.data[id].name+' / '+this.data[id].max.toLocaleString();
			}
			this.info.add('area-'+id,(txt ? txt : 'Hi there'),this.data[id].el,opts);
		}
		return this;
	}

	this.getData = function(){
		// Get Tom White's totals file
		S().ajax("https://raw.githubusercontent.com/tomwhite/covid-19-uk-data/master/data/covid-19-cases-uk.csv",{
			"dataType":"text",
			"this": this,
			"success": function(d){
				var data = CSV2JSON(d);
				var byid = {};
				var max = 0;
				for(var i = 0; i < data.length; i++){
					id = data[i].AreaCode;
					if(id){
						t = parseInt(data[i].TotalCases);
						if(t > 0){
							if(!byid[id]) byid[id] = {'days':{},'country':data[i].Country,'name':data[i].Area,'mindate':'3000-01-01','maxdate':'2000-01-01','max':0};
							byid[id].days[data[i]['Date']] = t;
							if(t > max) max = t;
							if(t > byid[id].max) byid[id].max = t;
							if(data[i]['Date'] > byid[id].maxdate) byid[id].maxdate = data[i]['Date'];
							if(data[i]['Date'] < byid[id].mindate) byid[id].mindate = data[i]['Date'];
						}
					}else{
						console.warn('No ID given for row '+i,data[i]);
					}
				}
				var ndays = 0;
				for(var id in byid){
					byid[id].mindate = new Date(byid[id].mindate);
					byid[id].maxdate = new Date(byid[id].maxdate);
					byid[id].ndays = Math.round((byid[id].maxdate.getTime()-byid[id].mindate.getTime())/86400000)+1;
					if(byid[id].ndays > ndays) ndays = byid[id].ndays;
				}
				this.data = byid;
				this.maxcases = max;
				this.maxdays = ndays+5;
				graph.x.max = this.maxdays;

				this.updateLabels();
				this.draw();
				
				// Highlight selected UTLAs
				if(this.qs.areas) this.qs.areas = this.qs.areas.split(/;/);
				for(i = 0; i < this.qs.areas.length; i++){
					this.selectLine(this.qs.areas[i],'',{'keep':true,'line':'#FF6700','background':'','color':'black','class':'label'});
				}

			},
			"error": function(e,attr){
				console.error('Unable to load '+attr.url);
			}		
		});
		return this;
	}


	// Build initial elements
	this.init();

	this.resize();
	

	return this;
}

/**
 * @desc Create logarithmic tick marks that span the range
 * @param {number} min - the minimum value to include
 * @param {number} max - the maximum value to include
 */
function logTicks(min,max){
	var mn,mx,val,major,minor,i,j,ticks,vis,inc,n,show,o,r;
	ticks = {'length':0,'min':min,'max':max};
	if(min > max) return ticks;

	// Get the log range
	r = Math.log10(max)-Math.log10(min);
	mn = Math.floor(Math.log10(min));
	mx = Math.ceil(Math.log10(max));
	o = Math.ceil(r/(3*6))*3;

	// The major tick marks
	major = [];

	// First we make the major tick marks
	for(i = mn; i <= mx ; i++){
		val = Math.pow(10,i);
		major.push(val);
		if(val >= min && val < max){
			// The tick mark is in the range of the graph
			show = true;
			// If the range is big, only show every 'o' orders
			if(r > 8 && Math.log10(val)%o!=0) show = false;
			ticks[''+ticks.length] = {'value':val,'label':(show ? val.toString() : ''),'length':1};
			ticks.length++;
		}
	}

	// Now create the minor tick marks
	if(ticks.length < 10){
		minor = [];
		n = ticks.length;
		for(i = 0; i < major.length; i++){
			minor.push(major[i]);
			for(j = 2; j <= 9; j++){
				val = major[i] * j;
				vis = (val > min && val < max);
				minor.push(val);
				if(vis){
					ticks[''+ticks.length] = {'value':val,'label':(n <= 2 ? val.toString() : ''),'length':1,'minor':true};
					ticks.length++;
				}
			}
		}
	}

	return ticks;
}
/**
 * @desc Make the tick marks.
 * @param {number} mn - the minimum value
 * @param {number} mx - the maximum value
 */
function makeTicks(mn,mx,n,opts){

	var v,l,i,d,vmx,ticks;
	ticks = {};
	if(!opts) opts = {};

	// If the range is negative we cowardly quit
	if(mn > mx) return ticks;
	// If the min or max are not numbers we quit
	if(isNaN(mn) || isNaN(mx)) return ticks;


	if(opts.log){
		ticks = logTicks(mn,mx);
	}else{
		ticks.length = 0;
		ticks.inc = defaultSpacing(mn,mx,n);
		vmx = mx + ticks.inc;
		for(v = Math.floor(mn/ticks.inc), i = 0; v <= vmx; v += ticks.inc, i++){
			// If formatLabel is set we use that to format the label
			ticks[i] = {'value':v,'label':(typeof opts.formatLabel==="function" ? opts.formatLabel.call(ticks[i].value,opts) : v.toString())};
			ticks.length++;
		}
	}

	if(ticks.length == 0){
		console.warn('No ticks');
		return ticks;
	}

	ticks.range = ticks[ticks.length-1].value - ticks[0].value;

	return ticks;
}



function InfoBubbles(graph){
	var msg = {};
	function getXY(el){
		var r,r2,xoff;
		r = el.getBoundingClientRect();
		r2 = el.parentNode.getBoundingClientRect();
		xoff = parseFloat(el.nearestViewportElement.getAttribute('x'));
		return {'x':(xoff+r.width).toFixed(2),'y':(r.top-r2.top).toFixed(2)};
	}
	this.update = function(){
		var r,r2,xoff,id;
		console.log('update',msg);
		for(id in msg){
			xy = getXY(msg[id].original);
			console.log(id);
			S(msg[id].el).css({'left':xy.x+'px','top':xy.y+'px','position':'absolute'});
		}
		return this;
	}
	this.add = function(id,txt,el,opts){
		if(!msg[id]){
			var xy = getXY(el);
			info = document.createElement('div');
			info.setAttribute("style",'left:'+xy.x+'px; top:'+xy.y+'px;position:absolute;');
			msg[id] = {'el':info,'original':el};
			graph.el.svg.insertAdjacentElement('afterend',msg[id].el);
		}
		el = S(msg[id].el);
		if(opts.background) el.css({'background':opts.background,'border-color':opts.background});
		if(opts.color) el.css({'color':opts.color});
		if(opts.keep) msg[id].keep = opts.keep;
		if(opts['class']) el.addClass(opts['class']);
		el.html(txt+'<div class="after"></div>');
		return this;
	}
	this.remove = function(id){
		if(typeof id==="string"){
			if(!msg[id].keep){
				msg[id].el.parentNode.removeChild(msg[id].el);
				delete msg[id];
			}
		}else{
			for(id in msg){
				if(!msg[id].keep){
					msg[id].el.parentNode.removeChild(msg[id].el);
					delete msg[id];
				}
			}
		}
		return this;
	}
	return this;
}



function CSV2JSON(data,format,start,end){

	if(typeof start!=="number") start = 1;

	var lines = CSVToArray(data);
	if(typeof end!=="number") end = lines.length;

	var header = lines[0];
	var simpleheader = JSON.parse(JSON.stringify(header));
	var line,datum,key,key2,f,i;
	var newdata = [];
	var lookup = {};
	// Work out a simplified (no spaces, all lowercase) version of the 
	// keys for matching against column headings.
	if(format){
		for(i in format){
			if(format[i]){
				key = i.replace(/ /g,"").toLowerCase();
				lookup[key] = i+'';
			}
		}
		for(i = 0; i < simpleheader.length; i++) simpleheader[i] = simpleheader[i].replace(/ /g,"").toLowerCase();
	}
	for(i = start; i < end; i++){
		line = lines[i];
		datum = {};
		if(line){
			for(var j=0; j < line.length; j++){
				key = header[j];
				key2 = simpleheader[j];
				if(format && lookup[key2]){
					key = lookup[key2];
					f = format[key];
					if(format[key].name) key = format[key].name;
					if(f.format=="number"){
						if(line[j]!=""){
							if(line[j]=="infinity" || line[j]=="Inf") datum[key] = Number.POSITIVE_INFINITY;
							else datum[key] = parseFloat(line[j]);
						}
					}else if(f.format=="eval"){
						if(line[j]!="") datum[key] = eval(line[j]);
					}else if(f.format=="date"){
						if(line[j]){
							line[j] = line[j].replace(/^"/,"").replace(/"$/,"");
							try {
								datum[key] = new Date(line[j]);
							}catch(err){
								this.log.warning('Invalid date '+line[j]);
								datum[key] = new Date('0001-01-01');
							}
						}else datum[key] = null;
					}else if(f.format=="boolean"){
						if(line[j]=="1" || line[j]=="true" || line[j]=="Y") datum[key] = true;
						else if(line[j]=="0" || line[j]=="false" || line[j]=="N") datum[key] = false;
						else datum[key] = null;
					}else{
						datum[key] = (line[j][0]=='"' && line[j][line[j].length-1]=='"') ? line[j].substring(1,line[j].length-1) : line[j];
					}
				}else{
					datum[key] = (line[j][0]=='"' && line[j][line[j].length-1]=='"') ? line[j].substring(1,line[j].length-1) : line[j];
				}
			}
			newdata.push(datum);
		}
	}
	return newdata;
}

/**
 * CSVToArray parses any String of Data including '\r' '\n' characters,
 * and returns an array with the rows of data.
 * @param {String} CSV_string - the CSV string you need to parse
 * @param {String} delimiter - the delimeter used to separate fields of data
 * @returns {Array} rows - rows of CSV where first row are column headers
 */
function CSVToArray (CSV_string, delimiter) {
   delimiter = (delimiter || ","); // user-supplied delimeter or default comma

   var pattern = new RegExp( // regular expression to parse the CSV values.
	 ( // Delimiters:
	   "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
	   // Quoted fields.
	   "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
	   // Standard fields.
	   "([^\"\\" + delimiter + "\\r\\n]*))"
	 ), "gi"
   );

   var rows = [[]];  // array to hold our data. First row is column headers.
   // array to hold our individual pattern matching groups:
   var matches = false; // false if we don't find any matches
   // Loop until we no longer find a regular expression match
   while (matches = pattern.exec( CSV_string )) {
	   var matched_delimiter = matches[1]; // Get the matched delimiter
	   // Check if the delimiter has a length (and is not the start of string)
	   // and if it matches field delimiter. If not, it is a row delimiter.
	   if (matched_delimiter.length && matched_delimiter !== delimiter) {
		 // Since this is a new row of data, add an empty row to the array.
		 rows.push( [] );
	   }
	   var matched_value;
	   // Once we have eliminated the delimiter, check to see
	   // what kind of value was captured (quoted or unquoted):
	   if (matches[2]) { // found quoted value. unescape any double quotes.
		matched_value = matches[2].replace(
		  new RegExp( "\"\"", "g" ), "\""
		);
	   } else { // found a non-quoted value
		 matched_value = matches[3];
	   }
	   // Now that we have our value string, let's add
	   // it to the data array.
	   rows[rows.length - 1].push(matched_value);
   }
   return rows; // Return the parsed data Array
}

var graph;

S().ready(function(){

	// We need to load the data separately to making the graph. Use callbacks to attach the data to the graph and update.
	graph = new PandemicGraph({'id':'graph'});
	graph.getData();
	
	function resizeIframe(obj) { obj.style.height = '1px'; obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px'; }
	window.addEventListener('resize', function(event){
		iframes = S('iframe');
		for(var i = 0; i < iframes.length; i++) resizeIframe(iframes[i]);
	});
	
});