//Data structure mapping coordinates on a sphere to the nearest point in a kdtree
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
	//Feed locations into a kdtree for O(logN) lookups
	points = [];
	var x = pos.x;
	var y = pos.y;
	var z = pos.z;
	for(var i=0, il = x.length; i<il; i++){
		points.push({x:x[i], y:y[i], z:z[i], i:i});
	}
	var voronoiResolutionFactor = 2;
	var getDistance = function(a,b) { 
		return Math.pow(a.x - b.x, 2) +  Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2); 
	};
	var kdtree = new kdTree(points, getDistance, ["x","y","z"]);
	var voronoiPointNum = Math.pow(voronoiResolutionFactor * Math.sqrt(points.length), 2);
	
	//Now feed that kdtree into a Voronoi diagram for O(1) lookups
	//If cached voronoi is already provided, use that
	//If this seems like overkill, trust me - it's not
	return VoronoiSphere.FromKDTree(voronoiPointNum, kdtree);
}
VoronoiSphere.FromKDTree = function(pointsNum, kdtree) {
	var cells_per_point = 8;
	var circumference = 2*Math.PI;
	var raster_dim_size = (cells_per_point * Math.sqrt(pointsNum) / circumference) | 0;
	var raster_size = raster_dim_size * raster_dim_size;
	var cell_half_width = 2 / ((raster_dim_size - 1));

	// names for Uint16Arrays follow naming conventions for 2-blades in geometric algebra
	var xy = new Uint16Array(raster_size);
	var yz = new Uint16Array(raster_size);
	var zx = new Uint16Array(raster_size);
	var yx = new Uint16Array(raster_size);
	var zy = new Uint16Array(raster_size);
	var xz = new Uint16Array(raster_size);

	var sides = [
		xy,
		yz,
		zx,
		yx,
		zy,
		xz,
	];
	// population
	var component_orders = [
		// 0 indicates first dimension in grid
		// 1 indicates second dimension in grid
		// 2 indicates the dimension omitted from grid
		[0,1,2],
		[2,0,1],
		[1,2,0],
		[1,0,2],
		[2,1,0],
		[0,2,1],
	];
	var li = sides.length;
	var lj = raster_dim_size;
	var lk = raster_dim_size;
	var pos = {x:0, y:0, z:0};
	var raster = xy;
	var raster_x = 0.0;
	var raster_y = 0.0;
	var raster_z = 0.0;
	var raster_id = 0;
	var nearest_id = 0;
	var component_order = component_orders[0];
	var raster_components = [];
	var sqrt = Math.sqrt;
	for (var i = 0; i < li; ++i) {
		raster = sides[i];
		component_order = component_orders[i];
		for (var j = 0; j < lj; ++j) {
			for (var k = 0; k < lk; ++k) {
				// get position of the cell on the unit sphere
				raster_x = j * cell_half_width - 1;
				raster_y = k * cell_half_width - 1;
				// reconstruct the dimension omitted from the grid using pythagorean theorem
				raster_z = sqrt(1 - (raster_x * raster_x) - (raster_y * raster_y)) || 0;
				raster_z *= i > 2? -1 : 1;
				// translate from raster coordinates to absolute coordinates
				raster_components = [raster_x, raster_y, raster_z];
				pos = {x:0, y:0, z:0};
				pos.x = raster_components[component_order[0]];
				pos.y = raster_components[component_order[1]];
				pos.z = raster_components[component_order[2]];
				raster_id = j * raster_dim_size + k;
				nearest_id = kdtree.nearest(pos,1)[0][0].i;
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