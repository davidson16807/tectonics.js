var CsvExporter 	= {};

CsvExporter.world = function (world, options) {
	options = options || {};

	// header, containing column names
	var csv_text = [
		'latitude',
		'longitude',
		'elevation',
		'plate',
	].join() + '\n'

	// commented line, containing metadata
	csv_text += '#' + [
		'degrees',
		'degrees',
		'meters',
		'id',
	].join() + '\n'

	var grid = world.grid;
	var latitude = Float32SphereRaster.latitude(grid.pos.y);
	var longitude = Float32SphereRaster.longitude(grid.pos.x, grid.pos.z);

	for (var i = 0, li = grid.vertices.length; i < li; i++) {
		csv_text += [
			latitude[i]  * 180/Math.PI,
			longitude[i] * 180/Math.PI,
			world.lithosphere.displacement[i] - world.hydrosphere.sealevel,
			world.lithosphere.top_plate_map[i],
			// TODO: add precip, temperature, and npp
		].join() + '\n'
	}

	return csv_text;
}