var JsonSerializer 	= {};
JsonSerializer.model = function (model, options) {
	options = options || {};
	var _seed = options['seed'] || '';
	var _random = options['random'] || new Random(parseSeed(_seed));

	var world_json = JsonSerializer.world(model._world, options);

	var model_json = {
		version: '2.0',
		random: {
		    seed: _seed,
			mt: _random.mt,
			mti: _random.mti
		},
		age: model.age,
		world: world_json,
	};

	return model_json;
}
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
	};

	for (var i = 0, li = world.plates.length; i < li; i++) {
		var plate = world.plates[i];
		var plate_json = JsonSerializer.plate(plate, options);
		world_json.plates.push(plate_json);
	};
	return world_json;
}
JsonSerializer.plate = function (plate, options) {
	options = options || {};
	
	// serialize non-field values to json
	var plate_json = {
		eulerPole: 				plate.eulerPole,
		angularSpeed: 			plate.angularSpeed,
		local_to_global_matrix: plate.local_to_global_matrix,
	};

	// encode in base64
	plate_json.ids 	= Base64.encode(Uint16Array.from( Uint16Raster .get_mask(plate.grid.vertex_ids,	plate.mask) ).buffer);
	plate_json.sima = Base64.encode(                  Float32Raster.get_mask(plate.sima,            plate.mask)  .buffer);
	plate_json.sial = Base64.encode(                  Float32Raster.get_mask(plate.sial,            plate.mask)  .buffer);
	plate_json.age 	= Base64.encode(                  Float32Raster.get_mask(plate.age,             plate.mask)  .buffer);

	return plate_json;
}

var JsonDeserializer = {};
JsonDeserializer.plate = function (plate_json, _world, options) {
	options = options || {};

	var plate = new Plate({
		world: _world,
		angularSpeed: plate_json.angularSpeed,
		eulerPole: plate_json.eulerPole,
		local_to_global_matrix: plate_json.local_to_global_matrix,
	});

	var file_ids = new Uint16Array(Base64.decode(plate_json.ids));
	Uint8Raster.set_ids_to_value	(plate.mask, 	file_ids, 1);
	Float32Raster.set_ids_to_values	(plate.sima, 	file_ids, new Float32Array(Base64.decode(plate_json.sima)) );
	Float32Raster.set_ids_to_values	(plate.sial, 	file_ids, new Float32Array(Base64.decode(plate_json.sial)) );
	Float32Raster.set_ids_to_values	(plate.age, 	file_ids, new Float32Array(Base64.decode(plate_json.age))  );

	return plate;
}
JsonDeserializer.world = function (world_json, grid, options) {
	options = options || {};

	var _world = new World(
	{
		grid: grid,
		supercontinentCycle: undefined,
		plates: [],
	});

	for (var i = 0; i < world_json.plates.length; i++) {
		var plate_json = world_json.plates[i];
		var plate = JsonDeserializer.plate(plate_json, _world, options);
		_world.plates.push(plate);
	};

	_world.supercontinentCycle = new SupercontinentCycle(_world, world_json.supercontinentCycle);

	return _world;
}
JsonDeserializer.model = function (model_json, grid, options) {
	options = options || {};

	var _model = new Model();
	_model._world = JsonDeserializer.world(model_json.world, grid, options);
	_model.age = model_json.age;

	var _seed = model_json.random.seed;
	var _random = new Random(parseSeed(seed));
	_random.mt  = model_json.random.mt;
	_random.mti  = model_json.random.mti;
	return {
		model: _model,
		seed: _seed,
		random: _random
	};
}