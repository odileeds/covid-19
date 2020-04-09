(function(root){

	/*!
	 * stuQuery
	 */
	(function(b){var f={};function d(h){this.stuquery="1.0.27";this.getBy=function(q,p){var o,l,n;o=-1;var j=[];if(p.indexOf(":eq")>0){l=p.replace(/(.*)\:eq\(([0-9]+)\)/,"$1 $2").split(" ");p=l[0];o=parseInt(l[1])}if(p[0]=="."){h=q.getElementsByClassName(p.substr(1))}else{if(p[0]=="#"){h=q.getElementById(p.substr(1))}else{h=q.getElementsByTagName(p)}}if(!h){h=[]}if(h.nodeName&&h.nodeName=="SELECT"){j.push(h)}else{if(typeof h.length!=="number"){h=[h]}for(n=0;n<h.length;n++){j.push(h[n])}if(o>=0&&j.length>0){if(o<j.length){j=[j[o]]}else{j=[]}}}return j};this.matchSelector=function(l,k){if(k[0]=="."){k=k.substr(1);for(var j=0;j<l.classList.length;j++){if(l.classList[j]==k){return true}}}else{if(k[0]=="#"){if(l.id==k.substr(1)){return true}}else{if(l.tagName==k.toUpperCase()){return true}}}return false};if(typeof h==="string"){this.e=this.querySelector(document,h)}else{if(typeof h==="object"){this.e=(typeof h.length=="number")?h:[h]}}for(var i in this.e){if(this.e[i]){this[i]=this.e[i]}}this.length=(this.e?this.e.length:0);return this}d.prototype.querySelector=function(m,h){var s=[];var q,r,p,n,l,o;if(h.indexOf(":eq")>=0){q=h.split(" ");for(p=0;p<q.length;p++){if(p==0){o=this.getBy(m,q[p])}else{r=[];for(n=0;n<o.length;n++){r=r.concat(this.getBy(o[n],q[p]))}o=r.splice(0)}}}else{o=m.querySelectorAll(h)}for(l=0;l<o.length;l++){s.push(o[l])}return s};d.prototype.ready=function(h){if(/in/.test(document.readyState)){setTimeout("S(document).ready("+h+")",9)}else{h()}};d.prototype.html=function(j){if(typeof j==="number"){j=""+j}if(typeof j!=="string"&&this.length==1){return this[0].innerHTML}if(typeof j==="string"){for(var h=0;h<this.length;h++){this[h].innerHTML=j}}return this};d.prototype.append=function(j){if(!j&&this.length==1){return this[0].innerHTML}if(j){for(var h=0;h<this.length;h++){var k=document.createElement("template");k.innerHTML=j;var l=(typeof k.content==="undefined"?k:k.content);if(l.childNodes.length>0){while(l.childNodes.length>0){this[h].appendChild(l.childNodes[0])}}else{this[h].append(j)}}}return this};d.prototype.prepend=function(l){var k,h,n,m;if(!l&&this.length==1){return this[0].innerHTML}for(k=0;k<this.length;k++){n=document.createElement("div");n.innerHTML=l;m=n.childNodes;for(h=m.length-1;h>=0;h--){this[k].insertBefore(m[h],this[k].firstChild)}}return this};d.prototype.before=function(l){var k,n,m,h;for(k=0;k<this.length;k++){n=document.createElement("div");n.innerHTML=l;m=n.childNodes;for(h=0;h<m.length;h++){this[k].parentNode.insertBefore(m[h],this[k])}}return this};d.prototype.after=function(j){for(var h=0;h<this.length;h++){this[h].insertAdjacentHTML("afterend",j)}return this};function g(h,k){if(h&&h.length>0){for(var j=0;j<h.length;j++){if(h[j].node==k){return{success:true,match:j}}}}return{success:false}}function e(l,j,i,h,k){if(!f[j]){f[j]=[]}f[j].push({node:l,fn:i,fn2:h,data:k})}function a(i){if(f[i.type]){var h=g(f[i.type],i.currentTarget);if(h.success){if(h.match.data){i.data=f[i.type][h.match].data}return{fn:f[i.type][h.match].fn,data:i}}}return function(){return{fn:""}}}d.prototype.off=function(k){if(typeof Element.prototype.removeEventListener!=="function"){Element.prototype.removeEventListener=function(q,n){if(!oListeners.hasOwnProperty(q)){return}var m=oListeners[q];for(var i=-1,l=0;l<m.aEls.length;l++){if(m.aEls[l]===this){i=l;break}}if(i===-1){return}for(var p=0,o=m.aEvts[i];p<o.length;p++){if(o[p]===n){o.splice(p,1)}}}}for(var j=0;j<this.length;j++){var h=g(f[k],this.e[j]);if(h.success){this[j].removeEventListener(k,f[k][h.match].fn2,false);f[k].splice(h.match,1)}}return this};d.prototype.on=function(m,o,k){var j=(m||window.event).split(/ /);if(typeof o==="function"&&!k){k=o;o=""}if(typeof k!=="function"){return this}if(this.length>0){var p=this;var n;for(var l=0;l<j.length;l++){m=j[l];n=function(i){var q=a({currentTarget:this,type:m,data:o,originalEvent:i,preventDefault:function(){if(i.preventDefault){i.preventDefault()}},stopPropagation:function(){if(i.stopImmediatePropagation){i.stopImmediatePropagation()}if(i.stopPropagation){i.stopPropagation()}if(i.cancelBubble!=null){i.cancelBubble=true}}});if(typeof q.fn==="function"){return q.fn.call(p,q.data)}};for(var h=0;h<this.length;h++){e(this[h],m,k,n,o);if(this[h].addEventListener){this[h].addEventListener(m,n,false)}else{if(this[h].attachEvent){this[h].attachEvent(m,n)}}}}}return this};d.prototype.trigger=function(m){var l;var j=m.split(/ /);for(var k=0;k<j.length;k++){if(document.createEvent){l=document.createEvent("HTMLEvents");l.initEvent(j[k],true,true)}else{l=document.createEventObject();l.eventType=j[k]}l.eventName=m;for(var h=0;h<this.length;h++){if(document.createEvent){this[h].dispatchEvent(l)}else{this[h].fireEvent("on"+l.eventType,l)}}}return this};d.prototype.focus=function(){if(this.length==1){this[0].focus()}return this};d.prototype.blur=function(){if(this.length==1){this[0].blur()}return this};d.prototype.remove=function(){if(this.length<1){return this}for(var h=this.length-1;h>=0;h--){if(!this[h]){return}if(typeof this[h].remove==="function"){this[h].remove()}else{if(typeof this[h].parentElement.removeChild==="function"){this[h].parentElement.removeChild(this[h])}}}return this};d.prototype.hasClass=function(j){var k,l;var h=true;for(k=0;k<this.length;k++){l=this[k].getAttribute("class");if(l){if(!l.match(new RegExp("(\\s|^)"+j+"(\\s|$)"))){h=false}}else{h=false}}return h};d.prototype.toggleClass=function(h){var j,k;for(j=0;j<this.length;j++){k=this[j].getAttribute("class");if(k){if(k.match(new RegExp("(\\s|^)"+h+"(\\s|$)"))){k=k.replace(new RegExp("(\\s|^)"+h+"(\\s|$)","g")," ").replace(/ $/,"")}else{k=(h+" "+h).replace(/^ /,"")}}else{k=h}this[j].setAttribute("class",k)}return this};d.prototype.addClass=function(h){var k,j;for(j=0;j<this.length;j++){k=this[j].getAttribute("class");if(k){if(!k.match(new RegExp("(\\s|^)"+h+"(\\s|$)"))){k=(k+" "+h).replace(/^ /,"")}}else{k=h}this[j].setAttribute("class",k)}return this};d.prototype.removeClass=function(h){var j,k;for(j=0;j<this.length;j++){k=this[j].getAttribute("class");if(k!=""){while(k.match(new RegExp("(\\s|^)"+h+"(\\s|$)"))){k=k.replace(new RegExp("(\\s|^)"+h+"(\\s|$)","g")," ").replace(/ $/,"").replace(/^ /,"")}this[j].setAttribute("class",k||"")}}return this};d.prototype.css=function(l){var q,k,o;if(this.length==1&&typeof l==="string"){q=window.getComputedStyle(this[0]);return q[l]}for(k=0;k<this.length;k++){q={};var h=this[k].getAttribute("style");if(h){var p=this[k].getAttribute("style").split(";");for(var n=0;n<p.length;n++){var j=p[n].split(":");if(j.length==2){q[j[0]]=j[1]}}}if(typeof l==="object"){for(o in l){if(typeof l[o]!=="undefined"){q[o]=l[o]}}var m="";for(o in q){if(typeof q[o]!=="undefined"){if(m){m+=";"}if(q[o]){m+=o+":"+q[o]}}}this[k].setAttribute("style",m)}}return this};d.prototype.parent=function(){var j=[];for(var h=0;h<this.length;h++){j.push(this[h].parentElement)}return S(j)};d.prototype.children=function(l){var j;if(typeof l==="string"){var h=[];for(j=0;j<this.length;j++){for(var k=0;k<this[j].children.length;k++){if(this.matchSelector(this[j].children[k],l)){h.push(this[j].children[k])}}}return S(h)}else{for(j=0;j<this.length;j++){this[j]=(this[j].children.length>l?this[j].children[l]:this[j])}return this}};d.prototype.find=function(j){var h=[];for(var k=0;k<this.length;k++){h=h.concat(this.querySelector(this[k],j))}return S(h)};function c(p,h,q,k){var o=[];for(var n=0;n<p.length;n++){o.push(p[n].getAttribute(h));var m=false;for(var l in k){if(typeof q===k[l]){m=true}}if(m){if(q){p[n].setAttribute(h,q)}else{p[n].removeAttribute(h)}}}if(o.length==1){o=o[0]}if(typeof q==="undefined"){return o}else{return p}}d.prototype.attr=function(h,i){return c(this,h,i,["string","number"])};d.prototype.prop=function(h,i){return c(this,h,i,["boolean"])};d.prototype.clone=function(){var h=document.createElement("div");h.appendChild(this[0].cloneNode(true));return h.innerHTML};d.prototype.replaceWith=function(k){var h;var l=S(this.e);for(var j=0;j<this.length;j++){h=document.createElement("div");h.innerHTML=k;l[j]=h.cloneNode(true);this[j].parentNode.replaceChild(l[j],this[j])}return l};d.prototype.width=function(){if(this.length>1){return}return this[0].offsetWidth};d.prototype.height=function(){if(this.length>1){return}return this[0].offsetHeight};d.prototype.outerWidth=function(){if(this.length>1){return}var h=getComputedStyle(this[0]);return this[0].offsetWidth+parseInt(h.marginLeft)+parseInt(h.marginRight)};d.prototype.outerHeight=function(){if(this.length>1){return}var h=getComputedStyle(this[0]);return this[0].offsetHeight+parseInt(h.marginTop)+parseInt(h.marginBottom)};d.prototype.offset=function(){var h=this[0].getBoundingClientRect();return{top:h.top+document.body.scrollTop,left:h.left+document.body.scrollLeft}};d.prototype.position=function(){if(this.length>1){return}return{left:this[0].offsetLeft,top:this[0].offsetTop}};d.prototype.ajax=function(i,s){if(typeof i!=="string"){return false}if(!s){s={}}var l="",o="";var q,r;if(i.indexOf("?")>0){r=i.split("?");if(r.length){i=r[0];o=r[1]}}if(s.dataType=="jsonp"){l="fn_"+(new Date()).getTime();window[l]=function(t){if(typeof s.success==="function"){s.success.call((s["this"]?s["this"]:this),t,s)}}}if(typeof s.cache==="boolean"&&!s.cache){o+=(o?"&":"")+(new Date()).valueOf()}if(l){o+=(o?"&":"")+"callback="+l}if(s.data){o+=(o?"&":"")+s.data}if(s.method=="POST"){s.url=i}else{s.url=i+(o?"?"+o:"")}if(s.dataType=="jsonp"){var p=document.createElement("script");p.src=s.url;document.body.appendChild(p);return this}q=(window.XMLHttpRequest)?new XMLHttpRequest():new ActiveXObject("Microsoft.XMLHTTP");q.addEventListener("load",window[l]||j);q.addEventListener("error",n);q.addEventListener("progress",h);var k="responseType" in q;if(s.beforeSend){q=s.beforeSend.call((s["this"]?s["this"]:this),q,s)}if(s.dataType=="script"){q.overrideMimeType("text/javascript")}function j(t){s.header=q.getAllResponseHeaders();var u;if(q.status==200||q.status==201||q.status==202){u=q.response;if(q.responseType==""||q.responseType=="text"){u=q.responseText}if(s.dataType=="json"){try{if(typeof u==="string"){u=JSON.parse(u.replace(/[\n\r]/g,"\\n").replace(/^([^\(]+)\((.*)\)([^\)]*)$/,function(z,y,x,A){return(y==l)?x:""}).replace(/\\n/g,"\n"))}}catch(w){n(w)}}if(s.dataType=="script"){var v=document.createElement("script");v.setAttribute("type","text/javascript");v.innerHTML=u;document.head.appendChild(v)}s.statusText="success";if(typeof s.success==="function"){s.success.call((s["this"]?s["this"]:this),u,s)}}else{s.statusText="error";n(t)}if(typeof s.complete==="function"){s.complete.call((s["this"]?s["this"]:this),u,s)}}function n(t){if(typeof s.error==="function"){s.error.call((s["this"]?s["this"]:this),t,s)}}function h(t){if(typeof s.progress==="function"){s.progress.call((s["this"]?s["this"]:this),t,s)}}if(k&&s.dataType){try{q.responseType=s.dataType}catch(m){n(m)}}try{q.open((s.method||"GET"),s.url,true)}catch(m){n(m)}if(s.method=="POST"){q.setRequestHeader("Content-type","application/x-www-form-urlencoded")}try{q.send((s.method=="POST"?o:null))}catch(m){n(m)}return this};d.prototype.loadJSON=function(i,j,h){if(!h){h={}}h.dataType="json";h.complete=j;this.ajax(i,h);return this};b.stuQuery=d;b.S=function(h){return new d(h)}})(window||this);

})(window || this);


