var JsonSerializer 	= {};
JsonSerializer.world = function (world, options) {
	options = options || {};

	var supercontinentCycle = world.supercontinentCycle;

	var world_json = {
		plates: [],
		grid: undefined,
		supercontinentCycle: {
			duration: supercontinentCycle.duration,
			age: supercontinentCycle.age,
		},
		random: {
			mt: random.mt,
			mti: random.mti
		},
	};

	for (var i = 0, li = world.plates.length; i < li; i++) {
		var plate = world.plates[i];
		var plate_json = JsonSerializer.plate(plate, options);
		world_json.plates.push(plate_json);
	};
	return {
		version: '1.0',
		seed: seed, // TODO: don't use global variable!
		world: world_json
	};
}
JsonSerializer.plate = function (plate, options) {
	options = options || {};
	
	// serialize non-field values to json
	var plate_json = {
		uuid: 					plate.uuid,
		eulerPole: 				plate.eulerPole.toArray(),
		angularSpeed: 			plate.angularSpeed,
		local_to_global_matrix: plate.local_to_global_matrix.toArray(),
	};

	// encode in base64
	plate_json.ids 	= Base64.encode(Uint16Array.from( Float32Raster.get_mask(plate.grid.vertex_ids,	plate.mask) ).buffer);
	plate_json.sima = Base64.encode(Uint16Array.from( Float32Raster.get_mask(plate.sima, 			plate.mask) ).buffer);
	plate_json.sial = Base64.encode(Uint16Array.from( Float32Raster.get_mask(plate.sial, 			plate.mask) ).buffer);
	plate_json.age 	= Base64.encode(Uint16Array.from( Float32Raster.get_mask(plate.age, 			plate.mask) ).buffer);

	return plate_json;
}

var JsonDeserializer = {};
JsonDeserializer.plate = function (plate_json, _world, options) {
	options = options || {};

	var plate = new Plate({
		world: _world,
		angularSpeed: plate_json.angularSpeed,
		uuid: plate_json.uuid,
	});
	plate.eulerPole.fromArray(plate_json.eulerPole);
	plate.local_to_global_matrix.fromArray(plate_json.local_to_global_matrix);

	var file_ids = new Uint16Array(Base64.decode(plate_json.ids));
	Float32Raster.set_ids_to_value	(plate.mask, 	file_ids, 1);
	Float32Raster.set_ids_to_values	(plate.sima, 	file_ids, new Uint16Array(Base64.decode(plate_json.sima)) );
	Float32Raster.set_ids_to_values	(plate.sial, 	file_ids, new Uint16Array(Base64.decode(plate_json.sial)) );
	Float32Raster.set_ids_to_values	(plate.age, 	file_ids, new Uint16Array(Base64.decode(plate_json.age))  );

	return plate;
}
JsonDeserializer.world = function (world_json, options) {
	options = options || {};

	var _world = new World(
	{
		grid: view.grid,
		supercontinentCycle: undefined,
		plates: [],
	});

	for (var i = 0; i < world_json.world.plates.length; i++) {
		var plate_json = world_json.world.plates[i];
		var plate = JsonDeserializer.plate(plate_json, _world, options);
		_world.plates.push(plate);
	};

	_world.supercontinentCycle = new SupercontinentCycle(_world, world_json.world.supercontinentCycle);
	
	seed = world_json.seed;
	random = new Random(parseSeed(seed));

	var random_json = world_json.world.random;
	random.mt  = random_json.mt;
	random.mti  = random_json.mti;

	return _world;
}