'use strict';

// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is used by both model and view

function Grid(template, options){
	options = options || {};
	var voronoi = options.voronoi;
	var voronoiResolutionFactor = options.voronoiResolutionFactor || 2;
	var voronoiPointNum, neighbors, face, points, vertex;

	this.template = template;
	
	// Precompute map between buffer array ids and grid cell ids
	// This helps with mapping cells within the model to buffer arrays in three.js
	// Map is created by flattening this.template.faces
	var faces = this.template.faces;
	var buffer_array_to_cell = new Uint16Array(faces.length * 3);
	for (var i=0, i3=0, li = faces.length; i<li; i++, i3+=3) {
		var face = faces[i];
		buffer_array_to_cell[i3+0] = face.a;
		buffer_array_to_cell[i3+1] = face.b;
		buffer_array_to_cell[i3+2] = face.c;
	};
	this.buffer_array_to_cell = buffer_array_to_cell;

	//Precompute neighbors for O(1) lookups
	var neighbors = this.template.vertices.map(function(vertex) { return new buckets.Set()});
	for(var i=0, il = this.template.faces.length, faces = this.template.faces; i<il; i++){
		face = faces[i];
		neighbors[face.a].add(face.b);
		neighbors[face.a].add(face.c);
		neighbors[face.b].add(face.a);
		neighbors[face.b].add(face.c);
		neighbors[face.c].add(face.a);
		neighbors[face.c].add(face.b);
	}
	this._neighbors = neighbors.map(function(set) { return set.toArray(); });
	
	//Feed locations into a kdtree for O(logN) lookups
	points = [];
	for(var i=0, il = this.template.vertices.length, vertices = this.template.vertices; i<il; i++){
		vertex = vertices[i];
		points.push({x:vertex.x, y:vertex.y, z:vertex.z, i:i});
	}
	this.getDistance = function(a,b) { 
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2); 
	};
	this._kdtree = new kdTree(points, this.getDistance, ["x","y","z"]);
	
	//Now feed that kdtree into a Voronoi diagram for O(1) lookups
	//If cached voronoi is already provided, use that
	//If this seems like overkill, trust me - it's not
	if (voronoi){
		this._voronoi = voronoi;
	} else {
		voronoiPointNum = Math.pow(voronoiResolutionFactor * Math.sqrt(this.template.vertices.length), 2);
		this._voronoi = new VoronoiSphere(voronoiPointNum, this._kdtree);
	}
}

Grid.prototype.getVoronoi = function() {
	//Now feed that kdtree into a Voronoi diagram for O(1) lookups
	return new VoronoiSphere(this._kdtree, this.template.vertices.length);
}

Grid.prototype.getNearestId = function(vertex) { 
	return this._voronoi.getNearestId(vertex); 
	return this._kdtree.nearest({x:vertex.x, y:vertex.y, z: vertex.z}, 1)[0][0].i;
}

Grid.prototype.getNeighborIds = function(id) {
	return this._neighbors[id];
}