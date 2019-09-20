// SphericalGeometry is a namespace isolating all business logic relating to geometry on the surface of spheres
// It assumes no knowledge of physics
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects
var SphericalGeometry = (function() {

    SphericalGeometry = {};

    SphericalGeometry.get_surface_area = function(radius) {
        return 4*Math.PI*radius*radius;
    }
    SphericalGeometry.get_volume = function(radius) {
        return 4/3*Math.PI*radius*radius*radius;
    }
    SphericalGeometry.get_radius_from_volume = function(volume) {
        return Math.cbrt(volume / (4/3*Math.PI));
    }
    SphericalGeometry.get_radius_from_surface_area = function(surface_area) {
        return Math.sqrt(surface_area / (4*Math.PI));
    }
    SphericalGeometry.cartesian_to_spherical = function(x,y,z){
        return {lat: Math.asin(y/Math.sqrt(x*x+y*y+z*z)), lon: Math.atan2(-z, x)};
    }
    SphericalGeometry.spherical_to_cartesian = function(lat, lon){
        return Vector(
            Math.cos(lat) * Math.cos(lon),
            Math.sin(lat),
           -Math.cos(lat) * Math.sin(lon)
        );
    }
    SphericalGeometry.get_latitudes = function(height, lat) {
        // Note: vertical axis is classically Y in 3d gaming, but it's classically Z in the math
        // We call it "height" to avoid confusion.
        // see https://gamedev.stackexchange.com/questions/46225/why-is-y-up-in-many-games
        var lat = lat || Float32Raster(height.grid);
        var asin = Math.asin;
        for (var i=0, li=height.length; i<li; ++i) {
            lat[i] = asin(height[i]);
        }
        return lat;
    }
    SphericalGeometry.get_longitudes = function(x, z, lon) {
        var lon = lon || Float32Raster(x.grid);
        var atan = Math.atan2;
        for (var i=0, li=x.length; i<li; ++i) {
            lon[i] = atan(-z[i], x[i]);
        }
        return lon;
    }
    SphericalGeometry.get_random_point_on_surface = function(random) {
        return SphericalGeometry.spherical_to_cartesian(
            Math.asin(2*random.random() - 1),
            2*Math.PI * random.random()
        );
    };
    SphericalGeometry.get_random_point_on_great_circle = function(eulerPole, random) {
        var a = eulerPole;
        var b = Vector(0,0,1); 
        var c = Vector()

        // First, cross eulerPole with another vector to give a nonrandom point along great circle
        Vector.cross_vector    (a.x, a.y, a.z,      b.x, b.y, b.z,     c); 
        Vector.normalize    (c.x, c.y, c.z,                     c); 
        
        // then rotate by some random amount around the eulerPole
        var random_rotation_matrix = Matrix3x3.RotationAboutAxis(a.x, a.y, a.z, 2*Math.PI * random.random());
        return Vector.mult_matrix(c.x, c.y, c.z,  random_rotation_matrix)
    };
    SphericalGeometry.get_random_rotation_matrix3x3 = function (random) {
        var up = Vector(0,0,1); 
        var a = Vector(); 
        var b = Vector(); 
        var c = SphericalGeometry.get_random_point_on_surface(random); 
        Vector.cross_vector    (c.x, c.y, c.z, up.x, up.y, up.z, a); 
        Vector.normalize    (a.x, a.y, a.z, a); 
        Vector.cross_vector    (c.x, c.y, c.z, a.x, a.y, a.z, b); 
        return Matrix3x3.BasisVectors(a,b,c); 
    }

    // what follows is an implementation of the terrain generation algorithm discussed by
    // Hugo Elias here: http://freespace.virgin.net/hugo.elias/models/m_landsp.htm
    // the algorithm is specifically made to generate terrain on a sphere.
    // It does this by iteratively splitting the world in
    // half and adding some random amount of landmass to one of the sides.
    // It does this until an attractive landmass results.
    // 
    // Its a bit more sophisticated in that it uses a smooth function
    // instead of an immediate drop off between sides. 
    // This is done to produce smoother terrain using fewer iterations 
    SphericalGeometry.get_random_surface_field = function (grid, random) {
        // Now, we iterate through the cells and find their "height rank".
        // This value doesn't translate directly to elevation. 
        // It only represents how cells would rank if sorted by elevation.
        // This is done so we can later derive elevations that are consistent with earth's.
        var positions = grid.vertices;
        var pos = grid.pos;
        var z = Float32Raster(grid);
        var height_ranks = Float32Raster(grid);
        Float32Raster.fill(height_ranks, 0);
        for (var j = 0, lj = 1000; j < lj; j++) {
            VectorField.dot_vector(pos, SphericalGeometry.get_random_point_on_surface(random), z);
            Float32RasterInterpolation.smoothstep2(z, 300, z);
            ScalarField.add_field(height_ranks, z, height_ranks);
        }
        Float32Dataset.normalize(height_ranks, height_ranks);

        return height_ranks;
    }

    return SphericalGeometry;
})();
