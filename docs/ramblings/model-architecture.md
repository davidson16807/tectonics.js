The problem we want to address is this:
We have several entities that may each interact with one another.
For any length of timestep, given the present state of each entity, we must be able to calculate the future state of each entity.
Please note: when we say "any length of timestep", we really mean it.
Our timestep can be anything from a fraction of a second to several million years,
Our modeling approach is definitely going to change based upon the length of this timestep.
For short timesteps we are likely to use numerical integration.
For long timesteps we may use steady state assumptions, statistical mechanics, or even outright guesswork. 

Let's consider an example:
We have a set of particles that interact with each other via forces. 
For short timesteps we can use numerical integration. Our main loop looks like this:

 get_delta (particle1, particle2, ... particleN, timestep) => particle1_delta
 add_delta (particle1, particle1_delta)                    => particle1_result

Under certain circumstances we may be allowed to decompose delta calculation into contributions, 
For particles, these might represent the accelaration by gravity or drag.
For mass pools, these might represent fluxes between pools such as precipitation or evaporation.
We will call these contributions "fluxes", for brevity.
Tracking fluxes has an added benefit that lets us observe individual contributions that might be meaningful to the user:
 get_flux  (particle1, particle2, timestep)   => particle1_flux1 
 get_flux  (particle1, particle3, timestep)   => particle1_flux2 
 add_flux  (particle1_flux1, particle1_flux2) => particle1_delta
 add_delta (particle1, particle1_delta)       => particle1_result

Using deltas and fluxes have several advantanges: 
 * we can add deltas together to check whether the model obeys conservation laws
 * we can sometimes compare deltas easily to real world measurements to check model accuracy
 * we can sometimes show deltas to the user, if they happen to find them useful to look at

However if our timestep is large enough, we may no longer be able to use numerical integration.
Instead, there might be some other equation that governs position or velocity.
For instance, if were modeling orbital mechanics, then over long time periods we might use equations from the two body problem.
If we were modeling a particle falling to earth, then over a sufficiently long timestep we might use the terminal velocity equation.
Under these circumstances, it will no longer make sense to calculate deltas.
So we need a more generic method signature.
This method signature would not make use of deltas as input.
However, it would still be free of side-effects, as demonstrated in the implementation above.
So let's try generalizing our main loop a bit:

 update   (particle1, particle2, ... particleN, timestep) => particle1_result

There are still instances where the user would like to see contributions or deltas.
However, there are still a number of ways to accomodate for this.
We could for instance calculate deltas upon request within a memo object:

 update   (particle1, particle2, ... particleN, timestep) => particle1_result
 get_memos (particle1)    => particle1_memos
 particle1_memos.delta1() => particle1_delta

However, if the delta takes a long time to calculate, it would be very inefficient.
We would unnecessarily repeat our calculations. 

We could return deltas or fluxes as an output of our update function:

 update   (particle1, particle2, ... particleN, timestep) => particle1_result, particle1_flux1, particle2_flux2

If deltas/fluxes are already being calculated, then no extra work is needed.
However if deltas/fluxes would not otherwise be calculated, they must now be calculated.
So there is a performance penalty.
If the delta takes a long time to calculate, it would be very inefficient in the latter case.

We could calculate deltas by taking the difference of present and future state.
This has only a minor performance penalty, however it forbids us from determining individual fluxes.
Individual fluxes would then have to be calculated separately using memos, with performance penalties similar to the ones above.

 update    (particle1, particle2, ... particleN, timestep) => particle1_result
 sub       (particle1_result, particle2, ... particleN, timestep) => particle1_delta
 add_delta (particle1, particle1_delta)                    => particle1_result

No, perhaps we ought to grant our update function access to any memo object that might be needed to calculate its result.
This way, we have a place to store the delta in case it is calculated during the update function.
If it is calculated during the update function, then no extra time is spent recalculating it.
If it is not calculated during the update function, then we only perform the calculation when it is requested by the user.

 update (particle1, particle2, ... particleN, particle1_memo, timestep) => particle1_result
 particle1_memos.flux1() => particle1_flux

This may be unecessarily verbose, but there is nothing stopping us from treating the memo as a complete facade for a particle

 update (particle1_memo, particle2_memo, ... particleN_memo, timestep) => particle1_result

Where attributes of the particle could just as well be accessed through the memo. In other words:
 
 particle1_memo.position() == particle1.position

This merely defers verbosity to the get_memos() function: 
Instead of including two variables per particle within the update function method signature,
we would instead include N variables within the particle memo implementation 
where N is the number of attributes within particles. 

At this point our architecture is becoming sufficiently obscure that we should probably no longer pursue further improvement.
It seems there are diminishing returns when designing software architectures.
There is a mounting trade off in terms of user comprehension.

Now let's turn to our motivating example.
Instead of particles we now have subcomponents that contribute to the behavior of a terrestrial planet:
 * biosphere
 * atmosphere
 * hydrosphere
 * lithosphere
 * universe

Each has its own state variables. Here are some examples. 
Please note state variables should always be tracked as mass to allow easy transfer between pools
 * biosphere:   plant_carbon_mass
 * atmosphere:  co2_mass, h2o_mass
 * hydrosphere: h2o_mass
 * lithosphere: carbonate_mass, h2o_mass

Each subcomponent has its own flux variables, which are again mass variables where applicable. Here are some examples. 
 * biosphere:   plant_carbon_net_productivity
 * atmosphere:  h2o_precipitation, h2o_evaporation
 * hydrosphere: idunno
 * lithosphere: carbonate_mass, h2o_mass

Many of these fluxes depend on states from within other subcomponents.
For instance, "plant_carbon_net_productivity" depends on insolation and atmospheric co2, 
so it relies on the biosphere, atmosphere, and universe subcomponents as dependencies.

Now, according to the architecture we've outlined above, fluxes should be stored within memos.
The get_memos() function that is used to generate these memos should therefore accept all dependencies as input.

 Biosphere.get_memos(biosphere, atmosphere, universe) => biosphere_memos
 biosphere_memos.plant_carbon_net_productivity() => npp

This is unfortunate, but let's remember two things:
 * We have achieved designing a performant stateless function. 
   It works in the general case without introducing significant mental overhead. 
   This is a huge win.
 * Subcomponents (atmosphere, hydrosphere, etc.) in the real world are tightly coupled. 
   Attributes are often derived from several other subcomponents. 
   There is often no clear distinction which subcomponent an attribute belongs to. 
   So subcomponents can be thought more as arbitrary boundaries that help organize code,
   rather than proper objects that need strict encapsulation.
