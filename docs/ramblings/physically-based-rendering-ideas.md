
What color would we render the earth if we could only use a pixel?
How would we render Carl Sagan's "Pale Blue Dot"?
We would use microfacet theory.
We would measure results in units of intensity for each color channel.
The rgb intensity of the pixel would be the sum of contributions for all surfaces on the earth exposed to the camera (where NV>0)
The diffuse component would be the sum of diffuse contributions from all surfaces.
The specular component would be sum of all specular contributions from all surfaces whose surface normal is the halfway vector.
Do note: this still effectively requires calculating the sum of contributions from all surfaces due to microfacets. 

We could effectively use the flyweight pattern:
	subdivide the world into material classes (80% water, 20% land)
	each material class has representative surface normals with their own frequencies
	calculate contributions from each material class and representative surface normal
	multiply by their percentages

Adapting this idea for ordinary physically based rendering:
	subdivide the surface into material classes (water, ice, land, forest), each with:
		frequency can be determined by a function of height or slope:
				  frequency of water can be determined from comparing height function to ocean_depth
				  frequency of snow can be determined from comparing slope to angle of repose for snow
		roughness determined by a function of 
		color     (no change required in calculation)
	each material class has representative microfacet surface normals with their own frequencies,
		in our case this would be expressed entirely through roughness, masking, shadows, and surface normal distribution functions
	calculate contributions from each material class and representative microfacet normal
		F 	fraction of light immediately reflected on contact with surface that's conducive to reflection (fresnel reflectance)
		G 	fraction of light that reaches surface and reaches camera once reflected (masking and shadowing),
			derived from surface roughness,
			roughness may be a dynamically calculated gestalt value (if materials are closely interspersed, e.g. water and trees in a mangrove swamp) 
			or material specific (if materials are well separated, e.g. groves in a forest)
		D 	fraction of microfacets with a surface normal conducive to reflection towards camera
	multiply by their percentages

