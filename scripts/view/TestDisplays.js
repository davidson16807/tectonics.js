// TESTS FOR VARIOUS FIELDS 
// NOT TO BE INCLUDED IN PRODUCTION

var test;

scalarDisplays.thickness 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (plate) {
			return ScalarField.add_field(plate.sima, plate.sial);
		} 
	} );
scalarDisplays.sima 	= new ScalarHeatDisplay( { min: '6000.', max: '7000.',  
		getField: function (plate) {
			return plate.sima;
		} 
	} );
scalarDisplays.sial 	= new ScalarHeatDisplay( { min: '6000.', max: '70000.',  
		getField: function (plate) {
			return plate.sial;
		} 
	} );
function lerp(a,b, x){
	return a + x*(b-a);
}
function clamp (x, minVal, maxVal) {
	return Math.min(Math.max(x, minVal), maxVal);
}
function smoothstep (edge0, edge1, x) {
	var fraction = (x - edge0) / (edge1 - edge0);
	return clamp(fraction, 0.0, 1.0);
	// return t * t * (3.0 - 2.0 * t);
}
function get_density(sima, sial, age, density) {
	density = density || Float32Raster(sima.grid);
	var sima_density;
    for (var i = 0, li = density.length; i < li; i++) {
    	sima_density = lerp(2890, 3300, smoothstep(0, 250, age[i]));
    	density[i] = sima[i] + sial[i] > 0? (sima[i] * sima_density + sial[i] * 2700) / (sima[i] + sial[i]) : 2890;
    }
    return density;
}
function get_displacement(thickness, density, mantleDensity, displacement) {
	displacement = displacement || Float32Raster(thickness.grid);
 	var thickness_i, rootDepth;
 	for(var i=0, li = displacement.length; i<li; i++){

 		//Calculates elevation as a function of crust density. 
 		//This was chosen as it only requires knowledge of crust density and thickness,  
 		//which are relatively well known. 
 		thickness_i = thickness[i]; 
 		rootDepth = thickness_i * density[i] / mantleDensity; 
 		displacement[i] = thickness_i - rootDepth;
 	}
 	return displacement;
}
scalarDisplays.density 	= new ScalarHeatDisplay( { min: '2700.', max: '3300.',  
		getField: function (plate) {
			return get_density(plate.sima, plate.sial, plate.age);
		} 
	} );
scalarDisplays.displacement 	= new ScalarHeatDisplay( { min: '3682.', max: '12000.',  
		getField: function (plate) {
			var thickness = ScalarField.add_field(plate.sima, plate.sial);
			var density = get_density(plate.sima, plate.sial, plate.age);
			return get_displacement(thickness, density, 3300);
		}
	} );

var subduction_min_age_threshold = 150;
var subduction_max_age_threshold = 200;
var subductability_transition_factor = 1/100;
scalarDisplays.subductability = new ScalarHeatDisplay(  {
		min: '1.', max: '0.',
		getField: function (crust) {
			var thickness = ScalarField.add_field(crust.sima, crust.sial);
			var density = get_density(crust.sima, crust.sial, crust.age);
			var foundering = Float32Raster(crust.grid);
 			for(var i=0, li = foundering.length; i<li; i++){
 				foundering[i] = density[i] > 3150;
			}
			return foundering;
		}
	} );

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

scalarDisplays.plate0 	= new ScalarHeatDisplay( { min: '0.', max: '1.',  
		getField: function (world) {
			return world.plates[0].mask;
		} 
	} );
scalarDisplays.plates 	= new ScalarHeatDisplay( { min: '0.', max: '5.',  
		getField: function (world) {
			var plates = world.plates;
			var result = Float32Raster(world.grid);
			for (var i = 0; i < plates.length; i++) {
				ScalarField.add_scalar_term(result, plates[i].mask, i, result);
			}
			return result;
		} 
	} );
scalarDisplays.plate0age 	= new ScalarHeatDisplay( { min: '250.', max: '0.',  
		getField: function (world) {
			return world.plates[0].age;
		} 
	} );
scalarDisplays.plate_masks 	= new ScalarHeatDisplay( { min: '-1.', max: '7.',  
		getField: function (world) {
			return world.plate_masks;
		} 
	} );
scalarDisplays.plate_count 	= new ScalarHeatDisplay( { min: '0.', max: '3.',  
		getField: function (world) {
			return world.plate_count;
		} 
	} );
scalarDisplays.is_detaching 	= new ScalarHeatDisplay( { min: '0.', max: '7.',
		getField: function (world) {
			return world.is_detaching;
		} 
	} );
scalarDisplays.is_rifting 	= new ScalarHeatDisplay( { min: '0.', max: '7.',
		getField: function (world) {
			return world.is_rifting;
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
			// var field = getSubductabilitySmoothed(plate)
			// var gradient = ScalarField.gradient(field);
			// var angular_velocity = VectorField.cross_vector_field(gradient, plate.grid.pos);
			// laplacian = VectorField.divergence(gradient);
			return plate.asthenosphere_velocity;
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
