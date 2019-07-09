
We need some way to represent how light of different wavelengths propogates through the atmosphere. 
We need to do this in order to model the greenhouse gas effect, among other things. 

Let's describe the greenhouse gas effect: 
Visible light comes in from the sun, 
it gets radiated back out as infrared, 
then gets absorbed by greenhouse gases. 

Greenhouse gases transmit visible light but block infrared, 
so infrared gets absorbed as heat. 

So it appears we need some way to represent the intensity of light at different wavelengths.
To do this, we create two data structures.
One is composed of scalars (let's call it "SpectrumProfile"), 
and the other is composed of rasters (let's call it "SpectrumRaster"),
much in the same way that RockColumn and Crust are scalar and raster representations for components of earths crust. 

We observe we only need to represent a limited range of the spectrum. 
We don't need to represent microwaves or x-rays, for instance.
As we see from sites like [this](https://www.omnicalculator.com/physics/wiens-law),
If the peak wavelength of a celestial body is longer than infrared, it is likely too dim to account for.
For instance, I have never heard of a GCM accounting for the cosmic microwave background radiation, 
yet the CMB only broadcasts on the threshold of infrared and microwave (3K, 1mm).
Likewise, the hottest stars broadcast at a peak that is well within the ultraviolet range (40000K, 72nm). 

Other effects like stellar flares might complicate things. 
For instance, we do not know whether [Proxima b](https://en.wikipedia.org/wiki/Proxima_Centauri_b) 
has an atmosphere, because it would likely be blasted by ionizing radiation during stellar flares.
However we do not yet have a way to model planetary outgassing anyways,
so we should only consider this wavelength once we can fully model its effects.
If we do need to model x-rays in the future, it should be trivial to add a new attribute to these data structures.

It's clear to see we only need to represent the spectrum between ultraviolet and infrared.
However it's less clear what the resolution should be. 
It's at least clear that we probably do not need to represent individual color channels, 
like red, green, and blue, because I am not aware of any thermodynamic phenomenon 
that concerns itself with the selective propagation of red light vs blue light. 
It is true these color channels will become extremely important when we want to render a world using a graphics shader,
but this is a completely different implementation that's written in a completely different language.

However we do at least need to capture the distinction between visible and infrared light,
since that is required by our motivating example.
We will suffice for now to represent ultraviolet, visible, and infrared light as separate channels. 

So that leaves our implementation as follows:

  SpectrumProfile: 
      double ultraviolet
      double visible
      double infrared
  
  SpectrumRaster:   
      raster ultraviolet
      raster visible
      raster infrared

Now, when we take another look at our greenhouse gas example,
the second thing we notice is that light propagates in different ways for different materials.
It is transmitted by the atmosphere, 
reflected or reemitted by the surface, 
and absorbed by the greenhouse gas.
We must represent the quantities of light that undergo these processes, 
and ideally we should do it for all of the materials that are worth accounting for.

So what quantities should we represent? I can think of the following:
      reception         the amount that interacts with a material
      reflection        the amount that is reflected immediately
      absorption        the amount that is absorbed as heat
      emission          the amount that is emitted when the material gets hot
      transmission      the amount that passes through the 

And what materials should we represent? For a first pass, I suggest we limit ourself to the air and the surface.
Later on, we can represent other materials like clouds, once we have enough code to represent those materials.

In order to represent the greenhouse gas effect, we need to represent both incoming and outgoing light. 
Incoming light interacts with the air and the surface.
Outgoing light only interacts with the air.
That leaves us with the following quantities:

    intensity_of_incoming_light_received_by_air
    intensity_of_incoming_light_reflected_by_air
    intensity_of_incoming_light_absorbed_by_air
    //intensity_of_incoming_light_emitted_by_air
    intensity_of_incoming_light_transmitted_by_air

    intensity_of_incoming_light_received_by_surface
    intensity_of_incoming_light_reflected_by_surface
    intensity_of_incoming_light_absorbed_by_surface
    intensity_of_incoming_light_emitted_by_surface
    //intensity_of_incoming_light_transmitted_by_surface

    intensity_of_outgoing_light_received_by_surface
    intensity_of_outgoing_light_reflected_by_surface
    intensity_of_outgoing_light_absorbed_by_surface
    intensity_of_outgoing_light_emitted_by_surface
    //intensity_of_outgoing_light_transmitted_by_surface

    intensity_of_outgoing_light_received_by_air
    intensity_of_outgoing_light_reflected_by_air
    intensity_of_outgoing_light_absorbed_by_air
    //intensity_of_outgoing_light_emitted_by_air
    intensity_of_outgoing_light_transmitted_by_air
 
We comment out the rasters that are likely not relevant in the general case
(e.g. we will never need to model a planet that is completely transparent,
so we do not have to track intensity_of_incoming_light_transmitted_by_surface)

If we only want to represent the greenhouse gas effect on earth, we only need the following Float32Rasters:

    intensity_of_incoming_visible_light_received_by_surface 
    intensity_of_incoming_visible_light_absorbed_by_surface
    intensity_of_incoming_visible_light_emitted_by_surface
    intensity_of_outgoing_infrared_light_transmitted_by_air

And "intensity_of_incoming_visible_light_received_by_surface" is equivalent to the output from Universe.average_insolation()
This representation assumes that surface air temperature will equilibrate to whatever is the temperature of the surface proper 
This is all we need for our first pass. 

If we model climate using a steady state assumption, 
such as if our timestep is very large,
then we assume intensity_of_incoming_visible_light_absorbed_by_surface equals
intensity_of_outgoing_infrared_light_transmitted_by_air. 

The order of calculation is as follows:

    intensity_of_incoming_visible_light_received_by_surface 
    intensity_of_incoming_visible_light_absorbed_by_surface
    intensity_of_incoming_visible_light_emitted_by_surface

However, if we model climate using numerical integration,
the order is as follows:

    intensity_of_incoming_visible_light_received_by_surface 
    intensity_of_incoming_visible_light_absorbed_by_surface
    intensity_of_incoming_visible_light_emitted_by_surface
    intensity_of_outgoing_infrared_light_transmitted_by_air

This has implications for our architecture.
See more information about this in model-architecture.md

Now let's discuss our second pass.
In our second pass, we want to model 
Let's introduce an additional datastructure,
to represent the way light from a certain source propogates within a material:

  LightInteractionRaster:
      SpectralRaster received
      SpectralRaster reflected
      SpectralRaster absorbed
      SpectralRaster emitted
      SpectralRaster transmitted

If needed in the future, we can add an additional "LightInteractionProfile"
that operates analogously to "SpectrumProfile" or "RockColumn".
But this won't be needed for our discussion here.

So all told, we need the following LightInteractionRasters:
      
      incoming_light_interaction_with_air
      incoming_light_interaction_with_surface
      outgoing_light_interaction_with_surface
      outgoing_light_interaction_with_air

And if we account for clouds, we will expand this list to the following:

      incoming_light_interaction_with_air
      incoming_light_interaction_with_clouds
      incoming_light_interaction_with_surface
      outgoing_light_interaction_with_clouds
      outgoing_light_interaction_with_air

However this will not occur within our first pass, nor second.
For our first pass, we will limit ourselves to 4 LightInteractionRasters, 
each with 5 SpectralRasters containing 3 Float32Rasters. 
60 rasters total.
At 10k cells per raster, that's ~2MB, so our implementation should not be constrained by memory.
I suspect it should not be constrained by runtime, either, 
since these rasters are strictly computed using in-order memory access
(see "performance-considerations.md" for an explanation of this concept). 