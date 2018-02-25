//Data structure mapping 3d coordinates onto a lattice for fast lookups 
// lattice assumes that max distance to nearest neighbors will never exceed farthest_nearest_neighbor_distance
function IntegerLattice(points, getDistance, farthest_nearest_neighbor_distance){

	var lattice = [];
	var N = 3;
	var cell_width = farthest_nearest_neighbor_distance;

	var max_x = Math.max.apply(null, points.map(point => point.x));
	var min_x = Math.min.apply(null, points.map(point => point.x));
	var range_x = max_x - min_x;
	var cell_num_x = range_x / cell_width;

	var max_y = Math.max.apply(null, points.map(point => point.y));
	var min_y = Math.min.apply(null, points.map(point => point.y));
	var range_y = max_y - min_y;
	var cell_num_y = range_y / cell_width;

	var max_z = Math.max.apply(null, points.map(point => point.z));
	var min_z = Math.min.apply(null, points.map(point => point.z));
	var range_z = max_z - min_z;
	var cell_num_z = range_z / cell_width;

	var round = Math.round;

	function cell_id(xi, yi, zi) {
		return  xi * cell_num_z * cell_num_y 
			  + yi * cell_num_z 
			  + zi;
	}
	function add(id, point) {
		lattice[id] = lattice[id] || [];
		lattice[id].push(point)
	}

	var xi = 0;
	var yi = 0;
	var zi = 0;
	var point = points[0];
	for(var i=0, il = points.length; i<il; i++){
		point = points[i];
		xi = round((point.x - min_x) / cell_width);
		yi = round((point.y - min_y) / cell_width);
		zi = round((point.z - min_z) / cell_width);
		add(cell_id(xi, yi, zi), 	point);
		add(cell_id(xi+1, yi, zi), 	point);
		add(cell_id(xi-1, yi, zi), 	point);
		add(cell_id(xi, yi+1, zi), 	point);
		add(cell_id(xi, yi-1, zi), 	point);
		add(cell_id(xi, yi, zi+1), 	point);
		add(cell_id(xi, yi, zi-1), 	point);
	} 

	function nearest(point){
		var xi = round((point.x - min_x) / cell_width);
		var yi = round((point.y - min_y) / cell_width);
		var zi = round((point.z - min_z) / cell_width);

		var neighbors = lattice[cell_id(xi, yi, zi)] || [];

		var neighbor = neighbors[0];
		var nearest_ = neighbors[0] || {x:NaN,y:NaN,z:NaN,i:-1};
		var nearest_distance = Infinity;
		var distance = 0.0;
		for(var i=0, il = neighbors.length; i<il; i++){
			neighbor = neighbors[i];
			var distance = getDistance(point, neighbor);
			if (distance < nearest_distance) {
				nearest_distance = distance;
				nearest_ = neighbor;
			}
		}

		return nearest_;
	}

	this.nearest = nearest;
	return this;
}
