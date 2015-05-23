'use strict';

function RockColumn(world, optional){
	optional = optional || {};

	this.world = world;
	this.displacement = optional['displacement'] || 0;
	this.thickness = optional['thickness'] || world.ocean.thickness;
	this.density = optional['density'] || world.ocean.density;
}

RockColumn.prototype.isContinental = function(){
	return this.thickness > 17000;
}

RockColumn.prototype.accrete = function(subducted){
	var sialDensity = this.world.land.density
	var simaDensity = this.world.mantleDensity
	
	var sialFraction = (subducted.density - simaDensity) / (sialDensity - simaDensity)
	
	var thickness = this.thickness;
	var heightChange = subducted.thickness * sialFraction;
	var pressure = (thickness*this.density) +
			   (heightChange*sialDensity);
	var density  = pressure / (thickness + heightChange);
	this.thickness += heightChange;
	this.density = density;
}

RockColumn.prototype.isostasy = function(){
	//Calculates elevation as a function of crust density.
	//This was chosen as it only requires knowledge of crust density and thickness, 
	//which are relatively well known.
	var thickness = this.thickness;
	var rootDepth = thickness * this.density / this.world.mantleDensity;
	var displacement = thickness - rootDepth;
	this.displacement = displacement ;
}