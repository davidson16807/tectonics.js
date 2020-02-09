
How should we represent changes in phase and material? 

The solution we've used in the past is to implement them in a proscribed order:

	atmosphere	gaseous		
	icecap		solid		water
	ocean		liquid		water
	crust		solid		silicate
	mantle		liquid		silicate
	core		solid		iron, nickel

Any one of these components can be taken away from the world and still leave a state that is valid, 
at least as far as the simulation is concerned.

But let's think about this last point. 
Do these components really make sense in every combination?

There are 2^6 = 64 possible combinations we can create from these components.
I will list these below. Try to visualize what each world would look like.

atmosphere	icecap		ocean		crust		mantle		core		earthlike
			icecap		ocean		crust		mantle		core		europa with a mantle of magma
atmosphere				ocean		crust		mantle		core		balmy earthlike
						ocean		crust		mantle		core		not possible, ocean would outgas
atmosphere	icecap					crust		mantle		core		mars
			icecap					crust		mantle		core		enceladus
atmosphere							crust		mantle		core		venus, partial lava world
									crust		mantle		core		mercury
atmosphere	icecap		ocean					mantle		core		not possible, ocean would boil or mantle would solidify
			icecap		ocean					mantle		core		not possible, ocean would boil or mantle would solidify
atmosphere				ocean					mantle		core		not possible, ocean would boil or mantle would solidify
						ocean					mantle		core		not possible, ocean would boil or mantle would solidify
atmosphere	icecap								mantle		core		not possible, icecap would melt or mantle would solidify
			icecap								mantle		core		not possible, icecap would melt or mantle would solidify
atmosphere										mantle		core		lava world
												mantle		core		not possible, lava ocean would cool or outgas
atmosphere	icecap		ocean		crust					core		not possible, crust and core are essential the same
			icecap		ocean		crust					core		not possible, crust and core are essential the same
atmosphere				ocean		crust					core		not possible, crust and core are essential the same
						ocean		crust					core		not possible, ocean would outgas
atmosphere	icecap					crust					core		not possible, crust and core are essential the same
			icecap					crust					core		not possible, crust and core are essential the same
atmosphere							crust					core		not possible, crust and core are essential the same
									crust					core		not possible, crust and core are essential the same
atmosphere	icecap		ocean								core		titan
			icecap		ocean								core		europa
atmosphere				ocean								core		
						ocean								core		not possible, ocean would outgas
atmosphere	icecap											core		
			icecap											core		ceres
atmosphere													core		
															core		asteroid

We will ignore those possibilities that involve a missing core.
This is because this scenario is highly unlikely.
A rocky core is essential to begin planet formation,
and once a planet becomes big enough to generate a liquid mantle,
there will very likely be some sort of heavy metal component under high pressure
that will resist melting.
So really, it's more like 2^5 = 32 possible combinations. 

Of the 32 remaining combinations however, 
there are still several states which are highly unlikely.
These occur along boundaries where dramatic temperature differences would necessarily exist,
both including phase change boundaries (e.g. icecaps floating in a magma ocean)
and material boundaries (e.g. oceans giving way to magma)

While it is not strictly impossible for any of these states to exist,
to consider them would be much like considering a moon made out of cheese:
you could definitely could simulate it, but the simulation would rapidly evolve until
you reach a state where you no longer have the state you were considering.
So I suppose in looking for an answer, 
we are really seeking a way to represent planets over long time periods. 

I would like to say we are seeking a way to represent planets in a steady state,
however that is not really the case.
There are many real examples that mirror the scenarios above that will not persist indefinitely. 
The earth will for instance eventually loose its liquid mantle to cooling,
not in the immediate future, but at some point.

This observation makes me realize it is best to model the way in which the planet evolves,
so that it becomes immaterial to this discussion whether any of the circumstances above could occur over long time periods. 
We are free to design a model in which such states occur, 
since if such a state is reached, the system will simply evolve itself out of that state. 

That simplifies our problem, but it does not solve it. 

Let's look again at our list of components and see if they are scalar or raster:

The atmosphere most definitely can be represented using scalars. 
It mixes too fast to be represented by rasters over long timescales,
and over short timescales, we do not care to model the mixing.

Icecaps most definitely need to be represented using rasters,
since their coverage varies spatially.
Even on planets where ice completely covers the surface, 
we can still use rasters to represent their thicknesses. 

For our concerns, the state of an ocean can be completely described by its mass.
We simply assume that over long enough timescales,
water will pool in whatever way is necessary to create a global sealevel,
and over short timescales, we do not care to model the pooling process. 
However, we can use rasters to store derived attributes, such as ocean depth. 

Crust behaves very similarly to icecaps, so much that we find we're repeating ourselves.
There are situations where its coverage varies spatially, 
as we see with hypothetical lava worlds,
and these require using rasters.
In regular circumstances where crust completely covers the surface, 
we use the same rasters to represent thickness.

There are some phenomenon we start to note when we consider crust,
and these phenomenon inform us of processes that likely also occur with ice.
For instance, we know isostatic displacement affects both crust and ice. 
Plate tectonics may also occur in some cryogenic form, 
as we see postulated for the dwarf planet, Pluto.

Likewise, mantles likely can be represented in the same way as oceans.
Their state is completely described by their mass, 
and that mass pools would around any imperfections in the core, were they to exist. 
We could use rasters to represent their depth, 
but if we do it will only be to achieve behavioral symmetry with oceans.

Finally, the core is always assumed to exist. 
We don't really care about it spatially for large planets, 
but that is not the case on small planets that feature huge surface imperfections.

