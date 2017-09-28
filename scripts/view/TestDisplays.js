// TESTS FOR VARIOUS FIELDS 
// NOT TO BE INCLUDED IN PRODUCTION

var testDisplays = {};

// test for raster id placement
testDisplays.ids 	= new ScalarHeatDisplay( { 
		scaling: true,
		getField: function (crust) {
			return ids.grid.vertex_ids;
		} 
	} );

// test for voronoi diagram used by grid.getNearestIds
// should look just like testDisplays.ids
testDisplays.voronoi_ids	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (crust) {
			return crust.grid.getNearestIds(crust.grid.pos);
		} 
	} );

// test for get_nearest_values - does it reconstruct the ids field after rotation?
// should look just like testDisplays.ids, but rotated
testDisplays.id_rotated 	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (crust) {
			var ids = new Float32Array(crust.age.length);
			for (var i=0, li=ids.length; i<li; ++i) {
			    ids[i] = i;
			}
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( new THREE.Vector3(1,0,0), 0.5 );
			var pos = VectorField.mult_matrix(crust.grid.pos, rotationMatrix.toArray());
			// test = (crust.grid.getNearestIds(pos));
			return Float32Raster.get_nearest_values(ids, pos);
		} 
 	} );

// test for Float32Raster.get_nearest_values()
// rotates the age field by a certain amount
testDisplays.age_rotated 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		// scaling: true,
		getField: function (crust, result) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( new THREE.Vector3(1,0,0), 0.5 );
			var pos = VectorField.mult_matrix(crust.grid.pos, rotationMatrix.toArray());
			// test = (crust.grid.getNearestIds(pos));
			test = Float32Raster.get_nearest_values(crust.age, pos, result);
			return test;
		} 
	} );

// test for individual plate mask
testDisplays.single_plate = new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: function (world) {
			return world.plates[0].mask;
		} 
	} );








// test for the flood fill algorithm, AKA "magic wand select"
testDisplays.flood_fill1 = new ScalarHeatDisplay(  { 
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
testDisplays.flood_fill_white_top_hat = new ScalarHeatDisplay(  { 
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
testDisplays.flood_fill_black_top_hat = new ScalarHeatDisplay(  { 
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
testDisplays.flood_fill_dilation = new ScalarHeatDisplay(  { 
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

			var dilation = BinaryMorphology.dilation(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(dilation);
		}
	} );
// test for binary morphology
testDisplays.flood_fill_erosion = new ScalarHeatDisplay(  { 
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

			var erosion = BinaryMorphology.erosion(BinaryMorphology.to_binary(flood_fill), crust.grid, 5);

			return BinaryMorphology.to_float(erosion);
		}
	} );
// test for binary morphology
testDisplays.flood_fill_opening = new ScalarHeatDisplay(  { 
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
testDisplays.flood_fill_closing = new ScalarHeatDisplay(  { 
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
testDisplays.flood_fill8 = new ScalarHeatDisplay(  { 
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

vectorDisplays.asthenosphere_angular_velocity = new VectorFieldDisplay( { 
		getField: function (crust, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(crust.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			// laplacian = VectorField.divergence(gradient);
			return angular_velocity;
		} 
	} );

vectorDisplays.averaged_angular_velocity = new VectorFieldDisplay( { 
		getField: function (world, flood_fill, scratch1) {
			// scratch represents pressure
			var pressure = scratch1;
			// flood_fill does double duty for performance reasons
			var scratch2 = flood_fill;
			var field = TectonicsModeling.get_asthenosphere_pressure(world.subductability, pressure, scratch2);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, world.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, world.grid);

			var averaged_angular_velocity_field_sum = VectorField.DataFrame(world.grid, {x:0,y:0,z:0});
			for (var i=0, li=plates.length; i<li; ++i) {
			    var flood_fill = plates[i];
				var averaged_angular_velocity = VectorDataset.weighted_average(angular_velocity, flood_fill);
				var averaged_angular_velocity_field = ScalarField.mult_vector(flood_fill, averaged_angular_velocity);
				VectorField.add_vector_field(averaged_angular_velocity_field_sum, averaged_angular_velocity_field, 
					averaged_angular_velocity_field_sum);
			}

			return averaged_angular_velocity_field_sum;
		} 
	} );

vectorDisplays.averaged_velocity = new VectorFieldDisplay( { 
		getField: function (world) {
			var field = getSubductabilitySmoothed(world);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, world.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, world.grid);

			var averaged_angular_velocity_field_sum = VectorField.DataFrame(world.grid, {x:0,y:0,z:0});
			for (var i=0, li=plates.length; i<li; ++i) {
			    var flood_fill = plates[i];
				var averaged_angular_velocity = VectorDataset.weighted_average(angular_velocity, flood_fill);
				var averaged_angular_velocity_field = ScalarField.mult_vector(flood_fill, averaged_angular_velocity);
				VectorField.add_vector_field(averaged_angular_velocity_field_sum, averaged_angular_velocity_field, 
					averaged_angular_velocity_field_sum);
			}

			var averaged_velocity = VectorField.cross_vector_field(world.grid.pos, averaged_angular_velocity_field_sum);
			return averaged_velocity;
		} 
	} );
