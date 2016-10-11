'use strict';


function Crust(optional) {
	this.grid = optional['grid'];
	this.displacement = Float32Raster(this.grid);
	this.elevation = Float32Raster(this.grid);
	this.thickness = Float32Raster(this.grid);
	this.density = Float32Raster(this.grid);
	this.age = Float32Raster(this.grid);
	this.uuid = Uuid.create();
}
Crust.get_value = function(crust, i) {
	return new RockColumn({
		displacement 	:crust.displacement[i],
		elevation 		:crust.elevation[i],
		thickness 		:crust.thickness[i],
		density 		:crust.density[i],
		age 			:crust.age[i],
	});
}
Crust.set_value = function(crust, i, rock_column) {
	crust.displacement[i]	= rock_column.displacement;
	crust.elevation[i] 		= rock_column.elevation;
	crust.thickness[i] 		= rock_column.thickness;
	crust.density[i] 		= rock_column.density;
	crust.age[i] 			= rock_column.age;
}