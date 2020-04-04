const ImageImporter = {};

ImageImporter.get_elevations_from_canvas_context = function (canvas_context, grid, options) {
    options = options || {};

    const canvas = canvas_context.canvas;
    const canvas_width  = canvas.width;
    const canvas_height = canvas.height;

    const elevation_max = options.elevation_max ||   8850; // NOTE: default is the height of Mt. Everest, in meters
    const elevation_min = options.elevation_min || -10994; // NOTE: default is the depth of the Marianas trench, in meters
    const elevation_range = elevation_max - elevation_min;

    const latitude  = SphericalGeometry.get_latitudes (grid.pos.y,             Float32Raster(grid));
    const longitude = SphericalGeometry.get_longitudes(grid.pos.x, grid.pos.z, Float32Raster(grid));
    const elevations = Float32Raster(grid);

    for (let i = 0, li = latitude.length; i<li ; i++) {
        const x = (canvas_width  * (longitude[i] / (2.*Math.PI) + 0.5)) | 0;
        const y = (canvas_height * (-latitude[i] / (Math.PI)    + 0.5)) | 0;
        const color = canvas_context.getImageData(x, y, 1, 1).data;
        const elevation = color[0] * elevation_range / 255 + elevation_min;
        elevations[i] = elevation;
    }

    return elevations;
}
