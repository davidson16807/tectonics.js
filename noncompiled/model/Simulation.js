function Simulation (parameters) {
	parameters = parameters || {};
	var _model 				= void 0;
	this.paused 			= parameters.paused || false;
	this.speed 				= parameters.speed || 1;
	this.elapsed_time		= parameters.elapsed_time || 0;
	this.seed 				= parameters.seed || 0;
	this.focus 				= parameters.focus;
	this.random 			= new Random(parseSeed(this.seed));
	if (parameters.random !== void 0) {
		this.random.mt  = parameters.random.mt;
		this.random.mti = parameters.random.mti;
	}
	this._last_update_timestamp = 0;

	function parseSeed(text) {
			var parsed = parseInt(text);
			if(isNaN(parsed)) {
				parsed = 0;
				for (var i = 0; i < Math.min(8, text.length); i++) {
					parsed = (parsed * 256) + text.charCodeAt(i);
				}
			}
			return parsed;
	    }
	    
	// the "model" is the singular entity we are simulating
	// it can be anything that implements the correct interface: a universe, a planet, an atmosphere, etc.
	this.model = function(model) {
		if (model === void 0) {
			return _model;
		};
		_model = model;
		model.initialize();
	};
	this.model(parameters.model);

	this.getParameters = function() {
		return {
			model: 			this._model !== void 0? this._model.getParameters() : undefined,
			paused: 		this.paused,
			speed: 			this.speed,
			elapsed_time: 	this.elapsed_time,
			seed: 			this.seed,
			focus: 			this.focus,
			random: {
				mt: random.mt,
				mti: random.mti
			},
		};
	}

	this.update = function() {
		var now = performance.now();
		var seconds = (now - this._last_update_timestamp)/1000;
		this._last_update_timestamp = now;

		//minimum refresh rate of 5fps
		if (seconds > 1/5){
			return;
		}

		if (this.paused){
			return;
		}

		if (_model === void 0) {
			return;
		}

		this.elapsed_time += this.speed * seconds;

		var timestep = this.speed * seconds / Units.SECONDS_IN_MEGAYEAR;

		_model.invalidate(timestep);
		_model.calcChanges(timestep);
		_model.applyChanges(timestep);
	};

	this.toggle_pause = function () {
		this.paused = !this.paused;
	}
}
