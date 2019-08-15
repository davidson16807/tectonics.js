Stratigraphy only matters to us if a hypothetical person on a planet could access it. 
The Kola super deep borehole in Russia is the deepest place any human has accessed to date, at a depth of 12km. 
Other measures of accessible depth can be taken from ocean trenches or canyons, on Earth or elsewhere in the solar system, but we find these are less extreme and still on the same order of magnitude. 
So let's say the max height relevant to stratigraphy is 12km, or dex 4.3
Lowest acceptable precision for a layer is probably Minecraft level, 1m blocks, dex 0
Highest precision solution per layer is to store each mass pool as floats,
 and there are about 16 mass pools ranging from orthoclase to nitrogen ice
dex 1.2 + 0.6 = 1.8 per layer, and dex 1.8 + 4.3 - 0 = 6.1 per cell
There are upwards of 40k cells per grid, dex 4.6
So dex 10.7 per grid
It would take 50GB to store a single stratigraphic rasters at full resolution
Keep in mind that we want to store multiple stratigraphic rasters to simulate plate tectonics.
There are 7 major plates on Earth and we've been content with simulating that number in the past, 
so we would need dex 10.7 + 0.7 = 11.4, or ~250 GB to simulate an entire planet's stratigraphy

We conclude that we cannot simulate stratigraphic layers to our hearts content in a naive fashion.
We either need to sacrifice precision, or create some clever representation that is still able to handle mass transfer in a sane way. 

To guide our investigation, let's define a maximum tolerable budget for a planet's stratigraphy. 
We only need an order of magnitude estimate. 1GB is too much, and 10MB is kinda stingy, so 100MB will be our target. This is dex 8.

Dex 8 - 0.7 - 4.6 = 2.7, or 600 bytes is the maximum allowable size per stratigraphic column. This allows us to store dex 2.7-1.8 = 0.9 dex, or 8 layers with a simple naive representation where layer depth is constant and all mass layers are present. 

This is abyssmal, but there is plenty of room for improvement. We would like a way to simulate as much stratigraphy as appreciable, using a representation where it is trivial to transfer mass, using only 600 bytes per stratigraphic column. 

We can either ease our definition of "appreciable" or modify our representation, or both. 

First: we do not need to represent the world in Minecraft blocks. We could represent layers as a series of intermixed mass pools whose thickness is dependant on their mass pool content. With 16 mass pools, each with a 4 byte floating point, this amounts to 64 bytes per layer. This fits snugly within a cache line, and provides for around 10 such layers per column. Since the user only cares about fidelity towards the surface, we can add mass pools within the top layer to our heart's content, incrementing the top layer every timestep, or at a predetermined time interval, and every time that happens we can merge bottom layers together to fit within the 10 layer allowance. If we increment at every timestep, then at our largest timestep each rock layer will represent 10,000 years of history. This seems like far too fine a resolution for our model. We are mostly only interested in recreating stratigraphic profiles like those seen at visitor centers of major national monuments, like Red Rocks, Sedona, or the Grand Canyon. A stratification interval of 50 million years is more appropriate. Layer thickness of anywhere on the order of 10 to 1000 meters are to be expected. This could correspond to a layer mass of 10^4 to 10^6 kilograms per square meter. A full column could represent anything from 100 to 10000 meters. Our current model represents lithification as occurring at a depth of 160 meters, at metamorphosis as occurring at a depth of 11 kilometers, so even with a modest number of layers, we could and should represent these processes. 

Another thing: in addition to mass pools, each layer should have some way to indicate phase: sediment, sedimentary, metamorphic, or igneous. For instance, sandstone turns to quartzite under extreme temperature and pressure. Changes such as this could just as well be represented on a phase diagram, much as how we could use a phase diagram to determine the mass of the oceans and atmosphere. However, there is a significant difference here: when water is heated to become a vapor, it can easily return to water when the temperature lowers. However, once a rock undergoes lithification or metamorphosis, it will seldom return to its earlier state. 

Because these processes are irreversible, we cannot naively derive rock type as a pure function of depth. We need to introduce state to solve the problem. 

But consider what happens when we add some trivial flag to indicate metamorphosis. It works well enough if an entire layer is composed of a single material like silica. However, what happens if it's a complex mixture, say, of silica and ice? Ice has a phase diagram that's completely different from silica. Depending on your pressure or temperature, you could have silica embedded in ice IV, or quartzite in ice IV, or silica in regular ice. There's too much complexity here. We can't describe the results with just a simple flag, and even if we did, we wouldn't want to handle the logic that attempts to do so. 

We can, however, store the maximum pressure and temperature that was encountered. For the depths we're concerned with, both pressure and temperature increase monotonically with depth, in a predictable fashion, so there is little risk of developing situations where temperature and pressure have maxed out at separate points in time. 

This still leaves us with the problem of representing sedimentation. As with metamorphosis, sedimentation cannot be reversed by eliminating the conditions that caused it, so we must introduce state to represent it. However, unlike metamorphosis, the degree of sedimentation is fairly consistent across mass pools within a single layer. At the very least, we will assume that is the case. 

So I could see our "Layer" data structure housing the following:
	mass pools
	sediment size
	max pressure received
	max temperature received
	
If sedimentation occurs, sediment size is set to an representative value and max pressure and temperature are reset to surface values. At that point, we no longer care whether the sediment is composed e.g. of quartzite vs sandstone remnants, since surface processes will likely intermix with other sediments of different history.

If lithification occurs, sediment size remains the same but max pressure and max temperature are recorded. Sedimentary rock is distinguished by particle size (e.g. mudstone vs. sandstone) and we want to allow for this distinction, at least conceptually. We may not have the ability right now to model the exact sediment size, but we will at least have some sort of indication that is conceptually sound.

A similar thing happens during metamorphosis. While classifications for metamorphic rock don't typically distinguish by particle size, they do occassionally distinguish metavolcanic from metasedimentary rock. Sediment size could be a useful way to indicate this distinction.

As for igneous rock, there are two major categories that require representation: volcanic (formed from volcanoes) and plutonic (formed from magma seeping into parent rock)

Volcanic igneous rock is easy to represent. When volcanic rock is formed, both sediment size and pressure/temperature extremes are reset. 

When plutonic igneous rock is formed, we must represent that magma has intruded into the cracks of the parent rock. The parent maintains existing sediment size, but the intrusion solidifies to whatever size fills the gaps. Max pressure remains the same, but max temperature will likely change to reflect whatever the liquid intrusion was heated to. The change in max temperature applies to both the intrusion and the parent rock, since the parent rock will likely be exposed to the temperature of the intrusion during formation. We could then represent plutonic igneous rock by leaving sediment size and max pressure, but setting max temperature to the melting point of the rock at ambient pressure. 

One final thing: we do need to concern ourselves with what the representative depth would be for a given layer. Each layer has a variable thickness, so depth could vary considerably across the layer. This in turn means that pressure and temperature could vary considerably. This is especially the case for the bottom-most layer, which is sort of a garbage bin of whatever mass pools were leftover. Fortunately enough, we again reason that users don't care so much what happens at the bottom. We further reiterate that our model does have the potential to generate depths that are sufficient for metamorphosis, so it is likely with adequate parameterization that the bottommost layer will always be at a depth where metamorphosis could occur consistently throughout the layer. 
