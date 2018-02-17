//Data structure mapping coordinates on a unit spheroid to the nearest neighboring point in a set
//Retrievals from the map are of O(1) complexity. The result resembles a voronoi diagram, hence the name.
function VoronoiSphere(sides, cell_half_width, raster_dim_size){
	this.sides = sides;
	this.xy = sides[0];
	this.yz = sides[1];
	this.zx = sides[2];
	this.yx = sides[3];
	this.zy = sides[4];
	this.xz = sides[5];
	this.cell_half_width = cell_half_width;
	this.raster_dim_size = raster_dim_size;
}
VoronoiSphere.FromPos = function (pos) {
	//Feed locations into a kdtrees for O(logN) lookups
	var x = pos.x;
	var y = pos.y;
	var z = pos.z;

	var radius=1; // Assume unit sphere
	var area = 4*Math.PI*radius*radius;
	var area_per_vertex = area / x.length;

	var overlap = Math.sqrt(3*area_per_vertex); 
	// NOTE: "overlap" is the overlap in regions that are covered by kd trees

	var overlap2 = overlap * overlap;

	var xy = [];
	var yz = [];
	var zx = [];
	var yx = [];
	var zy = [];
	var xz = [];

	// step 1: sort vertices by the side they occupy on a cube sphere
	for (var i = 0, li = x.length; i<li; ++i){
		xi = x[i];
		yi = y[i];
		zi = z[i];
		xi2 = xi * xi;
		yi2 = yi * yi;
		zi2 = zi * zi;
		if (xi2 > yi2 - overlap2 && xi2 > zi2 - overlap2) { // x is greatest
			if (xi > 0) {
				yz.push({x:yi, y:zi, i:i});
			} else {
				zy.push({x:zi, y:yi, i:i});
			}
		} 
		if (yi2 > xi2 - overlap2 && yi2 > zi2 - overlap2) { // y is greatest
			if (yi > 0) {
				zx.push({x:zi, y:xi, i:i});
			} else {
				xz.push({x:xi, y:zi, i:i});
			}
		}
		if (zi2 > xi2 - overlap2 && zi2 > yi2 - overlap2) { // z is greatest
			if (zi > 0) {
				xy.push({x:xi, y:yi, i:i});
			} else {
				yx.push({x:yi, y:xi, i:i});
			}
		}
	}

	var sqrt = Math.sqrt;
	var get_distance = function(a,b) { 
		var ax = a.x;
		var ay = a.y;
		var az2 = 1 - ax*ax - ay*ay;
		var az = sqrt(az2 > 0? az2 : 0);
		var bx = b.x;
		var by = b.y;
		var bz = sqrt(1 - bx*bx - by*by);
		return (ax - bx)*(ax - bx) +  (ay - by)*(ay - by) + (az - bz)*(az - bz); 
	};

	// step 2: generate one kdtree for each side of the cube sphere,
	// and feed those kdtrees into a Voronoi diagram for O(1) lookups
	// If this seems like overkill, trust me - it's not
	return VoronoiSphere.FromKDTrees(xy.length, [
		new kdTree(xy, get_distance, ["x","y"]),
		new kdTree(yz, get_distance, ["x","y"]),
		new kdTree(zx, get_distance, ["x","y"]),
		new kdTree(yx, get_distance, ["x","y"]),
		new kdTree(zy, get_distance, ["x","y"]),
		new kdTree(xz, get_distance, ["x","y"]),
	]);
}
VoronoiSphere.FromKDTrees = function(pointsNum, kdtrees) {
	var cells_per_point = 30;
	var raster_size = cells_per_point * pointsNum;
	var raster_dim_size = Math.round(Math.sqrt(raster_size)) | 0;
	var cell_half_width = 2 / ((raster_dim_size - 1));

	// names for Uint16Arrays follow naming conventions for 2-blades in geometric algebra

	var sides = [
		new Uint16Array(raster_size),
		new Uint16Array(raster_size),
		new Uint16Array(raster_size),
		new Uint16Array(raster_size),
		new Uint16Array(raster_size),
		new Uint16Array(raster_size),
	];

	var li = sides.length;
	var lj = raster_dim_size;
	var lk = raster_dim_size;
	var pos = {x:0, y:0};
	var raster = sides[0];
	var raster_x = 0.0;
	var raster_y = 0.0;
	var raster_id = 0;
	var nearest_id = 0;
	for (var i = 0; i < li; ++i) {
		raster = sides[i];
		for (var j = 0; j < lj; ++j) {
			for (var k = 0; k < lk; ++k) {
				// get position of the cell on the unit sphere
				raster_x = j * cell_half_width - 1;
				raster_y = k * cell_half_width - 1;
				pos.x = raster_x;
				pos.y = raster_y;
				raster_id = j * raster_dim_size + k;
				nearest_id = kdtrees[i].nearest(pos,1)[0][0].i;
				raster[raster_id] = nearest_id;
			}
		}
	}
	return new VoronoiSphere(sides, cell_half_width, raster_dim_size);
}
VoronoiSphere.FromJson = function (json) {
	var xy = new Uint16Array(Base64.decode(json.xy));
	var yz = new Uint16Array(Base64.decode(json.yz));
	var zx = new Uint16Array(Base64.decode(json.zx));
	var yx = new Uint16Array(Base64.decode(json.yx));
	var zy = new Uint16Array(Base64.decode(json.zy));
	var xz = new Uint16Array(Base64.decode(json.xz));
	
	var sides = [
		xy,
		yz,
		zx,
		yx,
		zy,
		xz,
	];

	return new VoronoiSphere(sides, json.cell_half_width, json.raster_dim_size);
}
VoronoiSphere.prototype.toJson = function() {
	var json = {};
	json.xy	= Base64.encode(this.xy.buffer);
	json.yz	= Base64.encode(this.yz.buffer);
	json.zx	= Base64.encode(this.zx.buffer);
	json.yx	= Base64.encode(this.yx.buffer);
	json.zy	= Base64.encode(this.zy.buffer);
	json.xz	= Base64.encode(this.xz.buffer);
	json.cell_half_width = this.cell_half_width;
	json.raster_dim_size = this.raster_dim_size;
	return json;
}
VoronoiSphere.prototype.getNearestIds = function(pos_field, result) {
	result = result || new Uint16Array(pos_field.x.length);

	var x = pos_field.x;
	var y = pos_field.y;
	var z = pos_field.z;

	var xy = this.xy;
	var yz = this.yz;
	var zx = this.zx;
	var yx = this.yx;
	var zy = this.zy;
	var xz = this.xz;

	var cell_half_width = this.cell_half_width;
	var raster_dim_size = this.raster_dim_size;

	var xi = 0.0;
	var yi = 0.0;
	var zi = 0.0;
	var xi2 = 0.0;
	var yi2 = 0.0;
	var zi2 = 0.0;
	var raster = xy;
	var raster_x = 0.0;
	var raster_y = 0.0;
	var raster_i = 0;
	var raster_j = 0;
	var raster_id = 0;
	for (var i = 0, li = x.length; i<li; ++i){
		xi = x[i];
		yi = y[i];
		zi = z[i];
		xi2 = xi * xi;
		yi2 = yi * yi;
		zi2 = zi * zi;
		if (xi2 > yi2 && xi2 > zi2) { // x is greatest
			if (xi > 0) {
				raster = yz;
				raster_x = yi;
				raster_y = zi;
			} else {
				raster = zy;
				raster_x = zi;
				raster_y = yi;
			}
		} else if (yi2 > xi2 && yi2 > zi2) { // y is greatest
			if (yi > 0) {
				raster = zx;
				raster_x = zi;
				raster_y = xi;
			} else {
				raster = xz;
				raster_x = xi;
				raster_y = zi;
			}
		} else if (zi2 > xi2 && zi2 > yi2) { // z is greatest
			if (zi > 0) {
				raster = xy;
				raster_x = xi;
				raster_y = yi;
			} else {
				raster = yx;
				raster_x = yi;
				raster_y = xi;
			}
		}
		raster_i = ((raster_x + 1) / cell_half_width) | 0;
		raster_j = ((raster_y + 1) / cell_half_width) | 0;
		raster_id = raster_i * raster_dim_size + raster_j;
		result[i] = raster[raster_id];
	}

	return result;
}