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
	this.densityEffect = world.getRandomPlateDensityEffect();
	this.crust = [];
	
	//efficiency attributes, AKA attributes of attributes:
	this._grid = world.grid;
	this._geometry = world.grid.initializer(world.NA);
	this._vertices = this._geometry.vertices;
	this._material	= new THREE.MeshBasicMaterial({color: Math.random() * 0xffffff, transparent:true, opacity:1});
	this._neighbors = [];
	this.mesh	= new THREE.Mesh( this._geometry, this._material ); 
	
	for(var i = 0, length = this._vertices.length, vertices = this._vertices; i<length; i++){
		vertices[i].id = i;
	}
}
Plate.prototype.get = function(i){
	return this._vertices[i];
}
Plate.prototype.getSize = function(){
	return this._vertices.filter(function(vertex){return vertex.elevation > this.world.THRESHOLD}).length;
}
Plate.prototype.getRandomPoint = function(){
	var points = this._collideable.filter(function(vertex){return vertex.elevation > this.world.THRESHOLD});
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
	for(var i=0, vertices = this.crust, length = this._geometry.faces.length; i<length; i++){
		var face = this._geometry.faces[i];
		a = _isDefined(vertices[face.a]);
		b = _isDefined(vertices[face.b]);
		c = _isDefined(vertices[face.c]);
		if((a != b || b != c)){
			if(a){ collideable[face.a] = vertices[face.a]; } 
			else { riftable[face.a] = true; }
			if(b){ collideable[face.b] = vertices[face.b]; }
			else { riftable[face.b] = true; }
			if(c){ collideable[face.c] = vertices[face.c]; }
			else { riftable[face.c] = true; }
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
	var intersected = plate.crust[id];
	if (_isDefined(intersected) && !plate._collideable[id]) {
		return intersected;
	}
}
Plate.prototype.deform = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this._grid;
	var collideable = this._collideable;
	var vertices = this._vertices;
	var vertex, intersected;
	for(i=0, li = collideable.length; i<li; i++){
		var vertex = collideable[i];
		if(_.isUndefined(vertex)){
			continue;
		}
		var absolute = mesh.localToWorld(vertices[i].clone().normalize());
		var intersected = this._getIntersections(absolute, plates, grid, _getCollisionIntersection);
		if(intersected){
			vertex.collide(intersected);
			this._geometry.verticesNeedUpdate  = true;
		}
	}
}

_getRiftIntersection = function(id, plate) {
	var intersected = plate.crust[id];
	if (intersected || plate._riftable[id]) {
		return true;
	}
}
Plate.prototype.rift = function(){
	var mesh = this.mesh;
	var plates = this._neighbors;
	var geometry = this._geometry;
	var grid = this.world.grid;
	var vertex, intersected;
	var riftable = this._riftable;
	var vertices = this._vertices;
	var crust = this.crust;
	var OCEAN = this.world.OCEAN;
	var OCEAN_CRUST_DENSITY = this.world.OCEAN_CRUST_DENSITY;
	for(i=0, li = this._riftable.length; i<li; i++){
		if(_.isUndefined(riftable[i])){
			continue;
		}
		var absolute = mesh.localToWorld(grid.template.vertices[i].clone());
		intersected = this._getIntersections(absolute, plates, grid, _getRiftIntersection);
		if(!intersected){
			crust[i] = new Crust(this, intersected, OCEAN, OCEAN_CRUST_DENSITY);
		}
	}
}

Plate.prototype._getNeighbors = function(vertex){
	var vertices = this.crust;
	var ids = this._grid.getNeighborIds(vertex.id);
	var ids2 = []
	for(var i=0, li=ids.length; i<li; i++){
		ids2[i] = vertices[ids[i]];
	}
	return ids2;
}
Plate.prototype.getContinent = function(vertex){
	var group = new buckets.Set(_hashVector);
	var stack = [vertex];
	while(stack.length > 0){
		var next = stack.pop();
		if (!group.contains(next)){
			var neighbors = next.plate._getNeighbors(next).filter(function(neighbor){return _isDefined(neighbor) && neighbor.isContinental()})
			if (neighbors.length > 3){
				group.add(next);
				stack = stack.concat(neighbors);
			}
		}
	}
	return group;
}
Plate.prototype.dock = function(intersection, plate, continent){
	var grid = this._grid;
	var mesh = this.mesh;
	var crust = this.crust;
	var vertices = grid.template.vertices;
	var otherMesh = plate.mesh;
	var otherVertices = plate._vertices;
	var otherCrust = plate.crust;

	var processed = new buckets.Set(_hashVector);
	var destroyed = [];
	var stack = [intersection];
	while(stack.length > 0){
		var next = stack.pop();
		if(processed.contains(next)){
			continue;
		}
		processed.add(next);
		var absolute = mesh.localToWorld(vertices[next.id].clone());
		var relative = otherMesh.worldToLocal(absolute);
		var id = grid.getNearestId(relative);
		var hit = otherVertices[id];
		if(continent.contains(hit)){
			crust[next.id] = hit;
			destroyed.push(id);
			stack = stack.concat(this._getNeighbors(next));
		}
	}
	for(var i=0; i<destroyed.length; i++){
		otherCrust[i].destroy();
	}
}