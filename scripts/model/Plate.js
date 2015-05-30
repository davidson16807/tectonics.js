'use strict';

function _isFilled(vertex){
	return vertex.content != void 0;
}
function _isLand(cell){ return cell.isContinental() };
function _hashCell(vector){
	return vector.id.toString();
}

var _MATERIAL = new THREE.MeshBasicMaterial();

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
	this._cells = [];
	this._neighbors = [];
	this.mesh	= new THREE.Mesh( this._geometry, _MATERIAL ); 
	this.uuid = optional['uuid'] || this.mesh.uuid;

	var vertices = this._geometry.vertices;
	for(var i = 0, length = vertices.length, cells = this._cells; i<length; i++){
		cells.push(new Cell(this, vertices[i], i));
	};
}
Plate.prototype.get = function(i){
	return this._cells[i];
}

Plate.prototype.getCentroid = function(){
	var points = this._cells.
		filter(function(cell){ return cell.isContinental(); } ).
		map(function(cell){ return cell.pos});
	return points.
		reduce(function(a,b){
			return new THREE.Vector3().addVectors(a,b);
		}).
		divideScalar(points.length).
		normalize();
}
Plate.prototype.getSize = function(){
	return this._cells.filter(_isFilled).length;
}
Plate.prototype.getContinentalSize = function(){
	return this._cells.filter(_isLand).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this._cells.filter(_isFilled);
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomLand = function(){
	var points = this._cells.filter(_isLand);
	var i = Math.floor(Math.random()*points.length);
	return points[i];
}
Plate.prototype.getRandomJunction = function() {
	var cells = this._cells;
	var candidates = this._geometry.faces.filter(function(face) { 
		return  _isFilled(cells[face.a]) && 
				_isFilled(cells[face.b]) && 
				_isFilled(cells[face.c])
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


function _getCollisionIntersection(id, plate) {
	var intersected = plate._cells[id];
	if (intersected.content && !plate._collideable[id]) {
		return intersected;
	}
}
Plate.prototype.deform = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this.grid;
	var collideable = this._collideable;
	var cell, intersected;
	for(var i=0, li = collideable.length; i<li; i++){
		var cell = collideable[i];
		if(_.isUndefined(cell) || _.isUndefined(cell.content)){
			continue;
		}
		var intersected = cell.getIntersections(plates, _getCollisionIntersection);
		if(intersected){
			cell.collide(intersected);
			this._geometry.verticesNeedUpdate  = true;
		}
	}
}

function _getRiftIntersection(id, plate) {
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
	for(var i=0, li = riftable.length; i<li; i++){
		cell = riftable[i];
		if(_.isUndefined(cell) || !_.isUndefined(cell.content)){
			continue;
		}
		intersected = cell.getIntersections(plates, _getRiftIntersection);
		if(!intersected){
			cell.create(ocean);
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
	var precipitation = 7.8e5;
	// ^^^ measured in meters of rain per million years
	// global land average from wikipedia
	var erosiveFactor = 1.8e-7; 
	// ^^^ the rate of erosion per the rate of rainfall in that place
	// measured in fraction of height gradient per meters of rain
	for(var i=0, li = cells.length; i<li; i++){
		var content = cells[i].content;
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
			if(neighbor.displacement < world.SEALEVEL && content.displacement < world.SEALEVEL){
				continue;
			}
			var dheight = content.displacement - neighbor.displacement;
			dheightSum += dheight / lj;
		}
		var erosion = dheightSum * precipitation * timestep * erosiveFactor;
		content.thickness -= erosion;
	}
}

Plate.prototype.isostasy = function() {
	var cells = this._cells;
	for(var i=0, li = cells.length; i<li; i++){
		var content = cells[i].content;
		if(_.isUndefined(content)){
			continue;
		}
		content.isostasy();
	}
}

Plate.prototype.dock = function(subjugated){
	var grid = this.grid;
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
		
		if(!hit.isContinental() || i > 100){
			hit.replace(subjugated);
			subjugated.destroy();
			break;
		}
	}
}

Plate.prototype.split = function(){
	var _this = this;
	var grid = this.grid;
	var gridvertices = grid.template.vertices;
	var world = this.world;
	var cells = this._cells;
	
	
	var centroid = this.getCentroid();
	var plates = [];
	var seeds = new buckets.Dictionary(_hashCell);
	while(plates.length + world.plates.length - 1  <  world.platesNum){
		var junction = _this.getRandomJunction();
		var pos = junction[0].pos;
		var eulerPole = pos.distanceToSquared(centroid) < 2? 
			new THREE.Vector3().crossVectors(centroid, pos).normalize() :
			new THREE.Vector3().crossVectors(pos, centroid).normalize();

		var smaller = new Plate(world, eulerPole, world.getRandomPlateSpeed());
		var larger = new Plate(world, eulerPole, world.getRandomPlateSpeed());
		plates.push(smaller);
		plates.push(larger);
		seeds.set(junction[0], smaller);
		seeds.set(junction[1], larger);
		seeds.set(junction[2], larger);
	}

	for(var i=0, li = plates.length; i<li; i++){
		var plate = plates[i];
		world.plates.push(plate);
		window.dispatchEvent(new CustomEvent('model-update', {detail: {
					'channel': 'plate',
					'topic': 'create',
					'content': plate
				}}));
		plate.mesh.matrix = this.mesh.matrix;
		plate.mesh.rotation.setFromRotationMatrix( this.mesh.matrix );
	}
	for(var i=0, li = cells.length; i<li; i++){
		var cell = cells[i];
		if(cell.content){
			var nearest = _.min(seeds.keys(), function(x) {	
				return x.pos.distanceTo(cell.pos); 
			});
			seeds.get(nearest)._cells[i].replace(cell);
		}
	}
	
	world.plates.splice(world.plates.indexOf(this),1);
}
Plate.prototype.destroy = function(){
	window.dispatchEvent(new CustomEvent('model-update', {detail: {
				'channel': 'plate',
				'topic': 'delete',
				'content': this
			}}));
	
	var mesh = this.mesh;
	this.mesh = void 0;
	
	mesh.material.dispose();
	
	delete this.mesh;
}
