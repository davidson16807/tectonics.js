Stratigraphy only matters to us if a hypothetical person on a planet could access it. The Kola super deep borehole in Russia is the deepest place any human has accessed to date, at a depth of 12km. Other measures of accessible depth can be taken from ocean trenches or canyons, on Earth or elsewhere in the solar system, but we find these are less extreme and still on the same order of magnitude. 

So let's say the max height relevant to stratigraphy is 12km, or dex 4.3

Lowest acceptable precision for a layer is probably Minecraft level, 1m blocks, dex 0

Highest precision solution per layer is to store each mass pool as floats, and there are about 16 mass pools ranging from orthoclase to nitrogen ice.

dex 1.2 + 0.6 = 1.8 per layer, and dex 1.8 + 4.3 - 0 = 6.1 per cell

There are upwards of 40k cells per grid, dex 4.6

So dex 10.7 per grid

It would take 50GB to store a single stratigraphic rasters at full resolution

Keep in mind that we want to store multiple stratigraphic rasters to simulate plate tectonics.
There are 7 major plates on Earth and we've been content with simulating that number in the past, 
so we would need dex 10.7 + 0.7 = 11.4, or ~250 GB to simulate an entire planet's stratigraphy.

We conclude that we cannot simulate stratigraphic layers to our hearts content in a naive fashion.
We either need to sacrifice precision, or create some clever representation that is still able to handle mass transfer in a sane way. 

To guide our investigation, let's define a maximum tolerable budget for a planet's stratigraphy. 
We only need an order of magnitude estimate. 1GB is too much. 100MB is right around what we get away with already when running in Chrome. So this will be our target. This is dex 8.

Dex 8 - 0.7 - 4.6 = 2.7, or 600 bytes is the maximum allowable size per stratigraphic column. This allows us to store dex 2.7-1.8 = 0.9 dex, or 8 layers with a simple naive representation where layer depth is constant and all mass layers are present. 

This is abyssmal, but there is plenty of room for improvement. We would like a way to simulate as much stratigraphy as appreciable, using a representation where it is trivial to transfer mass, using only 600 bytes per stratigraphic column. 

We can either ease our definition of "appreciable" or modify our representation, or both. 

First: we do not need to represent the world in Minecraft blocks. We could represent layers as a series of intermixed mass pools whose thickness is dependant on their mass pool content. With 16 mass pools, each with a 4 byte floating point, this amounts to 64 bytes per layer. This fits snugly within a cache line, and provides for around 10 such layers per column. Since the user only cares about fidelity towards the surface, we can add mass pools within the top layer to our heart's content, incrementing the top layer every timestep, or at a predetermined time interval, and every time that happens we can merge bottom layers together to fit within the 10 layer allowance. If we increment at every timestep, then at our largest timestep each rock layer will represent 10,000 years of history. This seems like far too fine a resolution for our model. We are mostly only interested in recreating stratigraphic profiles like those seen at visitor centers of major national monuments, like Red Rocks, Sedona, or the Grand Canyon. A stratification interval of 50 million years is more appropriate. Layer thickness of anywhere on the order of 10 to 1000 meters are to be expected. This could correspond to a layer mass of 10^4 to 10^6 kilograms per square meter. A full column could represent anything from 100 to 10000 meters. Our current model represents lithification as occurring at a depth of 160 meters, at metamorphosis as occurring at a depth of 11 kilometers, so even with a modest number of layers, we could and should represent these processes. 

Another thing: in addition to mass pools, each layer should have some way to indicate phase: sediment, sedimentary, metamorphic, or igneous. For instance, sandstone turns to quartzite under extreme temperature and pressure. Changes such as this could just as well be represented on a phase diagram, much as how we could use a phase diagram to determine the mass of the oceans and atmosphere. However, there is a significant difference here: when water is heated to become a vapor, it can easily return to water when the temperature lowers. However, once a rock undergoes lithification or metamorphosis, it will seldom return to its earlier state. 

Because these processes are irreversible, we cannot naively derive rock type as a pure function of depth. We need to introduce state to solve the problem. 

But consider what happens when we add some trivial flag to indicate metamorphosis. It works well enough if an entire layer is composed of a single material like silica. However, what happens if it's a complex mixture, say, of silica and ice? Ice has a phase diagram that's completely different from silica. Depending on your pressure or temperature, you could have silica embedded in ice IV, or quartzite in ice IV, or silica in regular ice. There's too much complexity here. We can't describe the results with just a simple flag, and even if we did, we wouldn't want to handle the logic that attempts to do so. 

It's far better to understand what goes on in each of these processes and see if there is some core set of state variables that account for them all. The rock cycle provides us with an exhaustive list of processes we want to describe, so let's go through them: solidification, sedimentation, lithification, metamorphosis.

"Solidification" is our term for the formation of igneous rock. Prior to that event, a rock can be thought of as a homogeneous mix of fluids, so it has no state other than the mass of constituents. In other words, it's a good place to start our discussion. The result of solidification depends on the rate at which cooling occurs. If the fluids cooled quickly, they do not have time to differentiate into macroscopic grains (known as "grains"), and it forms homogenous extrusive rock, like basalt (mafic) or rhyolite (felsic). If magma cooled slowly, it has plenty of time to differentiate, and it forms heterogeneous intrusive rock like gabbro (mafic) or granite (felsic). 

