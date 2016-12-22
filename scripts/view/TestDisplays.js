// TESTS FOR VARIOUS FIELDS 
// NOT TO BE INCLUDED IN PRODUCTION

var test;

// test for Float32Raster.get_nearest_values()
// rotates age by a certain amount
scalarDisplays.age_rotated 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		// scaling: true,
		getField: function (plate, result) {
			var rotationMatrix = new THREE.Matrix4();
			rotationMatrix.makeRotationAxis( plate.eulerPole, 0.5 );
			var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
			// test = (plate.grid.getNearestIds(pos));
			test = Float32Raster.get_nearest_values(plate.age, pos, result);
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

// scalarDisplays.id_rotated 	= new ScalarHeatDisplay( {
// 		scaling: true,
// 		getField: function (plate) {
// 			var ids = new Float32Array(plate.age.length);
// 			for (var i=0, li=ids.length; i<li; ++i) {
// 			    ids[i] = i;
// 			}

// 			var rotationMatrix = new THREE.Matrix4();
// 			rotationMatrix.makeRotationAxis( plate.eulerPole, 0.5 );
// 			var pos = VectorField.mult_matrix(plate.grid.pos, rotationMatrix.toArray());
// 			// test = (plate.grid.getNearestIds(pos));
// 			return Float32Raster.get_nearest_values(ids, pos);
// 		} 
// 	} );
scalarDisplays.voronoi_ids	= new ScalarHeatDisplay( {
		scaling: true,
		getField: function (plate) {
			return plate.grid.getNearestIds(plate.grid.pos);
		} 
	} );

scalarDisplays.flood_fill1 = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			return flood_fill;
		}
	} );

scalarDisplays.flood_fill_white_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var white_top_hat = BinaryMorphology.white_top_hat(BinaryMorphology.to_binary(flood_fill), 5);
			return white_top_hat;
		}
	} );
scalarDisplays.flood_fill_black_top_hat = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var white_top_hat = BinaryMorphology.white_top_hat(BinaryMorphology.to_binary(flood_fill), 5);
			return white_top_hat;
		}
	} );

scalarDisplays.flood_fill_dilation = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var dilation = BinaryMorphology.dilation(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(dilation);
		}
	} );
scalarDisplays.flood_fill_erosion = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var erosion = BinaryMorphology.erosion(BinaryMorphology.to_binary(flood_fill), plate.grid, 5);

			return BinaryMorphology.to_float(erosion);
		}
	} );
scalarDisplays.flood_fill_opening = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var opening = BinaryMorphology.opening(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(opening);
		}
	} );
scalarDisplays.flood_fill_closing = new ScalarHeatDisplay(  { 
		min: '1.', max: '0.',
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			
			var max_id = VectorRaster.max_id(gradient);
			var mask = Float32Raster(plate.grid, 1);
			var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

			var closing = BinaryMorphology.closing(BinaryMorphology.to_binary(flood_fill), 5);

			return BinaryMorphology.to_float(closing);
		}
	} );

scalarDisplays.flood_fill8 = new ScalarHeatDisplay(  { 
		min: '10.', max: '0.',
		getField: function (crust) {
			var gradient = crust.asthenosphere_velocity;
			var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
			var gradient = angular_velocity;
			var crust_fields = VectorImageAnalysis.image_segmentation(gradient, crust.grid);
			
			var crust_field_sum = Float32Raster(crust.grid, 0);
			for (var i=0; i<crust_fields.length; ++i) {
				ScalarField.add_field_term(crust_field_sum, crust_fields[i], i+1, crust_field_sum);
			}
			return crust_field_sum;
		}
	} );



vectorDisplays.test = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var vector = VectorRaster(plate.grid);
			for(var i=0, li = vector.length; i<li; i++){
				vector[i] = new THREE.Vector3(1,0,0); 
			}
			return plate.grid.pos;
		} 
	} );
vectorDisplays.asthenosphere_angular_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate)
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			// laplacian = VectorField.divergence(gradient);
			return angular_velocity;
		} 
	} );

vectorDisplays.asthenosphere_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate)
			var gradient = ScalarField.gradient(field);
			// var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			// laplacian = VectorField.divergence(gradient);
			return gradient;
		} 
	} );
vectorDisplays.averaged_angular_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, plate.grid);

			var averaged_angular_velocity_field_sum = VectorField.DataFrame(plate.grid, {x:0,y:0,z:0});
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
vectorDisplays.averaged_velocity = new DataFrameVectorDisplay( { 
		getField: function (plate) {
			var field = getSubductabilitySmoothed(plate);
			var gradient = ScalarField.gradient(field);
			var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			var gradient = angular_velocity;
			var plates = split(gradient, plate.grid);

			var averaged_angular_velocity_field_sum = VectorField.DataFrame(plate.grid, {x:0,y:0,z:0});
			for (var i=0, li=plates.length; i<li; ++i) {
			    var flood_fill = plates[i];
				var averaged_angular_velocity = VectorDataset.weighted_average(angular_velocity, flood_fill);
				var averaged_angular_velocity_field = ScalarField.mult_vector(flood_fill, averaged_angular_velocity);
				VectorField.add_vector_field(averaged_angular_velocity_field_sum, averaged_angular_velocity_field, 
					averaged_angular_velocity_field_sum);
			}

			var averaged_velocity = VectorField.cross_vector_field(plate.grid.pos, averaged_angular_velocity_field_sum);
			return averaged_velocity;
		} 
	} );