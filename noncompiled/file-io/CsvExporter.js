var CsvExporter 	= {};

CsvExporter.world = function (world, options) {
	options = options || {};

	// header, containing column names
	var csv_text = [
		'latitude',
		'longitude',
		'elevation',
		'plate',
		'temperature',
		'precipitation'
	].join() + '\n'

	// commented line, containing metadata
	csv_text += '#' + [
		'degrees',
		'degrees',
		'meters',
		'id',
		'celcius',
		'millimeters/year'
	].join() + '\n'

	var grid = world.grid;
	var latitude = Float32SphereRaster.latitude(grid.pos.y, 				Float32Raster(world.grid));
	var longitude = Float32SphereRaster.longitude(grid.pos.x, grid.pos.z, 	Float32Raster(world.grid));
	var elevation = world.hydrosphere.elevation.value();
	var top_plate_map = world.lithosphere.top_plate_map;
	var surface_temp = world.atmosphere.surface_temp;
	var precip = world.atmosphere.precip.value();

	for (var i = 0, li = grid.vertices.length; i < li; i++) {
		csv_text += [
			latitude[i]  * 180/Math.PI,
			longitude[i] * 180/Math.PI,
			elevation[i],
			top_plate_map[i],
			surface_temp[i] - AtmosphereModeling.WATER_FREEZING_POINT_STP,
			precip[i],
		].join() + '\n'
	}

	return csv_text;
}