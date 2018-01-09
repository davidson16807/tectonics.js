// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is the lowest level data structure in the app - all raster operations under rasters/ depend on it

function Grid(template, options){
	options = options || {};
	var voronoi_generator = options.voronoi_generator;
	var neighbor_lookup, face, points, vertex;

	this.template = template;
	
	// Precompute map between buffer array ids and grid cell ids
	// This helps with mapping cells within the model to buffer arrays in three.js
	// Map is created by flattening this.template.faces
	var faces = this.template.faces;
	this.faces = faces;
	var vertices = this.template.vertices;
	this.vertices = vertices;

	var vertex_ids = new Uint16Array(this.vertices.length);
	for (var i=0, li=vertex_ids.length; i<li; ++i) {
	    vertex_ids[i] = i;
	}
	this.vertex_ids = vertex_ids;

	this.pos = VectorRaster.FromVectors(this.vertices, this);

	var buffer_array_to_cell = new Uint16Array(faces.length * 3);
	for (var i=0, i3=0, li = faces.length; i<li; i++, i3+=3) {
		var face = faces[i];
		buffer_array_to_cell[i3+0] = face.a;
		buffer_array_to_cell[i3+1] = face.b;
		buffer_array_to_cell[i3+2] = face.c;
	};
	this.buffer_array_to_cell = buffer_array_to_cell;

	//Precompute neighbors for O(1) lookups
	var neighbor_lookup = this.template.vertices.map(function(vertex) { return new buckets.Set()});
	for(var i=0, il = this.template.faces.length, faces = this.template.faces; i<il; i++){
		face = faces[i];
		neighbor_lookup[face.a].add(face.b);
		neighbor_lookup[face.a].add(face.c);
		neighbor_lookup[face.b].add(face.a);
		neighbor_lookup[face.b].add(face.c);
		neighbor_lookup[face.c].add(face.a);
		neighbor_lookup[face.c].add(face.b);
	}
	neighbor_lookup = neighbor_lookup.map(function(set) { return set.toArray(); });
	this.neighbor_lookup = neighbor_lookup;

	var neighbor_count = Uint8Raster(this);
	for (var i = 0, li=neighbor_lookup.length; i<li; i++) { 
		neighbor_count[i] = neighbor_lookup[i].length;
	}
	this.neighbor_count = neighbor_count;

	// an "edge" in graph theory is a unordered set of vertices 
	// i.e. this.edges does not contain duplicate neighbor pairs 
	// e.g. it includes [1,2] but not [2,1] 
	var edges = []; 
	var edge_lookup = []; 
	// an "arrow" in graph theory is an ordered set of vertices 
	// it is also known as a directed edge 
	// i.e. this.arrows contains duplicate neighbor pairs 
	// e.g. it includes [1,2] *and* [2,1] 
	var arrows = [];  
	var arrow_lookup = []; 

	var neighbors = []; 
	var neighbor = 0; 
	
	//Precompute a list of neighboring vertex pairs for O(N) traversal 
	for (var i = 0, li=neighbor_lookup.length; i<li; i++) { 
	  neighbors = neighbor_lookup[i]; 
	  for (var j = 0, lj=neighbors.length; j<lj; j++) { 
	    neighbor = neighbors[j]; 
	    arrows.push([i, neighbor]); 
	
	    arrow_lookup[i] = arrow_lookup[i] || []; 
	    arrow_lookup[i].push(arrows.length-1); 
	
	    if (i < neighbor) { 
	      edges.push([i, neighbor]); 
	
	      edge_lookup[i] = edge_lookup[i] || []; 
	      edge_lookup[i].push(edges.length-1); 
	
	      edge_lookup[neighbor] = edge_lookup[neighbor] || []; 
	      edge_lookup[neighbor].push(edges.length-1); 
	    } 
	  } 
	} 

	this.edges = edges; 
	this.edge_lookup = edge_lookup; 
	this.arrows = arrows; 
	this.arrow_lookup = arrow_lookup; 
	
	this.pos_arrow_differential = VectorField.arrow_differential(this.pos); 
    this.pos_arrow_differential_normalized = VectorRaster.OfLength(arrows.length, undefined)
    this.pos_arrow_differential_normalized = VectorField.normalize(this.pos_arrow_differential, this.pos_arrow_differential_normalized); 
	this.pos_arrow_distances = Float32Raster.OfLength(arrows.length, undefined)
	VectorField.magnitude(this.pos_arrow_differential, this.pos_arrow_distances);
	this.average_distance = Float32Dataset.average(this.pos_arrow_distances);
	this.average_area = this.average_distance * this.average_distance;

	if (voronoi_generator){
		this._voronoi = voronoi_generator(this.pos);
	}
}

Grid.prototype.getNearestId = function(vertex) { 
	return this._voronoi.getNearestId(vertex); 
}

Grid.prototype.getNearestIds = function(pos_field, result) {
	result = result || Uint16Raster(this);
	return this._voronoi.getNearestIds(pos_field, result);
}

Grid.prototype.getNeighborIds = function(id) {
	return this.neighbor_lookup[id];
}
