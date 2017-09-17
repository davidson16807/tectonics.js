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
	console.log('called')
	if(this._world !== void 0){
		console.log('publishing model.world.remove')
		Publisher.publish('crust', 'remove', { 
			value: this._world, 
			uuid: this._world.uuid } 
		);
	};
	console.log('publishing model.world.add')
	this._world = world;
	Publisher.publish('crust', 'add', { 
		value: world, 
		uuid: world.uuid } 
	);
};

Model.prototype.fast_update = function(timestep) {
	var seconds = this.fast_update_clock.getDelta();
	
	// //minimum refresh rate of 15fps
	// if (seconds > 1/15){
	// 	return;
	// }

	if (this.paused){
		return;
	}
	if (world !== void 0) {
		this.age += this.MegaYearPerSecond * seconds;
		world.fast_update(this.MegaYearPerSecond * seconds);
	};
};
Model.prototype.slow_update = function(timestep) {
	var seconds = this.slow_update_clock.getDelta();

	//minimum refresh rate of 5fps
	if (seconds > 1/5){
		return;
	}

	if (this.paused){
		return;
	}
	if (world !== void 0) {
		world.slow_update(this.MegaYearPerSecond * seconds);
	};
};
Model.prototype.toggle_pause = function () {
	if(this.paused){
		this.MegaYearPerSecond = parseInt($('#speedControl').val());
	} 
	this.paused = !this.paused;
}