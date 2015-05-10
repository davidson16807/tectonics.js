'use strict';

// grid: 	 an object of type Grid
// optional: A list of optional parameters. Optional parameters default to values seen on early earth
function World(grid, optional){
	optional = optional || {};
	
	var radius = optional['radius'] || 6367;
	var continentRadius = (optional['continentRadius'] || 1250) / radius;
	
	this.supercontinentCycle = new SupercontinentCycle(this);

	this.radius = radius;
	this.platesNum = optional['platesNum'] || 7;
	this.mountainWidth = (optional['mountainWidth'] || 300) / radius;
	this.getRandomPlateSpeed = optional['getRandomPlateSpeed'] ||
		//function() { return Math.exp(random.normal(-5.13, 0.548)); }
		function() { return random.normal(0.00687, 0.00380); }
		//^^^ log normal and normal distribution fit to angular velocities from Larson et al. 1997
	this.getRandomPlateDensityEffect = optional['getRandomPlateDensityEffect'] ||
		function() { return random.normal(0,40); }
		// from Carlson & Raskin 1984
		
	this.grid = grid;
	this.age = 0;
	
	var shield = this.getRandomPoint();
	var getRandomPlateSpeed 		= this.getRandomPlateSpeed;
	var getRandomPlateDensityEffect = this.getRandomPlateDensityEffect;
	var plate = new Plate(this,  
		this.getRandomPoint(), 
		getRandomPlateSpeed());
	this.plates = [plate];
	for(var i=0, length = plate._cells.length; i<length; i++) {
		var cell = plate._cells[i];
		if(shield.distanceTo(cell.pos) < continentRadius ) { 
			cell.create(this.land);
		} else {
			cell.create(this.ocean);
		}
		cell.content.isostasy();
	}
	this.updateNeighbors();
	this.updateBorders();
}

World.prototype.SEALEVEL = 3682;
World.prototype.mantleDensity=3300
World.prototype.waterDensity=1026  
World.prototype.ocean =
 new RockColumn(void 0,
				-3682, // Charette & Smith 2010
                7100,  // +/- 800, White McKenzie and O'nions 1992
				2890) // Carlson & Raskin 1984
World.prototype.land =
 new RockColumn(void 0,
				840, //Sverdrup & Fleming 1942
                36900, // +/- 2900, estimate for shields, Zandt & Ammon 1995
				2700) 

World.prototype.simulate = function(timestep){
	var length = this.plates.length;
	var plates = this.plates;
	var i = 0;
	for(i = 0; i<length; i++){
		plates[i].move(timestep);
	}
	for(i = 0; i<length; i++){
		plates[i].erode(timestep);
	}
	for(i = 0; i<length; i++){
		plates[i].isostasy();
	}
	this.updateMatrices();
	this.updateBorders();
	for(i = 0; i<length; i++){
		plates[i].rift();
	}
	for(i = 0; i<length; i++){
		plates[i].deform();
	}
	var platestemp = plates.slice(0); // copy the array
	for(i = 0; i<length; i++){
		if(platestemp[i].getSize() <= 100)
		{
			plates.splice(plates.indexOf(platestemp[i]),1);
			platestemp[i].destroy();
			this.updateNeighbors();
		}
	}
	this.supercontinentCycle.update(timestep);
	this.age += timestep;
}

World.prototype.split = function(){
	if(this.plates.length >= this.platesNum){
		return;
	}
	var largest = this.plates.sort(function(a, b) { return b.getContinentalSize() - a.getContinentalSize(); })[0];
	largest.split();
	this.updateNeighbors();
	this.updateBorders();
	
	largest.destroy();
	
	console.log(this.age);
}

World.prototype.updateNeighbors = function(){
	for(var j = 0, length = this.plates.length; j<length; j++){
		this.plates[j].updateNeighbors();
	}
}

World.prototype.updateBorders = function(){
	var length = this.plates.length;
	var plates = this.plates;
	for(var i = 0; i<length; i++){
		plates[i].updateBorders();
	}
}

World.prototype.updateMatrices = function(){
	var length = this.plates.length;
	var plates = this.plates;
	for(var i = 0; i<length; i++){
		plates[i].mesh.updateMatrix();
		plates[i].mesh.updateMatrixWorld();
	}
}

World.prototype.getRandomPoint = function() {
	return _toCartesian({
		lat: Math.asin(2*random.random() - 1),
		lon: 2*Math.PI * random.random()
	});
}