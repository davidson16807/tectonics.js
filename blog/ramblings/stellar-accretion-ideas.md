
IDEA:

start with distribution function, probably a Boltzmann distribution, representing properties of solar nebula:
composition
partial pressure of vapor
temperature (absent of sun)
use stoichiometry to calculate amount of common protoplanetary molecules: h20, nh3, h2s, co2, ch4.
find condensation lines for each protoplanetary molecule and each timestep
	this indicates where accretion of these molecules can occur, i.e. where they can become trapped together without concern for escape velocity

randomly sample points of equal mass from mass distribution function - these are planetoids

for each timestep:
	find luminosity of star
	for each planetoid:
		find hill radii
		find escape velocity
		find temperature 
		calculate tidal drag
		for every other planetoid:
			if two planetoids lie in each others hill radius:
				merge planetoids
		for each type of simple molecule:
			if planetoid lies past condensation point:
				accrete all molecular mass of hill radii onto planetoid
			else:
				find amount of gas within a hill radii that does not exceed escape velocity of planetoid

sample temperature across hill radius 

find hill radii of each planetoid
find escape velocity for each planetoid
if point falls within hill radii of a planetoid
where points occur within a number of hill radii from each other, merge planetoids together

for each timestep:
	what is the amount 