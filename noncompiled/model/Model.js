function Model () {
	this.paused = false;
	this.MegaYearPerSecond = 5;
	this.age = 0;
	this._world = void 0;
	this.fast_update_clock = new THREE.Clock();
	this.slow_update_clock = new THREE.Clock();
}

Model.prototype.world = function(world) {
	if (world === void 0) {
		return this._world;
	};
	this._world = world;
};

Model.prototype.update = function(timestep) {
	var seconds = this.slow_update_clock.getDelta();

	//minimum refresh rate of 5fps
	if (seconds > 1/5){
		return;
	}

	if (this.paused){
		return;
	}
	if (world !== void 0) {
		this.age += this.MegaYearPerSecond * seconds;
		world.update(this.MegaYearPerSecond * seconds);
	};
};
Model.prototype.toggle_pause = function () {
	this.paused = !this.paused;
}