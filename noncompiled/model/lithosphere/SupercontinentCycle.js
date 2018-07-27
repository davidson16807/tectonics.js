'use strict';

function SupercontinentCycle(lithosphere, parameters){
	parameters = parameters || {};

	this.getRandomDuration = function() { return 150; };
		// function() { return random.uniform(300, 500); };
		// from wikipedia
	
	this.lithosphere = lithosphere;
	this.duration = parameters['duration'] || this.getRandomDuration();
	this.age = parameters['age'] || this.duration;

	this.getParameters = function() {
		return { 
			duration: 	duration,
			age: 		age,
		};
	}
};
SupercontinentCycle.prototype.update = function(timestep) {
	this.age += timestep;
	if(this.isEnding() === true){
		this.restart();
	}
};
SupercontinentCycle.prototype.isEnding = function() {
	//return this.lithosphere.plates.length <= 2;
	return this.age >= this.duration;
};
SupercontinentCycle.prototype.restart = function() {
	var lithosphere = this.lithosphere;

	this.age = 0;
	this.duration = this.getRandomDuration();

	lithosphere.resetPlates();
}; 