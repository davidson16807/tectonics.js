function SupercontinentCycle(world, optional){
	optional = optional || {};

	this.getRandomDuration = optional['getRandomDuration'] ||
		function() { return random.uniform(300, 500); };
		// from wikipedia
	
	this.world = world;	
	this.duration = optional['duration'] || this.getRandomDuration();
	this.age = optional['age'] || this.duration;
	this.oldSupercontinentPos = optional['oldSupercontinentPos'] || Sphere.getRandomPoint();
	this.newSupercontinentPos = optional['newSupercontinentPos'] || Sphere.getRandomPointAlongGreatCircle(this.oldSupercontinentPos);
};
SupercontinentCycle.prototype.update = function(timestep) {
	this.age += timestep;
	if(this.isEnding()){
		this.restart();
	}
};
SupercontinentCycle.prototype.isEnding = function() {
	//return this.world.plates.length <= 2;
	return this.age >= this.duration;
};
SupercontinentCycle.prototype.restart = function() {
	console.log(this.world.age);
	var world = this.world;

	this.age = 0;
	this.duration = this.getRandomDuration();
	this.oldSupercontinentPos = this.newSupercontinentPos;
	this.newSupercontinentPos = Sphere.getRandomPointAlongGreatCircle(this.oldSupercontinentPos);

	if (world.plates.length <= world.platesNum) {
		world.split();
	};

	// let's setup some shorthand variable names:
	var oldpos = this.oldSupercontinentPos;
	var newpos = this.newSupercontinentPos;
	// we need to find a set of euler poles around which plates are guaranteed to move from oldpos to newpos 
	// we first start by finding two particular candidate euler poles
	//  * the first euler pole defines the shortest path from oldpos to newpos
	//  * the second euler pole defines the longest path from oldpos to newpos 

	// get the euler pole that defines the shortest path (aka orthodrome)
	// this euler pole is the mid point between oldpos and newpos
	var shortestPathEulerPole = oldpos.clone().add(newpos).normalize();	

	// get the euler pole that defines the longest path
	// this euler pole defines a great circle along which both oldpos and newpos can be found
	// in other words, this euler pole is the cross product of oldpos and newpos 
	var longestPathEulerPole = oldpos.clone().cross(newpos).normalize();

	// shortestPathEulerPole and longestPathEulerPole form a great circle
	// this great circle encompasses all possible eulerpoles that describe the path from oldpos to newpos
	// we need to find the euler pole that defines this great circle
	// in other words, we need to find the cross product of shortestPathEulerPole and longestPathEulerPole
	var eulerPoleOfEulerPoles = shortestPathEulerPole.clone().cross(longestPathEulerPole).normalize();

	//find a random point along the great circle defined by eulerPoleX
	var eulerPole = Sphere.getRandomPointAlongGreatCircle(eulerPoleOfEulerPoles);
};