(function(root){

	/*!
		Typeahead search v0.1.4
	*/
	(function(a){function c(){this.version="0.1.4";this.init=function(f,e){return new b(f,e)};return this}function b(g,f){if(!f){f={}}if(typeof g==="string"){g=document.querySelector(g)}if(!g){console.warn("No valid element provided");return this}var l=this;var o={};var j,e;var m=(typeof f.inline==="boolean"?f.inline:false);function p(C,w,B){var q,r,u,x,v,z,y;x=C.toUpperCase();u=[];if(x){for(r=0;r<f.items.length;r++){z={rank:0,key:r,value:f.items[r]};if(typeof f.rank==="function"){z.rank=f.rank(f.items[r],C)}else{if(f.items[r].toUpperCase().indexOf(x)==0){z.rank+=3}if(f.items[r].toUpperCase().indexOf(x)>0){z.rank+=1}}u.push(z)}u=d(u,"rank")}if(!j){g.parentElement.style.position="relative";j=document.createElement("div");j.classList.add("typeahead-results");j.style.top=(g.offsetTop+g.offsetHeight)+"px";j.style.left=g.offsetLeft+"px";j.style.maxWidth=(g.parentElement.offsetWidth-g.offsetLeft-parseInt(window.getComputedStyle(g.parentElement,null).getPropertyValue("padding-right")))+"px";j.style.position="absolute";e.style.position="relative";g.insertAdjacentElement("afterend",j)}v="";if(u.length>0){q=Math.min(u.length,(typeof f.max==="number"?f.max:10));v="<ol>";for(r=0;r<q;r++){if(u[r].rank>0){v+='<li data-id="'+u[r].key+'" '+(r==0?' class="selected"':"")+'><a tabindex="0" href="#" class="name">'+(typeof f.render==="function"?f.render(f.items[u[r].key]):f.items[u[r].key])+"</a></li>"}}v+="</ol>"}j.innerHTML=v;if(m){g.style.marginBottom=j.offsetHeight+"px"}var A=n();for(r=0;r<A.length;r++){A[r].addEventListener("click",function(s){s.preventDefault();s.stopPropagation();i(this.getAttribute("data-id"))})}if(o[B]){w._typeahead=l;for(r=0;r<o[B].length;r++){y=o[B][r];w.data=y.data||{};if(typeof y.fn==="function"){y.fn.call(this,w)}}}return this}function n(){return(j?j.querySelectorAll("li"):[])}function i(q){if(q){l.input=g;if(typeof f.process==="function"){f.process.call(l,f.items[q])}else{console.log(f.items[q])}}if(j){j.innerHTML=""}if(m){g.style.marginBottom="0px"}return}function k(){var q=n();for(var r=0;r<q.length;r++){if(q[r].classList.contains("selected")){return i(q[r].getAttribute("data-id"))}}return}function h(v){var q=n();var t=-1;var u;for(var r=0;r<q.length;r++){if(q[r].classList.contains("selected")){t=r}}u=t;if(v==40){t++}else{t--}if(t<0){t=q.length-1}if(t>=q.length){t=0}if(u>=0){q[u].classList.remove("selected")}q[t].classList.add("selected")}this.on=function(r,s,q){if(!g){console.warn("Unable to attach event "+r);return this}if(r=="change"){if(!o[r]){o[r]=[];g.addEventListener("keyup",function(t){t.preventDefault();t.stopPropagation();if(t.keyCode==40||t.keyCode==38){h(t.keyCode)}else{if(t.keyCode==13){k()}else{p(this.value,t,r);if(typeof f.endsearch==="function"){f.endsearch(this.value)}}}});g.addEventListener("blur",function(t){if(typeof f.blur==="function"){f.blur()}})}o[r].push({fn:q,data:s})}else{if(r=="blur"){console.log("blur")}else{console.warn("No event of type "+r)}}return this};this.off=function(s,r){if(o[s]){for(var q=0;q<o[s].length;q++){if(o[s][q].fn==r){o[s].splice(q,1)}}}};if(g.form){e=g.form;e.addEventListener("submit",function(q){q.preventDefault();q.stopPropagation();k()},false)}if(g){g.setAttribute("autocomplete","off")}this.addItems=function(q){if(!f.items){f.items=[]}f.items=f.items.concat(q)};this.on("change",{test:"blah"},function(q){});return this}a.TypeAhead=new c();function d(e,f){return e.sort(function(h,g){return h[f]<g[f]?1:-1})}})(window||this);

})(window || this);


