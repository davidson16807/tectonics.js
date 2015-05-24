JsonSerializer = {};
JsonSerializer.serialize = function(world) {
	var supercontinentCycle = world.supercontinentCycle;

	var world_json = {
		radius: world.radius,
		platesNum: world.platesNum,
		mountainWidth: world.mountainWidth,
		age: world.age,
		grid: undefined,
		supercontinentCycle: {
			duration: supercontinentCycle.duration,
			age: supercontinentCycle.age,
			oldSupercontinentPos: supercontinentCycle.oldSupercontinentPos,
			newSupercontinentPos: supercontinentCycle.newSupercontinentPos,
		},
		plates: [],
	};

	for (var i = 0, li = world.plates.length; i < li; i++) {
		plate = world.plates[i]
		var plate_json = {
			eulerPole:      plate.eulerPole.toArray(),
			angularSpeed:   plate.angularSpeed,
			densityOffset:  plate.densityOffset,
			meshMatrix:     plate.mesh.matrix.toArray(),
			rockColumns:    {}
		};
		for (var j = 0, lj = plate._cells.length; j < lj; j++) {
			var cell = plate._cells[j];
			if(!cell.content){
				continue;
			}
			var rockColumn = cell.content;
                        plate_json.rockColumns[j] =
			[
				Math.round(rockColumn.thickness),
				Math.round(rockColumn.density),
			]
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
		
		//for now it doesn't deal with empty rockColumns so there is no size change
                for (var key in plate_json.rockColumns){
                  if (plate_json.rockColumns.hasOwnProperty(key)) {
                    plate._cells[parseInt(key)].content = new RockColumn(_world, {
                      thickness: plate_json.rockColumns[key][0],
                      density:   plate_json.rockColumns[key][1]
                    });
                  }
                }
                /* var rockColumn = new RockColumn(_world, {
                *          thickness: plate_json.defaultThickness,
                *          density:   plate_json.defaultDensity
                *  });
                */ // haven't add this to serialize yet
		return plate;
	});
	_world.updateNeighbors();
	_world.updateBorders();
	_world.supercontinentCycle = new SupercontinentCycle(_world, json.world.supercontinentCycle);
	seed = json.seed;
	random = new Random(parseSeed(seed));
	return _world;
}
