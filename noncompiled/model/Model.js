function Model () {
	this.paused = false;
	this.MegaYearPerSecond = 5;
	this.age = 0;
	this._world = void 0;
	this._last_update_timestamp = 0;
}

Model.prototype.world = function(world) {
	if (world === void 0) {
		return this._world;
	};
	this._world = world;
};

Model.prototype.update = function() {
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
	if (world !== void 0) {
		this.age += this.MegaYearPerSecond * seconds;
		world.update(this.MegaYearPerSecond * seconds);
	};
};
Model.prototype.toggle_pause = function () {
	this.paused = !this.paused;
}