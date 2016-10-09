'use strict';

var Crust = {};
Crust.init = function(plate, grid) {
	plate.is_member	= Float32Raster( grid );
	plate.age 		= Float32Raster( grid );
	plate.displacement= Float32Raster( grid );
	plate.thickness = Float32Raster( grid );
	plate.density 	= Float32Raster( grid );
	plate.elevation = Float32Raster( grid );
}
Crust.copy = function(from_plate, from_id, to_plate, to_id ){
	to_plate.is_member	[to_id] 	= from_plate.is_member	[from_id];
	to_plate.age		[to_id] 	= from_plate.age		[from_id];
	to_plate.displacement[to_id] 	= from_plate.displacement[from_id];
	to_plate.thickness	[to_id] 	= from_plate.thickness	[from_id];
	to_plate.density	[to_id]		= from_plate.density	[from_id];
	to_plate.elevation	[to_id] 	= from_plate.elevation	[from_id];
}
Crust.move = function(from_plate, from_id, to_plate, to_id ){
	to_plate.is_member	[to_id] 	= from_plate.is_member	[from_id];
	to_plate.age		[to_id] 	= from_plate.age		[from_id];
	to_plate.displacement[to_id] 	= from_plate.displacement[from_id];
	to_plate.thickness	[to_id] 	= from_plate.thickness	[from_id];
	to_plate.density	[to_id]		= from_plate.density	[from_id];
	to_plate.elevation	[to_id] 	= from_plate.elevation	[from_id];
	
	from_plate.is_member[from_id] 	= 0;
}

Crust.remove = function(plate, id) {
	plate.is_member[id]		= 0;
	plate.age[id]       	= 0; 
	plate.displacement[id]  = 0; 
	plate.thickness[id]   	= 0;
	plate.density[id]     	= 0;
	plate.elevation[id]   	= 0;
}

Crust.create = function(plate, id, template) { 
  plate.is_member[id]   = 1; 
  plate.age[id]       = 0; 
  plate.displacement[id]   = 0; 
  plate.thickness[id]   = template.thickness; 
  plate.density[id]     = template.density; 
  plate.elevation[id]   = template.elevation; 
} 
Crust.add = function(plate, id, optional) {
	plate.is_member[id] 	= 1;
	plate.age[id] 			= optional['age'] 		|| 0;
	plate.displacement[id] 	= optional['displacement']|| 0;
	plate.thickness[id] 	= optional['thickness'] || world.ocean.thickness;
	plate.density[id] 		= optional['density'] 	|| world.ocean.density;
	plate.elevation[id] 	= optional['elevation'] || world.ocean.elevation;
}

function RockColumn(world, optional){
	optional = optional || {};

	var this_ = {};
	this_.world = world;
	this_.age = optional['age'] || 0;
	this_.displacement = optional['displacement'] || 0;
	this_.thickness = optional['thickness'] || world.ocean.thickness;
	this_.density = optional['density'] || world.ocean.density;
	this_.elevation = optional['elevation'] || world.ocean.elevation;

	this_.isContinental = function(){
		return this_.thickness > 17000;
	}
	this_.update = function (timestep) {
		this_.age += timestep;
	}
	this_.accrete = function(subducted){
		var sialDensity = this_.world.land.density
		var simaDensity = this_.world.mantleDensity
		
		var sialFraction = (subducted.density - simaDensity) / (sialDensity - simaDensity)
		
		var thickness = this_.thickness;
		var heightChange = subducted.thickness * sialFraction;
		var pressure = (thickness*this_.density) +
				   (heightChange*sialDensity);
		var density  = pressure / (thickness + heightChange);
		this_.thickness += heightChange;
		this_.density = density;
	}

	this_.subductability = function (rock) {
		var continent = smoothstep(2800, 3000, rock.density);
		return 	rock.density * (1-continent) 	+ 
				lerp(rock.density, 3300, smoothstep(0,280, rock.age)) * continent
	}
	
	return this_;
}
