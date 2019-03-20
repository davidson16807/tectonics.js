var ImageImporter = {};

ImageImporter.get_elevations_from_canvas_context = function (canvas_context, grid, options) {
    options = options || {};

    var canvas = canvas_context.canvas;
    var canvas_width  = canvas.width;
    var canvas_height = canvas.height;

    var elevation_max = options.elevation_max ||   8850; // NOTE: default is the height of Mt. Everest, in meters
    var elevation_min = options.elevation_min || -10994; // NOTE: default is the depth of the Marianas trench, in meters
    var elevation_range = elevation_max - elevation_min;

    var latitude  = SphericalGeometry.get_latitudes (grid.pos.y,             Float32Raster(grid));
    var longitude = SphericalGeometry.get_longitudes(grid.pos.x, grid.pos.z, Float32Raster(grid));
    var elevations = Float32Raster(grid);

    for (var i = 0, li = latitude.length; i<li ; i++) {
        var x = (canvas_width  * (longitude[i] / (2.*Math.PI) + 0.5)) | 0;
        var y = (canvas_height * (-latitude[i] / (Math.PI)    + 0.5)) | 0;
        var color = canvas_context.getImageData(x, y, 1, 1).data;
        var elevation = color[0] * elevation_range / 255 + elevation_min;
        elevations[i] = elevation;
    }

    return elevations;
}
