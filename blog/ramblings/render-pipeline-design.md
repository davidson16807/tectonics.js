WE MAY ASSUME:
#1: the collection of shaders only render stable, natural terrestrial surfaces, atmospheres, clouds, rings, and suns from a distance
#2: a single shader within the collection only renders one of the above types and does not try to render arbitrary PBR surfaces
	* this specialization allows us to use noise functions within the fragment shader that could not otherwise be used, and possibly other things
	* functions inside the shader can be reused to render more general purpose PBR surfaces
	* if needed, we can switch out the shader program for nearby terrain to render up close scenes, 
	  and noise functions identical to those mentioned above can be duplicated outside the shader
#3: celestial bodies are always in stable orbits that are far removed from other celestial bodies, and volumetric bodies do not overlap
	* e.g. two bodies cannot share the same atmosphere or ring system, a ring system cannot intersect the atmosphere, two ring systems cannot exist around the same planet
	* this is a fairly reasonable assumption we see often in nature, and it follows from the "stable" stipulation from assumption #1
	* this relaxes complications relating to the way we use the depth buffer to render overlapping volumetrics
	* if we wish to relax this constraint in the future we can switch out the shader program for colliding bodies,
	  since there are enough existing challenges with modeling collisions that we'd likely need a radically different approach for, anyways (e.g. metaballs)
#4: the only intersections that ever occur between solids and volumetrics is between clouds, atmospheres, and solids
	* this can be proved by exhaustion, following from assumption #1
						s a c r s
		s solids 		x x x
		a atmospheres	x   x
		c clouds  		x x
		r rings 		
		s suns 			
#5: only a small number of light sources exist in a scene
	* even in a binary star system, the light from one sun will almost certainly be orders of magnitude brighter
	* in a timelapse, only a few light sources are needed per frame per star, and we've discovered we can get by with a single sample per light source if we really needed
	* light sources may be dynamically pruned based on intensity of light at the focus point
#6: only omni-directional light sources participate in light scattering
	* e.g. only stars, no scattering from light pollution, bioluminesensce, red hot surfaces, red hot atmospheres, or multi scattering events
	* this may be relaxed in the future by simulating 
#7: shadows and outside light sources have no appreciable effect on the appearance of a star, a star's light comes only from its own emission
#8: the atmospheres of other planets have no appreciable effect on the appearance of a planet, only the atmosphere of the planet itself
	* note this only describes 


WE MUST SUPPORT:
multiple omni-directional light sources (<6)
	* e.g. binary star systems and timelapses
both point light sources and spherical light sources 
	* e.g. suns that cast umbra and penumbra
multiple volumetrics of the same kind, and volumetrics from nearby bodies
	* e.g. two binary planets, both with their own rings and atmospheres, interacting with one another
[extinction] of [scattered, reflected, and emitted] light by a planet's own atmosphere occuring along the [view ray and light ray]
[extinction] of [reflected and emitted] light by a small number of [atmospheres] occuring along the [view ray]
[occlusion and extinction] of [scattered, reflected, and emitted] light by a small number of [rings and spheres], occurring along both the [view ray and light ray]
	* view ray occlusion can be handled by 