Sedimentation occurs through mechanical or chemical weathering and the result depends on what process is involved. Chemical weathering often results in fine particles of clay, and we can assume that the composition of each clay particle is homogeneous. If intrusive rock goes through chemical weathering, certain grains will degrade faster than others. The result is a mixture of small particles of fast dissolving minerals (like clay) and large particles of slow dissolving minerals (like sand). Meanwhile, mechanical weathering often results in coarser particles like gravel. 

Lithification occurs under pressure due to the compaction and cementation of grains. Compaction is merely an increase in the packing density of grains, or a decrease in the pore size. Cementation is the creation of new material between the grains due to the precipitation of ions in fluid, which is analogous to the crystal formation that's needed to create gemstones and native metals. 

Metamorphosis occurs under heat and pressure due to a solid state change of grains. The grains retain the same composition, but now have different chemical structure. No melting occurs during this process, not even partial, and if even partial melting should occur, I suppose the result is better described as intrusive igneous rock. 

And now the stage is set. We see a few common threads throughout the above description of processes. Rocks are characterized by a set of "grains", each of which has a homogenous mineral composition and an average size. Different minerals can have the same composition but different structure, depending on the pressure and temperature extremes they were exposed to. The pressure and temperature extremes encountered are assumed to be constant for all components of the same composition within a given a rock specimen. There is also an average "particle size", which is distinct from the average size of a grain in the case of mechanical weathering, and if a grain precipitates as with lithification or crystal formation, the size of the component depends on the pore density between the grains. 

So let's consider the following data structure to represent our "Layer":
4b	particle size
	mass pool:
4b		mass
1b		max pressure received
1b		max temperature received
1b		mass pool id (optional)
1b		average size

We assume here that pressure and temperature increase monotonically with depth, in a predictable fashion, so there is little risk of developing situations where temperature and pressure have maxed out at separate points in time. This allows us to efficiently store max pressure and temperature for each grain. 

Let's consider an edge case that is still relevant to users: the formation of alluvial diamond deposits. To form a diamond, a mass pool of carbon must receive a max pressure and temperature that falls within a certain range. The average size of the diamond presumably depends on the pore size of the parent rock it forms in. It is also presumed at some point that the parent rock undergoes partial melting, which allows the diamond to be forced up onto the surface through fissures known as "kimberly pipes". Once there, the partial melt solidifies: the other mass pools solidify, their max pressures and temperatures are reset to surface values, and their average size is small to reflect the rapid cooling rate. The particle size of the rock is set to a maximum to reflect that it is solid after formation. At this stage, the data structure describes the consistency of Kimberlite. After a time, weathering occurs, dissolvable mass pools reset their max pressures and temperatures and set their size to infinitesimal. The result is a mix of clay, sand, and diamond. This can be transported through erosion to become an alluvial diamond deposit. 

The data structure above requires a lot of memory, and if we are to store all mass pools in a single cache line, we need a single mass pool to be stored within 8 bytes. The mass of the pool itself requires the most precision since it is a conserved property, and it needs to represent values across several orders of magnitude ranging from 1kg/m^2 ash layers to 10^6 kg/m^2 metamorphic rock layers. So I propose at least a 2 byte short. If the other attributes are a minimum of one byte, we are guaranteed to run over the size of a 4 byte word, so we might as well make use of the remaining space and make mass a 4 byte float. 

As for pressure, temperature, and size, we really only need rough estimates. Temperature should not exceed 24000 K (the temperature of Jupiter's core) and could be further limited to 6000 K (the temperature of Earth's core) if needed. Pressure should not exceed 5e12 Pa (Jupiter's core) and could be limited to 2e11 Pa (Earth's upper mantle) if needed. Error intervals could be on the order of 10 K for temperature and 10^8 Pa for pressure (to represent lithification, and e.g. to distinguish metamorphic forms of basalt) 

In table form:
			max(dex) 	min(dex) 	
temperature	2e4 		1e1 		
pressure 	5e12 		1e8 		

Since temperature and pressure are only representational, it may be in our interest to store them in a single byte that represents their logarithm at a given base. We would have to choose which base. For performance, it should probably be a root of 2 to allow for performant bit twiddling. 

If temperature       were represented as `2<<(T/17)`,  we could represent temperatures up to  32768K with a precision of 12%
If pressure          were represented as `2<<(P/6)`,   we could represent pressures    up to    6e12 with a precision of 12%
If particle diameter were represented as `2<<(-d/25)`, we could represent sizes        down to 0.001 with a precision of 12%

One final thing: we do need to concern ourselves with what the representative depth would be for a given layer. Each layer has a variable thickness, so depth could vary considerably across the layer. This in turn means that pressure and temperature could vary considerably. This is especially the case for the bottom-most layer, which is sort of a garbage bin of whatever mass pools were leftover. 

There are things working in our favor though. We again reason that users don't care so much what happens at the bottom. We further reiterate that our model does have the potential to generate depths that are sufficient for metamorphosis, so it is likely with adequate parameterization that the bottommost layer will always be at a depth where metamorphosis could occur consistently throughout the layer. 
