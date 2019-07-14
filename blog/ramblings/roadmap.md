Entity-Component-System Roadmap

Components
x	Body
x	Star
x	World
	Surface
	PlateTectonics
	Interior
	Ocean
	Icecap
	Atmosphere
	Biosphere
	Spins?
	Orbits?
	Phases?
	StarView
	WorldView

Systems: (in order of application)
	TidalForcing:
		for ocean:
		for surface:
		for spin:
	PlateTectonics: 
		for plate_tectonics:
			if surface: 
				// merge surface deltas back into plates
				// update surface from plates
	AsteroidImpact: 
		for surface: 
	HotspotVolcanism:
		for surface:
	WindErosion:
		for atmosphere:
			if surface:
	WaterErosion:
		for ocean:
			if surface:
	Metamorphosis:
		for surface:
			if ocean: 
			if icecaps:
	Climate:
		for atmosphere:
	Oxidation:
		for surface: 
			if atmosphere:
		for atmosphere:
			if not surface:
	PlantLife:
		for plant_population: 
			if atmosphere and surface and ocean: 
			else: // kill off everything
	AnimalLife:
		for animal_population:
			if plant_population and atmosphere and surface:
		
	View:
		for star: 
			if bodies:
		for surface: 
			if atmosphere:
		for atmosphere:
			if not surface:

