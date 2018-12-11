var VoronoiSphere = (function() {
	
	const OCTAHEDRON_SIDE_COUNT = 8;	// number of sides on the data cube
	var OCTAHEDRON_SIDE_Z = VectorRaster.FromVectors([
			Vector(-1,-1,-1),
			Vector( 1,-1,-1),
			Vector(-1, 1,-1),
			Vector( 1, 1,-1),
			Vector(-1,-1, 1),
			Vector( 1,-1, 1),
			Vector(-1, 1, 1),
			Vector( 1, 1, 1)
		]);
	VectorField.normalize(OCTAHEDRON_SIDE_Z, OCTAHEDRON_SIDE_Z);
	var OCTAHEDRON_SIDE_X = VectorField.cross_vector(OCTAHEDRON_SIDE_Z, Vector(0,0,1));
	VectorField.normalize(OCTAHEDRON_SIDE_X, OCTAHEDRON_SIDE_X);
	var OCTAHEDRON_SIDE_Y = VectorField.cross_vector_field(OCTAHEDRON_SIDE_Z, OCTAHEDRON_SIDE_X);
	VectorField.normalize(OCTAHEDRON_SIDE_Y, OCTAHEDRON_SIDE_Y);
	var OCTAHEDRON_SIDE_X = VectorRaster.ToArray(OCTAHEDRON_SIDE_X);
	var OCTAHEDRON_SIDE_Y = VectorRaster.ToArray(OCTAHEDRON_SIDE_Y);
	var OCTAHEDRON_SIDE_Z = VectorRaster.ToArray(OCTAHEDRON_SIDE_Z);


	var cell_count = function (dimensions_x, dimensions_y){
		return OCTAHEDRON_SIDE_COUNT * dimensions_x * dimensions_y;
	}
	var cell_id = function (side_id, xi, yi, dimensions_x, dimensions_y){
		return  side_id * dimensions_x * dimensions_y
			  + xi      * dimensions_y 
			  + yi;
	}

	//Data structure mapping coordinates on a sphere to the nearest neighbor
	//Retrievals from the map are of O(1) complexity. The result resembles a voronoi diagram, hence the name.
	function VoronoiSphere(pos, cell_width, farthest_distance){
		var dimension_x = Math.ceil(2./cell_width)+1;
		var dimension_y = Math.ceil(2./cell_width)+1;
		var cells = new Uint16Array(cell_count(dimension_x, dimension_y));

		this.cell_width = cell_width;
		this.dimension_x = dimension_x;
		this.dimension_y = dimension_y;
		this.cells = cells;

		//Feed locations into an integer lattice for fast lookups
		var points = [];
		var x = pos.x;
		var y = pos.y;
		var z = pos.z;
		for(var i=0, il = x.length; i<il; i++){
			points.push({x:x[i], y:y[i], z:z[i], i:i});
		}
		var getDistance = function(a,b) { 
				return (a.x - b.x)*(a.x - b.x) +  (a.y - b.y)*(a.y - b.y) + (a.z - b.z)*(a.z - b.z); 
			};
		var lattice = new IntegerLattice(points, getDistance, farthest_distance);

		var side_x = OCTAHEDRON_SIDE_X[0];
		var side_y = OCTAHEDRON_SIDE_Y[0];
		var side_z = OCTAHEDRON_SIDE_Z[0];
		var cell_x = Vector();
		var cell_y = Vector();
		var cell_z = Vector();
		var cell_pos = Vector();
		var sqrt = Math.sqrt;
		var max = Math.max;

		var x2d = 0.;
		var y2d = 0.;
		var z2d = 0.;
		// populate cells using the slower IntegerLattice implementation
		for (var side_id = 0; side_id < OCTAHEDRON_SIDE_COUNT; side_id++)
		{
			for (var xi2d = 0; xi2d < dimension_x; xi2d++)
			{
				for (var yi2d = 0; yi2d < dimension_y; yi2d++)
				{
					// get position of the cell that's projected onto the 2d grid
					x2d = xi2d * cell_width - 1.;
					y2d = yi2d * cell_width - 1.;

					// reconstruct the dimension omitted from the grid using pythagorean theorem
					z2d = sqrt(max(1. - (x2d*x2d) - (y2d*y2d), 0.));
					side_x = OCTAHEDRON_SIDE_X[side_id];
					side_y = OCTAHEDRON_SIDE_Y[side_id];
					side_z = OCTAHEDRON_SIDE_Z[side_id];

					Vector.mult_scalar(side_x.x, side_x.y, side_x.z, x2d, cell_x);
					Vector.mult_scalar(side_y.x, side_y.y, side_y.z, y2d, cell_y);
					Vector.mult_scalar(side_z.x, side_z.y, side_z.z, z2d, cell_z);

					// reset vector
					cell_pos.x = 0;
					cell_pos.y = 0;
					cell_pos.z = 0;

					Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_x.x, cell_x.y, cell_x.z, cell_pos);
					Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_y.x, cell_y.y, cell_y.z, cell_pos);
					Vector.add_vector(cell_pos.x, cell_pos.y, cell_pos.z, cell_z.x, cell_z.y, cell_z.z, cell_pos);
					cells[cell_id(side_id, xi2d, yi2d, dimension_x, dimension_y)] =  lattice.nearest(cell_pos).i;
				}
			}
		}
	}
	VoronoiSphere.prototype.getNearestIds = function(pos_field, result) {
		result = result || new Uint16Array(pos_field.x.length);

		cell_width = this.cell_width;
		dimension_x = this.dimension_x;
		dimension_y = this.dimension_y;
		cells = this.cells;

		var side_x = OCTAHEDRON_SIDE_X[0];
		var side_y = OCTAHEDRON_SIDE_Y[0];

		var projection_x = 0;
		var projection_y = 0;

		var grid_pos_x = 0;
		var grid_pos_y = 0;

		var pos_field_xi = 0;
		var pos_field_yi = 0;
		var pos_field_zi = 0;

		var side_id = 0;

		var dot = Vector.dot_vector;
		var floor = Math.floor;
		for (var i = 0, li = pos_field.x.length; i < li; i++)
		{
			pos_field_xi = pos_field.x[i];
			pos_field_yi = pos_field.y[i];
			pos_field_zi = pos_field.z[i];

			var side_id = 
			  (( pos_field_xi > 0)     ) +
			  (( pos_field_yi > 0) << 1) +
			  (( pos_field_zi > 0) << 2) ; 

			side_x = OCTAHEDRON_SIDE_X[side_id];
			side_y = OCTAHEDRON_SIDE_Y[side_id];

			projection_x = dot( side_x.x, side_x.y, side_x.z, pos_field_xi, pos_field_yi, pos_field_zi );
			projection_y = dot( side_y.x, side_y.y, side_y.z, pos_field_xi, pos_field_yi, pos_field_zi );

			grid_pos_x = floor((projection_x + 1.) / cell_width);
			grid_pos_y = floor((projection_y + 1.) / cell_width);

			result[i] = cells[cell_id(side_id, grid_pos_x, grid_pos_y, dimension_x, dimension_y)];
		}
		return result;
	}
	return VoronoiSphere;
})();