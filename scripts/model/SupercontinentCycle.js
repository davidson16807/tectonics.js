function SupercontinentCycle(world, optional){
	optional = optional || {};

	this.getRandomDuration = optional['getRandomDuration'] ||
		function() { return random.uniform(300, 500); };
		// from wikipedia
	
	this.world = world;	
	this.duration = optional['duration'] || this.getRandomDuration();
	this.age = optional['age'] || this.duration;
	this.oldSupercontinentPos = optional['oldSupercontinentPos'] || world.getRandomPoint();
	this.newSupercontinentPos = optional['newSupercontinentPos'] || world.getRandomPoint(); //this.getNewSupercontinentPos();
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
	var world = this.world;

	if (world.plates.length <= world.platesNum) {
		world.split();
		console.log(world.age);
	};
	
	//set each plate's velocity to random value (at least for now)
	//reset each plate's motion such that euler pole is the axis of rotation between oldSuperContinentPos, newSupercontinentPos, and plate's center

	this.age = 0;
	this.duration = this.getRandomDuration();
	this.oldSupercontinentPos = this.newSupercontinentPos;
	//this.newSupercontinentPos = this.world.getNewSupercontinentPos();
};
SupercontinentCycle.prototype.getNewSupercontinentPos = function(oldSupercontinentPos) {
	// start with oldSupercontinentPos as z
	var matrix1 = new THREE.Matrix4();
	matrix1.lookAt(new THREE.Vector3(0,0,0), oldSupercontinentPos, new THREE.Vector3(0,0,1));
	
	// rotate 90 degrees about an axis orthogonal to oldSupercontinentPos
	// here, we find one possible x axis where z = oldSupercontinentPos
	var newSupercontinentPos = new THREE.Vector3(1,0,0);
	newSupercontinentPos.applyMatrix4(matrix1);
	
	// rotate by some random amount 
	var matrix2 = new THREE.Matrix4();
	matrix2.makeRotationAxis( oldSupercontinentPos, random.uniform(0, 2*Math.PI) );
	newSupercontinentPos.applyMatrix4(matrix2);
	
	return newSupercontinentPos;
};