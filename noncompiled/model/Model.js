function Model (parameters) {
	var _world 				= void 0;
	this.paused 			= parameters.paused || false;
	this.speed 				= parameters.speed || 1;
	this.age 				= parameters.age || 0;
	this.seed 				= parameters.seed || 0;
	this._last_update_timestamp = 0;

	this.world = function(world) {
		if (world === void 0) {
			return _world;
		};
		_world = world;
		world.initialize()
	};
	this.world(parameters.world);

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

		if (_world !== void 0) {
			this.age += this.speed * seconds;
			_world.update(this.speed * seconds);
		};
	};

	this.worldLoaded = function() {
		var now = performance.now();
		this._last_update_timestamp = now;

		if (world !== void 0) {
			world.worldLoaded();
		};
	};

	this.toggle_pause = function () {
		this.paused = !this.paused;
	}
}
