_isDefined = function(value){
	return value != void 0;
}
_hashVector = function(vector){
	return vector.id.toString()
}

function Plate(world, center, eulerPole, angularSpeed)
{
	this.world = world;
	this.center = center; // TODO: remove
	this.eulerPole = eulerPole;
	this.angularSpeed = angularSpeed;
	this.densityOffset = world.getRandomPlateDensityEffect();
	
	//efficiency attributes, AKA attributes of attributes:
	this._grid = world.grid;
	this._crust = world.crust;
	this._geometry = world.grid.initializer(world.NA);
	this._vertices = this._geometry.vertices;
	this._material	= new THREE.MeshBasicMaterial({color: random.random() * 0xffffff, transparent:true, opacity:1});
	this._neighbors = [];
	this.mesh	= new THREE.Mesh( this._geometry, this._material ); 
	
	for(var i = 0, length = this._vertices.length, vertices = this._vertices; i<length; i++){
		vertices[i].plate = this;
		vertices[i].id = i;
	}
}
Plate.prototype.get = function(i){
	return this._vertices[i];
}
Plate.prototype.getSize = function(){
	var THRESHOLD = this.world.THRESHOLD;
	return this._vertices.filter(function(vertex){return vertex.length() > THRESHOLD}).length;
}
Plate.prototype.getContinentalSize = function(){
	var SEALEVEL = this.world.SEALEVEL;
	return this._vertices.filter(function(vertex){return vertex.length() > SEALEVEL}).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this._vertices.filter(function(vertex){return vertex.length() > this.world.THRESHOLD});
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomBorder = function(){
	var points = this._collideable.filter(function(vertex){return vertex.length() > this.world.THRESHOLD});
	var i = Math.floor(random.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomJunction = function() {
	var SEALEVEL = this.world.SEALEVEL;
	var vertices = this._vertices;
	var candidates = this._geometry.faces.filter(function(face) { 
		return  vertices[face.a].length() > SEALEVEL && 
				vertices[face.b].length() > SEALEVEL && 
				vertices[face.c].length() > SEALEVEL
	});
	if(candidates.length > 0){
		var i = Math.floor(Math.random()*candidates.length);
		var selection = candidates[i];
		return [vertices[selection.a], vertices[selection.b], vertices[selection.c]];
	}
	if(this._collideable.length > 0){
		return [this.getRandomBorder(), this.getRandomBorder(), this.getRandomBorder()];
	}
	return [this.getRandomPoint(), this.getRandomPoint(), this.getRandomPoint()];
}
Plate.prototype.updateNeighbors = function(){
	var _this = this;
	this._neighbors = this.world.plates.
		filter(function(platemesh){return platemesh.mesh.uuid != _this.mesh.uuid});
}
Plate.prototype.updateBorders = function(){
	var collideable = [];
	var riftable = [];
	var THRESHOLD = this.world.THRESHOLD;
	var a,b,c;
	for(var i=0, vertices = this._vertices, length = this._geometry.faces.length; i<length; i++){
		var face = this._geometry.faces[i];
		a = vertices[face.a].length()> THRESHOLD;
		b = vertices[face.b].length()> THRESHOLD;
		c = vertices[face.c].length()> THRESHOLD;
		if((a != b || b != c)){
			if(a){ collideable[face.a] = vertices[face.a]; }
			else { riftable[face.a] = vertices[face.a]; }
			if(b){ collideable[face.b] = vertices[face.b]; }
			else { riftable[face.b] = vertices[face.b]; }
			if(c){ collideable[face.c] = vertices[face.c]; }
			else { riftable[face.c] = vertices[face.c]; }
		}
	}
	this._collideable = collideable;
	this._riftable = riftable;
}
Plate.prototype.move = function(timestep){
	this.increment = this.angularSpeed * timestep;
	this.mesh.rotateOnAxis(this.eulerPole, this.increment);
}

Plate.prototype._getIntersections = function(absolute, plates, grid, getIntersection){
	for(var j=0, lj = plates.length; j<lj; j++){
		var plate = plates[j];
		var relative = plate.mesh.worldToLocal(absolute.clone());
		var id = grid.getNearestId(relative);
		var intersection = getIntersection(id, plate);
		if(intersection) {
			this._neighbors.splice(j, 1);
			this._neighbors.unshift(plate);
			return intersection; 
		}
	}
}

_getCollisionIntersection = function(id, plate) {
	var intersected = plate._vertices[id];
	if (intersected.length() > plate.world.THRESHOLD && !plate._collideable[id]) {
		return intersected;
	}
}
Plate.prototype.deform = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this._grid;
	var collideable = this._collideable;
	var vertex, intersected;
	for(i=0, li = collideable.length; i<li; i++){
		var vertex = collideable[i];
		if(_.isUndefined(vertex)){
			continue;
		}
		var absolute = mesh.localToWorld(vertex.clone().normalize());
		var intersected = this._getIntersections(absolute, plates, grid, _getCollisionIntersection);
		if(intersected){
			this._crust.collide(vertex, intersected);
			this._geometry.verticesNeedUpdate  = true;
		}
	}
}

_getRiftIntersection = function(id, plate) {
	var intersected = plate._vertices[id];
	if (intersected.length() > plate.world.THRESHOLD || plate._riftable[id]) {
		return intersected;
	}
}
Plate.prototype.rift = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this.world.grid;
	var vertex, intersected;
	var riftable = this._riftable;
	var OCEAN = this.world.OCEAN;
	var OCEAN_CRUST_DENSITY = this.world.OCEAN_CRUST_DENSITY;
	for(i=0, li = this._riftable.length; i<li; i++){
		vertex = riftable[i];
		if(_.isUndefined(vertex)){
			continue;
		}
		var absolute = mesh.localToWorld(vertex.clone().normalize());
		intersected = this._getIntersections(absolute, plates, grid, _getRiftIntersection);
		if(!intersected){
			this._crust.create(vertex, OCEAN, OCEAN_CRUST_DENSITY);
			geometry.verticesNeedUpdate  = true;
		}
	}
}

Plate.prototype.dock = function(subjugated){
	var crust = this._crust;
	var grid = this._grid;
	var vertices = this._vertices;
	var subjugatedPlate = subjugated.plate
	var otherMesh = subjugatedPlate.mesh
	var mesh = this.mesh;
	
	var increment =    new THREE.Matrix4().makeRotationAxis( this.eulerPole, 		    -this.increment );
	increment.multiply(new THREE.Matrix4().makeRotationAxis( subjugatedPlate.eulerPole, -subjugatedPlate.increment ));
	var temp = subjugated.clone();
	
	for(var i = 0; true; i++){
		//move subjugated back by increment
		temp.applyMatrix4(increment);
		
		//check for continental collision
		var absolute = otherMesh.localToWorld(temp.clone().normalize());
		var relative = mesh.worldToLocal(absolute);
		var id = grid.getNearestId(relative);
		var hit = vertices[id];
		
		if(!crust.isContinental(hit) || i > 100){
			crust.replace(hit, subjugated);
			crust.destroy(subjugated);
			break;
		}
	}
}

Plate.prototype.split = function(){
	var grid = this._grid;
	var gridvertices = grid.template.vertices;
	var world = this.world;
	var crust = this._crust;
	var vertices = this._vertices;
	
	platesNum = world.platesNum - world.plates.length
	plates = _.range(platesNum).map(function(i) { 
		return new Plate(world, 
			grid.getRandomPoint(), 
			grid.getRandomPoint(), 
			world.getRandomPlateSpeed());
	});
	var kdtree = new kdTree(_.range(platesNum).map(function(i) {
		return {x:plates[i].center.x, y:plates[i].center.y, z:plates[i].center.z, i:i}
	}), grid.getDistance, ["x","y","z"]);
	
	for(var i=0, li = plates.length; i<li; i++){
		var plate = plates[i];
		plate.mesh.matrix = this.mesh.matrix;
		plate.mesh.rotation.setFromRotationMatrix( this.mesh.matrix );
	}
	
	for(var i=0, li = vertices.length; i<li; i++){
		var vertex = gridvertices[i];
		var id = kdtree.nearest(vertex,1)[0][0].i;
		var nearest = plates[id];
		crust.replace(nearest._vertices[i], vertices[i]);
	}
	
	world.plates.splice(world.plates.indexOf(this),1);
	while(plates.length) { world.plates.push(plates.pop()); }
}
Plate.prototype.destroy = function(){
	for(var i = 0, length = this._vertices.length, vertices = this._vertices; i<length; i++){
		vertices[i].plate = void 0;
	}
}
