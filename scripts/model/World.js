'use strict';

// grid: 	 an object of type Grid
// optional: A list of optional parameters. Optional parameters default to values seen on early earth
function World(optional){
	optional = optional || {};

	this.getRandomPlateSpeed = optional['getRandomPlateSpeed'] ||
		//function() { return Math.exp(random.normal(-5.13, 0.548)); }
		function() { return random.normal(0.00687, 0.00380); }
		//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997
	this.getRandomPlateDensityEffect = optional['getRandomPlateDensityEffect'] ||
		function() { return random.normal(0,40); }
		// from Carlson & Raskin 1984

	var radius = optional['radius'] || 6367;
	this.radius = radius;
	
	this.supercontinentCycle = optional["supercontinentCycle"] || new SupercontinentCycle(this);
	this.grid = optional['grid'] || new Grid( 
		new THREEx.FibonacciSphereGeometry(1, 10000)
		/*new THREE.IcosahedronGeometry(1, 5)*/
		);
	this.age = optional['age'] || 0;
	this.platesNum = optional['platesNum'] || 7;
	this.mountainWidth = (optional['mountainWidth'] || 300) / radius;
	
	this.plates = [];
	this.updateNeighbors();
	this.updateBorders();
}

World.prototype.SEALEVEL = 3682;
World.prototype.mantleDensity=3300;
World.prototype.waterDensity=1026;
World.prototype.ocean =
 RockColumn(void 0, {
	elevation: 	-3682,	// Charette & Smith 2010
	thickness: 	7100, 	// +/- 800, White McKenzie and O'nions 1992
	density: 	2890	// Carlson & Raskin 1984
 });
World.prototype.land =
 RockColumn(void 0, {
	elevation: 	840,   //Sverdrup & Fleming 1942
    thickness: 	36900, // +/- 2900, estimate for shields, Zandt & Ammon 1995
	density: 	2700
 });

World.prototype.fast_update = function (timestep) {
	if (timestep === 0) {
		return;
	};

	var length = this.plates.length;
	var plates = this.plates;
	var i = 0;
	for(i = 0; i<length; i++){
		plates[i].move(timestep);
	}
}

World.prototype.slow_update = function(timestep){
	if (timestep === 0) {
		return;
	};

	var length = this.plates.length;
	var plates = this.plates;
	var i = 0;
	for(i = 0; i<length; i++){
		plates[i].update(timestep);
	}
	for(i = 0; i<length; i++){
		plates[i].erode(timestep);
	}
	for(i = 0; i<length; i++){
		plates[i].isostasy();
	}
	this.updateBorders();
	for(i = 0; i<length; i++){
		plates[i].rift();
	}
	for(i = 0; i<length; i++){
		plates[i].deform();
	}
	for (var i = 0; i<length; i++) {
		Publisher.publish('plate.cells', 'update', { 
			value: {
				displacement: plates[i].displacement,
				age: plates[i].age,
				is_member: plates[i].is_member
			}, 
			uuid: plates[i].uuid } 
		);
	};
	var platestemp = plates.slice(0); // copy the array
	for(i = 0; i<length; i++){
		// if(platestemp[i].getSize() <= 100)
		// {
		// 	this.remove(platestemp[i]);
		// 	this.updateNeighbors();
		// }
	}
	this.supercontinentCycle.update(timestep);
	this.age += timestep;
}

World.prototype.split = function(){
	// don't bother if splitting will produce more plates than desired
	if(this.plates.length >= this.platesNum){
		return;
	}
	
	var largest = this.plates.sort(function(a, b) { return b.getContinentalSize() - a.getContinentalSize(); })[0];
	var plates = largest.split();

	if (plates === void 0) {
		return;
	};
	for (var i = 0, li = plates.length; i < li; i++) {
		this.add(plates[i]);
	};
	this.remove(largest);

	this.updateNeighbors();
	this.updateBorders();
	
}

World.prototype.add = function(plate) {
	this.plates.push(plate);
	Publisher.publish('world.plates', 'add', { value: plate, uuid: this.uuid } );
};
World.prototype.remove = function(plate) {
	this.plates.splice(this.plates.indexOf(plate),1);
	Publisher.publish('world.plates', 'remove', { value: plate, uuid: this.uuid });
};

World.prototype.updateNeighbors = function(){
	for(var i = 0, length = this.plates.length; i<length; i++){
		this.plates[i].updateNeighbors();
	}
}

World.prototype.updateBorders = function(){
	var length = this.plates.length;
	var plates = this.plates;
	for(var i = 0; i<length; i++){
		plates[i].updateBorders();
	}
}

World.prototype.getRandomPoint = function() {
	return _toCartesian({
		lat: Math.asin(2*random.random() - 1),
		lon: 2*Math.PI * random.random()
	});
}
