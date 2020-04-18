// TESTS FOR EXISTING FUNCTIONALITY 
// NOT TO BE INCLUDED IN PRODUCTION

var RasterUnitTests = (function() {
    var RasterUnitTests = {};
    RasterUnitTests.distance = function (pos, vector) {
        var offset = VectorField.sub_vector(pos, vector);
        return ScalarField.max_scalar(VectorField.magnitude(offset), 0.2);
    }
    RasterUnitTests.circle = function (pos, center, radius) {
        center = center || {x:0,y:0,z:1};
        radius = radius || 0.5;
        return ScalarField.lt_scalar(RasterUnitTests.distance(pos, center), radius);
    }
    return RasterUnitTests;
})();


window.ScalarWorldViewOptions = window.ScalarWorldViewOptions || {};

// test for raster id placement
window.ScalarWorldViewOptions.ids     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    scaling: true,
    get_scalar_raster: function (crust) {
        return crust.grid.vertex_ids;
    } 
};

// test for voronoi diagram used by grid.getNearestIds
// should look just like regressionTestViews.ids
window.ScalarWorldViewOptions.voronoi_ids    = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    scaling: true,
    get_scalar_raster: function (crust) {
        return crust.grid.getNearestIds(crust.grid.pos);
    } 
};

// test for get_nearest_values - does it reconstruct the ids field after rotation?
// should look just like window.ScalarWorldViewOptions.ids, but rotated
window.ScalarWorldViewOptions.id_rotated     = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    scaling: true,
    get_scalar_raster: function (crust) {
        var ids = Float32Raster(crust.grid);
        Float32Raster.FromUint16Raster(crust.grid.vertex_ids, ids);
        var rotationMatrix = Matrix3x3.RotationAboutAxis(1,0,0, 0.5);
        var pos = VectorField.mult_matrix(crust.grid.pos, rotationMatrix);
        return Float32Raster.get_nearest_values(ids, pos);
    }
 };

// test for individual plate mask
window.ScalarWorldViewOptions.single_plate = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
     min: '0.', max: '1.',
    get_scalar_raster: function (world) {
        return world.plates[0].mask;
    } 
};



window.ScalarWorldViewOptions.add = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
     min: '4.', max: '0.',
    get_scalar_raster: function (crust, result, scratch1) {
        return ScalarField.add_field(
            RasterUnitTests.distance(crust.grid.pos, {x:0,y:0,z:1}),
            RasterUnitTests.distance(crust.grid.pos, {x:0.7,y:0,z:0.7})
        );
    }
};

window.ScalarWorldViewOptions.mult = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
     min: '4.', max: '0.',
    get_scalar_raster: function (crust, result, scratch1) {
        return ScalarField.mult_field(
            RasterUnitTests.distance(crust.grid.pos, {x:0,y:0,z:1}),
            RasterUnitTests.distance(crust.grid.pos, {x:0.7,y:0,z:0.7})
        );
    }
};

window.ScalarWorldViewOptions.distance = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, result, scratch1) {
        return RasterUnitTests.distance(crust.grid.pos, {x:0,y:0,z:1});
    }
};

// test for binary morphology
window.ScalarWorldViewOptions.circle = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, result, scratch1) {
        return RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1});
    }
};
window.ScalarWorldViewOptions.union = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        return BinaryMorphology.union(
            RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1}),
            RasterUnitTests.circle(crust.grid.pos, {x:0.7,y:0,z:0.7})
        );
    }
};
window.ScalarWorldViewOptions.intersection = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        return BinaryMorphology.intersection(
            RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1}),
            RasterUnitTests.circle(crust.grid.pos, {x:0.7,y:0,z:0.7})
        );
    }
};
window.ScalarWorldViewOptions.difference = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        return BinaryMorphology.difference(
            RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1}),
            RasterUnitTests.circle(crust.grid.pos, {x:0.7,y:0,z:0.7})
        );
    }
};
window.ScalarWorldViewOptions.dilation = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        return BinaryMorphology.dilation(RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1}), 1);
    }
};
window.ScalarWorldViewOptions.erosion = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        return BinaryMorphology.erosion(RasterUnitTests.circle(crust.grid.pos, {x:0,y:0,z:1}), 1);
    }
};

// test for the flood fill algorithm, AKA "magic wand select"
window.ScalarWorldViewOptions.flood_fill1 = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '1.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        // scratch represents pressure
        var pressure = scratch1;
        // flood_fill does double duty for performance reasons
        var scratch2 = flood_fill;
        var field = TectonicsModeling.get_asthenosphere_pressure(crust.density, pressure, scratch2);

        var gradient = ScalarField.gradient(pressure);
        var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
        var gradient = angular_velocity;
        
        var max_id = VectorRaster.max_id(gradient);
        var mask = Uint8Raster(crust.grid, 1);
        var flood_fill = VectorRasterGraphics.magic_wand_select(gradient, max_id, mask);

        return flood_fill;
    }
};
// test for image segmentation algorithm
window.ScalarWorldViewOptions.flood_fill8 = {
    scalar_raster_view_type: 'ColorscaleRasterViewResources',
    min: '8.', max: '0.',
    get_scalar_raster: function (crust, flood_fill, scratch1) {
        // scratch represents pressure
        var pressure = scratch1;
        // flood_fill does double duty for performance reasons
        var scratch2 = flood_fill;
        var field = TectonicsModeling.get_asthenosphere_pressure(crust.density, pressure, scratch2);
        var gradient = ScalarField.gradient(field);
        var angular_velocity = VectorField.cross_vector_field(gradient, crust.grid.pos);
        var gradient = angular_velocity;
        var plate_map = TectonicsModeling.get_plate_map(gradient, 7, 200);
        return plate_map;
    }
};


// test for basic vector rendering
window.VectorWorldViewOptions.test = { 
    get_vector_raster: function (crust) {
        var vector = VectorRaster(crust.grid);
        for(var i=0, li = vector.length; i<li; i++){
            vector[i] = new THREE.Vector3(1,0,0); 
        }
        return crust.grid.pos;
    } 
};
