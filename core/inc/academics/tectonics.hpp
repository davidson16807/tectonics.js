#pragma once

#include <cmath>

#include <glm/vec3.hpp>               // *vec3
#include <rasters/raster.hpp>          // float_raster, etc.
#include <rasters/glm/vec_raster.hpp>  // *vec*_raster
#include <rasters/glm/vector_calculus.hpp>  // *vec*_raster

namespace academics {

	namespace tectonics {

		using namespace rasters;

		void guess_plate_velocity(const bool_raster& plate_mask, const float_raster& buoyancy, const float mantle_viscosity, vec3_raster& result) {

		    // NOTE: 
		    // Here, we calculate plate velocity as the terminal velocity of a subducting slab as it falls through the mantle.
		    // 
		    // Imagine a cloth with lead weights strapped to one side as it slides down into a vat of honey - it's kind of like that.
		    // 
		    // WARNING:
		    // most of this is wrong! Here, we try calculating terminal velocity for each grid cell in isolation,
		    //  then try to average them to approximate the velocity of the rigid body. 
		    // 
		    // If we wanted to do it the correct way, this is how we'd do it:
		    //  * find drag force, subtract it from slab pull force, and use that to update velocity via netwonian integration
		    //  * repeat simulation for several iterations every time step 
		    // the reason we don't do it the correct way is 1.) it's slow, 2.) it's complicated, and 3.) it's not super important
		    // 
		    // from Schellart 2010
		    // particularly http://rockdef.wustl.edu/seminar/Schellart%20et%20al%20(2010)%20Supp%20Material.pdf
		    // TODO: modify to linearize the width parameter ("W") 
		    // originally: 
		    //         v = S F (WLT)^2/3 /18 cμ
		    // modify to:
		    //         v = S F W(LT)^1/2 /18 cμ
		    // 
		    // TODO: commit Schellart 2010 to the research folder!
		    // TODO: REMOVE HARDCODED CONSTANTS!
		    // TODO: make width dependant on the size of subducting region!
		    float width = 300e3f; // meters 
		    float length = 600e3f; // meters
		    float thickness = 100e3f; // meters
		    float effective_area = pow(thickness * length * width, 2.f/3.f); // m^2
		    float shape_parameter = 0.725f; // unitless
		    float slab_dip_angle_constant = 4.025f; // unitless
		    float world_radius = 6367e3f; // meters

		    float lateral_speed_per_unit_force  = 1.f;
		    lateral_speed_per_unit_force *= effective_area;					// start with m^2
		    lateral_speed_per_unit_force /= mantle_viscosity;				// convert to m/s per Newton
		    lateral_speed_per_unit_force /= 18.f;							// apply various unitless constants
		    lateral_speed_per_unit_force *= shape_parameter;                     
		    lateral_speed_per_unit_force /= slab_dip_angle_constant;             
		    // lateral_speed_per_unit_force *= Units.MEGAYEAR;				// convert to m/My per Newton
		    lateral_speed_per_unit_force /= world_radius; 					// convert to radians/My per Newton

		    // find boundary normal, store it in result
		    // NOTE: result does double duty for performance reasons
		    gradient	(plate_mask,result);
		    normalize 	(result,  	result);

		    // buoyancy * lateral_speed_per_unit_force yields lateral velocity yields lateral speed
		    // boundary normal times lateral speed yields lateral velocity
		    // we store all this in result for performance reasons
		    result *= buoyancy; 
		    result *= lateral_speed_per_unit_force; // radians/My
		}
	}
}




