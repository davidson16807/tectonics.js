function Model () {
	this.MegaYearPerSecond = void 0;
	this._world = void 0;
}

Model.prototype.world = function(world) {
	if (_.isUndefined(world)) {
		return this._world;
	};


	if (!_.isUndefined(this._world)){
		Publisher.publish('world', 'delete', this._world)
		this._world.destroy();
	}
	
	Publisher.publish('world', 'create', world);
	this._world = world;
};

Model.prototype.update = function(timestep) {
	if (!_.isUndefined(world)) {
		world.simulate(timestep);
	};
};