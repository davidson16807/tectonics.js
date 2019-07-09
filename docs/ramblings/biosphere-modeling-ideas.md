
starting principles:
* All taxons require a trophic pathway to generate power
* A trophic pathway is characterized by a set of material requirements, a max power output per unit biomass, and a max power output per unit of material
* The power output of a trophic pathway is determined by the law of the minimum
* Autotrophy exists when all requirements for a trophic pathway are provided by the environment. This applies for both phototrophy and chemotrophy. 
* Heterotrophy exists when any requirement for a trophic pathway is fulfilled by consuming other taxons. This applies for both phototrophy and chemotrophy. Light cannot be transferred by consuming organisms, however other requirements can be. 
* Evolution of trophic pathways occur on timescales of a billion years, so pathway evolution does not need to be considered by the model. It could be imposed by the user, or set to some earth-like default.
* Evolution of autotrophic/heterotrophic pathways may occur in shorter timescales, e.g. venus fly traps
* For a taxon to survive at a location, its output power (Pout) must not exceed input power (Pin) times an energy efficiency constant (η). Pout is a taxon-specific constant. η is assumed to be a universal constant, around 10% for autotrophs and 20% for heterotrophs
	Pout < η Pin
* Energy stored in biomass is a percentage of total output energy
* All taxons must be able to disperse spatially over the course of at least several generations.
* Dispersion may occur in three ways:
	* advection		only considered over large spatial scales, can occur through liquid or gas, but probably only liquid should be considered
	* diffusion		considered when advection is over short scales
	* motility 		probably modeled using diffusion (slow) or flood fill (fast)
* There is an evolutionary trade off between energy requirements (Pout) and motile dispersion rate
* An "animal" is defined as an individual belonging to a motile taxon. It is not necessarily an individual belonging to a heterotrophic taxon. This is defined for the sake of brevity.
* The maximum distance an animal travels over time is proportionate to the output power
	Pout ∝ 1/2 m x v² 1/t
	Pout ∝ 1/2 m x (∂x/∂t)² 1/t
	2 Pout 1/m ∝ Δx Δx/Δt² 1/Δt
	2 k Pout 1/m Δt³ = Δx²

	^^^ So Δx increases nonlinearly with timescale? This doesn't seem right
* k appears to be ~1/100,000 based on the sustained walking speed of horse and human

lifecycle:
	energy consumption
	survival
	reproduction/dispersal

human Pin: 100 W
human η: 20%
plant Pin:  ~136 W/m^2, ~10% of the solar constant, reflecting sunlight-to-biomass efficiency of corn (https://en.wikipedia.org/wiki/Photosynthetic_efficiency)
plant Pout: ~6 W/m^2, ~0.5% of the solar constant, reflecting sunlight-to-product efficiency of corn (https://en.wikipedia.org/wiki/Photosynthetic_efficiency)
So ~80m^2 of a crop plant can support 1 human, at absolute minimum. This assumes:
 * all available surface area is consumed by plant yearround, LAI >= 1
 * all material needs for the plant are met
 * plant is grown on the equator
 * plant is grown year round
incident radiation at agricultural latitudes is ~70% of solar constant, so ~120m^2 at our latitudes
Empirically, 5000m^2 of crop plant can support 1 average american, so we're off by a factor of ~40
americans derive 30% of energy from animal products, converted at 20% efficiency
i.e. 30% takes 5 times more land so this inflates by a factor of .7*1 + .3*5 = 2.2
up to 260m^2, off by factor of ~20
grazeland for cattle is much less productive, but can't say by how much

Potential dispersion methods:
	* laplacian diffusion
	* advection
	* flood fill algorithm



You can start to see how this could be lumped together with a generic reaction/diffusion model:
	perform a reaction given a series of reactants and products
		produce production estimates for each reactant, take the minimum 
	simulate transport of products
	simulate mortality, where applicable

e.g. for a plant:
reactants:
	W	water (precip)
	C	co2
	N	nitrogen
	P	phosphorus
	I	insolation
	B	plant biomass
products:
	B	plant biomass
	W	water, (water vapor, transpiration)
	O	oxygen

B'min = min(W/12, C/6, N/1, P/1, I/1, B/1)
∂B/∂t = D∇²B + B'min - H'min/x - MB

where
	M 	mortality	
	D 	diffusion	
	H'min, determined from the H'min term from the growth equation of some herbivore, H:

H'min = min(B/x, ...)
∂H/∂t = D∇²H + H'min - MH

don't forget that mortality, M, should feed back into raw organic matter pools, Oᵢ:
∂Oᵢ/∂t = D∇²Oᵢ + MH + MB + ...
where D=0, i.e. it doesn't move...
unless you came up with some sort of fluid based transport



You could decouple this products/reactants into a series of pathways if you wanted to reach towards a basic model of biochemical evolution:
	photosynthesis
	oxygen metabolism

certain products/reactants can spread in different ways:
	diffusion (most seeds)
	gradient descent for some cost function (most animals over small scales)
	advection (wind or water dispersed seeds)
	species assisted (fruiting plants), probably modeled by 
	flood fill (humans, birds, etc. - very successful species that can occupy an entire region in a single timestep)
	nonspatial pool (well mixed atmospheric gasses within the turbosphere)

but what happens when e.g. two flood fill species each exhaust all available nutrients? How do you represent competition? How do you maintain conservation of mass?
	obvious solutions:
		select one or the other and give them first pick of mass, i.e. "winner take all"
		divide equally according to needs
		what happens with competing chemical reactions? What defines the equilibrium?
			consider two reactions A->B and A->C
			∂A/∂t = -k1 A -k2 A
			∂B/∂t = k1 A
			∂C/∂t = k2 A
			A(t) = A0 exp(-(k1+k2)t) from integration
			so...
			∂B/∂t = k1 A0 exp(-(k1+k2)t) from substitution
			∂C/∂t = k2 A0 exp(-(k1+k2)t) from substitution

			adapting this to our model, lets say our plant from earlier, B, has a competitor, C, and they feed on resource A:
			∂B/∂t = D∇²B + B'min - H'min/x - MB
			B'min = min( A/k1, D/k3, ...)
			∂A/∂t = -k1 B'min -k2 C'min

			if B is constrained by A, then B'min = 1/k1 A, and...
			A(t) = A0 exp(-t) from integration 
			and 
			B'min = 1/k1 A0 exp(-t)

			if B is constrained by D, then B'min = 1/k3 D, and...
			A(t) = -1/k3 D t from integration 

			so it doesn't adapt well
			our model as it stands only works in absence of resource limited competition
			can't be governed by law of the minimum 
			both species are going to take as much as they can as a matter of survival
			doesn't matter how much they need, since in the extreme case humans can rob all of the resources from a land for trivial reasons, even if that resource is very important to another species. Case in point: passenger pigeons, a very important resource in pre-1800 midwest prarie ecosystem, and one time source of cheap fancy hats
			so it all comes down to how well they exploit resources
			i.e. competitive exclusion principle
			biggest indicator of ability to exploit resources is position on trophic pyramid: herbivores exploit better than plants, preditors better than herbivores, etc.
			second indicator probably 





You could use this to simulate nonbiological things, too, e.g.:
reactants:
	C 	carbonic acid
	M 	metal
products:
	X 	carbonate mineral

X'min = min(C/1, M/1)
∂X/∂t = D∇²H + X'min - MH
where M = 0
D may also be 0, depending on whether it transports

