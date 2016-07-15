'use strict';

function _isFilled(vertex){
	return vertex.content != void 0;
}
function _isLand(cell){ return cell.isContinental() };
function _hashCell(vector){
	return vector.id.toString();
}

function Plate(world, optional)
{
	optional = optional || {}
	this.world = world;
	this.eulerPole = optional['eulerPole'] || world.getRandomPoint();
	this.angularSpeed = optional['angularSpeed'] || world.getRandomPlateSpeed();
	this.densityOffset = optional['densityOffset'] || world.getRandomPlateDensityEffect();
	
	//efficiency attributes, AKA attributes of attributes:
	this.grid = world.grid;
	this._geometry = world.grid.template;
	this.cells = [];
	this._neighbors = [];
	this.matrix = optional['matrix'] || new THREE.Matrix4();
	this.uuid = optional['uuid'] || Uuid.create();

	var vertices = this._geometry.vertices;
	for(var i = 0, length = vertices.length, cells = this.cells; i<length; i++){
		cells.push(new Cell(this, vertices[i], i));
	};

	this._collideable = new Uint8Array(this.cells.length);
	this._riftable = new Uint8Array(this.cells.length);
	this.increment = 0;
}

Plate.prototype.localToWorld = function(a) {
    return a.applyMatrix4(this.matrix);
};
Plate.prototype.worldToLocal = function(b) {
    return b.applyMatrix4(this.worldToLocalMatrix)
},
Plate.prototype.get = function(i){
	return this.cells[i];
}

