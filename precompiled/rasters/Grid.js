// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is the lowest level data structure in the app - all raster operations under rasters/ depend on it

function Grid(parameters, options){
    options = options || {};
    var neighbor_lookup, face, points, vertex;

    this.parameters = parameters;
    
    // Precompute map between buffer array ids and grid cell ids
    // This helps with mapping cells within the model to buffer arrays in three.js
    // Map is created by flattening this.parameters.faces
    var faces = this.parameters.faces;
    this.faces = faces;
    var vertices = this.parameters.vertices;
    this.vertices = vertices;

	this.getParameters = function(){
		return {
			faces: 		faces	.map(f => { return {a: f.a, b: f.b, c: f.c} } ),
			vertices: 	vertices.map(v => { return {x: v.x, y: v.y, z: v.z} } ),
		};
	}

    var vertex_ids = new Uint16Array(this.vertices.length);
    for (var i=0, li=vertex_ids.length; i<li; ++i) {
        vertex_ids[i] = i;
    }
    this.vertex_ids = vertex_ids;
    this.vertex_ids.grid = this;

    this.pos = VectorRaster.FromVectors(this.vertices, this);

    var buffer_array_to_cell = new Uint16Array(faces.length * 3);
    for (var i=0, i3=0, li = faces.length; i<li; i++, i3+=3) {
        var face = faces[i];
        buffer_array_to_cell[i3+0] = face.a;
        buffer_array_to_cell[i3+1] = face.b;
        buffer_array_to_cell[i3+2] = face.c;
    };
    this.buffer_array_to_cell = buffer_array_to_cell;

    var positions = new Float32Array( faces.length * 3 * 3 );
    var normals = new Float32Array( faces.length * 3 * 3 );
    for ( var i = 0, i2 = 0, i3 = 0; i < faces.length; i ++, i2 += 6, i3 += 9 ) {
        var face = faces[ i ];
        var a = vertices[ face.a ];
        var b = vertices[ face.b ];
        var c = vertices[ face.c ];
        positions[ i3     ] = a.x;
        positions[ i3 + 1 ] = a.y;
        positions[ i3 + 2 ] = a.z;
        positions[ i3 + 3 ] = b.x;
        positions[ i3 + 4 ] = b.y;
        positions[ i3 + 5 ] = b.z;
        positions[ i3 + 6 ] = c.x;
        positions[ i3 + 7 ] = c.y;
        positions[ i3 + 8 ] = c.z;
    }
    this._buffer_geometry_positions = positions;
    this._buffer_geometry_normals   = normals;

    //Precompute neighbors for O(1) lookups
    var neighbor_lookup = vertices.map(function(vertex) { return {}});
    for(var i=0, il = faces.length; i<il; i++){
        face = faces[i];
        neighbor_lookup[face.a][face.b] = face.b;
        neighbor_lookup[face.a][face.c] = face.c;
        neighbor_lookup[face.b][face.a] = face.a;
        neighbor_lookup[face.b][face.c] = face.c;
        neighbor_lookup[face.c][face.a] = face.a;
        neighbor_lookup[face.c][face.b] = face.b;
    }
    neighbor_lookup = neighbor_lookup.map(function(set) { return Object.values(set); });
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

    const CELLS_PER_VERTEX = 8;
    this._voronoi = new VoronoiSphere(this.pos, Float32Dataset.min(this.pos_arrow_distances)/CELLS_PER_VERTEX, Float32Dataset.max(this.pos_arrow_distances));
}

Grid.prototype.getNearestId = function(vertex) { 
    return this._voronoi.getNearestId(vertex); 
}

Grid.prototype.getNearestIds = function(pos_field, result) {
    result = result || Uint16Raster(pos_field.grid);
    return this._voronoi.getNearestIds(pos_field, result);
}

Grid.prototype.getNeighborIds = function(id) {
    return this.neighbor_lookup[id];
}

Grid.prototype.getBufferGeometry = function() {
    THREE.BufferAttribute();
    return {
        id: THREE.GeometryIdCount++,
        uuid: THREE.Math.generateUUID(),
        name: "",
        attributes: {
            position: { itemSize: 3, array: this._buffer_geometry_positions, __proto__: THREE.BufferAttribute.prototype },
            normal:   { itemSize: 3, array: this._buffer_geometry_normals,   __proto__: THREE.BufferAttribute.prototype }
        },
        offsets: [],
        boundingSphere: null,
        boundingBox: null,
        //HACK: the line below is an interrim hack that stays until I can remove Three.js
        __proto__: THREE.BufferGeometry.prototype 
    };
};
