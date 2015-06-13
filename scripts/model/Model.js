function Model () {
	this.MegaYearPerSecond = void 0;
	this._world = void 0;
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

Model.prototype.update = function(timestep) {
	if (!_.isUndefined(world)) {
		world.simulate(timestep);
	};
};