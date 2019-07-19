Performance Considerations:

We must look at our current implementation first to see how performance will be affected by implementing fluid simulation. 

Our most performance-limiting case occurs when the user runs the model at large timesteps, thereby causing the tectonics model to kick in. Performance profiling within the tectonics model will serve as a standard of comparison, demonstrating what we can get away with. 

When we look through code, we see there is a class of operation that consists of simply mapping grid cell values from one scalar field to another. These make no consideration for the values within neighboring grid cells, so they can be performed entirely by traversing memory "in order". Scalar field addition is one such operation. We see from profiling that their effect is negligible. We will assume this class of operation is not worth our consideration. Operations within this class can be applied to our heart's content without concern for performance. 

Instead, we learn the majority of time is spent within operations that feature "out of order" memory access. These include operations involving ∇, binary morphology, the integration of deltas, and custom model code. Let's call these "nonsequential operations". 

Not all nonsequential operations are created equal.  The most obvious difference that bears performance implications lies with the memory footprint of their input. We will start by assuming the performance of nonsequential operations scales linearly with the size of this footprint. So a nonsequential operation that works on 32 bit floating point numbers might be assigned a performance score of "1", whereas a similar operation that works on 8 bit integers might be assigned a performance score of "1/4". Nonsequential operations that work over multiple floating point rasters, such as those of the "Crust" namespace, will be assigned a score that equals the number of rasters they deal with. For instance, "Crust.get_ids" processes 7 rasters as input, and so it will have a score of 7. "Uint8Raster.gradient" has 1 uint8 raster as input and 3 float32 rasters as output, so we'll round out its score to 3.

Nonsequential operations occur within the following functions within the tectonics model. This is a comprehensive list. Included are call frequencies and performance scores for the nonsequential operations that occur within them. Numbers were collected from a performance profile of a world with 4 plates (hence all the multiplications by 4)

	runtime (ms) 	score 		score breakdown
	6.2				10			1x10			calculate_deltas
												model_erosion
	3.0				4			4x1				integrate_deltas
												add_values_to_ids
	8.0				12			4x3				move_plates
												gradient
												getNearestIds
	5.3				32			4x8				merge_plates_to_master
												Float32Raster.get_ids
												Uint8Raster.get_ids
												Crust.get_ids
	2.4				3			4x3/4			update_rifting
												Uint8Raster.get_ids
												BinaryMorphology.margin
												BinaryMorphology.erosion
	5.7				7			4x7/4			update_subducted
												Uint8Raster.get_ids
												Float32Raster.get_ids
												BinaryMorphology.padding
												BinaryMorphology.erosion

The scoring function is a mostly accurate predictor. Our worst prediction was for "merge_plates_to_master", which performed acceptably well despite having the highest score of any function. This may be because we failed to account for the data locality of the rasters processed by Crust.get_ids. Let's try and fix this by scoring calls to Crust.get_ids as a "1". With this correction, "merge_plates_to_master" scores as a 8, and performance has a pleasingly linearly relation to performance score. We'll consider this a good enough modification to continue our investigation.  

Let's presume we implement all seven equations as described by Rohli in "Climatology". We no longer have to consider the effect of multiple plates. We now have only a single grid, one of which has a size equal to those of our existing implementation. We now must calculate deltas for three state variables, one of which is a vector composed of 3 component rasters. This amounts to 6 rasters total. 

The first component of any delta represents advection. Advection can be implemented in two ways, either:
	* by taking the gradient of the state variable and then dotting by velocity, or...
	* by backcalculating a sample position from velocity and then sampling that position from the state variable raster. 

The first method requires us to calculate the gradient for every state variable. These are float32 rasters, so their gradients have 1 float32 raster input and 3 float32 raster outputs. So the performance score for this approach to advection is at least 6x4 = 24, which is prohibitive. 

However, the other method only requires us to backcalculate a sample position that can be reused to derive the advection component for each state variable. Backcalculation is completely sequential, so the performance score rests entirely with sample retrieval. This amounts to 6 calls to Float32Raster.get_ids, one for each state variable. The performance score is 6, which is comparable to update_subducted. Further performance gains may be had since state variables could be clump together in a manner similar to "Crust", but we won't consider this since we only want to consider the worst case when dealing with unimplemented modeling paradigms. 