Plate.prototype.getCentroid = function(){
	var points = this.cells.
		filter(function(cell){ return cell.isContinental(); } ).
		map(function(cell){ return cell.pos});
	if(points.length < 1){
		return undefined;
	}
	return points.
		reduce(function(a,b){
			return new THREE.Vector3().addVectors(a,b);
		}).
		divideScalar(points.length).
		normalize();
}
Plate.prototype.getDensityOffset = function() {
	return -this.getContinentalSize();
	//var densitySum = 0;
	//var cells = this.cells;
	//var content;
	//for (var i = 0, li = cells.length; i < li; i++) {
	//	content = cells[i].content;
	//	if (content === void 0) {
	//		continue;
	//	};
	//	densitySum += content.density;
	//};
	//return densitySum / this.getSize(); 
};
Plate.prototype.getSize = function(){
	return this.cells.filter(_isFilled).length;
}
Plate.prototype.getContinentalSize = function(){
	return this.cells.filter(_isLand).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this.cells.filter(_isFilled);
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomLand = function(){
	var points = this.cells.filter(_isLand);
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomJunction = function() {
	var cells = this.cells;
	var candidates = this._geometry.faces.filter(function(face) { 
		return  cells[face.a] !== void 0 && 
				cells[face.b] !== void 0 && 
				cells[face.c] !== void 0
	});
	if(candidates.length > 0){
		var i = Math.floor(random.random()*candidates.length);
		var selection = candidates[i];
		return [cells[selection.a], cells[selection.b], cells[selection.c]];
	}
	return [this.getRandomPoint(), this.getRandomPoint(), this.getRandomPoint()];
}
Plate.prototype.updateNeighbors = function(){
	var _this = this;
	this._neighbors = this.world.plates.
		filter(function(plate){return plate.uuid != _this.uuid});
}
Plate.prototype.updateBorders = function(){
	var collideable = new Uint8Array(this.cells.length);
	var riftable = new Uint8Array(this.cells.length);
	var face, a,b,c;
	for(var i=0, cells = this.cells, length = this._geometry.faces.length; i<length; i++){
		face = this._geometry.faces[i];
		a = cells[face.a].content !== void 0;
		b = cells[face.b].content !== void 0;
		c = cells[face.c].content !== void 0;
		if(a !== b || b !== c){
			if(a === true){ collideable[face.a] = 1; }
			else { riftable[face.a] = 1; }
			if(b === true){ collideable[face.b] = 1; }
			else { riftable[face.b] = 1; }
			if(c === true){ collideable[face.c] = 1; }
			else { riftable[face.c] = 1; }
		}
	}
	this._collideable = collideable;
	this._riftable = riftable;
}
Plate.prototype.move = function(timestep){
	this.increment = this.angularSpeed * timestep;
	var rotationMatrix = new THREE.Matrix4();
	rotationMatrix.makeRotationAxis( this.eulerPole, this.angularSpeed * timestep );
	rotationMatrix.multiply( this.matrix ); 
	this.matrix = rotationMatrix;
	this.worldToLocalMatrix = new THREE.Matrix4();
	this.worldToLocalMatrix.getInverse(this.matrix);
	Publisher.publish('plate.matrix', 'update', 
		{ value: this.matrix, uuid: this.uuid } );
}


function _getCollisionIntersection(id, plate) {
	var intersected = plate.cells[id];
	if (intersected.content !== void 0 && plate._collideable[id] === 0) {
		return intersected;
	}
}
Plate.prototype.deform = function(){
	var plates = this._neighbors;
	var grid = this.grid;
	var collideable = this._collideable;
	var cells = this.cells;
	var cell, intersected;
	var getIntersection = _getCollisionIntersection;
	var plate, id;
	var absolute_pos = new THREE.Vector3();
	var relative_pos = new THREE.Vector3();
	var i,li,j,lj;
	var li = collideable.length;
	var lj = plates.length;
	for(i=0; i<li; i++){
		if(collideable[i] === 0){
			continue;
		}
		cell = cells[i];
		if(cell.content === void 0){
			continue;
		}
		absolute_pos.copy(cell.pos);
		this.localToWorld(absolute_pos);
		intersected = void 0;
		for(j=0; j<lj; j++){
			plate = plates[j];
			relative_pos.copy(absolute_pos);
			plate.worldToLocal(relative_pos);
			id = grid.getNearestId(relative_pos);
			intersected = getIntersection(id, plate);
			if(intersected !== void 0) {
				this._neighbors.splice(j, 1);
				this._neighbors.unshift(plate);
				break;
			}
		}
		
		if(intersected !== void 0){
			cell.collide(intersected);
		}
	}
}

function _getRiftIntersection(id, plate) {
	var intersected = plate.cells[id];
	if (intersected.content !== void 0 || plate._riftable[id] > 0) {
		return intersected;
	}
}
Plate.prototype.rift = function(){
	var plates = this._neighbors;
	var grid = this.world.grid;
	var riftable = this._riftable;
	var cells = this.cells;
	var ocean = this.world.ocean;
	var getIntersection = _getRiftIntersection;
	var cell, intersected;
	var plate, id;
	var absolute_pos = new THREE.Vector3();
	var relative_pos = new THREE.Vector3();
	var i,li,j,lj;
	var li = riftable.length;
	var lj = plates.length;
	for(i=0; i<li; i++){
		if(riftable[i] === 0){
			continue;
		}
		cell = cells[i];
		if(cell.content !== void 0){
			continue;
		}

		absolute_pos.copy(cell.pos);
		this.localToWorld(absolute_pos);
		intersected = void 0;
		for(j=0; j<lj; j++){
			plate = plates[j];
			relative_pos.copy(absolute_pos);
			plate.worldToLocal(relative_pos);
			id = grid.getNearestId(relative_pos);
			intersected = getIntersection(id, plate);
			if(intersected !== void 0) {
				this._neighbors.splice(j, 1);
				this._neighbors.unshift(plate);
				break;
			}
		}
		if(intersected === void 0){
			cell.create(ocean);
		}
	}
}
Plate.prototype.update = function(timestep) {
	var i, li
	var cells = this.cells;
	for(i=0, li = cells.length; i<li; i++){
		var content = cells[i].content;
		if(content === void 0){
			continue;
		}
		content.update(timestep);
	}
};
Plate.prototype.erode = function(timestep){
	// Model taken from Simoes et al. 2010
	// This erosion model is characteristic in that its geared towards large spatiotemporal scales
	// A sediment erosion model is also described there, but here we only implement bedrock erosion, for now
	var world = this.world;
	var grid = this.world.grid;
	var cells = this.cells;
	var precipitation = 7.8e5;
	// ^^^ measured in meters of rain per million years
	// global land average from wikipedia
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height gradient per meters of rain

	var i, j, li, lj, content, dheightSum, neighborIds, neighbor, dheight, erosion;
	for(i=0, li = cells.length; i<li; i++){
		content = cells[i].content;
		if(content === void 0){
			continue;
		}
		dheightSum = 0;
		neighborIds = grid.getNeighborIds(i);
		for(j = 0, lj = neighborIds.length; j<lj; j++){
			neighbor = cells[neighborIds[j]].content;
			if(neighbor === void 0){
				continue;
			}
			if(neighbor.displacement < world.SEALEVEL && content.displacement < world.SEALEVEL){
				continue;
			}
			dheight = content.displacement - neighbor.displacement;
			dheightSum += dheight / lj;
		}
		erosion = dheightSum * precipitation * timestep * erosiveFactor;
		content.thickness -= erosion;
	}
}

Plate.prototype.isostasy = function() {
	var cells = this.cells;
	for(var i=0, li = cells.length; i<li; i++){
		var content = cells[i].content;
		if(content === void 0){
			continue;
		}
		content.isostasy();
	}
}

Plate.prototype.dock = function(subjugated){
	var grid = this.grid;
	var cells = this.cells;
	var subjugatedPlate = subjugated.plate;
	
	var increment =    new THREE.Matrix4().makeRotationAxis( this.eulerPole, 		    -this.increment );
	increment.multiply(new THREE.Matrix4().makeRotationAxis( subjugatedPlate.eulerPole, -subjugatedPlate.increment ));
	var temp = subjugated.pos.clone();
	var absolute = new THREE.Vector3();
	var relative = new THREE.Vector3();
	
	var absolute, relative, id, hit;
 	for(var i = 0; true; i++){
		//move subjugated back by increment
		temp.applyMatrix4(increment);
		
		//check for continental collision
		absolute.copy(temp).normalize();
		subjugatedPlate.localToWorld(absolute);

		relative.copy(absolute);
		this.worldToLocal(relative);

		id = grid.getNearestId(relative);
		hit = cells[id];
		
		if(!hit.isContinental() === true || i > 100){
			hit.replace(subjugated);
			subjugated.destroy();
			break;
		}
	}
}
var _min = function(list, getKey) {
	var value = Infinity;
	var result = void 0;
	for (var i = 0, li = list.length; i < li; i++) {
		var element = list[i];
		var key = getKey(element);
		if(key < value){
			value = key;
			result = element;
		}
	};
	return result;
};
Plate.prototype.split = function(){
	var _this = this;
	var grid = this.grid;
	var gridvertices = grid.template.vertices;
	var world = this.world;
	var cells = this.cells;
	
	var centroid = this.getCentroid();
	if(centroid === void 0){
		return undefined;
	}

	var plates = [];
	var seeds = new buckets.Dictionary(_hashCell);
	while(plates.length + world.plates.length - 1  <  world.platesNum){
		var junction = _this.getRandomJunction();
		var pos = junction[0].pos;
		var eulerPole = pos.distanceToSquared(centroid) < 2? 
			new THREE.Vector3().crossVectors(centroid, pos).normalize() :
			new THREE.Vector3().crossVectors(pos, centroid).normalize();

		var smaller = new Plate(world, 
			{
				eulerPole: eulerPole, 
				angularSpeed: world.getRandomPlateSpeed(),
			});
		var larger = new Plate(world, 
			{
				eulerPole: eulerPole,
				angularSpeed: world.getRandomPlateSpeed(),
			});

		plates.push(smaller);
		plates.push(larger);
		seeds.set(junction[0], smaller);
		seeds.set(junction[1], larger);
		seeds.set(junction[2], larger);
	}

	for(var i=0, li = plates.length; i<li; i++){
		var plate = plates[i];
		plate.matrix = this.matrix;
	}
	for(var i=0, li = cells.length; i<li; i++){
		var cell = cells[i];
		if(cell.content !== void 0){
			var nearest = _min(seeds.keys(), function(x) {	
				return x.pos.distanceTo(cell.pos); 
			});
			seeds.get(nearest).cells[i].replace(cell);
		}
	}

	for(var i=0, li = plates.length; i<li; i++){
		var plate = plates[i];
		plate.densityOffset = plate.getDensityOffset() + random.random();
	}

	return plates;
}