(function(root){

	/* ================= */
	/* Query String v0.1 */
	root.QueryString = function(){
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


	
	/* ============ */
	/* Colours v0.2 */

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
		 * @param	Number  r		 The red color value
		 * @param	Number  g		 The green color value
		 * @param	Number  b		 The blue color value
		 * @return  Array			  The HSV representation
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

	function Colours(){

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
		};
		function col(a){
			if(typeof a==="string") return new Colour(a);
			else return a;
		}
		this.getColourPercent = function(pc,a,b){
			pc /= 100;
			a = col(a);
			b = col(b);
			return 'rgb('+parseInt(a.rgb[0] + (b.rgb[0]-a.rgb[0])*pc)+','+parseInt(a.rgb[1] + (b.rgb[1]-a.rgb[1])*pc)+','+parseInt(a.rgb[2] + (b.rgb[2]-a.rgb[2])*pc)+')';
		};
		this.makeGradient = function(a,b){
			a = col(a);
			b = col(b);
			return 'background: '+a.hex+'; background: -moz-linear-gradient(left, '+a.hex+' 0%, '+b.hex+' 100%);background: -webkit-linear-gradient(left, '+a.hex+' 0%,'+b.hex+' 100%);background: linear-gradient(to right, '+a.hex+' 0%,'+b.hex+' 100%);';
		};
		function processScale(id,str){
			if(scales[id] && scales[id].str){
				console.warn('Colour scale '+id+' already exists. Bailing out.');
				return this;
			}
			scales[id] = {'str':str};
			scales[id].stops = extractColours(str);
			return this;
		}
		function extractColours(str){
			var stops,cs,i,c;
			stops = str.replace(/^\s+/g,"").replace(/\s+$/g,"").replace(/\s\s/g," ").split(', ');
			cs = [];
			for(i = 0; i < stops.length; i++){
				var bits = stops[i].split(/ /);
				if(bits.length==2) cs.push({'v':bits[1],'c':new Colour(bits[0])});
				else if(bits.length==1) cs.push({'c':new Colour(bits[0])});
			}
			
			for(c=0; c < cs.length;c++){
				if(cs[c].v){
					// If a colour-stop has a percentage value provided, 
					if(cs[c].v.indexOf('%')>=0) cs[c].aspercent = true;
					cs[c].v = parseFloat(cs[c].v);
				}
			}
			return cs;
		}

		// Process existing scales
		for(var id in scales){
			if(scales[id]) processScale(id,scales[id]);
		}
		
		// Return a Colour object for a string
		this.getColour = function(str){
			return new Colour(str);
		};
		// Return the colour scale string
		this.getColourScale = function(id){
			return scales[id].str;
		};
		// Return the colour string for this scale, value and min/max
		this.getColourFromScale = function(s,v,min,max){
			var cs,v2,pc,c;
			var colour = "";
			if(!scales[s]){
				console.warn('No colour scale '+s+' exists');
				return '';
			}
			if(typeof min!=="number") min = 0;
			if(typeof max!=="number") max = 1;
			cs = scales[s].stops;
			v2 = 100*(v-min)/(max-min);

			if(cs.length == 1) colour = 'rgba('+cs[0].c.rgb[0]+', '+cs[0].c.rgb[1]+', '+cs[0].c.rgb[2]+', ' + (v2/100).toFixed(3) + ")";
			else{
				for(c = 0; c < cs.length-1; c++){
					if(v2 >= cs[c].v && v2 <= cs[c+1].v){
						// On this colour stop
						pc = 100*(v2 - cs[c].v)/(cs[c+1].v-cs[c].v);
						if(v2 > max) pc = 100;	// Don't go above colour range
						colour = this.getColourPercent(pc,cs[c].c,cs[c+1].c);
						continue;
					}
				}
			}
			return colour;	
		};
		
		return this;
	}

	root.Colour = new Colours();


	/* CSV v0.1 */
	function CSV(){

		this.toJSON = function(data,format,start,end,delim){

			if(typeof start!=="number") start = 1;

			var lines = this.toArray(data,delim);
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
		};

		/**
		 * CSVToArray parses any String of Data including '\r' '\n' characters,
		 * and returns an array with the rows of data.
		 * @param {String} str - the CSV string you need to parse
		 * @param {String} delim - the delimeter used to separate fields of data
		 * @returns {Array} rows - rows of CSV where first row are column headers
		 */
		this.toArray = function(str,delim){
			delim = (delim || ","); // user-supplied delimeter or default comma
			var pattern = new RegExp( // regular expression to parse the CSV values.
			 ( // Delimiters:
				"(\\" + delim + "|\\r?\\n|\\r|^)" +
				// Quoted fields.
				"(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +
				// Standard fields.
				"([^\"\\" + delim + "\\r\\n]*))"
			 ), "gi"
			);

			var rows = [[]];  // array to hold our data. First row is column headers.
			// array to hold our individual pattern matching groups:
			var matches = false; // false if we don't find any matches
			// Loop until we no longer find a regular expression match
			while (matches = pattern.exec( str )) {
				var matched_delimiter = matches[1]; // Get the matched delimiter
				// Check if the delimiter has a length (and is not the start of string)
				// and if it matches field delimiter. If not, it is a row delimiter.
				if (matched_delimiter.length && matched_delimiter !== delim) {
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
		};

		return this;
	}

	root.CSV = new CSV();

})(window || this);