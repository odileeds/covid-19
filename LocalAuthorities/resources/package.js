var graph;
var hexmap;

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
			if(c){
				if(!c.match(new RegExp("(\\s|^)" + cls + "(\\s|$)"))) result = false;
			}else result = false;
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
			}else{
				c = cls;
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


/* Typeahead search v0.1.3 */
(function(root){

	function Builder(){
		this.version = "0.1.3";
		this.init = function(el,opt){ return new TA(el,opt); };
		return this;
	}
	/**
	 * @desc Create a new TypeAhead object
	 * @param {DOM|string} el - the DOM element
	 * @param {object} opt - configuration options
	 */
	function TA(el,opt){
		if(!opt) opt = {};
		if(typeof el==="string") el = document.querySelector(el);
		if(!el){
			console.warn('No valid element provided');
			return this;
		}
		var _obj = this;
		var evs = {};
		var results,form;
		var inline = (typeof opt.inline==="boolean" ? opt.inline : false);

		function search(s,e,t){

			str = s.toUpperCase();

			// Rank the results
			tmp = [];
			if(str){
				for(var i = 0 ; i < opt.items.length; i++){
					datum = {'rank':0,'key':i,'value':opt.items[i]};
					if(typeof opt.rank==="function") datum.rank = opt.rank(opt.items[i],s);
					else{
						if(opt.items[i].toUpperCase().indexOf(str) == 0) datum.rank += 3;
						if(opt.items[i].toUpperCase().indexOf(str) > 0) datum.rank += 1;
					}
					tmp.push(datum);
				}
				tmp = sortBy(tmp,'rank');
			}

			// Add results to DOM
			if(!results){
				el.parentElement.style.position = "relative";
				results = document.createElement('div');
				results.classList.add('typeahead-results');
				results.style.top = (el.offsetTop + el.offsetHeight)+'px';
				results.style.left = el.offsetLeft+'px';
				results.style.maxWidth = (el.parentElement.offsetWidth - el.offsetLeft - parseInt(window.getComputedStyle(el.parentElement, null).getPropertyValue('padding-right')))+'px';
				results.style.position = "absolute";
				form.style.position = "relative";
				el.insertAdjacentElement('afterend',results);
			}

			html = "";
			if(tmp.length > 0){
				var n = Math.min(tmp.length,(typeof opt.max==="number" ? opt.max : 10));
				html = "<ol>";
				for(var i = 0; i < n; i++){
					if(tmp[i].rank > 0) html += '<li data-id="'+tmp[i].key+'" '+(i==0 ? ' class="selected"':'')+'><a tabindex="0" href="#" class="name">'+(typeof opt.render==="function" ? opt.render(opt.items[tmp[i].key]) : opt.items[tmp[i].key])+"</a></li>";
				}
				html += "</ol>";
			}
			results.innerHTML = html;
			if(inline){
				el.style.marginBottom = results.offsetHeight+'px';
			}

			// Add click events
			var li = getLi();
			for(var i = 0 ; i < li.length ; i++){
				li[i].addEventListener('click',function(ev){
					ev.preventDefault();
					ev.stopPropagation();
					select(this.getAttribute('data-id'));
				});
			}
			
			if(evs[t]){
				e._typeahead = _obj;
				// Process each of the events attached to this event
				for(var i = 0; i < evs[t].length; i++){
					ev = evs[t][i];
					e.data = ev.data||{};
					if(typeof ev.fn==="function") ev.fn.call(this,e);
				}
			}

			return this;
		}

		function getLi(){ return (results ? results.querySelectorAll('li') : []); }
		
		function select(i){
			if(i){
				_obj.input = el;
				if(typeof opt.process==="function") opt.process.call(_obj,opt.items[i]);
				else console.log(opt.items[i])
			}
			if(results) results.innerHTML = "";
			if(inline) el.style.marginBottom = "0px";
			return;
		}

		function submit(){
			var li = getLi();
			var s = -1;
			for(var i = 0; i < li.length; i++){
				if(li[i].classList.contains('selected')) return select(li[i].getAttribute('data-id'));
			}
			return;
		}

		function highlight(keyCode){
			var li = getLi();
			var s = -1;
			var sel;
			for(var i = 0; i < li.length; i++){
				if(li[i].classList.contains('selected')) s = i;
			}
			sel = s;
			if(keyCode==40) s++;
			else s--;
			if(s < 0) s = li.length-1;
			if(s >= li.length) s = 0;
			if(sel >= 0) li[sel].classList.remove('selected');
			li[s].classList.add('selected');
		}

		this.on = function(event,data,fn){
			if(!el){
				console.warn('Unable to attach event '+event);
				return this;
			}
			if(event=="change"){
				if(!evs[event]){
					evs[event] = [];
					el.addEventListener('keyup',function(e){
						e.preventDefault();
						e.stopPropagation();
						if(e.keyCode==40 || e.keyCode==38){
							highlight(e.keyCode);
						}else if(e.keyCode==13){
							submit();
						}else{
							t = event;

							// Match here
							search(this.value,e,event);
						}
					});
				}
				evs[event].push({'fn':fn,'data':data});
			}else console.warn('No event of type '+event);
			return this;
		}
		this.off = function(e,fn){
			// Remove any existing event from our list
			if(evs[e]){
				for(var i = 0; i < evs[e].length; i++){
					if(evs[e][i].fn==fn) evs[e].splice(i,1);
				}
			}
		}
		if(el.form){
			form = el.form;
			form.addEventListener('submit',function(e){
				e.preventDefault();
				e.stopPropagation();
				submit();
			},false);
		}
		if(el){
			el.setAttribute('autocomplete','off');
		}
		this.addItems = function(d){
			if(!opt.items) opt.items = [];
			opt.items = opt.items.concat(d);
		}
		this.on('change',{'test':'blah'},function(e){ console.log('change end'); });

		return this;
	}

	root.TypeAhead = new Builder();

	// Sort the data
	function sortBy(arr,i){
		yaxis = i;
		return arr.sort(function (a, b) {
			return a[i] < b[i] ? 1 : -1;
		});
	}

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
	
	// Do we update the address bar?
	this.pushstate = !!(window.history && history.pushState);
	// Add "back" button functionality
	var _obj = this;
	if(this.pushstate){
		window[(this.pushstate) ? 'onpopstate' : 'onhashchange'] = function(e){
			if(e.state && e.state.type) _obj.updateAreas(e.state.type);
			else _obj.updateAreas(_obj.defaulttype);
		};
	}

	this.graph = graph;
	this.el = S('#logplot')[0];
	this.info = new InfoBubbles(graph,{'line':'#2254F4','background':'','color':''});
	this.qs = qs();
	months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
	function getDate(d){ return months[d.getMonth()]+' '+d.getDate(); } //toISOString().substr(0,10);

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
			if(x < w) graph.el.xaxis.appendChild(createElement('text',{'html':ticks[i].value.toLocaleString(),'x':x,'y':y,'style':{'text-anchor':'middle','dominant-baseline':'hanging'}}));
		}
		graph.el.xaxis.appendChild(createElement('text',{'html':'Number of days since '+graph.mincases+' confirmed cases','x':getX(graph.x.max/2),'y':(y+this.fs*1.5),'style':{'text-anchor':'middle','dominant-baseline':'hanging','font-weight':'bold'}}));


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
					graph.el.yaxis.appendChild(createElement('text',{'html':ticks[i].value.toLocaleString(),'x':(xoff-5).toFixed(2),'y':y.toFixed(2),'style':{'text-anchor':'end','dominant-baseline':'middle'}}));
				}
				if(ticks[i].value > 0) graph.el.axes.appendChild(createElement('path',{'d':'M '+(xoff-3).toFixed(2)+','+y+' l '+(w - xoff + 3).toFixed(2)+',0','style':{'stroke':'#999','stroke-width':(ticks[i].minor ? '0.8px':'1.5px'),'fill':'transparent','opacity':(ticks[i].minor ? 0.2 : 0.3)}}));
			}
		}

		return this;
	}
	function createElement(t,o){
		if(!o) o = {};
		if(!o.style) o.style = {};
		if(t=="path"){
			if(!o['stroke-linecap']) o['stroke-linecap'] = 'round';
			if(!o['vector-effect']) o['vector-effect'] = 'non-scaling-stroke';
		}
		var el,i,j;
		el = document.createElementNS("http://www.w3.org/2000/svg", t);
		if(t=="text") el.innerHTML = o.html;
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
			svg += '</svg><time>Updated: ?</time>';
			this.el.innerHTML = svg;
			graph.el.svg = this.el.querySelectorAll('svg')[0];
			graph.el.holder = graph.el.svg.querySelectorAll('#'+this.id+'-holder')[0];
			graph.el.chart = graph.el.svg.querySelectorAll('#'+this.id+'-chart')[0];
			graph.el.chartfurniture = graph.el.svg.querySelectorAll('#'+this.id+'-chart-furniture')[0];
			graph.el.chartfurniture.appendChild(createElement('path',{'id':'graph-axis-x-line','d':'M 0 0 l 100,0','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
			graph.el.chartfurniture.appendChild(createElement('path',{'id':'graph-axis-y-line','d':'M 0 0 l 0 100','style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3}}));
			graph.el.axes = graph.el.svg.querySelectorAll('#'+this.id+'-axis-lines')[0];
		}

		graph.y.log = S('.switch input')[0].checked;
		S('.switch input').on('change',{me:this},function(e){
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

		if(this.maxdateformat){
			t = this.el.querySelectorAll('time')[0];
			t.innerHTML = "Updated: "+this.maxdateformat;
			t.setAttribute('datetime',this.maxdate.toISOString().substr(0,10));
		}

		var now = new Date();
		var endtime = new Date();
		endtime.setUTCHours(24);
		endtime.setUTCMinutes(0);
		endtime.setUTCSeconds(0);

		// Loop through the data and draw or redraw the lines
		for(id in this.data){
			if(id.indexOf('W06')!=0){
				data = [];
				v = 1;
				mindate = new Date(this.data[id].mindate.toISOString().substr(0,10)+'T12:00Z');
				//this.data[id].mindate.setUTCHours(0);
				
				for(d = mindate; d < endtime; d.setDate(d.getDate() + 1)){
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
					this.data[id].el = createElement('g',{'id':'area-'+id});
					this.data[id].line = createElement('path',{'style':{'stroke':'#999','stroke-width':'1px','fill':'transparent','opacity':0.3},'class':'line'});
					this.data[id].area = createElement('path',{'style':{'fill':'#999','opacity':0.3,'fillOpacity':0.2},'class':'area'});
					this.data[id].el.appendChild(this.data[id].line);
					this.data[id].el.appendChild(this.data[id].area);
					graph.el.chart.appendChild(this.data[id].el);
					S('#area-'+id+' .line').on('mouseover',{me:this,g:graph,id:id},function(e){

						// Remove existing strokes if they aren't keep
						S(e.data.g.el.svg).find('.active:not(.keep) .line').css({'stroke':''});
						
						S(e.data.g.el.svg).find('.active').removeClass('active');

						// Remove old infobubbles
						e.data.me.info.remove();

						// Add an info bubble
						e.data.me.selectLine(e.data.id,'',{'class':'label'});

						// Simulate z-index
						//e.data.g.el.chart.appendChild(el);
					}).on('mouseout',{me:this,id:id},function(e){

						// Deselect the line
						e.data.me.deselectLine(e.data.id);

					});
				}
				if(this.data[id].line) this.data[id].line.setAttribute('d',path);
				if(this.data[id].area) this.data[id].area.setAttribute('d',path+' L '+x.toFixed(2)+',0Z');
			}else{
				console.warn('Not including '+id,this.data[id]);
			}
		}
		return this;
	}
	this.updateAreas = function(){

		var a;
		if(typeof this.qs.areas==="object") a = this.qs.areas;
		this.qs = qs();

		// Build a type ahead search
		if(!this.typeahead){
			
			items = [];
			for(id in this.data) items.push({'name':this.data[id].name,'country':this.data[id].country,'id':id});
			
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

					// Highlight on map
					//hexmap.hex.search.key(str);
					return r;
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
					//hexmap.hex.search.pick(d.id);
					
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

		return this;
	}

	this.updateHistory = function(){
		var str = this.qs.areas.join(";");
		if(this.pushstate) history.pushState({'areas':str},"COVID-19",(str ? '?areas='+str : '?'));
	}

	this.addToggle = function(id,update){

		if(S('#toggle-holder .toggles').length==0) S('#toggle-holder').append('<ul class="toggles"></ul>');

		var li;

		// Add to array
		var match = -1;
		if(!this.qs.areas) this.qs.areas = [];
		for(var i = 0; i < this.qs.areas.length; i++){
			if(this.qs.areas[i]==id) match = i;
		}
		if(match < 0) this.qs.areas.push(id);

		// Select the line
		this.selectLine(id,'',{'keep':true,'line':'#D60303','background':'','color':'black','class':'label'});

		// Build toggle
		if(this.data[id] && S('#toggle-'+id).length==0){
			li = document.createElement('li');
			li.setAttribute('class','c12-bg');
			li.setAttribute('title','Toggle '+this.data[id].name);
			li.innerHTML = '<label for="toggle-'+id+'">'+this.data[id].name+'</label><span class="close"><span>&times;</span><input id="toggle-'+id+'" type="checkbox" checked="checked" data="'+id+'"></span>';
			S('#toggle-holder .toggles')[0].appendChild(li);
			S(li).find('input').on('change',{me:this},function(e){
				e.preventDefault();
				e.stopPropagation();
				e.data.me.removeToggle(e.currentTarget.getAttribute('data'),true);
			});
		}

		if(update) this.updateHistory();

		return this;
	}
	this.removeToggle = function(id,update){
		if(this.info.msg['area-'+id]) this.deselectLine(id,true);
		//else this.selectLine(id,'',{'keep':true,'line':'#FF6700','background':'','color':'black','class':'label'});
		// Remove toggle from DOM
		S('#toggle-'+id).parent().parent().remove();
		
		// Remove from array
		var match = -1;
		for(var i = 0; i < this.qs.areas.length; i++){
			if(this.qs.areas[i]==id) match = i;
		}
		if(match >= 0) this.qs.areas.splice(match,1);

		if(update) this.updateHistory();

		return this;
	}
	
	this.selectLine = function(id,txt,opts){

		// Add a fixed info bubble
		if(this.data[id]){

			if(!this.data[id].opts) this.data[id].opts = {};
			if(opts.keep){
				S(this.data[id].el).addClass('keep');
				if(typeof opts.background==="string") this.data[id].opts.background = opts.background;
				if(typeof opts.color==="string") this.data[id].opts.color = opts.color;
				if(typeof opts.line==="string") this.data[id].opts.line = opts.line;
				if(opts['class']) this.data[id].opts['class'] = opts['class'];
			}
			if(typeof this.data[id].opts.background==="string") opts.background = this.data[id].opts.background;
			if(typeof this.data[id].opts.color==="string") opts.color = this.data[id].opts.color;
			if(typeof this.data[id].opts.line==="string") opts.line = this.data[id].opts.line;
			if(!opts.line) opts.line = opts.background;
			if(this.data[id].opts['class']) opts['class'] = this.data[id].opts['class'];

			el = S('#area-'+id);
			if(!opts.keep) el.addClass('active');
			el.find('.line').css({'stroke': opts.line||this.info.opts.line});
			el.find('.area').css({'fill': opts.line||this.info.opts.line});

			if(!txt){
				// Build label text
				d = getDate(this.data[id].maxdate);
				txt = this.data[id].name+' ('+this.data[id].max.toLocaleString()+')'+(d==this.maxdateformat ? '':' '+d);
			}
			this.info.add('area-'+id,(txt ? txt : 'Hi there'),this.data[id].el,opts);
		}
		return this;
	}
	
	this.deselectLine = function(id,override){
		el = S('#area-'+id);
		el.removeClass('active');
		if(el.hasClass('keep') && override){
			this.info.unprotect('area-'+id);
			delete this.data[id].opts;
			el.removeClass('keep');
		}
		if(!el.hasClass('keep')){
			el.find('.line').css({'stroke':''});
			el.find('.area').css({'fill':''});
		}
		this.info.remove();
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
				this.maxdate = new Date('2000-01-01');
				for(var id in byid){
					byid[id].mindate = new Date(byid[id].mindate+'T00:00Z');
					byid[id].maxdate = new Date(byid[id].maxdate+'T00:00Z');
					if(byid[id].maxdate > this.maxdate) this.maxdate = byid[id].maxdate;
					byid[id].ndays = Math.round((byid[id].maxdate.getTime()-byid[id].mindate.getTime())/86400000)+1;
					if(byid[id].ndays > ndays) ndays = byid[id].ndays;
				}
				this.data = byid;
				this.maxcases = max;
				this.maxdays = ndays+5;
				this.maxdateformat = getDate(this.maxdate);
				graph.x.max = this.maxdays;

				this.updateLabels();
				this.draw();
				this.updateAreas();

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



function InfoBubbles(graph,opts){
	var msg = {};
	this.msg = msg;
	this.opts = opts;
	function getXY(el){
		var r,r2,xoff;
		r = el.getBoundingClientRect();
		r2 = el.parentNode.getBoundingClientRect();
		xoff = parseFloat(el.nearestViewportElement.getAttribute('x'));
		return {'x':(xoff+r.width).toFixed(2),'y':(r.top-r2.top).toFixed(2)};
	}
	this.update = function(){
		var r,r2,xoff,id;
		for(id in msg){
			if(msg[id].el){
				xy = getXY(msg[id].original);
				S(msg[id].el).css({'left':xy.x+'px','top':xy.y+'px','position':'absolute'});
			}
		}
		return this;
	}
	this.unprotect = function(id){
		if(msg[id]){
			msg[id].keep = false;
			msg[id].el.remove();
		}
		return this;
	}
	this.add = function(id,txt,el,opts){
		if(!msg[id] || !msg[id].el){
			if(!msg[id]) msg[id] = {'original':el };
			var xy = getXY(el);
			info = document.createElement('div');
			info.setAttribute("style",'left:'+xy.x+'px; top:'+xy.y+'px;position:absolute;');
			info.setAttribute("id","label-"+id);
			msg[id].el = info;
			graph.el.svg.insertAdjacentElement('afterend',msg[id].el);
		}
		
		el = S(msg[id].el);
		bg = opts.background || this.opts.background;
		c = opts.color || this.opts.color;
		if(bg) el.css({'background':bg,'border-color':bg});
		if(c) el.css({'color':c});
		if(opts.keep) msg[id].keep = opts.keep;
		if(opts['class']) el.addClass(opts['class']);
		el.html(txt+'<div class="after"></div>');
		return this;
	}
	this.remove = function(id){
		if(typeof id==="string"){
			if(!msg[id]) return this;
			if(!msg[id].keep){
				if(msg[id].el && msg[id].el.parentNode) msg[id].el.parentNode.removeChild(msg[id].el);
				delete msg[id];
			}
		}else{
			for(id in msg){
				if(msg[id] && !msg[id].keep){
					if(msg[id].el && msg[id].el.parentNode) msg[id].el.parentNode.removeChild(msg[id].el);
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


/*
	Stuquery SVG Builder
*/
function SVG(id,w,h){
	if(!id) return this;
	this.version = "0.1.6";
	this.canvas = S('#'+id);
	this.w = parseInt(w || this.canvas[0].offsetWidth);
	this.h = parseInt(h || this.canvas[0].offsetHeight);
	this.id = id;
	this.canvas.html('<svg height="'+this.h+'" version="1.1" width="'+this.w+'" viewBox="0 0 '+this.w+' '+this.h+'" xmlns="http://www.w3.org/2000/svg"><desc>Created by stuQuery SVG</desc></svg>');
	this.paper = S(this.canvas.find('svg')[0]);

	// Initialise
	this.nodes = [];
	this.clippaths = [];
	this.patterns = [];
	
	var _obj = this;
	var counter = 0;
	
	function Path(path){
		this.path = path;
		this.p = path;
		
		if(typeof path==="string"){
			this.path = path;
			this.p = path;
			var c;
			this.p += '0';
			this.p = this.p.match(/(^|[A-Za-z]| )[^ A-Za-z]+/g);
			var a = this.p[this.p.length-1];
			this.p[this.p.length-1] = a.substring(0,a.length-1);
			for(var i = 0; i < this.p.length; i++){
				if(this.p[i].search(/[A-Za-z]/) == 0){
					c = this.p[i][0];
					this.p[i] = this.p[i].substr(1);
				}else{
					if(this.p[i][0] == ' ') this.p[i] = this.p[i].substr(1);
					c = '';
				}
				this.p[i] = [c,this.p[i].split(/\,/)];
				if(this.p[i][1].length == 2){
					for(var j = 0; j < this.p[i][1].length; j++) this.p[i][1][j] = parseFloat(this.p[i][1][j]);
				}else{
					this.p[i][1] = [];
				}
			}
		}else{
			this.p = path;
			this.path = this.string(path);
		}
		return this;
	}
	Path.prototype.string = function(){
		var str = '';
		for(var i = 0; i < this.p.length; i++){
			str += ((this.p[i][0]) ? this.p[i][0] : ' ')+(this.p[i][1].length > 0 ? this.p[i][1].join(',') : ' ');
		}
		return str;
	};
	function copy(o){
		var out, v, key;
		out = Array.isArray(o) ? [] : {};
		for(key in o){
			if(o[key]){
				v = o[key];
				out[key] = (typeof v === "object") ? copy(v) : v;
			}
		}
		return out;
	}
	Path.prototype.copy = function(){
		return new Path(copy(this.p));
	};
	function Node(inp){
		this.transforms = [];
		// Make a structure to hold the original properties
		this.orig = {};
		this.events = [];
		var i;
		for(i in inp){
			if(inp[i]) this[i] = inp[i];
		}
		for(i in inp){
			if(inp[i]) this.orig[i] = inp[i];
		}
		if(this.path){
			this.path = new Path(this.path);
			this.d = this.path.string();
			this.orig.path = this.path.copy();
			this.orig.d = this.d;
		}
		this.id = _obj.id+'-svg-node-'+counter;
		counter++;

		return this;
	}
	Node.prototype.on = function(type,attr,fn){
		if(!fn && typeof attr==="function"){
			fn = attr;
			attr = {};
		}
		this.events.push({'type':type,'attr':attr,'fn':fn});
		return this;
	};
	Node.prototype.attr = function(attr,arg){
		if(arg){ attr = {}; attr[attr] = arg; }
		if(!this.attributes) this.attributes = {};
		if(!this.el || this.el.length == 0) this.el = S('#'+this.id);
		for(var a in attr){
			if(attr[a]){
				if(typeof attr[a]==="string") attr[a] = attr[a].replace(/\"/g,"\'");
				this.attributes[a] = attr[a];
				this.el.attr(a,attr[a]);
				// Update the path on the element's "d" property
				if(a=="path") this.el.attr('d',(new Path(attr[a])).string());
				if(this.type=="text"){
					// Update any tspan elements' x position
					var tspan = this.el.find('tspan');
					for(var i = 0 ; i < tspan.length; i++) tspan[i].setAttribute('x',(this.attributes.x||this.x));
				}
			}
		}
		this.orig.attributes = JSON.parse(JSON.stringify(this.attributes));
		
		if(this.attributes && this.attributes.id) this.id = this.attributes.id;

		return this;
	};
	Node.prototype.transform = function(ts){
		if(typeof ts.length==="undefined" && typeof ts==="object") ts = [ts];
		if(!this.transforms) this.transforms = [];
		for(var t = 0; t < ts.length; t++) this.transforms.push(ts[t]);
		return this;
	};
	Node.prototype.update = function(){
		if(this.transforms && this.transforms.length > 0){
			var t,p,i,j;

			// Reset path
			if(this.orig.path) this.path = this.orig.path.copy();
			
			// Loop over all the transforms and update properties
			for(t = 0; t < this.transforms.length; t++){
				for(p in this.transforms[t].props){
					// Replace the current value with the original
					if(this.orig[p] && this[p]) this[p] = JSON.parse(JSON.stringify(this.orig[p]));
				}
			}
			// Update attributes to the original ones
			if(this.orig.attributes) this.attributes = JSON.parse(JSON.stringify(this.orig.attributes));

			for(t = 0; t < this.transforms.length; t++){
				if(this.transforms[t].type=="scale"){
					if(this.type == "path"){
						for(i = 0; i < this.orig.path.p.length; i++){
							for(j = 0; j < this.orig.path.p[i][1].length; j++){
								this.path.p[i][1][j] *= this.transforms[t].props[(j%2==0 ? "x": "y")];
							}
						}
						this.path.path = this.path.string();
						this.d = this.path.path;
					}else{
						for(p in this.transforms[t].props){
							if(this[p]) this[p] *= this.transforms[t].props[p];
						}
					}
					if(this.attributes){
						for(p in this.transforms[t].props){
							if(this.attributes[p]) this.attributes[p] *= this.transforms[t].props[p];
						}
					}
				}
			}
		}
		return this;
	};
	this.circle = function(x,y,r){
		this.nodes.push(new Node({'cx':x,'cy':y,'r':r,'type':'circle'}));
		return this.nodes[this.nodes.length-1];
	};
	this.rect = function(x,y,w,h,r){
		if(r) this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'r':r,'rx':r,'ry':r,'type':'rect'}));
		else this.nodes.push(new Node({'x':x,'y':y,'width':w,'height':h,'type':'rect'}));
		return this.nodes[this.nodes.length-1];
	};
	this.path = function(path){
		this.nodes.push(new Node({'path':path,'type':'path'}));
		return this.nodes[this.nodes.length-1];
	};
	this.text = function(x,y,text){
		this.nodes.push(new Node({'x':x,'y':y,'type':'text','text':text}));
		return this.nodes[this.nodes.length-1];
	};
	this.clip = function(o){
		this.clippaths.push(new Node(o));
		return this.clippaths[this.clippaths.length-1];
	};
	this.pattern = function(o){
		this.patterns.push(o);
		return this.patterns[this.patterns.length-1];
	};

	return this;
}
SVG.prototype.clear = function(){
	this.nodes = [];
	this.clippaths = [];
	this.patterns = [];
	this.draw();
	return this;
};
SVG.prototype.draw = function(head){
	var i,j,e;
	var dom = "<desc>Created by stuQuery SVG</desc>";
	if(this.patterns.length > 0){
		for(i = 0; i < this.patterns.length; i++) dom += this.patterns[i];
	}
	if(this.clippaths.length > 0){
		dom += '<defs>';
		for(i = 0; i < this.clippaths.length; i++){
		
			dom += '<clipPath id="'+this.clippaths[i].id+'">';
			if(this.clippaths[i].type){
				// Update node with any transforms
				this.clippaths[i].update();
				dom += '<'+this.clippaths[i].type;
				// Add properties
				for(j in this.clippaths[i]){
					if(j != "type" && typeof this.clippaths[i][j]!=="object" && typeof this.clippaths[i][j]!=="function" && j != "attributes"){
						dom += ' '+j+'="'+this.clippaths[i][j]+'"';
					}
				}
				dom += ' />';
			}
			dom += '</clipPath>';
		}
		dom += '</defs>';
	}

	function buildChunk(nodes,node){
		
		var n = nodes[node];
		var chunk = "";
		var t = n.type;
		var arr = (n.text) ? n.text.split(/\n/) : [];
		var j,a;
		
		if(n.type){
			chunk += '<'+t;
			// Update node with any transforms
			n.update();
			// Add properties
			for(j in n){
				if(j != "type" && typeof n[j]!=="object" && typeof n[j]!=="function" && j != "attributes"){
					if(j=="text" && arr.length > 1) chunk += '';
					else chunk += ' '+j+'="'+n[j]+'"';
				}
			}
			chunk += ' id="'+n.id+'"';
			// Add attributes
			for(a in n.attributes){
				if(n.attributes[a]) chunk += ' '+a+'="'+(a == "clip-path" ? 'url(#':'')+n.attributes[a]+(a == "clip-path" ? ')':'')+'"';
			}
			// Draw internal parts of a text element
			if(n.text){
				var y = 0;
				var lh = 1.2;
				chunk += '>';
				var off = -0.5 + arr.length*0.5;
				for(a = 0; a < arr.length; a++, y+=lh){
					chunk += '<tspan'+(a==0 ? ' dy="-'+(lh*off)+'em"':' x="'+(n.attributes.x||n.x)+'" dy="'+lh+'em"')+'>'+arr[a]+'</tspan>';
				}
				chunk += '</'+t+'>';
			}else{
				chunk += ' />';
			}
		}
		return chunk;
	}

	// Build the SVG chunks for each node
	for(i = 0; i < this.nodes.length; i++) dom += buildChunk(this.nodes,i);

	this.paper.html(dom);

	// Attach events to DOM
	for(i = 0; i < this.nodes.length; i++){
		if(this.nodes[i].events){
			for(e = 0; e < this.nodes[i].events.length; e++){
				S('#'+this.nodes[i].id).on(this.nodes[i].events[e].type,this.nodes[i].events[e].attr,this.nodes[i].events[e].fn);
			}
		}
	}

	return this;
};

// Display a hex map
// Requires stuquery.svg.js to be loaded first
// Input structure:
//    id: the ID for the HTML element to attach this to
//    width: the width of the SVG element created
//    height: the height of the SVG element created
//    padding: an integer number of hexes to leave as padding around the displayed map
//    showgrid: do we show the background grid?
//    formatLabel: a function to format the hex label
//    size: the size of a hexagon in pixels
function HexMap(attr){

	this.version = "0.4";
	if(!attr) attr  = {};
	this._attr = attr;
	if(S('#'+attr.id).length==0){
		console.log("Can't find the element to draw into (#"+attr.id+")");
		return {};
	}

	this.w = attr.width || 300;
	this.h = attr.height || 150;
	this.maxw = this.w;
	this.maxh = this.h;
	this.s = attr.size || 10;
	this.aspectratio = this.w/this.h;
	this.id = attr.id;
	this.hexes = {};
	this.min = 0;
	this.max = 1;
	this.padding = (typeof attr.padding==="number" ? attr.padding : 0);
	this.properties = { 'size': (typeof attr.size==="number" ? attr.size : 10) };
	
	var fs = (typeof attr.size==="number" ? attr.size : 10)*0.4;

	if(S('#'+this.id+'-inner').length==0) S('#'+this.id).append('<div id="'+this.id+'-inner"></div>');
	this.el = S('#'+this.id+'-inner');

	this.options = {
		'showgrid':(typeof attr.grid==="boolean" ? attr.grid : false),
		'showlabel':(typeof attr.showlabel==="boolean" ? attr.showlabel : true),
		'formatLabel': (typeof attr.formatLabel==="function" ? attr.formatLabel : function(txt,attr){ return txt.substr(0,3); }),
		'minFontSize': (typeof attr.minFontSize==="number" ? attr.minFontSize : 4)
	};

	this.style = {
		'default': { 'fill': '#cccccc','fill-opacity':(this.options.showlabel ? 0.5 : 1),'font-size':fs,'stroke-width':1.5,'stroke-opacity':1,'stroke':'#ffffff' },
		'highlight': { 'fill': '#1DD3A7' },
		'grid': { 'fill': '#aaa','fill-opacity':0.1 }
	};

	for(var s in attr.style){
		if(attr.style[s]){
			if(!this.style[s]) this.style[s] = {};
			if(attr.style[s].fill) this.style[s].fill = attr.style[s].fill;
			if(attr.style[s]['fill-opacity']) this.style[s]['fill-opacity'] = attr.style[s]['fill-opacity'];
			if(attr.style[s]['font-size']) this.style[s]['font-size'] = attr.style[s]['font-size'];
			if(attr.style[s].stroke) this.style[s].stroke = attr.style[s].stroke;
			if(attr.style[s]['stroke-width']) this.style[s]['stroke-width'] = attr.style[s]['stroke-width'];
			if(attr.style[s]['stroke-opacity']) this.style[s]['stroke-opacity'] = attr.style[s]['stroke-opacity'];
		}
	}
	
	this.mapping = {};

	// Can load a file or a hexjson data structure
	this.load = function(file,attr,fn){
		if(typeof attr==="function" && !fn){
			fn = attr;
			attr = "";
		}
		if(typeof fn !== "function") return this;

		if(typeof file==="string"){
			S(document).ajax(file,{
				'complete': function(data){
					this.setMapping(data);
					this.search.init();
					if(typeof fn==="function") fn.call(this,{'data':attr});
				},
				'error': this.failLoad,
				'this': this,
				'dataType':'json'
			});
		}else if(typeof file==="object"){
			this.setMapping(file);
			this.search.init();
			if(typeof fn==="function") fn.call(this,{'data':attr});
		}
		return this;
	};

	var _obj = this;
	// We'll need to change the sizes when the window changes size
	window.addEventListener('resize', function(event){ _obj.resize(); });
	
	function clone(d){
		return JSON.parse(JSON.stringify(d));
	}

	this.setHexStyle = function(r){
		var h = this.hexes[r];
		var style = clone(this.style['default']);
		var cls = "";

		if(h.active){
			style.fill = h.fillcolour;
			//cls += ' active';
		}
		if(h.hover){
			cls += ' hover';
		}
		if(h.selected){
			for(var p in this.style.selected){
				if(this.style.selected[p]) style[p] = this.style.selected[p];
			}
			cls += ' selected';
		}
		if(this.search.active) cls += (h.highlight) ? ' highlighted' : ' not-highlighted';
		style['class'] = 'hex-cell'+cls;
		h.attr(style);

		this.labels[r].attr({'class':'hex-label'+cls});

		return h;
	};
	
	this.toFront = function(r){
		// Simulate a change of z-index by moving elements to the end of the SVG
		
		// Keep selected items on top
		for(var region in this.hexes){
			if(this.hexes[region].selected){
				this.paper.paper[0].appendChild(this.hexes[region].el[0]);
				this.paper.paper[0].appendChild(this.labels[region].el[0]);
			}
		}
		// Simulate a change of z-index by moving this element (hex and label) to the end of the SVG
		this.paper.paper[0].appendChild(this.hexes[r].el[0]);
		this.paper.paper[0].appendChild(this.labels[r].el[0]);
		return this;
	};

	this.regionToggleSelected = function(r,others){
		this.selected = (this.selected==r) ? "" : r;
		var h = this.hexes[r];
		h.selected = !h.selected;
		this.setHexStyle(r);
		var region;

		// If we've deselected a region, deselect any other regions selected
		if(!h.selected){
			if(others){
				for(region in this.hexes){
					if(this.hexes[region].selected){
						this.hexes[region].selected = false;
						this.setHexStyle(region);
					}
				}
			}
		}
		return this;
	};

	this.regionFocus = function(r){
		var h = this.hexes[r];
		h.hover = true;
		this.setHexStyle(r);
		this.toFront(r);
		return this;
	};

	this.regionBlur = function(r){
		var h = this.hexes[r];
		h.hover = false;
		this.setHexStyle(r);
		return this;
	};

	this.regionActivate = function(r){
		var h = this.hexes[r];
		h.active = true;
		this.setHexStyle(r);
	};

	this.regionDeactivate = function(r){
		var h = this.hexes[r];
		h.active = false;
		this.setHexStyle(r);
	};

	this.regionToggleActive = function(r){
		var h = this.hexes[r];
		h.active = !h.active;
		this.setHexStyle(r);
	};

	this.selectRegion = function(r){
		this.selected = r;
		var h;
		for(var region in this.hexes){
			if(this.hexes[region]){
				h = this.hexes[region];
				if(r.length > 0 && region.indexOf(r)==0){
					h.selected = true;
					this.setHexStyle(region);
				}else{
					h.selected = false;
					this.setHexStyle(region);
				}
			}
		}
		return this;
	};

	// Add events (mouseover, mouseout, click)	
	this.on = function(type,attr,fn){
		if(typeof attr==="function" && !fn){
			fn = attr;
			attr = "";
		}
		if(typeof fn !== "function") return this;
		if(!this.callback) this.callback = {};
		this.callback[type] = { 'fn': fn, 'attr': attr };
		return this;
	};

	// Move the selected hex to the new coordinates
	this.moveTo = function(q,r){
		if(this.selected){
			var dq = q - this.mapping.hexes[this.selected].q;
			var dr = r - this.mapping.hexes[this.selected].r;

			for(var region in this.hexes){
				if(this.hexes[region]){
					if(region.indexOf(this.selected)==0){
						this.hexes[region].selected = true;
					}
					if(this.hexes[region].selected){
						this.mapping.hexes[region].q += dq;
						this.mapping.hexes[region].r += dr;
						var h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
						this.hexes[region].attr({'path':h.path}).update();
						if(this.options.showlabel && this.labels[region]){
							this.labels[region].attr({'x':h.x,'y':h.y+this.style['default']['font-size']/2,'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r}).update();
						}
						this.hexes[region].selected = false;
						this.setHexStyle(region);
					}
				}
			}
			this.selected = "";
		}
	};

	this.size = function(w,h){
		this.el.css({'height':'','width':''});
		w = Math.min(this.w,S('#'+this.id)[0].offsetWidth);
		this.el.css({'height':(w/this.aspectratio)+'px','width':w+'px'});
		this.paper = new SVG(this.id+'-inner',this.maxw,this.maxh);
		w = this.paper.w;
		h = this.paper.h;
		var scale = w/this.w;
		this.properties.size = this.s*scale;
		this.w = w;
		this.h = h;
		this.transform = {'type':'scale','props':{x:w,y:h,cx:w,cy:h,r:w,'stroke-width':w}};
		this.el.css({'height':'','width':''});

		return this;
	};
	
	function Search(attr){

		if(!attr) attr = {};
		this.attr = attr;
		this.el = '';
		this.active = false;
		this.selected = -1;
		this.regions = {};
		
		this.init = function(){
			for(var region in _obj.hexes){
				this.regions[region] = _obj.hexes[region].attributes.title.toLowerCase();
			}
		}
		this.key = function(str){
			str = str.toLowerCase();
			var regions = {};
			if(str.length > 2){
				for(var region in this.regions){
					if(this.regions[region].indexOf(str)>=0){
						regions[region] = true;
					}
				}
			}
			this.highlight(regions,n);
		};
		this.pick = function(value){
			// Trigger the click event on the appropriate hex
			if(_obj.hexes[value]) _obj.hexes[value].el.trigger('click');
		};
		this.highlight = function(rs){
			this.n = 0;
			var region;
			for(region in rs){
				if(rs[region]) this.n++;
			}
			for(region in _obj.hexes){
				if(this.n>0){
					if(rs[region]){
						_obj.hexes[region].highlight = true;//(rs[region]);
						_obj.hexes[region].attr({'class':'hex-cell highlighted'});
					}else{
						_obj.hexes[region].highlight = false;
						_obj.hexes[region].attr({'class':'hex-cell not-highlighted'});
					}
				}else{
					_obj.hexes[region].highlight = false;
					_obj.hexes[region].attr({'class':'hex-cell'});
				}
			}

			return this;
		};

		return this;
	}

	this.resize = function(){
		return this;
	};

	this.initialized = function(){
		this.create().draw();
		S('.spinner').remove();
		return this;
	};

	this.create = function(){
		this.paper.clear();
		this.constructed = false;
		return this;
	};

/*
	this.autoscale = function(){
		var min = 1e100;
		var max = -1e100;
		for(var region in this.mapping.hexes){
			if(typeof this.values[region]==="number"){
				if(this.values[region] < min) min = this.values[region];
				if(this.values[region] > max) max = this.values[region];
			}
		}
		this.min = min;
		this.max = max;
		return this;
	}
*/
	this.setMapping = function(mapping){
		this.mapping = mapping;
		if(!this.properties) this.properties = { "x": 100, "y": 100 };
		this.properties.x = this.w/2;
		this.properties.y = this.h/2;
		this.setSize();
		var p = mapping.layout.split("-");
		this.properties.shift = p[0];
		this.properties.orientation = p[1];

		return this.initialized();
	};

	this.setSize = function(size){
		if(size) this.properties.size = size;
		this.properties.s = { 'cos': this.properties.size*Math.sqrt(3)/2, 'sin': this.properties.size*0.5 };
		this.properties.s.c = this.properties.s.cos.toFixed(2);
		this.properties.s.s = this.properties.s.sin.toFixed(2);
		return this;
	};

	this.drawHex = function(q,r,scale){
		if(this.properties){
			if(typeof scale!=="number") scale = 1;
			scale = Math.sqrt(scale);

			var x = this.properties.x + (q * this.properties.s.cos * 2);
			var y = this.properties.y - (r * this.properties.s.sin * 3);

			if(this.properties.orientation == "r"){
				if(this.properties.shift=="odd" && (r&1) == 1) x += this.properties.s.cos;
				if(this.properties.shift=="even" && (r&1) == 0) x += this.properties.s.cos;
			}
			if(this.properties.orientation == "q"){
				if(this.properties.shift=="odd" && ((q&1) == 1)) y += this.properties.s.cos;
				if(this.properties.shift=="even" && ((q&1) == 0)) y += this.properties.s.cos;
			}

			var path = [['M',[x,y]]];
			var cs = this.properties.s.c * scale;
			var ss = this.properties.s.s * scale;
			if(this.properties.orientation == "r"){
				// Pointy topped
				path.push(['m',[cs,-ss]]);
				path.push(['l',[-cs,-ss,-cs,ss,0,(this.properties.size*scale).toFixed(2),cs,ss,cs,-ss]]);
				path.push(['z',[]]);
			}else{
				// Flat topped
				path.push(['m',[-ss,cs]]);
				path.push(['l',[-ss,-cs,ss,cs,(this.properties.size*scale).toFixed(2),0,ss,cs,-ss,cs]]);
				path.push(['z',[]]);
			}
			return { 'path':path, 'x':x, 'y': y };
		}
		return this;
	};

	this.updateColours = function(){
		var fn = (typeof this.setColours==="function") ? this.setColours : function(){ return this.style['default'].fill; };
		for(var region in this.mapping.hexes){
			if(this.mapping.hexes[region]){
				this.hexes[region].fillcolour = fn.call(this,region);
				this.setHexStyle(region);
			}
		}

		return this;
	};
	
	this.draw = function(){

		var r,q,h,region;

		var range = { 'r': {'min':1e100,'max':-1e100}, 'q': {'min':1e100,'max':-1e100} };
		for(region in this.mapping.hexes){
			if(this.mapping.hexes[region]){
				q = this.mapping.hexes[region].q;
				r = this.mapping.hexes[region].r;
				if(q > range.q.max) range.q.max = q;
				if(q < range.q.min) range.q.min = q;
				if(r > range.r.max) range.r.max = r;
				if(r < range.r.min) range.r.min = r;
			}
		}
		
		// Add padding to range
		range.q.min -= this.padding;
		range.q.max += this.padding;
		range.r.min -= this.padding;
		range.r.max += this.padding;
	
		// q,r coordinate of the centre of the range
		var qp = (range.q.max+range.q.min)/2;
		var rp = (range.r.max+range.r.min)/2;
		
		this.properties.x = (this.w/2) - (this.properties.s.cos * 2 *qp);
		this.properties.y = (this.h/2) + (this.properties.s.sin * 3 *rp);
		
		// Store this for use elsewhere
		this.range = range;
		
		var events = {
			'mouseover': function(e){
				var t = 'mouseover';
				if(e.data.hexmap.callback[t]){
					for(var a in e.data.hexmap.callback[t].attr){
						if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
					}
					if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
				}
			},
			'mouseout': function(e){
				var t = 'mouseout';
				if(e.data.hexmap.callback[t]){
					for(var a in e.data.hexmap.callback[t].attr){
						if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
					}
					if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
				}
			},
			'click': function(e){
				var t = 'click';
				if(e.data.hexmap.callback[t]){
					for(var a in e.data.hexmap.callback[t].attr){
						if(e.data.hexmap.callback[t].attr[a]) e.data[a] = e.data.hexmap.callback[t].attr[a];
					}
					if(typeof e.data.hexmap.callback[t].fn==="function") return e.data.hexmap.callback[t].fn.call(this,e);
				}
			}
		};
		
		if(this.options.showgrid){
			this.grid = [];
		
			for(q = range.q.min; q <= range.q.max; q++){
				for(r = range.r.min; r <= range.r.max; r++){
					h = this.drawHex(q,r);
					this.grid.push(this.paper.path(h.path).attr({'class':'hex-grid','data-q':q,'data-r':r,'fill':(this.style.grid.fill||''),'fill-opacity':(this.style.grid['fill-opacity']||0.1),'stroke':(this.style.grid.stroke||'#aaa'),'stroke-opacity':(this.style.grid['stroke-opacity']||0.2)}));
					this.grid[this.grid.length-1].on('mouseover',{type:'grid',hexmap:this,data:{'r':r,'q':q}},events.mouseover)
						.on('mouseout',{type:'grid',hexmap:this,me:_obj,data:{'r':r,'q':q}},events.mouseout)
						.on('click',{type:'grid',hexmap:this,region:region,me:_obj,data:{'r':r,'q':q}},events.click);
						
					// Make all the clipping areas
					this.paper.clip({'path':h.path,'type':'path'}).attr({'id':'hex-clip-'+q+'-'+r});
				}
			}
		}

		var min = 50000;
		var max = 80000;
		this.values = {};

		for(region in this.mapping.hexes){
			if(this.mapping.hexes[region]){
				this.values[region] = (this.mapping.hexes[region].p - min)/(max-min);
				if(this.values[region].value < 0) this.values[region] = 0;
				if(this.values[region].value > 1) this.values[region] = 1;

				h = this.drawHex(this.mapping.hexes[region].q,this.mapping.hexes[region].r);
				
				if(!this.constructed){
					this.hexes[region] = this.paper.path(h.path).attr({'class':'hex-cell','data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r});
					this.hexes[region].selected = false;
					this.hexes[region].active = true;
					this.hexes[region].attr({'id':'hex-'+region});

					// Attach events
					this.hexes[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
						.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.hexes[region]},events.mouseout)
						.on('click',{type:'hex',hexmap:this,region:region,me:this.hexes[region],data:this.mapping.hexes[region]},events.click);


					if(this.options.showlabel){
						if(!this.labels) this.labels = {};
						if(this.style['default']['font-size'] > this.options.minFontSize){
							this.labels[region] = this.paper.text(h.x,h.y+this.style['default']['font-size']/2,this.options.formatLabel(this.mapping.hexes[region].n,{'size':this.properties.size,'font-size':this.style['default']['font-size']})).attr({'clip-path':'hex-clip-'+this.mapping.hexes[region].q+'-'+this.mapping.hexes[region].r,'data-q':this.mapping.hexes[region].q,'data-r':this.mapping.hexes[region].r,'class':'hex-label','text-anchor':'middle','font-size':this.style['default']['font-size']+'px','title':(this.mapping.hexes[region].n || region)});
							this.labels[region].attr({'id':'hex-'+region+'-label'});
							//this.paper.clip({'path':h.path,'type':'path'}).attr({'id':'hex-'+region+'-clip'});
						}
					}

					// Attach events
					this.labels[region].on('mouseover',{type:'hex',hexmap:this,region:region,data:this.mapping.hexes[region],pop:this.mapping.hexes[region].p},events.mouseover)
						.on('mouseout',{type:'hex',hexmap:this,region:region,me:this.labels[region]},events.mouseout)
						.on('click',{type:'hex',hexmap:this,region:region,me:this.labels[region],data:this.mapping.hexes[region]},events.click);

				}
				this.setHexStyle(region);
				this.hexes[region].attr({'stroke':this.style['default'].stroke,'stroke-opacity':this.style['default']['stroke-opacity'],'stroke-width':this.style['default']['stroke-width'],'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
				//this.hexes[region].attr({'fill-opacity':this.style.selected['fill-opacity'],'fill':(this.hexes[region].selected ? this.style.selected.fill||this.hexes[region].fillcolour : this.style.default.fill),'stroke':'#ffffff','stroke-width':1.5,'title':this.mapping.hexes[region].n,'data-regions':region,'style':'cursor: pointer;'});
				this.hexes[region].update();
			}
		}

		if(!this.constructed) this.paper.draw();

		this.constructed = true;

		return this;
	};
	
	S(document).on('keypress',{me:this},function(e){
		e.stopPropagation();
		if(e.originalEvent.charCode==99) e.data.me.selectBySameColour(e);		// C
	});
		

	this.selectBySameColour = function(){
		if(this.selected){
			for(var region in this.hexes){
				if(this.hexes[region].fillcolour==this.hexes[this.selected].fillcolour){
					this.hexes[region].selected = true;
					this.setHexStyle(region);
					//this.hexes[region].attr({'fill':this.style.selected.fill||this.hexes[region].fillcolour,'fill-opacity':this.style.selected['fill-opacity']});
				}
			}
		}
		return this;
	};
		
	this.size();
	if(attr.file) this.load(attr.file);
	
	this.search = new Search(attr.search);
	console.log('here',_obj,this)


	return this;
}

// Define colour routines
function Colour(c,n){
	if(!c) return {};

	function d2h(d) { return ((d < 16) ? "0" : "")+d.toString(16);}
	function h2d(h) {return parseInt(h,16);}
	/**
	 * Converts an RGB color value to HSV. Conversion formula
	 * adapted from http://en.wikipedia.org/wiki/HSV_color_space.
	 * Assumes r, g, and b are contained in the set [0, 255] and
	 * returns h, s, and v in the set [0, 1].
	 *
	 * @param   Number  r       The red color value
	 * @param   Number  g       The green color value
	 * @param   Number  b       The blue color value
	 * @return  Array           The HSV representation
	 */
	function rgb2hsv(r, g, b){
		r = r/255;
		g = g/255;
		b = b/255;
		var max = Math.max(r, g, b), min = Math.min(r, g, b);
		var h, s, v = max;
		var d = max - min;
		s = max == 0 ? 0 : d / max;
		if(max == min) h = 0; // achromatic
		else{
			switch(max){
				case r: h = (g - b) / d + (g < b ? 6 : 0); break;
				case g: h = (b - r) / d + 2; break;
				case b: h = (r - g) / d + 4; break;
			}
			h /= 6;
		}
		return [h, s, v];
	}

	this.alpha = 1;

	// Let's deal with a variety of input
	if(c.indexOf('#')==0){
		this.hex = c;
		this.rgb = [h2d(c.substring(1,3)),h2d(c.substring(3,5)),h2d(c.substring(5,7))];
	}else if(c.indexOf('rgb')==0){
		var bits = c.match(/[0-9\.]+/g);
		if(bits.length == 4) this.alpha = parseFloat(bits[3]);
		this.rgb = [parseInt(bits[0]),parseInt(bits[1]),parseInt(bits[2])];
		this.hex = "#"+d2h(this.rgb[0])+d2h(this.rgb[1])+d2h(this.rgb[2]);
	}else return {};
	this.hsv = rgb2hsv(this.rgb[0],this.rgb[1],this.rgb[2]);
	this.name = (n || "Name");
	var r,sat;
	for(r = 0, sat = 0; r < this.rgb.length ; r++){
		if(this.rgb[r] > 200) sat++;
	}
	this.text = (this.rgb[0] + this.rgb[1] + this.rgb[2] > 500 || sat > 1) ? "black" : "white";
	return this;
}

var scales = {
	'Viridis8': 'rgb(122,76,139) 0, rgb(124,109,168) 12.5%, rgb(115,138,177) 25%, rgb(107,164,178) 37.5%, rgb(104,188,170) 50%, rgb(133,211,146) 62.5%, rgb(189,229,97) 75%, rgb(254,240,65) 87.5%, rgb(254,240,65) 100%',
	'ODI': 'rgb(114,46,165) 0%, rgb(230,0,124) 50%, rgb(249,188,38) 100%',
	'Heat': 'rgb(0,0,0) 0%, rgb(128,0,0) 25%, rgb(255,128,0) 50%, rgb(255,255,128) 75%, rgb(255,255,255) 100%',
	'Planck': 'rgb(0,0,255) 0, rgb(0,112,255) 16.666%, rgb(0,221,255) 33.3333%, rgb(255,237,217) 50%, rgb(255,180,0) 66.666%, rgb(255,75,0) 100%',
	'EPC': '#ef1c3a 1%, #ef1c3a 20.5%, #f78221 20.5%, #f78221 38.5%, #f9ac64 38.5%, #f9ac64 54.5%, #ffcc00 54.5%, #ffcc00 68.5%, #8cc63f 68.5%, #8cc63f 80.5%, #1bb35b 80.5%, #1bb35b 91.5%, #00855a 91.5%, #00855a 120%',
	'Plasma': 'rgb(12,7,134) 0, rgb(82,1,163) 12.5%, rgb(137,8,165) 25%, rgb(184,50,137) 37.5%, rgb(218,90,104) 50%, rgb(243,135,72) 62.5%, rgb(253,187,43) 75%, rgb(239,248,33) 87.5%',
	'Referendum': '#4BACC6 0, #B6DDE8 50%, #FFF380 50%, #FFFF00 100%',
	'Leodis': '#2254F4 0%, #F9BC26 50%, #ffffff 100%',
	'Longside': '#801638 0%, #addde6 100%'
}

// Send the colour stops as a string along with the minimum and maximum values
function extractColours(c,mn,mx){
	var stops = c.replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s\s/g," ").split(', ');
	var cs = new Array();
	for(var i = 0; i < stops.length; i++){
		var bits = stops[i].split(/ /);
		if(bits.length==2) cs.push({'v':bits[1],'c':new Colour(bits[0])})
		else if(bits.length==1) cs.push({'c':new Colour(bits[0])});
	}
	var r = mx-mn;
	for(var c=0; c < cs.length;c++){
		// If a colour-stop has a percentage value provided, 
		if(cs[c].v && cs[c].v.indexOf('%')>0) cs[c].v = (mn + parseFloat(cs[c].v)*r/100);
	}
	if(!cs[0].v) cs[0].v = mn; // Set the minimum value
	if(!cs[cs.length-1].v) cs[cs.length-1].v = mx; // Set the maximum value
	var skip = 0;
	// If a colour-stop doesn't have a specified position and it isn't the first
	// or last stop, then it is assigned the position that is half way between
	// the previous stop and next stop
	for(var c=1; c < cs.length;c++){
		// If we haven't got a value we increment our counter and move on
		if(!cs[c].v) skip++;
		// If we have a value and the counter shows we've skipped some
		// we now back-track and set them.
		if(cs[c].v && skip > 0){
			for(var d = 1; d <= skip ; d++){
				a = cs[c-skip-1].v;
				b = cs[c].v;
				cs[c-d].v = a + (b-a)*(skip-d+1)/(skip+1);
			}
			todo = 0;
		}
	}
	return cs;
}

function getColourScale(v,min,max,s){

	if(!s) s = "ODI";

	var cs = extractColours(scales[s],min,max);

	if(cs.length == 1) var colour = 'rgba('+cs[0].c.rgb[0]+', '+cs[0].c.rgb[1]+', '+cs[0].c.rgb[2]+', ' + v / max + ")";
	else{
		var colour = "";
		for(var c = 0; c < cs.length-1; c++){
			if(v >= cs[c].v){
				var pc = (v - cs[c].v)/(cs[c+1].v-cs[c].v);
				var a = cs[c].c;
				var b = cs[c+1].c;
				if(v > max) pc = 1;	// Don't go above colour range
				colour = 'rgb('+parseInt(a.rgb[0] + (b.rgb[0]-a.rgb[0])*pc)+','+parseInt(a.rgb[1] + (b.rgb[1]-a.rgb[1])*pc)+','+parseInt(a.rgb[2] + (b.rgb[2]-a.rgb[2])*pc)+')';
				continue;
			}
		}
	}
	return colour;	
}


function ColourScale(c1,c2){
	this.a = new Colour(c1);
	this.b = (c2 ? new Colour(c2) : this.a);
	var _obj = this;
	this.getColourStop = function(pc){
		pc /= 100;
		a = this.a;
		b = this.b;
		return 'rgb('+parseInt(this.a.rgb[0] + (b.rgb[0]-a.rgb[0])*pc)+','+parseInt(a.rgb[1] + (b.rgb[1]-a.rgb[1])*pc)+','+parseInt(a.rgb[2] + (b.rgb[2]-a.rgb[2])*pc)+')';
	}
	this.makeGradient = function(){
		a = this.a;
		b = this.b;
		return 'background: '+a.hex+'; background: -moz-linear-gradient(left, '+a.hex+' 0%, '+b.hex+' 100%);background: -webkit-linear-gradient(left, '+a.hex+' 0%,'+b.hex+' 100%);background: linear-gradient(to right, '+a.hex+' 0%,'+b.hex+' 100%);';
	}
	
	return this;
}
function ResultsMap(id,attr){
	if(!attr) attr = {};
	if(!attr.padding) attr.padding = 0;
	if(!attr.width || !attr.height || !attr.file || !attr.views) return {};

	this.w = attr.width;
	this.h = attr.height;
	this.aspectratio = attr.width/attr.height;
	this.id = id;
	this.type = "";
	this.files = {};
	this.views = attr.views;
	this.cache = {};

	if(S('#data-selector').length > 0) this.type = S('#data-selector')[0].value;
	if(S('.view-toggle').length > 0) this.type = document.querySelector('input[name="view"]:checked').id;

	this.defaulttype = this.type;


	function updateToggles(){
		S('.view-toggle').parent().removeClass('on').addClass('off');
		S('#'+document.querySelector('input[name="view"]:checked').id).parent().removeClass('off').addClass('on');
		return this;
	}
	
	this.qs = qs();

	var t;
	// Use the search string to pick a parameter to display
	//t = this.qs.type || location.search.replace(/\?/,"");

	if(t){
		// Check if this is in the list
		var options = S('#data-selector option');
		var v,i,ok;
		if(options.length > 0){
			ok = false;
			v = "";
			for(i = 0; i < options.length; i++){
				if(options[i].getAttribute('value')==t){
					ok = true;
				}
			}
			if(ok){
				S('#data-selector')[0].value = t;
				this.type = t;
			}
		}else{
			// Check if this is in the list
			options = S('.view-toggle');

			if(options.length > 0){
				v = "";
				for(i = 0; i < options.length; i++){
					if(options[i].getAttribute('id')==t){
						options[i].checked = true;
						this.type = t;
					}
				}
			}
		}
		updateToggles();
	}

	// Create a hex map
	var attrhex = JSON.parse(JSON.stringify(attr));
	attrhex.id = id;
	attrhex.size = 16;

	this.hex = new HexMap(attrhex);

	// Do we update the address bar?
	this.pushstate = !!(window.history && history.pushState);

	// Add "back" button functionality
	var _obj = this;
	if(this.pushstate){
		window[(this.pushstate) ? 'onpopstate' : 'onhashchange'] = function(e){
			if(e.state && e.state.type) _obj.updateData(e.state.type);
			else _obj.updateData(_obj.defaulttype);
		};
	}

	this.hex.load(attr.file,{me:this},function(e){
		el = document.querySelector('input[name="view"]:checked');
		e.data.me.setType(e.data.me.type,el.getAttribute('data'),(e.data.me.type!=e.data.me.defaulttype ? true : false));
	});

	
	// Listen for resizing information
	window.addEventListener('message', function(event){
		_obj.iframe = event.data;
		_obj.positionBubble();
	}, false);

	this.positionBubble = function(){
		if(this.iframe && S('.infobubble').length > 0) S('.infobubble').css({'top':'calc('+(this.iframe.top > 0 ? this.iframe.top : 0)+'px + 1em)','max-height':(this.iframe.height)+'px'});
	};

	this.setType = function(t,d,update){


		// Have we changed type?
		if(t==this.by){
			console.log('no change');
			return this;
		}

		console.log('setType',t,d)


		// Create query string
		this.qs.type = t;
		str = '';
		if(this.qs.type) str += (str ? '&':'')+'type='+this.qs.type;
		if(typeof this.qs.headless==="boolean") str += (str ? '&':'')+'headless='+this.qs.headless;

		// Update the history
		if(this.pushstate) history.pushState({type:t},"Hexes",(update ? '?'+str : ''));

		this.updateData(t,d);

		return this;
	};

	this.updateData = function(type,dtype){

		console.log('updateData',type,dtype);
		if(this.polling){
			console.info('Stop loop');
			clearInterval(this.polling);
		}

		if(!this.data || !this.data[type]){
			return this.loadResults(type,dtype,function(type,dtype){
				// Set the colours of the map
				this.setColours(type,dtype);
			});
		}else{

			// Set the colours
			this.setColours(type,dtype);
		}
		
		return this;
	};

	// Add events to map
	this.hex.on('mouseover',{'builder':this},function(e){

		e.data.hexmap.regionFocus(e.data.region);

		if(S('#tooltip').length==0) S('#'+e.data.builder.id+'-inner').append('<div id="tooltip"></div>');
		var tooltip = S('#tooltip');
		tooltip.html(e.data.builder.hex.hexes[e.data.region].attributes.title+'</div>');
		var bb = e.data.builder.hex.hexes[e.data.region].el[0].getBoundingClientRect();
		tooltip.css({'position':'absolute','left':''+Math.round(bb.left+(bb.width/2)-S('#'+e.data.builder.id)[0].offsetLeft)+'px','top':''+Math.round(bb.y+bb.height+window.scrollY-S('#'+e.data.builder.id)[0].offsetTop)+'px'});

	}).on('mouseout',{'builder':this},function(e){

		e.data.hexmap.regionBlur(e.data.region);
		S('#tooltip').remove();

	}).on('click',{'builder':this},function(e){

		e.data.builder.openActive(e.data.region);

	});
	
	this.closeActive = function(){
		this.hex.selected = "";
		this.hex.selectRegion('');
		S('.infobubble').remove();
		S('body').removeClass('modal');
		return this;
	};
	
	this.openActive = function(region){

		var previous = this.hex.selected;
		var current = region;
		if(this.hex.search.active) this.hex.search.toggle();

		this.label(region,previous!=current);
		this.hex.selectRegion(region);

		return this;
	};

	this.label = function(region,reopen){

		var view = this.views[this.by];
		if(!view) return this;
		var popup = view.popup;

		var title = this.hex.hexes[region].el[0].getAttribute('title');

		if(reopen){
			S('.infobubble').remove();
			S('#'+this.id+'').after('<div class="infobubble generalelection"><div class="infobubble_inner"><div class="spinner"><svg width="64" height="64" viewBox="-32 -32 64 64" xmlns="http://www.w3.org/2000/svg" style="transform-origin: center center;"><style>#odilogo-starburst rect2 { transform-origin: center center; -webkit-transform-origin: center center; }</style><g id="odilogo-starburst"><rect width="4" height="25" x="-2" transform="rotate(7)" fill="#2254F4"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(27)" fill="#F9BC26"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(47)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(67)" fill="#D60303"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(87)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(107)" fill="#1DD3A7"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(127)" fill="#EF3AAB"><animate attributeName="height" begin="0s" dur="2s" values="25;20;22;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(147)" fill="#FF6700"><animate attributeName="height" begin="0s" dur="4s" values="25;24;18;23;27;23;29;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(167)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="4s" values="25;15;27;25;24;32;16;24;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(187)" fill="#178CFF"><animate attributeName="height" begin="0s" dur="5s" values="25;18;23;21;31;20;24;21;28;31;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(207)" fill="#722EA5"><animate attributeName="height" begin="0s" dur="3s" values="25;32;16;24;19;27;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(227)" fill="#D73058"><animate attributeName="height" begin="0s" dur="5s" values="25;23;25;28;18;27;24;30;31;28;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(247)" fill="#00B6FF"><animate attributeName="height" begin="0s" dur="4s" values="25;19;23;29;26;25;31;21;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(267)" fill="#67E767"><animate attributeName="height" begin="0s" dur="2s" values="25;29;23;20;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(287)" fill="#E6007C"><animate attributeName="height" begin="0s" dur="1s" values="25;20;27;25;" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(307)" fill="#0DBC37"><animate attributeName="height" begin="0s" dur="5s" values="25;15;27;25;32;16;24;27;18;32;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(327)" fill="#D60303"><animate attributeName="height" begin="0s" dur="6s" values="25;19;26;30;21;24;29;27;15;23;20;29;25" calcMode="linear" repeatCount="indefinite" /></rect><rect width="4" height="25" x="-2" transform="rotate(347)" fill="#08DEF9"><animate attributeName="height" begin="0s" dur="3s" values="25;27;24;32;23;19;25" calcMode="linear" repeatCount="indefinite" /></rect></g><g id="odilogo"><circle cx="-12.8" cy="0" r="6.4" style="fill:black;"></circle><path d="M-7 -6.4 l 6.4 0 c 0 0 6.4 0 6.4 6.4 c 0 6.4 -6.4 6.4 -6.4 6.4 L -7 6.4Z" style="fill:black;"></path><rect width="6.4" height="12.5" x="5.5" y="-6.25" style="fill:black;"></rect></g></svg></div></div></div>');
		}

		function callback(title,region,data,attr){

			if(!attr) attr = {};
//console.log('test',title,region,data,attr);

			//var lbl = this.hex.mapping.hexes[region].label;
			var l = {};
			if(popup && typeof popup.render==="function"){
				l = popup.render.call(this,title,region,data,attr);
			}else{
				console.warn('No view for '+this.by+'/'+this.bysrc);
				l = {'label':title,'class':cls,'color':''};
			}
			var c = (l.color||'');
			var t = (l.color ? setTextColor(c) : 'black');
			var txt = l.label;
			txt = txt.replace(/%COLOR%/g,t);
			S('.infobubble_inner').html(txt).css({'width':(l.w ? l.w+'px':''),'height':(l.h ? l.h+'px':'')});
			S('.infobubble').attr('class','infobubble'+(l['class'] ? " "+l['class'] : ''));
			S('.infobubble .close').remove();
			S('.infobubble').prepend('<button class="close button" title="Close constituency information">&times;</button>');
			S('.infobubble .close').on('click',{me:this},function(e){ e.data.me.closeActive(); });
			if(typeof l.callback==="function") l.callback.call(this,title,region,data,attr);
			return this;
		}
		console.log(this.by,this.bysrc)
		callback.call(this,title,region,this.data[this.bysrc][region]);
		
		S('body').addClass('modal');

		return this;
	};


	// Add events to buttons for colour changing
	S('.view-toggle').on('change',{me:this},function(e){
		updateToggles();
		el = document.querySelector('input[name="view"]:checked');
		id = el.id;
		e.data.me.setType(id,el.getAttribute('data'),true);
	});

	S(document).on('keypress',function(e){
		//if(e.originalEvent.charCode==109) S('#savesvg').trigger('click');     // M
		//if(e.originalEvent.charCode==104) S('#save').trigger('click');     // H
	});
	

	this.loadResults = function(type,dtype,callback){
		if(!type) type = "GE2015-results";

		if(!this.data) this.data = {};
		this.data[dtype] = {};
		if(!this.hex.data) this.hex.data = {};
		this.hex.data[dtype] = {};

		if(this.views[type]){
			file = this.views[type].file;
			if(!this.cache[file]){
				console.info('Getting '+this.views[type].file +' for '+type+' ('+dtype+')');
				S().ajax(file,{
					'this': this,
					'callback': callback,
					'dataType':(this.views[type].file.indexOf(".json") > 0 ? 'json':'text'),
					'type': type,
					'dtype': dtype,
					'cache': (typeof this.views[type].live==="boolean" ? !this.views[type].live : true),
					'process': this.views[type].process,
					'success': function(d,attr){
						// Convert to JSON if CSV
						if(attr.dataType=="text") d = CSV2JSON(d);
						attr.timestamp = getTimestamp(attr.header);
						this.cache[attr.url] = d;
						// Process the data
						attr.process.call(this,attr.type,d,attr);
						if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
					},
					'error': function(e,attr){
						console.error('Unable to load '+attr.url);
						attr.timestamp = "?";
						// Process the data
						attr.process.call(this,attr.type,[],attr);
						if(typeof attr.callback==="function") attr.callback.call(this,attr.type,attr.dtype);
					}
				});
			}else{
				console.log('Using cached data');
				// Process the data
				this.views[type].process.call(this,type,this.cache[file],{'this':this});
				if(typeof callback==="function") callback.call(this,type,dtype);
			}
			
		}
		return this;
	};

	this.setColours = function(type,dtype){
		if(!type) type = "";
		
		if(S('#data-selector').length > 0) S('#data-selector')[0].value = type;
		if(S('.view-toggle').length > 0){
			var options = S('.view-toggle');
			for(var i = 0; i < options.length; i++){
				if(options[i].getAttribute('id')==type) options[i].checked = true;
			}
		}

		this.by = type;
		this.bysrc = dtype;

		var key = "";

		// Set the function for changing the colours and creating the key
		if(this.views[type] && typeof this.views[type].key==="function") key = this.views[type].key.call(this);

		// Update the key
		S('#key').html(key);

		// Update the map colours
		this.hex.updateColours();

		// Re-render the popup?
		if(this.hex.selected) this.label(this.hex.selected); //re-render

		return this;
	};

	function getTimestamp(str){
		var timestamp = "";
		var date;
		str.replace(/last-modified: (.*)/,function(m,p1){ date = p1; });
		if(date){
			date = new Date(date);
			timestamp = (date.getUTCHours() < 10 ? "0" : "")+date.getUTCHours()+':'+(date.getUTCMinutes() < 10 ? "0" : "")+date.getUTCMinutes();
		}
		return timestamp;
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


	// Start of colour code

	function d2h(d) { return ((d < 16) ? "0" : "")+d.toString(16);}
	function h2d(h) {return parseInt(h,16);}

	function setTextColor(hex){
		if(!hex) return '';
		var colour = new Colour(hex);
		hex = colour.hex;
		var L1 = getL(hex);
		var Lb = getL('#000000');
		var Lw = getL('#ffffff');
		var rb = (Math.max(L1, Lb) + 0.05) / (Math.min(L1, Lb) + 0.05);
		var rw = (Math.max(L1, Lw) + 0.05) / (Math.min(L1, Lw) + 0.05);
		if(L1 == Lw) return '#000000';
		return (rb > rw ? '#000000':'#FFFFFF');
	}
	function getL(c) {
		return (0.2126 * getsRGB(c.substr(1, 2)) + 0.7152 * getsRGB(c.substr(3, 2)) + 0.0722 * getsRGB(c.substr(-2)));
	}
	function getRGB(c) {
		try { c = parseInt(c, 16); } catch (err) { c = false; }
		return c;
	}
	function getsRGB(c) {
		c = getRGB(c) / 255;
		c = (c <= 0.03928) ? c / 12.92 : Math.pow(((c + 0.055) / 1.055), 2.4);
		return c;
	}

	return this;

}


S().ready(function(){

	// We need to load the data separately to making the graph. Use callbacks to attach the data to the graph and update.
	graph = new PandemicGraph({'id':'graph'});
	graph.getData();
	
	function resizeIframe(obj) { obj.style.height = '1px'; obj.style.height = obj.contentWindow.document.documentElement.scrollHeight + 'px'; }
	window.addEventListener('resize', function(event){
		iframes = S('iframe');
		for(var i = 0; i < iframes.length; i++) resizeIframe(iframes[i]);
	});




	// Build hexmap
	var LA2UTLA = { "E06000001":{"id":"E06000001","n":"Hartlepool"},"E06000002":{"id":"E06000002","n":"Middlesbrough"},"E06000003":{"id":"E06000003","n":"Redcar and Cleveland"},"E06000004":{"id":"E06000004","n":"Stockton-on-Tees"},"E06000005":{"id":"E06000005","n":"Darlington"},"E06000006":{"id":"E06000006","n":"Halton"},"E06000007":{"id":"E06000007","n":"Warrington"},"E06000008":{"id":"E06000008","n":"Blackburn with Darwen"},"E06000009":{"id":"E06000009","n":"Blackpool"},"E06000010":{"id":"E06000010","n":"Kingston upon Hull, City of"},"E06000011":{"id":"E06000011","n":"East Riding of Yorkshire"},"E06000012":{"id":"E06000012","n":"North East Lincolnshire"},"E06000013":{"id":"E06000013","n":"North Lincolnshire"},"E06000014":{"id":"E06000014","n":"York"},"E06000015":{"id":"E06000015","n":"Derby"},"E06000016":{"id":"E06000016","n":"Leicester"},"E06000017":{"id":"E06000017","n":"Rutland"},"E06000018":{"id":"E06000018","n":"Nottingham"},"E06000019":{"id":"E06000019","n":"Herefordshire, County of"},"E06000020":{"id":"E06000020","n":"Telford and Wrekin"},"E06000021":{"id":"E06000021","n":"Stoke-on-Trent"},"E06000022":{"id":"E06000022","n":"Bath and North East Somerset"},"E06000023":{"id":"E06000023","n":"Bristol, City of"},"E06000024":{"id":"E06000024","n":"North Somerset"},"E06000025":{"id":"E06000025","n":"South Gloucestershire"},"E06000026":{"id":"E06000026","n":"Plymouth"},"E06000027":{"id":"E06000027","n":"Torbay"},"E06000028":{"id":"E06000028","n":"Bournemouth"},"E06000029":{"id":"E06000029","n":"Poole"},"E06000030":{"id":"E06000030","n":"Swindon"},"E06000031":{"id":"E06000031","n":"Peterborough"},"E06000032":{"id":"E06000032","n":"Luton"},"E06000033":{"id":"E06000033","n":"Southend-on-Sea"},"E06000034":{"id":"E06000034","n":"Thurrock"},"E06000035":{"id":"E06000035","n":"Medway"},"E06000036":{"id":"E06000036","n":"Bracknell Forest"},"E06000037":{"id":"E06000037","n":"West Berkshire"},"E06000038":{"id":"E06000038","n":"Reading"},"E06000039":{"id":"E06000039","n":"Slough"},"E06000040":{"id":"E06000040","n":"Windsor and Maidenhead"},"E06000041":{"id":"E06000041","n":"Wokingham"},"E06000042":{"id":"E06000042","n":"Milton Keynes"},"E06000043":{"id":"E06000043","n":"Brighton and Hove"},"E06000044":{"id":"E06000044","n":"Portsmouth"},"E06000045":{"id":"E06000045","n":"Southampton"},"E06000046":{"id":"E06000046","n":"Isle of Wight"},"E06000047":{"id":"E06000047","n":"County Durham"},"E06000049":{"id":"E06000049","n":"Cheshire East"},"E06000050":{"id":"E06000050","n":"Cheshire West and Chester"},"E06000051":{"id":"E06000051","n":"Shropshire"},"E06000052":{"id":"E06000052","n":"Cornwall"},"E06000053":{"id":"E06000053","n":"Isles of Scilly"},"E06000054":{"id":"E06000054","n":"Wiltshire"},"E06000055":{"id":"E06000055","n":"Bedford"},"E06000056":{"id":"E06000056","n":"Central Bedfordshire"},"E06000057":{"id":"E06000057","n":"Northumberland"},"E07000004":{"id":"E10000002","n":"Buckinghamshire"},"E07000005":{"id":"E10000002","n":"Buckinghamshire"},"E07000146":{"id":"E10000020","n":"Norfolk"},"E07000147":{"id":"E10000020","n":"Norfolk"},"E07000148":{"id":"E10000020","n":"Norfolk"},"E07000149":{"id":"E10000020","n":"Norfolk"},"E07000150":{"id":"E10000021","n":"Northamptonshire"},"E07000151":{"id":"E10000021","n":"Northamptonshire"},"E07000152":{"id":"E10000021","n":"Northamptonshire"},"E07000153":{"id":"E10000021","n":"Northamptonshire"},"E07000154":{"id":"E10000021","n":"Northamptonshire"},"E07000155":{"id":"E10000021","n":"Northamptonshire"},"E07000156":{"id":"E10000021","n":"Northamptonshire"},"E07000163":{"id":"E10000023","n":"North Yorkshire"},"E07000164":{"id":"E10000023","n":"North Yorkshire"},"E07000165":{"id":"E10000023","n":"North Yorkshire"},"E07000166":{"id":"E10000023","n":"North Yorkshire"},"E07000167":{"id":"E10000023","n":"North Yorkshire"},"E07000168":{"id":"E10000023","n":"North Yorkshire"},"E07000169":{"id":"E10000023","n":"North Yorkshire"},"E07000170":{"id":"E10000024","n":"Nottinghamshire"},"E07000171":{"id":"E10000024","n":"Nottinghamshire"},"E07000172":{"id":"E10000024","n":"Nottinghamshire"},"E07000173":{"id":"E10000024","n":"Nottinghamshire"},"E07000174":{"id":"E10000024","n":"Nottinghamshire"},"E07000175":{"id":"E10000024","n":"Nottinghamshire"},"E07000176":{"id":"E10000024","n":"Nottinghamshire"},"E07000177":{"id":"E10000025","n":"Oxfordshire"},"E07000178":{"id":"E10000025","n":"Oxfordshire"},"E07000179":{"id":"E10000025","n":"Oxfordshire"},"E07000180":{"id":"E10000025","n":"Oxfordshire"},"E07000181":{"id":"E10000025","n":"Oxfordshire"},"E07000187":{"id":"E10000027","n":"Somerset"},"E07000188":{"id":"E10000027","n":"Somerset"},"E07000189":{"id":"E10000027","n":"Somerset"},"E07000190":{"id":"E10000027","n":"Somerset"},"E07000191":{"id":"E10000027","n":"Somerset"},"E07000192":{"id":"E10000028","n":"Staffordshire"},"E07000193":{"id":"E10000028","n":"Staffordshire"},"E07000194":{"id":"E10000028","n":"Staffordshire"},"E07000195":{"id":"E10000028","n":"Staffordshire"},"E07000196":{"id":"E10000028","n":"Staffordshire"},"E07000197":{"id":"E10000028","n":"Staffordshire"},"E07000198":{"id":"E10000028","n":"Staffordshire"},"E07000199":{"id":"E10000028","n":"Staffordshire"},"E07000200":{"id":"E10000029","n":"Suffolk"},"E07000201":{"id":"E10000029","n":"Suffolk"},"E07000202":{"id":"E10000029","n":"Suffolk"},"E07000203":{"id":"E10000029","n":"Suffolk"},"E07000204":{"id":"E10000029","n":"Suffolk"},"E07000205":{"id":"E10000029","n":"Suffolk"},"E07000206":{"id":"E10000029","n":"Suffolk"},"E07000207":{"id":"E10000030","n":"Surrey"},"E07000208":{"id":"E10000030","n":"Surrey"},"E07000209":{"id":"E10000030","n":"Surrey"},"E07000210":{"id":"E10000030","n":"Surrey"},"E07000211":{"id":"E10000030","n":"Surrey"},"E07000212":{"id":"E10000030","n":"Surrey"},"E07000213":{"id":"E10000030","n":"Surrey"},"E07000214":{"id":"E10000030","n":"Surrey"},"E07000215":{"id":"E10000030","n":"Surrey"},"E07000216":{"id":"E10000030","n":"Surrey"},"E07000217":{"id":"E10000030","n":"Surrey"},"E07000218":{"id":"E10000031","n":"Warwickshire"},"E07000219":{"id":"E10000031","n":"Warwickshire"},"E07000220":{"id":"E10000031","n":"Warwickshire"},"E07000221":{"id":"E10000031","n":"Warwickshire"},"E07000222":{"id":"E10000031","n":"Warwickshire"},"E07000223":{"id":"E10000032","n":"West Sussex"},"E07000224":{"id":"E10000032","n":"West Sussex"},"E07000225":{"id":"E10000032","n":"West Sussex"},"E07000226":{"id":"E10000032","n":"West Sussex"},"E07000227":{"id":"E10000032","n":"West Sussex"},"E07000228":{"id":"E10000032","n":"West Sussex"},"E07000229":{"id":"E10000032","n":"West Sussex"},"E07000234":{"id":"E10000034","n":"Worcestershire"},"E07000235":{"id":"E10000034","n":"Worcestershire"},"E07000236":{"id":"E10000034","n":"Worcestershire"},"E07000237":{"id":"E10000034","n":"Worcestershire"},"E07000238":{"id":"E10000034","n":"Worcestershire"},"E07000239":{"id":"E10000034","n":"Worcestershire"},"E07000240":{"id":"E10000015","n":"Hertfordshire"},"E07000241":{"id":"E10000015","n":"Hertfordshire"},"E07000242":{"id":"E10000015","n":"Hertfordshire"},"E07000243":{"id":"E10000015","n":"Hertfordshire"},"E07000244":{"id":"E10000029","n":"Suffolk"},"E07000245":{"id":"E10000029","n":"Suffolk"},"E07000246":{"id":"E10000027","n":"Somerset"},"E08000001":{"id":"E08000001","n":"Bolton"},"E08000002":{"id":"E08000002","n":"Bury"},"E08000003":{"id":"E08000003","n":"Manchester"},"E08000004":{"id":"E08000004","n":"Oldham"},"E08000005":{"id":"E08000005","n":"Rochdale"},"E08000006":{"id":"E08000006","n":"Salford"},"E08000007":{"id":"E08000007","n":"Stockport"},"E08000008":{"id":"E08000008","n":"Tameside"},"E08000009":{"id":"E08000009","n":"Trafford"},"E08000010":{"id":"E08000010","n":"Wigan"},"E08000011":{"id":"E08000011","n":"Knowsley"},"E08000012":{"id":"E08000012","n":"Liverpool"},"E08000013":{"id":"E08000013","n":"St. Helens"},"E08000014":{"id":"E08000014","n":"Sefton"},"E08000015":{"id":"E08000015","n":"Wirral"},"E08000016":{"id":"E08000016","n":"Barnsley"},"E08000017":{"id":"E08000017","n":"Doncaster"},"E08000018":{"id":"E08000018","n":"Rotherham"},"E08000019":{"id":"E08000019","n":"Sheffield"},"E08000021":{"id":"E08000021","n":"Newcastle upon Tyne"},"E08000022":{"id":"E08000022","n":"North Tyneside"},"E08000023":{"id":"E08000023","n":"South Tyneside"},"E08000024":{"id":"E08000024","n":"Sunderland"},"E08000025":{"id":"E08000025","n":"Birmingham"},"E08000026":{"id":"E08000026","n":"Coventry"},"E08000027":{"id":"E08000027","n":"Dudley"},"E08000028":{"id":"E08000028","n":"Sandwell"},"E08000029":{"id":"E08000029","n":"Solihull"},"E08000030":{"id":"E08000030","n":"Walsall"},"E08000031":{"id":"E08000031","n":"Wolverhampton"},"E08000032":{"id":"E08000032","n":"Bradford"},"E08000033":{"id":"E08000033","n":"Calderdale"},"E08000034":{"id":"E08000034","n":"Kirklees"},"E08000035":{"id":"E08000035","n":"Leeds"},"E08000036":{"id":"E08000036","n":"Wakefield"},"E08000037":{"id":"E08000037","n":"Gateshead"},"E09000001":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000002":{"id":"E09000002","n":"Barking and Dagenham"},"E09000003":{"id":"E09000003","n":"Barnet"},"E09000004":{"id":"E09000004","n":"Bexley"},"E09000005":{"id":"E09000005","n":"Brent"},"E09000006":{"id":"E09000006","n":"Bromley"},"E09000007":{"id":"E09000007","n":"Camden"},"E09000008":{"id":"E09000008","n":"Croydon"},"E09000009":{"id":"E09000009","n":"Ealing"},"E09000010":{"id":"E09000010","n":"Enfield"},"E09000011":{"id":"E09000011","n":"Greenwich"},"E09000012":{"id":"E09000001-12","n":"Hackney and City of London"},"E09000013":{"id":"E09000013","n":"Hammersmith and Fulham"},"E09000014":{"id":"E09000014","n":"Haringey"},"E09000015":{"id":"E09000015","n":"Harrow"},"E09000016":{"id":"E09000016","n":"Havering"},"E09000017":{"id":"E09000017","n":"Hillingdon"},"E09000018":{"id":"E09000018","n":"Hounslow"},"E09000019":{"id":"E09000019","n":"Islington"},"E09000020":{"id":"E09000020","n":"Kensington and Chelsea"},"E09000021":{"id":"E09000021","n":"Kingston upon Thames"},"E09000022":{"id":"E09000022","n":"Lambeth"},"E09000023":{"id":"E09000023","n":"Lewisham"},"E09000024":{"id":"E09000024","n":"Merton"},"E09000025":{"id":"E09000025","n":"Newham"},"E09000026":{"id":"E09000026","n":"Redbridge"},"E09000027":{"id":"E09000027","n":"Richmond upon Thames"},"E09000028":{"id":"E09000028","n":"Southwark"},"E09000029":{"id":"E09000029","n":"Sutton"},"E09000030":{"id":"E09000030","n":"Tower Hamlets"},"E09000031":{"id":"E09000031","n":"Waltham Forest"},"E09000032":{"id":"E09000032","n":"Wandsworth"},"E09000033":{"id":"E09000033","n":"Westminster"},"W06000001":{"id":"W06000001","n":"Isle of Anglesey"},"W06000002":{"id":"W06000002","n":"Gwynedd"},"W06000003":{"id":"W06000003","n":"Conwy"},"W06000004":{"id":"W06000004","n":"Denbighshire"},"W06000005":{"id":"W06000005","n":"Flintshire"},"W06000006":{"id":"W06000006","n":"Wrexham"},"W06000008":{"id":"W06000008","n":"Ceredigion"},"W06000009":{"id":"W06000009","n":"Pembrokeshire"},"W06000010":{"id":"W06000010","n":"Carmarthenshire"},"W06000011":{"id":"W06000011","n":"Swansea"},"W06000012":{"id":"W06000012","n":"Neath Port Talbot"},"W06000013":{"id":"W06000013","n":"Bridgend"},"W06000014":{"id":"W06000014","n":"Vale of Glamorgan"},"W06000015":{"id":"W06000015","n":"Cardiff"},"W06000016":{"id":"W06000016","n":"Rhondda Cynon Taf"},"W06000018":{"id":"W06000018","n":"Caerphilly"},"W06000019":{"id":"W06000019","n":"Blaenau Gwent"},"W06000020":{"id":"W06000020","n":"Torfaen"},"W06000021":{"id":"W06000021","n":"Monmouthshire"},"W06000022":{"id":"W06000022","n":"Newport"},"W06000023":{"id":"W06000023","n":"Powys"},"W06000024":{"id":"W06000024","n":"Merthyr Tydfil"},"E07000006":{"id":"E10000002","n":"Buckinghamshire"},"E07000007":{"id":"E10000002","n":"Buckinghamshire"},"E07000008":{"id":"E10000003","n":"Cambridgeshire"},"E07000009":{"id":"E10000003","n":"Cambridgeshire"},"E07000010":{"id":"E10000003","n":"Cambridgeshire"},"E07000011":{"id":"E10000003","n":"Cambridgeshire"},"E07000012":{"id":"E10000003","n":"Cambridgeshire"},"E07000026":{"id":"E10000006","n":"Cumbria"},"E07000027":{"id":"E10000006","n":"Cumbria"},"E07000028":{"id":"E10000006","n":"Cumbria"},"E07000029":{"id":"E10000006","n":"Cumbria"},"E07000030":{"id":"E10000006","n":"Cumbria"},"E07000031":{"id":"E10000006","n":"Cumbria"},"E07000032":{"id":"E10000007","n":"Derbyshire"},"E07000033":{"id":"E10000007","n":"Derbyshire"},"E07000034":{"id":"E10000007","n":"Derbyshire"},"E07000035":{"id":"E10000007","n":"Derbyshire"},"E07000036":{"id":"E10000007","n":"Derbyshire"},"E07000037":{"id":"E10000007","n":"Derbyshire"},"E07000038":{"id":"E10000007","n":"Derbyshire"},"E07000039":{"id":"E10000007","n":"Derbyshire"},"E07000040":{"id":"E10000008","n":"Devon"},"E07000041":{"id":"E10000008","n":"Devon"},"E07000042":{"id":"E10000008","n":"Devon"},"E07000043":{"id":"E10000008","n":"Devon"},"E07000044":{"id":"E10000008","n":"Devon"},"E07000045":{"id":"E10000008","n":"Devon"},"E07000046":{"id":"E10000008","n":"Devon"},"E07000047":{"id":"E10000008","n":"Devon"},"E07000048":{"id":"E10000009","n":"Dorset"},"E07000049":{"id":"E10000009","n":"Dorset"},"E07000050":{"id":"E10000009","n":"Dorset"},"E07000051":{"id":"E10000009","n":"Dorset"},"E07000052":{"id":"E10000009","n":"Dorset"},"E07000053":{"id":"E10000009","n":"Dorset"},"E07000061":{"id":"E10000011","n":"East Sussex"},"E07000062":{"id":"E10000011","n":"East Sussex"},"E07000063":{"id":"E10000011","n":"East Sussex"},"E07000064":{"id":"E10000011","n":"East Sussex"},"E07000065":{"id":"E10000011","n":"East Sussex"},"E07000066":{"id":"E10000012","n":"Essex"},"E07000067":{"id":"E10000012","n":"Essex"},"E07000068":{"id":"E10000012","n":"Essex"},"E07000069":{"id":"E10000012","n":"Essex"},"E07000070":{"id":"E10000012","n":"Essex"},"E07000071":{"id":"E10000012","n":"Essex"},"E07000072":{"id":"E10000012","n":"Essex"},"E07000073":{"id":"E10000012","n":"Essex"},"E07000074":{"id":"E10000012","n":"Essex"},"E07000075":{"id":"E10000012","n":"Essex"},"E07000076":{"id":"E10000012","n":"Essex"},"E07000077":{"id":"E10000012","n":"Essex"},"E07000078":{"id":"E10000013","n":"Gloucestershire"},"E07000079":{"id":"E10000013","n":"Gloucestershire"},"E07000080":{"id":"E10000013","n":"Gloucestershire"},"E07000081":{"id":"E10000013","n":"Gloucestershire"},"E07000082":{"id":"E10000013","n":"Gloucestershire"},"E07000083":{"id":"E10000013","n":"Gloucestershire"},"E07000084":{"id":"E10000014","n":"Hampshire"},"E07000085":{"id":"E10000014","n":"Hampshire"},"E07000086":{"id":"E10000014","n":"Hampshire"},"E07000087":{"id":"E10000014","n":"Hampshire"},"E07000088":{"id":"E10000014","n":"Hampshire"},"E07000089":{"id":"E10000014","n":"Hampshire"},"E07000090":{"id":"E10000014","n":"Hampshire"},"E07000091":{"id":"E10000014","n":"Hampshire"},"E07000092":{"id":"E10000014","n":"Hampshire"},"E07000093":{"id":"E10000014","n":"Hampshire"},"E07000094":{"id":"E10000014","n":"Hampshire"},"E07000095":{"id":"E10000015","n":"Hertfordshire"},"E07000096":{"id":"E10000015","n":"Hertfordshire"},"E07000098":{"id":"E10000015","n":"Hertfordshire"},"E07000099":{"id":"E10000015","n":"Hertfordshire"},"E07000102":{"id":"E10000015","n":"Hertfordshire"},"E07000103":{"id":"E10000015","n":"Hertfordshire"},"E07000105":{"id":"E10000016","n":"Kent"},"E07000106":{"id":"E10000016","n":"Kent"},"E07000107":{"id":"E10000016","n":"Kent"},"E07000108":{"id":"E10000016","n":"Kent"},"E07000109":{"id":"E10000016","n":"Kent"},"E07000110":{"id":"E10000016","n":"Kent"},"E07000111":{"id":"E10000016","n":"Kent"},"E07000112":{"id":"E10000016","n":"Kent"},"E07000113":{"id":"E10000016","n":"Kent"},"E07000114":{"id":"E10000016","n":"Kent"},"E07000115":{"id":"E10000016","n":"Kent"},"E07000116":{"id":"E10000016","n":"Kent"},"E07000117":{"id":"E10000017","n":"Lancashire"},"E07000118":{"id":"E10000017","n":"Lancashire"},"E07000119":{"id":"E10000017","n":"Lancashire"},"E07000120":{"id":"E10000017","n":"Lancashire"},"E07000121":{"id":"E10000017","n":"Lancashire"},"E07000122":{"id":"E10000017","n":"Lancashire"},"E07000123":{"id":"E10000017","n":"Lancashire"},"E07000124":{"id":"E10000017","n":"Lancashire"},"E07000125":{"id":"E10000017","n":"Lancashire"},"E07000126":{"id":"E10000017","n":"Lancashire"},"E07000127":{"id":"E10000017","n":"Lancashire"},"E07000128":{"id":"E10000017","n":"Lancashire"},"E07000129":{"id":"E10000018","n":"Leicestershire"},"E07000130":{"id":"E10000018","n":"Leicestershire"},"E07000131":{"id":"E10000018","n":"Leicestershire"},"E07000132":{"id":"E10000018","n":"Leicestershire"},"E07000133":{"id":"E10000018","n":"Leicestershire"},"E07000134":{"id":"E10000018","n":"Leicestershire"},"E07000135":{"id":"E10000018","n":"Leicestershire"},"E07000136":{"id":"E10000019","n":"Lincolnshire"},"E07000137":{"id":"E10000019","n":"Lincolnshire"},"E07000138":{"id":"E10000019","n":"Lincolnshire"},"E07000139":{"id":"E10000019","n":"Lincolnshire"},"E07000140":{"id":"E10000019","n":"Lincolnshire"},"E07000141":{"id":"E10000019","n":"Lincolnshire"},"E07000142":{"id":"E10000019","n":"Lincolnshire"},"E07000143":{"id":"E10000020","n":"Norfolk"},"E07000144":{"id":"E10000020","n":"Norfolk"},"E07000145":{"id":"E10000020","n":"Norfolk"},"E06000052":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"},"E06000053":{"id":"E06000052-3","n":"Cornwall and Isles of Scilly"}}
	var populations = {"E06000047":261868,"E06000005":52038,"E06000001":45595,"E06000002":69360,"E06000057":157458,"E06000003":67005,"E06000004":97817,"E11000007":562806,"E08000037":99993,"E08000021":153228,"E08000022":100815,"E08000023":73517,"E08000024":135253,"E12000002":3635677,"E06000008":74692,"E06000009":69099,"E06000049":188259,"E06000050":168531,"E06000006":63180,"E06000007":104600,"E10000006":246514,"E07000026":48360,"E07000027":33007,"E07000028":53079,"E07000029":33916,"E07000030":26365,"E07000031":51788,"E11000001":1414020,"E08000001":142564,"E08000002":94008,"E08000003":281159,"E08000004":117599,"E08000005":110478,"E08000006":131692,"E08000007":144160,"E08000008":111837,"E08000009":116684,"E08000010":163839,"E10000017":604149,"E07000117":43947,"E07000118":59697,"E07000119":39869,"E07000120":40117,"E07000121":72362,"E07000122":45686,"E07000123":72494,"E07000124":29969,"E07000125":35393,"E07000126":54364,"E07000127":55353,"E07000128":54898,"E11000002":702634,"E08000011":71704,"E08000012":251081,"E08000014":133092,"E08000013":89518,"E08000015":157240,"E12000003":2728776,"E06000011":167888,"E06000010":131762,"E06000012":78392,"E06000013":85773,"E06000014":103887,"E10000023":304577,"E07000163":27731,"E07000164":44912,"E07000165":78384,"E07000166":28274,"E07000167":27393,"E07000168":53166,"E07000169":44717,"E11000003":703853,"E08000016":122739,"E08000017":156275,"E08000018":131172,"E08000019":293666,"E11000006":1152644,"E08000032":266598,"E08000033":103606,"E08000034":218888,"E08000035":390347,"E08000036":173204,"E12000004":2415416,"E06000015":127751,"E06000016":181356,"E06000018":170287,"E06000017":20584,"E10000007":396158,"E07000032":63073,"E07000033":39983,"E07000034":51439,"E07000035":35555,"E07000036":57006,"E07000037":45855,"E07000038":49919,"E07000039":53329,"E10000018":353079,"E07000129":50607,"E07000130":94602,"E07000131":46665,"E07000132":56357,"E07000133":25120,"E07000134":52275,"E07000135":27453,"E10000019":376368,"E07000136":35577,"E07000137":69918,"E07000138":49875,"E07000139":57695,"E07000140":47309,"E07000141":69039,"E07000142":46955,"E10000021":377468,"E07000150":36255,"E07000151":43369,"E07000152":47511,"E07000153":50937,"E07000154":112926,"E07000155":46715,"E07000156":39756,"E10000024":412366,"E07000170":63715,"E07000171":58805,"E07000172":57204,"E07000173":58086,"E07000174":54355,"E07000175":60747,"E07000176":59454,"E12000005":2967551,"E06000019":96483,"E06000051":161847,"E06000021":129933,"E06000020":90362,"E10000028":439045,"E07000192":50334,"E07000193":60487,"E07000194":51823,"E07000195":65020,"E07000196":56449,"E07000197":68726,"E07000198":48811,"E07000199":37396,"E10000031":287255,"E07000218":32804,"E07000219":64079,"E07000220":54402,"E07000221":63968,"E07000222":72003,"E11000005":1467046,"E08000025":571590,"E08000026":193181,"E08000027":158366,"E08000028":164440,"E08000029":106003,"E08000030":141374,"E08000031":132094,"E10000034":295579,"E07000234":49402,"E07000235":38738,"E07000236":42336,"E07000237":50429,"E07000238":64236,"E07000239":50438,"E12000006":3094152,"E06000055":85970,"E06000056":143088,"E06000032":108450,"E06000031":103650,"E06000033":90619,"E06000034":87275,"E10000003":329326,"E07000008":65365,"E07000009":44314,"E07000010":51409,"E07000011":89370,"E07000012":78869,"E10000012":731915,"E07000066":91199,"E07000067":74579,"E07000068":37172,"E07000069":43977,"E07000070":88847,"E07000071":98130,"E07000072":63869,"E07000073":42486,"E07000074":32043,"E07000075":43247,"E07000076":71594,"E07000077":44771,"E10000015":584211,"E07000095":46940,"E07000096":76583,"E07000242":73398,"E07000098":50406,"E07000099":65829,"E07000240":72570,"E07000243":43442,"E07000102":45449,"E07000103":48268,"E07000241":61327,"E10000020":450967,"E07000143":70410,"E07000144":64065,"E07000145":49504,"E07000146":74710,"E07000147":51531,"E07000148":71020,"E07000149":69727,"E10000029":378681,"E07000200":45153,"E07000201":33837,"E07000202":68460,"E07000203":51621,"E07000204":57129,"E07000205":64387,"E07000206":58095,"E12000007":4526035,"E09000007":137911,"E09000001":4925,"E09000012":142522,"E09000001-12":147447,"E09000013":93441,"E09000014":137843,"E09000019":123495,"E09000020":78701,"E09000022":166355,"E09000023":152633,"E09000025":190893,"E09000028":162255,"E09000030":173895,"E09000032":158701,"E09000033":138765,"E09000002":106958,"E09000003":198805,"E09000004":120850,"E09000005":171383,"E09000006":161089,"E09000008":188497,"E09000009":171783,"E09000010":164697,"E09000011":148230,"E09000015":125866,"E09000016":126019,"E09000017":155844,"E09000018":139184,"E09000021":88190,"E09000024":101943,"E09000026":155440,"E09000027":96541,"E09000029":100961,"E09000031":141424,"E12000008":4553812,"E06000036":61188,"E06000043":147993,"E06000046":70187,"E06000035":138286,"E06000042":134266,"E06000044":110557,"E06000038":83000,"E06000039":76130,"E06000045":130700,"E06000037":78445,"E06000040":75109,"E06000041":84808,"E10000002":267645,"E07000004":101346,"E07000005":46811,"E07000006":33918,"E07000007":85570,"E10000011":271718,"E07000061":50374,"E07000062":45408,"E07000063":50547,"E07000064":46973,"E07000065":78415,"E10000014":679293,"E07000084":87108,"E07000085":59130,"E07000086":65160,"E07000087":57055,"E07000088":42267,"E07000089":48293,"E07000090":61799,"E07000091":86863,"E07000092":47853,"E07000093":62140,"E07000094":61625,"E10000016":784442,"E07000105":64429,"E07000106":82150,"E07000107":56241,"E07000108":59291,"E07000109":52380,"E07000110":85846,"E07000111":59055,"E07000112":56569,"E07000113":75171,"E07000114":69472,"E07000115":65190,"E07000116":58648,"E10000025":347408,"E07000177":75283,"E07000178":78448,"E07000179":70137,"E07000180":68934,"E07000181":54606,"E10000030":588322,"E07000207":66420,"E07000208":39286,"E07000209":74547,"E07000210":42548,"E07000211":73305,"E07000212":43422,"E07000213":49418,"E07000214":44144,"E07000215":42956,"E07000216":61771,"E07000217":50505,"E10000032":424316,"E07000223":31243,"E07000224":78585,"E07000225":59044,"E07000226":57225,"E07000227":70762,"E07000228":73805,"E07000229":53652,"E12000009":2802870,"E06000022":97185,"E06000028":98666,"E06000023":236712,"E06000052":280755,"E06000053":1021,"E06000024":105552,"E06000026":131798,"E06000029":74868,"E06000025":143292,"E06000030":112706,"E06000027":67195,"E06000054":252710,"E10000008":396241,"E07000040":71871,"E07000041":66245,"E07000042":40711,"E07000043":47977,"E07000044":42273,"E07000045":65737,"E07000046":33926,"E07000047":27502,"E10000009":210385,"E07000048":24485,"E07000049":43991,"E07000050":35229,"E07000051":23739,"E07000052":50000,"E07000053":32941,"E10000013":316534,"E07000078":57847,"E07000079":44439,"E07000080":43112,"E07000081":64642,"E07000082":59319,"E07000083":47175,"E10000027":277249,"E07000187":56766,"E07000188":61084,"E07000189":83139,"E07000190":59167,"E07000191":17094};
	var lookup = {};
	for(la in LA2UTLA){
		id = LA2UTLA[la].id;
		if(!lookup[id]) lookup[id] = {'n': LA2UTLA[la].n, 'LA':{} };
		lookup[id].LA[la] = true;
	}
	
	function process(type,data,attr){
		type = "COVID-19";
		if(!this.data[type]) this.data[type] = {};

		if(data.length > 0){
			total = 0;
			for(var i = 0; i < data.length; i++){
				code = data[i]['GSS_CD'];
				// Fix for Cornwall and Hackney in the PHE data
				if(code && code == "E06000052") data[i]['GSS_CD'] = "E06000052-3";
				if(code && code == "E09000012") data[i]['GSS_CD'] = "E09000001-12";
			}

			for(var i = 0; i < data.length; i++){
				code = data[i]['GSS_CD'];
				if(code){
					cases = parseInt(data[i]['TotalCases']);
					total += cases;
					percapita = (populations[code]) ? 1e5*cases/populations[code] : 0;
					if(!this.hex.hexes[code]){
						if(lookup[code]){
							if(!lookup[code].LA) console.warn(lookup[code]);
							n = Object.keys(lookup[code].LA).length;
							lastring = '';
							for(var la in lookup[code].LA){
								lastring += '<li>'+(this.hex.hexes[la] ? this.hex.hexes[la].attributes.title : '?')+'</li>';
							}
							//console.log('Population for '+code+' is '+populations[code]);
							for(var la in lookup[code].LA){
								this.data[type][la] = {
									'cases': cases/n,
									'percapita': percapita,
									'title':data[i]['GSS_NM'],
									'desc':'<strong>Total cases:</strong> '+cases+'.<br /><strong>Population (2020):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.<br /><strong>Includes:</strong> <ul>'+lastring+'</ul>'
								};
								//console.log(code+' ('+data[i]['GSS_NM']+') converts to '+la+' ('+n+' authorities)')
							}
						}else{
							console.warn('No hex for '+code+' and no UTLA lookup');
						}
					}else{
						//console.log('Population for '+code+' is '+populations[code]);
						this.data[type][code] = {
							'cases': cases,
							'percapita': percapita,
							'title':data[i]['GSS_NM'],
							'desc':'<strong>Total cases:</strong> '+cases+'.<br /><strong>Population (2020):</strong> '+(populations[code] ? populations[code].toLocaleString():'?')+'.<br /><strong>Cases per 100,000 people:</strong> '+Math.round(percapita)+'.'
						};
					}
				}
			}
		}else{
			for(var r in this.hex.hexes) this.data[type][r] = {};
		}
		now = new Date();
		if(S('#updated').length == 0) S('#'+this.id).prepend('<div id="updated">?</div>');
		S('#updated').html('Total: '+total.toLocaleString());
	}
	
	function render(title,region,data,attr){
		var r;
		var p = "";
		var lbl = "";
		var img = "";
		var wincolour = "";
		if(!data) data = {};

		lbl = '<h2 class="popup-title">'+(data.title||title)+'</h2>';
		lbl += (data.desc||'<p>Cases: '+data.cases);

		function postRender(title,region,data){
			S('#tooltip').remove();
		}

		return {'label':lbl,'class':'covid-19','color':'','callback': postRender };
	}

	var views = {
		'COVID-19-percapita':{
			'file': 'https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data',
			'process': process,
			'popup': {
				'render': render
			},
			'key': function(){
				var _obj = this;
				var min = 0;
				var max = -1e100;
				var filter = "percapita";
				var type = "COVID-19";
				for(la in this.data[type]){
					if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
					if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
				}
				this.hex.setColours = function(region){
					if(_obj.data[type][region]) return getColourScale(_obj.data[type][region][filter],min,max,"Viridis8");
					else return "#dfdfdf";
				}
				return '';
			}
		},
		'COVID-19-cases':{
			'file': 'https://www.arcgis.com/sharing/rest/content/items/b684319181f94875a6879bbc833ca3a6/data',
			'process': process,
			'popup': {
				'render': render
			},
			'key': function(){
				var _obj = this;
				var min = 0;
				var max = -1e100;
				var filter = "cases";
				var type = "COVID-19";
				for(la in this.data[type]){
					if(this.data[type][la][filter] > max) max = this.data[type][la][filter];
					if(this.data[type][la][filter] < min) min = this.data[type][la][filter];
				}
				this.hex.setColours = function(region){
					if(_obj.data[type][region]) return getColourScale(_obj.data[type][region][filter],min,max,"Viridis8");
					else return "#dfdfdf";
				}
				return '';
			}
		}
	}
	hexmap = new ResultsMap('hexmap',{
		'width':700,
		'height':850,
		'padding':0,
		'file':'https://raw.githubusercontent.com/odileeds/hexmaps/gh-pages/maps/uk-local-authority-districts-2019.hexjson',
		'views': views,
		'search':{'id':'search'}
	});
});