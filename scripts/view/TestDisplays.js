// TESTS FOR VARIOUS FIELDS 
// NOT TO BE INCLUDED IN PRODUCTION

var test;

// test for ScalarField.get_nearest_values()
// rotates age by a certain amount
scalarDisplays.age_rotated 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		// scaling: true,
		getField: function (plate, result) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( plate.eulerPole, 0.5 );
			var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
			// test = (plate.grid.getNearestIds(pos));
			test = ScalarField.get_nearest_values(plate.age, pos, plate.grid, result);
			return test;
		} 
	} );


scalarDisplays.ids 	= new ScalarHeatDisplay( { 
		scaling: true,
		getField: function (plate) {
			var ids = new Float32Array(plate.age.length);
			for (var i=0, li=ids.length; i<li; ++i) {
			    ids[i] = i;
			}
			return ids;
		} 
	} );

scalarDisplays.id_rotated 	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (plate) {
			var ids = new Float32Array(plate.age.length);
			for (var i=0, li=ids.length; i<li; ++i) {
			    ids[i] = i;
			}

			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( plate.eulerPole, 0.5 );
			var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
			// test = (plate.grid.getNearestIds(pos));
			return ScalarField.get_nearest_values(ids, pos, plate.grid);
		} 
	} );
scalarDisplays.voronoi_ids	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (plate) {
			return plate.grid.getNearestIds(plate.grid.pos);
		} 
	} );


scalarDisplays.subductability_smoothed_laplacian = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductability(plate)
			var laplacian = ScalarField.vertex_laplacian(field, plate.grid);
			// var gradient = ScalarField.vertex_gradient(field, plate.grid);
			// laplacian = VectorField.vertex_divergence(gradient, plate.grid);
			return laplacian;
		} 
	} );
scalarDisplays.flood_fill1 = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			return flood_fill;
		}
	} );

scalarDisplays.flood_fill_white_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var white_top_hat = Morphology.white_top_hat(Morphology.to_binary(flood_fill), plate.grid, 5);
			return white_top_hat;
		}
	} );
scalarDisplays.flood_fill_black_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var white_top_hat = Morphology.white_top_hat(Morphology.to_binary(flood_fill), plate.grid, 5);
			return white_top_hat;
		}
	} );

scalarDisplays.flood_fill_dilation = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var dilation = Morphology.dilation(Morphology.to_binary(flood_fill), plate.grid, 5);

			return Morphology.to_float(dilation);
		}
	} );
scalarDisplays.flood_fill_erosion = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var erosion = Morphology.erosion(Morphology.to_binary(flood_fill), plate.grid, 5);

			return Morphology.to_float(erosion);
		}
	} );
scalarDisplays.flood_fill_opening = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var opening = Morphology.opening(Morphology.to_binary(flood_fill), plate.grid, 5);

			return Morphology.to_float(opening);
		}
	} );
scalarDisplays.flood_fill_closing = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var magnitude = VectorField.magnitude(gradient);
			var max_id = ScalarField.max_id(magnitude);
			var mask = ScalarField.VertexTypedArray(plate.grid, 1);
			var flood_fill = VectorField.vertex_flood_fill(gradient, plate.grid, max_id, mask);

			var closing = Morphology.closing(Morphology.to_binary(flood_fill), plate.grid, 5);

			return Morphology.to_float(closing);
		}
	} );


var split = function(vector_field, grid) {
	var magnitude = VectorField.magnitude(vector_field);
	var mask = ScalarField.VertexTypedArray(grid, 1);

	var min_plate_size = 200;
	var flood_fills = [];
	var flood_fill;
	for (var i=1; i<7; ) {
		flood_fill = VectorField.vertex_flood_fill(vector_field, grid, ScalarField.max_id(magnitude), mask);   
		ScalarField.sub_field(magnitude, ScalarField.mult_field(flood_fill, magnitude), magnitude);
		ScalarField.sub_field(mask, flood_fill, mask);
	    if (ScalarField.sum(flood_fill) > min_plate_size) { 
			flood_fills.push(flood_fill);
			i++;
		}
	}
	
	var output;
	var outputs = [];
	var inputs = flood_fills;
	for (var i=0, li=inputs.length; i<li; ++i) {
	    outputs.push(Morphology.copy(inputs[i]));
	}
	for (var i=0, li=outputs.length; i<li; ++i) {
	    output = outputs[i];
	    output = Morphology.dilation(output, grid, 5);
	    output = Morphology.closing(output, grid, 5);
	    // output = Morphology.opening(output, grid, 5);
	    for (var j=0, lj=inputs.length; j<lj; ++j) {
	    	if (i != j) {
		        output = Morphology.difference(output, inputs[j]);
	    	}
	    }
	    inputs[i] = Morphology.to_float(output);
	}

	return inputs;
}

scalarDisplays.flood_fill8 = new ScalarHeatDisplay(  { 
		min: '10.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			var plate_fields = split(gradient, plate.grid);

			var plate_field_sum = ScalarField.VertexTypedArray(plate.grid, 0);
			for (var i=0; i<plate_fields.length; ++i) {
				ScalarField.add_field_term(plate_field_sum, plate_fields[i], i+1, plate_field_sum);
			}
			return plate_field_sum;
		}
	} );



vectorDisplays.asthenosphere_angular_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate)
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			// laplacian = VectorField.vertex_divergence(gradient, plate.grid);
			return angular_velocity;
		} 
	} );

vectorDisplays.asthenosphere_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate)
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			// var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			// laplacian = VectorField.vertex_divergence(gradient, plate.grid);
			return gradient;
		} 
	} );
vectorDisplays.averaged_angular_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, plate.grid);

			var averaged_angular_velocity_field_sum = VectorField.VertexDataFrame(plate.grid, {x:0,y:0,z:0});
			for (var i=0, li=plates.length; i<li; ++i) {
			    var flood_fill = plates[i];
				var averaged_angular_velocity = VectorField.weighted_average(angular_velocity, flood_fill);
				var averaged_angular_velocity_field = ScalarField.mult_vector(flood_fill, averaged_angular_velocity);
				VectorField.add_vector_field(averaged_angular_velocity_field_sum, averaged_angular_velocity_field, 
					averaged_angular_velocity_field_sum);
			}

			return averaged_angular_velocity_field_sum;
		} 
	} );
vectorDisplays.averaged_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.vertex_gradient(field, plate.grid);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, plate.grid);

			var averaged_angular_velocity_field_sum = VectorField.VertexDataFrame(plate.grid, {x:0,y:0,z:0});
			for (var i=0, li=plates.length; i<li; ++i) {
			    var flood_fill = plates[i];
				var averaged_angular_velocity = VectorField.weighted_average(angular_velocity, flood_fill);
				var averaged_angular_velocity_field = ScalarField.mult_vector(flood_fill, averaged_angular_velocity);
				VectorField.add_vector_field(averaged_angular_velocity_field_sum, averaged_angular_velocity_field, 
					averaged_angular_velocity_field_sum);
			}

			var averaged_velocity = VectorField.cross_vector_field(plate.grid.pos, averaged_angular_velocity_field_sum);
			return averaged_velocity;
		} 
	} );