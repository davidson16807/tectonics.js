function Simulation (parameters) {
	var _model 			= void 0;
	this.paused 			= parameters.paused || false;
	this.speed 				= parameters.speed || 1;
	this.elapsed_time		= parameters.elapsed_time || 0;
	this.seed 				= parameters.seed || 0;
	this.focus 				= parameters.focus;
	this._last_update_timestamp = 0;

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
			paused: 		this.paused,
			speed: 			this.speed,
			elapsed_time: 	this.elapsed_time,
			seed: 			this.seed,
			model: 			this._model !== void 0? this._model.getParameters() : undefined,
			focus: 			this.focus,
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
