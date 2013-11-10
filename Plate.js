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
	this._material	= new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, transparent:true, opacity:1});
	this._neighbors = [];
	this.mesh	= new THREE.Mesh( this._geometry, this._material ); 
	
	for(var i = 0, length = this._vertices.length, vertices = this._vertices; i<length; i++){
		vertices[i].plate = this;
		vertices[i].id = i;
		vertices[i].content = void 0;
	}
}
Plate.prototype.get = function(i){
	return this._vertices[i];
}
Plate.prototype.getSize = function(){
	return this._vertices.filter(function(vertex){return _isDefined(vertex.content)}).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this._collideable.filter(function(vertex){return _isDefined(vertex.content)});
	var i = Math.floor(Math.random()*points.length);
	return points[i];
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
		a = _isDefined(vertices[face.a].content);
		b = _isDefined(vertices[face.b].content);
		c = _isDefined(vertices[face.c].content);
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
	var intersected = plate._vertices[id];
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
	var vertex, intersected;
	for(i=0, li = collideable.length; i<li; i++){
		var vertex = collideable[i];
		if(_.isUndefined(vertex) || _.isUndefined(vertex.content)){
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
	if (intersected.content || plate._riftable[id]) {
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
		if(_.isUndefined(vertex) || !_.isUndefined(vertex.content)){
			continue;
		}
		var absolute = mesh.localToWorld(vertex.clone().normalize());
		intersected = this._getIntersections(absolute, plates, grid, _getRiftIntersection);
		if(!intersected){
			this._crust.create(vertex, OCEAN, OCEAN_CRUST_DENSITY);
			geometry.verticesNeedUpdate = true;
		}
	}
}

Plate.prototype._getNeighbors = function(vertex){
	var vertices = this._vertices;
	var ids = this._grid.getNeighborIds(vertex.id);
	var ids2 = []
	for(var i=0, li=ids.length; i<li; i++){
		ids2[i] = vertices[ids[i]];
	}
	return ids2;
}
Plate.prototype.getContinent = function(vertex){
	var crust = this._crust;

	var group = new buckets.Set(_hashVector);
	var stack = [vertex];
	while(stack.length > 0){
		var next = stack.pop();
		if (!group.contains(next)){
			var neighbors = next.plate._getNeighbors(next).filter(function(neighbor){return crust.isContinental(neighbor)})
			if (neighbors.length > 3){
				group.add(next);
				stack = stack.concat(neighbors);
			}
		}
	}
	return group;
}
Plate.prototype.dock = function(intersection, plate, continent){
	var crust = this._crust;
	var grid = this._grid;
	var mesh = this.mesh;
	var otherMesh = plate.mesh;
	var otherVertices = plate._vertices;

	var processed = new buckets.Set(_hashVector);
	var destroyed = [];
	var stack = [intersection];
	while(stack.length > 0){
		var next = stack.pop();
		if(processed.contains(next)){
			continue;
		}
		processed.add(next);
		var absolute = mesh.localToWorld(next.clone().normalize());
		var relative = otherMesh.worldToLocal(absolute);
		var id = grid.getNearestId(relative);
		var hit = otherVertices[id];
		if(continent.contains(hit)){
			crust.replace(next, hit);
			destroyed.push(hit);
			stack = stack.concat(this._getNeighbors(next));
		}
	}
	for(var i=0; i<destroyed.length; i++){
		crust.destroy(destroyed[i]);
	}
}