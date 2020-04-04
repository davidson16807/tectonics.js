const CsvExporter     = {};

CsvExporter.world = function (world, options) {
    options = options || {};

    // header, containing column names
    let csv_text = [
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

	const grid = world.grid;
	const latitude = SphericalGeometry.get_latitudes(grid.pos.y, Float32Raster(world.grid));
	const longitude = SphericalGeometry.get_longitudes(grid.pos.x, grid.pos.z, Float32Raster(world.grid));
	const elevation = world.hydrosphere.elevation.value();
	const top_plate_map = world.lithosphere.top_plate_map;
	const precipitation = world.atmosphere.precipitation.value();
    const surface_temperature = world.atmosphere.surface_temperature;

    for (let i = 0, li = grid.vertices.length; i < li; i++) {
        csv_text += [
            latitude[i]  * 180/Math.PI,
            longitude[i] * 180/Math.PI,
            elevation[i],
            top_plate_map[i],
            surface_temperature[i] - Units.STANDARD_TEMPERATURE,
            precipitation[i],
        ].join() + '\n'
    }

    return csv_text;
}