Besides advection, the only other nonsequential operations that we need to consider are:
	* the "primitive" subcomponent of the Navier-Stokes equation, effectively the float32 gradient of pressure (performance score: 4)
	* the "divergence" term within the mass conservation equation, effectively the float32 divergence of density (performance score: 4)

Things are looking really good for our implementation. We have exhaustively shown the performance score of a 2d GCM could be significantly less than that of our current tectonics model implementation, 14 vs 44. 

This makes us wonder two questions:
	1.) How can we build up the GCM model to make full use of resources?
	2.) Could we use fluid simulation to create a new, more performant tectonics model?

In answer to 1.), the obvious direction is to extend the GCM into 3d. This seems sorely needed since the implementation that we consider above assumes mass conservation when ∇⋅u⃗=0, which is not reflective of reality in 2d. Given the performance score of our current implementation, we could afford 3 layers in the z axis. We can quickly make use of any available resources, that's not the problem. The real problem is that we'd ideally want to use far more layers than this. 

However, nothing says we can't scale resolution down to where it becomes feasible. If we bump our IcosahedronGeometry's resolution level down by 1, we then cut the number of grid cells down by a factor of 4. That allows us to simulate 4 times more layers within our gcm, bringing us up to 12 layers. We can probably work with that. And as we know from personal experience, working at that grid resolution gives decent results as far as terrain is concerned, and the resolution requirements for a GCM should be even less demanding. Users generally don't care how finely resolved the rainforests or ice caps are, and that's as much as the GCM affects the appearance of the planet. 

In answer to 2.), we can trivially use the advection procedure above in order to model the entire lithosphere using just one grid, so that's not an issue. 

We will have to simulate viscosity, unlike with the GCM. However that's not so difficult. 

Viscous shear force has two terms. The first term is simply a vector where each component is the laplacian of a component within the velocity field. This has the action of resisting flow that's contrary to an average. The second term is the gradient of the divergence of the velocity field. In other words, it points to the region of greatest divergence. This has the action of resisting flow that would draw the fluid apart. For more information, I recommend reading [this chapter](http://www.feynmanlectures.caltech.edu/II_41.html) of the Feynman Lectures, and possibly trying-to-understand-viscous-force.md to see if that helps. 

Representing the viscous shear force will functionally replace our image segmentation algorithm, and if our implementation works well, that will serve as an astounding improvement to the scientific integrity of the model. The implementation should be straight forward, though we have no prescedent for it working. We already have a laplacian operation that operates on scalar fields, and it's trivial to adapt it to work on each component of the velocity field, given how we currently represent vector fields within memory. 

It is important to note here that most published equations for viscous force are for isotropic fluids: they only work when viscosity is constant. I think we want to modify viscosity where velocity divergence exceeds a certain threshold. This way, we have some way to represent the fracturing of crust into tectonic plates. Feynman provides the complete equation for variable viscosity in the aforementioned chapter. I am not completely sure this is the best way to simulate fracture using finite element methods. It's only my best guess. 

So using fluid simulation for our plate tectonics model requires one advection routine and two viscous force terms. We still consider only 7 rasters within our crust data structure, which should be a complete description of state. 

We would only need a single raster layer (this would still be a 2d model) but we would use a boundary condition so that when fluid is advected up from the mantle, it takes on the properties of new crust. 

The destruction of subducted crust is handled automatically by our advection routine. Continental crust would avoid subduction due to the viscous force terms. However, this behavior has yet to be demonstrated and it is still uncertain whether it would work this way.

So let's get an estimate for performance:

	10	1x10	calculate_deltas
					model_erosion
	0	0		integrate_deltas
	4	4		move_plates
					gradient
					getNearestIds
					Crust.get_ids
	6	6			VectorField.gradient_of_divergence
	6	6			VectorField.laplacian
	0	0		merge_plates_to_master
	 			update_rifting
	 			update_subducted
