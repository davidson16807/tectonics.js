// TESTS FOR EXISTING FUNCTIONALITY 
// NOT TO BE INCLUDED IN PRODUCTION

var regressionTestDisplays = {};

// test for raster id placement
regressionTestDisplays.ids 	= new ScalarHeatDisplay( { 
		scaling: true,
		getField: function (crust) {
			return crust.grid.vertex_ids;
		} 
	} );

// test for voronoi diagram used by grid.getNearestIds
// should look just like regressionTestDisplays.ids
regressionTestDisplays.voronoi_ids	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (crust) {
			return crust.grid.getNearestIds(crust.grid.pos);
		} 
	} );

// test for get_nearest_values - does it reconstruct the ids field after rotation?
// should look just like regressionTestDisplays.ids, but rotated
regressionTestDisplays.id_rotated 	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (crust) {
			var ids = Float32Raster(crust.grid);
			Float32Raster.FromUint16Raster(crust.grid.vertex_ids, ids);
			var rotationMatrix = Matrix.rotation_about_axis(1,0,0, 0.5);
			var pos = VectorField.mult_matrix(crust.grid.pos, rotationMatrix);
			return Float32Raster.get_nearest_values(ids, pos);
		}
 	} );

// test for Float32Raster.get_nearest_values()
// rotates the age field by a certain amount
regressionTestDisplays.age_rotated 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		// scaling: true,
		getField: function (crust, result) {
			var rotationMatrix = Matrix.rotation_about_axis(1,0,0, 0.5);
			var pos = VectorField.mult_matrix(crust.grid.pos, rotationMatrix);
			test = Float32Raster.get_nearest_values(crust.age, pos, result);
			return test;
		} 
	} );

// test for individual plate mask
regressionTestDisplays.single_plate = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: function (world) {
			return world.plates[0].mask;
		} 
	} );


// test for the flood fill algorithm, AKA "magic wand select"
regressionTestDisplays.flood_fill1 = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);

			var gradient = ScalarField.gradient(pressure);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			return flood_fill;
		}
	} );

// test for binary morphology
regressionTestDisplays.flood_fill_white_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);

			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var white_top_hat = BinaryMorphology.white_top_hat(BinaryMorphology.to_binary(flood_fill), 5);
			return white_top_hat;
		}
	} );

// test for binary morphology
regressionTestDisplays.flood_fill_black_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var white_top_hat = BinaryMorphology.white_top_hat(BinaryMorphology.to_binary(flood_fill), 5);
			return white_top_hat;
		}
	} );

// test for binary morphology
regressionTestDisplays.flood_fill_dilation = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Uint8Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var dilation = BinaryMorphology.dilation(BinaryMorphology.to_binary(flood_fill), 1);

			return BinaryMorphology.to_float(dilation);
		}
	} );
// test for binary morphology
regressionTestDisplays.flood_fill_erosion = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Uint8Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var erosion = BinaryMorphology.erosion(BinaryMorphology.to_binary(flood_fill), 1);

			return BinaryMorphology.to_float(erosion);
		}
	} );
// test for binary morphology
regressionTestDisplays.flood_fill_opening = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var opening = BinaryMorphology.opening(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(opening);
		}
	} );
// test for binary morphology
regressionTestDisplays.flood_fill_closing = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(crust.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var closing = BinaryMorphology.closing(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(closing);
		}
	} );

// test for image segmentation algorithm
regressionTestDisplays.flood_fill8 = new ScalarHeatDisplay(  { 
		min: '8.', max: '0.',
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			var plate_map = TectonicsModeling.get_plate_map(gradient, 7, 200);
			return plate_map;
		}
	} );


// test for basic vector rendering
vectorDisplays.test = new VectorFieldDisplay( { 
		getField: function (crust) {
			var vector = VectorRaster(crust.grid);
			for(var i=0, li = vector.length; i<li; i++){
				vector[i] = new THREE.Vector3(1,0,0); 
			}
			return crust.grid.pos;
		} 
	} );

vectorDisplays.asthenosphere_velocity = new VectorFieldDisplay( { 
		getField: function (world, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(world.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			return gradient;
		} 
	} );