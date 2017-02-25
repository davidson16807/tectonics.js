'use strict';

function SupercontinentCycle(parameters){
	parameters = parameters || {};

	this.getRandomDuration = parameters['getRandomDuration'] ||
		function() { return random.uniform(300, 500); };
		// from wikipedia
	
	this.world = parameters['world'] || stop('missing parameter: "world"');
	this.duration = parameters['duration'] || this.getRandomDuration();
	this.age = parameters['age'] || this.duration;
};
SupercontinentCycle.prototype.update = function(timestep) {
	this.age += timestep;
	if(this.isEnding() === true){
		this.restart();
	}
};
SupercontinentCycle.prototype.isEnding = function() {
	//return this.world.plates.length <= 2;
	return this.age >= this.duration;
};
SupercontinentCycle.prototype.restart = function() {
	var world = this.world;

	this.age = -Infinity;
	this.duration = this.getRandomDuration();

	world.resetPlates();

	// TODO: nudge plates here by small fraction, for testing purposes
}; 