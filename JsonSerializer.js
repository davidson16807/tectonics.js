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
			rockColumns: 	[],
			meshMatrix: 	plate.mesh.matrix.toArray()
		};
		console.log(plate_json.eulerPole);
		for (var j = 0, lj = plate._cells.length; j < lj; j++) {
			var cell = plate._cells[j];
			if(!cell.content){
				continue;
			}
			var rockColumn = cell.content;
			var rockColumn_json = 
			[
				j,
				Math.round(rockColumn.thickness),
				Math.round(rockColumn.density),
			]
			plate_json.rockColumns.push(rockColumn_json);
			// plate_json.rockColumns.push.apply(plate_json.rockColumns, rockColumn_json);
		};
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
		
		console.log(plate_json.eulerPole);
		for (var i = 0, li = plate_json.rockColumns.length; i < li; i++) {
			var rockColumn_json = plate_json.rockColumns[i];
			var rockColumn = new RockColumn(_world, {
				thickness: rockColumn_json[1],
				density: rockColumn_json[2]
			});
			rockColumn.isostasy();
			plate._cells[rockColumn_json[0]].content = rockColumn;
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