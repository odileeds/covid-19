/*!
 * COVID-19 Dashboard
 */
(function(root){

	
	function DashboardBuilder(opts){
		this.qs = QueryString();
		this.data = {};
		this.panels = opts.panels||{};
		this.plugins = opts.plugins||{};
		this.base = (typeof opts.base==="string") ? opts.base : 'resources/';
		
		this.loadPlugin = function(id,file,opt){
			console.log('Dashboard.loadPlugin',id,file,opt);
			if(!opt) opt = {};
			if(typeof file!=="string") return this;
			if(this.panels[id] && this.panels[id].loaded) return this;

			// If we are loading an external script we need to make sure we initiate 
			// it first. To do that we will re-write the callback that was provided.
			var config = {};
			config.success = function(data){
				// Initialize this plugin
				console.log('success',this,this.panels);
				if(!this.panels[id]) console.warn('Panel '+id+' does not exist');
				this.panels[id].loaded = true;
				// Initiate the plugin
				if(typeof this.plugins[id].init==="function") this.plugins[id].init.call(this);
				// Run any callback
				if(typeof opt.success==="function") opt.success.call(this,data);
			};
			config.dataType = 'script';
			config.this = this;
			config.cache = true;
			if(typeof opt.complete==="function") config.complete = opt.complete;
			if(typeof opt.progress==="function") config.progress = opt.progress;
			if(typeof opt.error==="function") config.error = opt.error;
			else config.error = function(e,attr){ console.log('Failed to load '+attr.url); }

			// Load the script
			S().ajax(this.base+file,config);
			return this;
		};
		
		this.init = function(){
			for(id in this.panels){
				if(this.panels[id]){
					console.log(this.panels[id])
					if(this.panels[id].src){
						this.loadPlugin(id,this.panels[id].src,{});
						
					}
				}
			}
		}
		
		this.init();

		return this;
	}

	root.Dashboard = function(input){
		if(!input) input = {};
		input.plugins = Dashboard.plugins;
		return new DashboardBuilder(input);
	};

	Dashboard.plugins = {};

})(window || this);

var dashboard;
S(document).ready(function(){
	dashboard = Dashboard({
		'base':'resources/',
		'panels':{
			'hexmap':{'src':'dashboard.hexmap.js'},
			'plot':{'src':'dashboard.plot.js'}
		}
	});
});