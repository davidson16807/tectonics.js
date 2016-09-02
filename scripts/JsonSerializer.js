function _abTostr(buf) {
  return String.fromCharCode.apply(null, new Uint16Array(buf));
}

function _strToab(str) {
  var buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  var bufView = new Uint16Array(buf);
  for (var i=0, strLen=str.length; i<strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}



var JsonSerializer 	= {};
JsonSerializer.world = function (world, options) {
	options = options || {};
	var base64 = options.base64 || true;

	var supercontinentCycle = world.supercontinentCycle;

	var world_json = {
		radius: world.radius,
		platesNum: world.platesNum,
		mountainWidth: world.mountainWidth,
		age: world.age,
		plates: [],
		grid: undefined,
		supercontinentCycle: {
			duration: supercontinentCycle.duration,
			age: supercontinentCycle.age,
			oldSupercontinentPos: supercontinentCycle.oldSupercontinentPos,
			newSupercontinentPos: supercontinentCycle.newSupercontinentPos,
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
		version: 0,
		seed: seed,
		world: world_json
	};
}
JsonSerializer.plate = function (plate, options) {
	options = options || {};
	var base64 = options.base64 || true;
	
	var plate_json = {
		eulerPole: 		plate.eulerPole.toArray(),
		angularSpeed: 	plate.angularSpeed,
		densityOffset: 	plate.densityOffset,
		rockColumns: 	{},
		matrix: 		plate.matrix.toArray(),
	};

	var grid = plate.grid;

	var ids_unfiltered = grid.vertex_ids;
	var thicknesses_unfiltered = plate.thickness;
	var densities_unfiltered = plate.density;
	var age_unfiltered = plate.age;
	var is_member = plate.is_member;

	var ids_array 		= [];
	var thicknesses_array= [];
	var densities_array = [];
	var age_array 		= [];
	var id;
	for (var i = 0; i < ids_unfiltered.length; i++) {
		if (is_member[i] > 0) {
			ids_array.push			( ids_unfiltered[i] );
			thicknesses_array.push	( thicknesses_unfiltered[i] );
			densities_array.push	( densities_unfiltered[i] );
			age_array.push			( age_unfiltered[i] );
		};
	};

	var ids = 			new Uint16Array(ids_array.length);
	var thicknesses = 	new Uint16Array(ids_array.length);
	var densities = 	new Uint16Array(ids_array.length);
	var age = 			new Uint16Array(ids_array.length);
	for (var i = 0; i < ids_array.length; i++) {
		ids[i] 			= ids_array[i];
		thicknesses[i] 	= thicknesses_array[i];
		densities[i] 	= densities_array[i];
		age[i] 			= age_array[i];
	};

	// var encode = options.base64? Base64.encode : _abTostr;
	plate_json.rockColumns = {
		ids: 			Base64.encode(ids.buffer),
		thicknesses: 	Base64.encode(thicknesses.buffer),
		densities: 		Base64.encode(densities.buffer),
		ages: 			Base64.encode(age.buffer),
	};

	return plate_json;
}

var JsonDeserializer = {};
JsonDeserializer.plate = function (plate_json, _world, options) {
	options = options || {};
	base64 = options.base64 || true;

	var plate = new Plate(_world, {
		angularSpeed: plate_json.angularSpeed,
		densityOffset: plate_json.densityOffset,
		uuid: plate_json.uuid,
	});
	plate.eulerPole.fromArray(plate_json.eulerPole);

	var plateMatrix = plate.matrix;
	plateMatrix.fromArray(plate_json.matrix);

	var rockColumns_json = plate_json.rockColumns;
	
	// var decode = options.base64? Base64.decode : _strToab;

	var file_ids 		= 	new Uint16Array(Base64.decode(rockColumns_json.ids));
	var file_thickness  = 	new Uint16Array(Base64.decode(rockColumns_json.thicknesses));
	var file_density 	= 	new Uint16Array(Base64.decode(rockColumns_json.densities));
	var file_age 		=	new Uint16Array(Base64.decode(rockColumns_json.ages));

	var thickness = plate.thickness;
	var density = plate.density;
	var age = plate.age;
	var is_member = plate.is_member;
	var file_id;
	for (var i = 0, li = file_ids.length; i < li; i++) {
		file_id = file_ids[i];
		is_member[file_id]  = 1;
		thickness[file_id] 	= file_thickness[i];
		density[file_id] 	= file_density[i];
		age[file_id] 		= file_age[i];
	};
	return plate;
}
JsonDeserializer.world = function (world_json, options) {
	options = options || {};
	var base64 = options.base64 || true;

	var _world = new World(view.grid,
	{
		radius: world_json.world.radius,
		platesNum: world_json.world.platesNum,
		mountainWidth: world_json.world.mountainWidth,
		age: world_json.world.age,
		supercontinentCycle: undefined,
		plates: [],
	});

	for (var i = 0; i < world_json.world.plates.length; i++) {
		var plate_json = world_json.world.plates[i];
		var plate = JsonDeserializer.plate(plate_json, _world, options);
		_world.plates.push(plate);
	};

	_world.updateNeighbors();
	_world.updateBorders();
	_world.supercontinentCycle = new SupercontinentCycle(_world, world_json.world.supercontinentCycle);
	
	seed = world_json.seed;
	random = new Random(parseSeed(seed));

	var random_json = world_json.world.random;
	random.mt  = random_json.mt;
	random.mti  = random_json.mti;

	return _world;
}
