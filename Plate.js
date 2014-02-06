_isFilled = function(vertex){
	return vertex.content != void 0;
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
	this._geometry = world.grid.template;
	this._material	= new THREE.MeshBasicMaterial();
	this._cells = [];
	this._neighbors = [];
	this.mesh	= new THREE.Mesh( this._geometry, this._material ); 
	
	vertices = this._geometry.vertices;
	for(var i = 0, length = vertices.length, cells = this._cells; i<length; i++){
		cells.push({
			pos: 	vertices[i],
			plate: 	this,
			id: 	i,
			content:void 0
		});
	}
}
Plate.prototype.get = function(i){
	return this._cells[i];
}
Plate.prototype.getSize = function(){
	return this._cells.filter(function(cell){return _isFilled(cell)}).length;
}

Plate.prototype.getCentroid = function(){
	var crust = this.world.crust;
	var points = this._cells.
		filter(function(cell){ return crust.isContinental(cell); } ).
		map(function(cell){ return cell.pos});
	return points.
		reduce(function(a,b){
			return new THREE.Vector3().addVectors(a,b);
		}).
		divideScalar(points.length).
		normalize();
}
Plate.prototype.getContinentalSize = function(){
	var crust = this.world.crust;
	return this._cells.filter(function(cell){ return crust.isContinental(cell) }).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this._cells.filter(function(cell){return _isFilled(cell)});
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomBorder = function(){
	var points = this._collideable.filter(function(cell){return _isFilled(cell)});
	var i = Math.floor(random.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomJunction = function() {
	var cells = this._cells;
	var candidates = this._geometry.faces.filter(function(face) { 
		return  crust.isContinental(cells[face.a]) && 
				crust.isContinental(cells[face.b]) && 
				crust.isContinental(cells[face.c])
	});
	if(candidates.length > 0){
		var i = Math.floor(Math.random()*candidates.length);
		var selection = candidates[i];
		return [cells[selection.a], cells[selection.b], cells[selection.c]];
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
	var a,b,c;
	for(var i=0, cells = this._cells, length = this._geometry.faces.length; i<length; i++){
		var face = this._geometry.faces[i];
		a = _isFilled(cells[face.a]);
		b = _isFilled(cells[face.b]);
		c = _isFilled(cells[face.c]);
		if((a != b || b != c)){
			if(a){ collideable[face.a] = cells[face.a]; }
			else { riftable[face.a] = cells[face.a]; }
			if(b){ collideable[face.b] = cells[face.b]; }
			else { riftable[face.b] = cells[face.b]; }
			if(c){ collideable[face.c] = cells[face.c]; }
			else { riftable[face.c] = cells[face.c]; }
		}
	}
	this._collideable = collideable;
	this._riftable = riftable;
}
Plate.prototype.move = function(timestep){
	this.increment = this.angularSpeed * timestep;
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.mesh.matrix ); 
	this.mesh.matrix = rotationMatrix;
	this.mesh.rotation.setFromRotationMatrix( this.mesh.matrix );
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
	var intersected = plate._cells[id];
	if (intersected.content && !plate._collideable[id]) {
		return intersected;
	}
}
Plate.prototype.deform = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this._grid;
	var collideable = this._collideable;
	var cell, intersected;
	for(i=0, li = collideable.length; i<li; i++){
		var cell = collideable[i];
		if(_.isUndefined(cell) || _.isUndefined(cell.content)){
			continue;
		}
		var absolute = mesh.localToWorld(cell.pos.clone());
		var intersected = this._getIntersections(absolute, plates, grid, _getCollisionIntersection);
		if(intersected){
			this._crust.collide(cell, intersected);
			this._geometry.verticesNeedUpdate  = true;
		}
	}
}

_getRiftIntersection = function(id, plate) {
	var intersected = plate._cells[id];
	if (intersected.content || plate._riftable[id]) {
		return intersected;
	}
}
Plate.prototype.rift = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this.world.grid;
	var cell, intersected;
	var riftable = this._riftable;
	var ocean = this.world.ocean;
	for(i=0, li = riftable.length; i<li; i++){
		cell = riftable[i];
		if(_.isUndefined(cell) || !_.isUndefined(cell.content)){
			continue;
		}
		var absolute = mesh.localToWorld(cell.pos.clone());
		intersected = this._getIntersections(absolute, plates, grid, _getRiftIntersection);
		if(!intersected){
			this._crust.create(cell, ocean);
			cell.content.isostasy();
			geometry.verticesNeedUpdate = true;
		}
	}
}

Plate.prototype.erode = function(timestep){
	// Model taken from Simoes et al. 2010
	// This erosion model is characteristic in that its geared towards large spatiotemporal scales
	// A sediment erosion model is also described there, but here we only implement bedrock erosion, for now
	var world = this.world;
	var mesh = this.mesh;
	var geometry = this._geometry;
	var grid = this.world.grid;
	var vertex, intersected;
	var cells = this._cells;
	var precipitation = 3.8e5;
	// ^^^ measured in meters of rain per million years
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height gradient per meters of rain
	for(var i=0, li = cells.length; i<li; i++){
		content = cells[i].content;
		if(_.isUndefined(content)){
			continue;
		}
		var dheightSum = 0;
		var neighborIds = grid.getNeighborIds(i);
		for(var j = 0, lj = neighborIds.length; j<lj; j++){
			var neighbor = cells[neighborIds[j]].content;
			if(_.isUndefined(neighbor)){
				continue;
			}
			if(neighbor.displacement < world.sealevel && content.displacement < world.sealevel){
				continue;
			}
			var dheight = content.displacement - neighbor.displacement;
			dheightSum += dheight / lj;
		}
		var erosion = dheightSum * precipitation * timestep * erosiveFactor;
		content.thickness -= erosion;
		content.isostasy();
	}
}

Plate.prototype.dock = function(subjugated){
	var crust = this._crust;
	var grid = this._grid;
	var cells = this._cells;
	var subjugatedPlate = subjugated.plate
	var otherMesh = subjugatedPlate.mesh
	var mesh = this.mesh;
	
	var increment =    new THREE.Matrix4().makeRotationAxis( this.eulerPole, 		    -this.increment );
	increment.multiply(new THREE.Matrix4().makeRotationAxis( subjugatedPlate.eulerPole, -subjugatedPlate.increment ));
	var temp = subjugated.pos.clone();
	
	for(var i = 0; true; i++){
		//move subjugated back by increment
		temp.applyMatrix4(increment);
		
		//check for continental collision
		var absolute = otherMesh.localToWorld(temp.clone().normalize());
		var relative = mesh.worldToLocal(absolute);
		var id = grid.getNearestId(relative);
		var hit = cells[id];
		
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
	var cells = this._cells;
	
	var centroid = this.getCentroid();
	var platesNum = world.platesNum - world.plates.length
	var plates = _.range(platesNum).map(function(i) { 
		var pos = world.getRandomPoint();
		var eulerPole = new THREE.Vector3().crossVectors(centroid, pos).normalize();
		return new Plate(world, pos, eulerPole, 
			world.getRandomPlateSpeed());
	});
	var kdtree = new kdTree(_.range(platesNum).map(function(i) {
		return {x:plates[i].center.x, y:plates[i].center.y, z:plates[i].center.z, i:i}
	}), grid.getDistance, ["x","y","z"]);
	
	for(var i=0, li = plates.length; i<li; i++){
		var plate = plates[i];
		world.plates.push(plate);
		view.add(plate);
		plate.mesh.matrix = this.mesh.matrix;
		plate.mesh.rotation.setFromRotationMatrix( this.mesh.matrix );
	}
	
	for(var i=0, li = cells.length; i<li; i++){
		var vertex = gridvertices[i];
		var id = kdtree.nearest(vertex,1)[0][0].i;
		var nearest = plates[id];
		crust.replace(nearest._cells[i], cells[i]);
	}
	
	world.plates.splice(world.plates.indexOf(this),1);
}
Plate.prototype.destroy = function(){
	view.remove(this);
	
	var mesh = this.mesh;
	this.mesh = void 0;
	this._material = void 0;
	
	mesh.material.dispose();
	
	delete mesh;
	
}
