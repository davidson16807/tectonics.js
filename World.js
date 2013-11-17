THREE.Object3D.prototype.clear = function(){
    var children = this.children;
    for(var i = children.length-1;i>=0;i--){
        var child = children[i];
        child.clear();
        this.remove(child);
    };
	//NOTE: the following fixes an issues with redrawing scenes where transparent objects are involved.
	renderer.render( scene, camera );
};

// grid: 	 an object of type Grid
// optional: A list of optional parameters. Optional parameters default to values seen on early earth
function World(grid, optional){
	optional = optional || {};
	
	var radius = optional['radius'] || 6367;
	var continentsNum = optional['continentsNum'] || 3;
	var continentRadius = (optional['continentRadius'] || 1250) / radius;
	
	this.radius = radius;
	this.platesNum = optional['platesNum'] || 7;
	this.mountainWidth = (optional['mountainWidth'] || 300) / radius;
	this.getRandomPlateSpeed = optional['getRandomPlateSpeed'] ||
		function() { return Math.exp(random.normal(3.492, 0.771)) / radius; }
		// alternative: random.normal(42.8, 27.7),
		// log normal and normal distributions fit from http://hypertextbook.com/facts/ZhenHuang.shtml
	this.getRandomPlateDensityEffect = optional['getRandomPlateDensityEffect'] ||
		function() { return random.normal(0,40); }
		// from Carlson & Raskin 1984
		
	this.grid = grid;
	this.crust = new Crust(this);
	this.age = 0;
	
	var vertices = grid.initializer(1).vertices;
	var shields = _.range(continentsNum).map(function(i) {
		return grid.getRandomPoint();
	});
	var getRandomPlateSpeed 		= this.getRandomPlateSpeed;
	var getRandomPlateDensityEffect = this.getRandomPlateDensityEffect;
	plate = new Plate(this, 
		grid.getRandomPoint(), 
		grid.getRandomPoint(), 
		getRandomPlateSpeed());
	this.plates = [plate];
	for(var i=0, length = vertices.length; i<length; i++) {
		var vertex = vertices[i];
		if(_.any(shields.map(function(shield) { return shield.distanceTo(vertex) < continentRadius }))) { 
			this.crust.create(plate.get(i), this.LAND, this.LAND_CRUST_DENSITY);
		} else {
			this.crust.create(plate.get(i), this.OCEAN, this.OCEAN_CRUST_DENSITY);
		}
	}
	this.updateNeighbors();
	this.updateBorders();
	
	var geometry	= this.grid.initializer(this.SEALEVEL);
	var material	= new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5});
	this.ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5}) ); 
	geometry	= this.grid.initializer(this.THRESHOLD);
	material	= new THREE.MeshBasicMaterial({color:0x000000, transparent:false});
	this.asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x000000, transparent:false}) ); 
}

World.prototype.NA = 0.1;
World.prototype.THRESHOLD = 1.0;
World.prototype.SUBDUCTED = 1.01;
World.prototype.OCEAN = 1.02
World.prototype.SEALEVEL = 1.03;
World.prototype.LAND = 1.04;
World.prototype.LAND_CRUST_DENSITY = 2700;
World.prototype.OCEAN_CRUST_DENSITY = 2890; // Carlson & Raskin 1984

World.prototype.simulate = function(timestep){
	var length = this.plates.length;
	var plates = this.plates;
	var i = 0;
	for(i = 0; i<length; i++){
		plates[i].move(timestep);
	}
	this.updateMatrices();
	for(i = 0; i<length; i++){
		plates[i].rift();
		plates[i]._geometry.verticesNeedUpdate = true;
	}
	for(i = 0; i<length; i++){
		plates[i].deform();
	}
	this.updateBorders();
	platestemp = plates.slice(0); // copy the array
	for(i = 0; i<length; i++){
		if(platestemp[i].getSize() <= 100)
		{
			plates.splice(plates.indexOf(platestemp[i]),1);
		}
	}
	while(plates.length < this.platesNum){
		this.split();
	}
	this.age += timestep
}

World.prototype.split = function(){
	var largest = this.plates.sort(function(a, b) { return b.getContinentalSize() - a.getContinentalSize(); })[0];
	largest.split();
	this.updateNeighbors();
	this.updateBorders();
	scene.clear();
	this.draw();
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

World.prototype.draw = function(){
	var length = this.plates.length;
	var plates = this.plates;
	for(var j = 0; j<length; j++){
		scene.add(plates[j].mesh);
	}
	scene.add(this.asthenosphere);
	scene.add(this.ocean);
}