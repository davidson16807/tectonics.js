function Model () {
	this.paused = false;
	this.MegaYearPerSecond = 5;
	this._world = void 0;
	this.fast_update_clock = new THREE.Clock();
	this.slow_update_clock = new THREE.Clock();
}

Model.prototype.world = function(world) {
	if (world === void 0) {
		return this._world;
	};
	console.log('called')
	if(this._world !== void 0){
		console.log('publishing model.world.remove')
		Publisher.publish('model.world', 'remove', { value: this._world, uuid: this._world.uuid });
	};
	console.log('publishing model.world.add')
	Publisher.publish('model.world', 'add', { value: world, uuid: this.uuid });
	this._world = world;
};

Model.prototype.fast_update = function(timestep) {
	var seconds = this.fast_update_clock.getDelta();
	
	// //minimum refresh rate of 15fps
	// if (seconds > 1/15){
	// 	return;
	// }

	if (world !== void 0) {
		world.fast_update(this.MegaYearPerSecond * seconds);
	};
};
Model.prototype.slow_update = function(timestep) {
	var seconds = this.slow_update_clock.getDelta();

	//minimum refresh rate of 5fps
	if (seconds > 1/5){
		return;
	}

	if (world !== void 0) {
		world.slow_update(this.MegaYearPerSecond * seconds);
	};
};