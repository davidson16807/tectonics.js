'use strict';

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

	this_.isostasy = function(){
		//Calculates elevation as a function of crust density.
		//This was chosen as it only requires knowledge of crust density and thickness, 
		//which are relatively well known.
		var thickness = this_.thickness;
		var rootDepth = thickness * this_.density / this_.world.mantleDensity;
		var displacement = thickness - rootDepth;
		this_.displacement = displacement ;
	}
	return this_;
}
