var _arrayToB64Uint8 = function(a) {
	var u8 = new UInt8Array(a);
	var str = String.fromCharCode.apply(null, u8);
	var b64 = btoa(encodeURIComponent(str));
	return b64;
};
var _toB64Uint16 = function(a) {
	var u16 = new Uint16Array(a);
	var str = String.fromCharCode.apply(null, u16);
	return btoa(unescape(encodeURIComponent( str )));
};
var _fromB64UInt16 = function(b64) {
	var start = new Date().getTime();
	var str = decodeURIComponent(escape(window.atob( b64 )));
	var chr = new Uint16Array(str.length);
	var end1 = new Date().getTime();
	console.log(end1 - start);
	for (var i = 0, li = str.length; i < li; i++) {
		chr[i] = str.charCodeAt(i);
	};
	var end2 = new Date().getTime();
	console.log(end2 - start);
    return u16;
}

JsonSerializer = {};
JsonSerializer.serialize = function(world) {
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
	};

	for (var i = 0, li = world.plates.length; i < li; i++) {
		plate = world.plates[i]
		var plate_json = {
			eulerPole: 		plate.eulerPole.toArray(),
			angularSpeed: 	plate.angularSpeed,
			densityOffset: 	plate.densityOffset,
			rockColumns: 	{},
			meshMatrix: 	plate.mesh.matrix.toArray()
		};

		var rockColumns = plate_json.rockColumns;
		var cells = plate._cells
			.filter(function(cell) {
				return cell.content;
			});
		rockColumns.ids = _toB64Uint16(
			cells.map(function(cell) {
				return cell.id;
			})
		);
		rockColumns.thicknesses = _toB64Uint16(
			cells.map(function(cell) {
				return cell.content.thickness;
			})
		);
		rockColumns.densities = _toB64Uint16(
			cells.map(function(cell) {
				return cell.content.density;
			})
		);

		world_json.plates.push(plate_json);
	};
	return {
		version: 0,
		seed: seed,
		world: world_json
	};
};
JsonSerializer.deserialize = function(json) {
	var _world = new World({
		radius: json.world.radius,
		platesNum: json.world.platesNum,
		mountainWidth: json.world.mountainWidth,
		age: json.world.age,
		grid: world.grid,					// HACK: shouldn't reference world
		supercontinentCycle: undefined,
		plates: [],
	});

	_world.plates = json.world.plates.map(function(plate_json){
		var plate = new Plate(_world, {
			angularSpeed: plate_json.angularSpeed,
			densityOffset: plate_json.densityOffset
		});

		plate.eulerPole.fromArray(plate_json.eulerPole);

		var plateMatrix = plate.mesh.matrix;
		plateMatrix.fromArray(plate_json.meshMatrix);
		plate.mesh.rotation.setFromRotationMatrix( plateMatrix );
		
		console.log('starting everything')
		var rockColumns_json = plate_json.rockColumns;
		var ids = _fromB64UInt16(rockColumns_json.ids);
		var thicknesses = _fromB64UInt16(rockColumns_json.thicknesses);
		var densities = _fromB64UInt16(rockColumns_json.densities);

		for (var i = 0, li = ids.length; i < li; i++) {
			var rockColumn = new RockColumn(_world, {
				thickness: thicknesses[i],
				density: densities[i]
			});
			rockColumn.isostasy();
			plate._cells[ids[i]].content = rockColumn;
		};
		return plate;
	});
	_world.updateNeighbors();
	_world.updateBorders();
	_world.supercontinentCycle = new SupercontinentCycle(_world, json.world.supercontinentCycle);
	seed = json.seed;
	random = new Random(parseSeed(seed));
	return _world;
}