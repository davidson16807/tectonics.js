
// The VectorField namespace provides operations over mathematical vector fields.
// All fields are represented on raster objects, e.g. VectorRaster or Float32Raster
var VectorField = {};


VectorField.add_scalar_term = function(vector_field1, vector_field2, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + (v[i] * scalar);
    }

    return result;
};

VectorField.add_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + v[i];
    }

    return result;
};

VectorField.sub_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - v[i];
    }

    return result;
};
VectorField.dot_vector_field = function(vector_field1, vector_field2, result) {
    result = result || Float32Raster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_ARRAY(result, Float32Array)

    var u = vector_field1.everything;
    var v = vector_field2.everything;

    var length = result.length;
    for (var i=0, li=u.length; i<li; ++i) {
        result[i%length] += u[i] * v[i];
    }
    return result;
};
VectorField.hadamard_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] * v[i];
    }

    return result;
};
VectorField.cross_vector_field = function (vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)
    
    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;

    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    var axi = 0;
    var ayi = 0;
    var azi = 0;

    var bxi = 0;
    var byi = 0;
    var bzi = 0;

    for (var i = 0, li=x.length; i<li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];

        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];

        x[i] = ayi*bzi - azi*byi;
        y[i] = azi*bxi - axi*bzi;
        z[i] = axi*byi - ayi*bxi;
    }

    return result;
}
VectorField.div_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field1.everything;
    var v = vector_field2.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / v[i];
    }

    return result;
};
VectorField.max_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;

    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;

    var cx = result.x;
    var cy = result.y;
    var cz = result.z;

    var axi=0, ayi=0, azi=0;
    var bxi=0, byi=0, bzi=0;
    var a_mag = 0, b_mag = 0;
    var is_a_bigger = false;

    var sqrt = Math.sqrt;
    for (var i = 0, li = ax.length; i<li; i++) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        a_mag = sqrt(    axi * axi + 
                        ayi * ayi + 
                        azi * azi      );

        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        b_mag = sqrt(    bxi * bxi + 
                        byi * byi + 
                        bzi * bzi      );

        is_a_bigger = a_mag > b_mag;
        cx[i] = is_a_bigger? axi : bxi;
        cy[i] = is_a_bigger? ayi : byi;
        cz[i] = is_a_bigger? azi : bzi;
    }
    return result;
}
VectorField.min_vector_field = function(vector_field1, vector_field2, result) {
    result = result || VectorRaster.OfLength(vector_field1.x.length, vector_field1.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_VECTOR_RASTER(result)

    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;

    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;

    var cx = result.x;
    var cy = result.y;
    var cz = result.z;

    var axi=0, ayi=0, azi=0;
    var bxi=0, byi=0, bzi=0;
    var a_mag = 0, b_mag = 0;
    var is_a_smaller = false;

    var sqrt = Math.sqrt;
    for (var i = 0, li = ax.length; i<li; i++) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];
        a_mag = sqrt(    axi * axi + 
                        ayi * ayi + 
                        azi * azi      );

        bxi = bx[i];
        byi = by[i];
        bzi = bz[i];
        b_mag = sqrt(    bxi * bxi + 
                        byi * byi + 
                        bzi * bzi      );

        is_a_smaller = a_mag < b_mag;
        cx[i] = is_a_smaller? axi : bxi;
        cy[i] = is_a_smaller? ayi : byi;
        cz[i] = is_a_smaller? azi : bzi;
    }
    return result;
}

VectorField.add_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] + x2;
        y[i] = y1[i] + y2;
        z[i] = z1[i] + z2;
    }

    return result;
};

VectorField.sub_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] - x2;
        y[i] = y1[i] - y2;
        z[i] = z1[i] - z2;
    }

    return result;
};
VectorField.dot_vector = function(vector_field, vector, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(result, Float32Array)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;

    for (var i=0, li=x1.length; i<li; ++i) {
        result[i] = x1[i] * x2 + 
                    y1[i] * y2 + 
                    z1[i] * z2;
    }
    return result;
};
VectorField.hadamard_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] * x2;
        y[i] = y1[i] * y2;
        z[i] = z1[i] * z2;
    }

    return result;
};
VectorField.cross_vector = function (vector_field, vector, result)  {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    var axi = 0;
    var ayi = 0;
    var azi = 0;

    var bxi = vector.x;
    var byi = vector.y;
    var bzi = vector.z;

    for (var i = 0, li=x.length; i < li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];

        x[i] = ayi*bzi   -   azi*byi;
        y[i] = azi*bxi   -   axi*bzi;
        z[i] = axi*byi   -   ayi*bxi;
    }
    return result;
}
VectorField.div_vector = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x2 = vector.x;
    var y2 = vector.y;
    var z2 = vector.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] / x2;
        y[i] = y1[i] / y2;
        z[i] = z1[i] / z2;
    }

    return result;
};

// NOTE: matrix is structured to match the output of THREE.Matrix3.toArray()
// i.e single array in column-major format
VectorField.mult_matrix = function (vector_field, matrix, result)  {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_3X3_MATRIX(matrix)
    ASSERT_IS_VECTOR_RASTER(result)

    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;

    var xx = matrix[0];    var xy = matrix[3];    var xz = matrix[6];
    var yx = matrix[1];    var yy = matrix[4];    var yz = matrix[7];
    var zx = matrix[2];    var zy = matrix[5];    var zz = matrix[8];

    var x = result.x;
    var y = result.y;
    var z = result.z;

    var axi = 0;
    var ayi = 0;
    var azi = 0;

    for (var i = 0, li=x.length; i < li; ++i) {
        axi = ax[i];
        ayi = ay[i];
        azi = az[i];

        x[i] = axi * xx    + ayi * xy     + azi * xz     ;
        y[i] = axi * yx    + ayi * yy     + azi * yz     ;
        z[i] = axi * zx    + ayi * zy     + azi * zz     ;
    }

    return result;
}

VectorField.add_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(scalar_field, Float32Array)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + scalar_field[i%length];
    }

    return result;
};
VectorField.sub_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(scalar_field, Float32Array)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - scalar_field[i%length];
    }

    return result;
};
VectorField.mult_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(scalar_field, Float32Array)
    ASSERT_IS_VECTOR_RASTER(result)


    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    for (var i=0, li=x.length; i<li; ++i) {
        x[i] = x1[i] * scalar_field[i];
        y[i] = y1[i] * scalar_field[i];
        z[i] = z1[i] * scalar_field[i];
    }

    return result;
};
VectorField.div_scalar_field = function(vector_field, scalar_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(scalar_field, Float32Array)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    var length = scalar_field.length;
    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / scalar_field[i%length];
    }

    return result;
};


VectorField.add_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_TYPE(scalar, number)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] + scalar;
    }

    return result;
};
VectorField.sub_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_TYPE(scalar, number)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] - scalar;
    }

    return result;
};
VectorField.mult_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_TYPE(scalar, number)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] * scalar;
    }

    return result;
};
VectorField.div_scalar = function(vector_field, scalar, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_TYPE(scalar, number)
    ASSERT_IS_VECTOR_RASTER(result)

    var u = vector_field.everything;
    var out = result.everything;

    for (var i=0, li=u.length; i<li; ++i) {
        out[i] = u[i] / scalar;
    }

    return result;
};
VectorField.vector_similarity = function(vector_field, vector, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(result, Float32Array)

    var ax = vector_field.x;
    var ay = vector_field.y;
    var az = vector_field.z;

    var bx = vector.x;
    var by = vector.y;
    var bz = vector.z;

    var axi = 0.; 
    var ayi = 0.; 
    var azi = 0.; 

    var sqrt = Math.sqrt;
    for (var i=0, li=result.length; i<li; ++i) {
        axi = ax[i]; 
        ayi = ay[i]; 
        azi = az[i]; 

        result[i] = 
         (axi*bx + 
          ayi*by + 
          azi*bz)   /   ( sqrt(axi*axi+
                               ayi*ayi+
                               azi*azi)   *   sqrt(bx*bx+
                                                   by*by+
                                                   bz*bz) );
    }
    return result;
};


VectorField.vector_field_similarity = function(vector_field1, vector_field2, result) {
    result = result || Float32Raster.OfLength(vector_field1.x.length, vector_field1.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field1)
    ASSERT_IS_VECTOR_RASTER(vector_field2)
    ASSERT_IS_ARRAY(result, Float32Array)

    var ax = vector_field1.x;
    var ay = vector_field1.y;
    var az = vector_field1.z;

    var bx = vector_field2.x;
    var by = vector_field2.y;
    var bz = vector_field2.z;

    var axi = 0.; 
    var ayi = 0.; 
    var azi = 0.; 

    var bxi = 0.;
    var byi = 0.;    
    var bzi = 0.;

    var sqrt = Math.sqrt;
    for (var i=0, li=result.length; i<li; ++i) {
        axi = ax[i]; 
        ayi = ay[i]; 
        azi = az[i]; 

        bxi = bx[i];
        byi = by[i];    
        bzi = bz[i];

        result[i] = 
         (axi*bxi + 
          ayi*byi + 
          azi*bzi)   /   ( sqrt(axi*axi+
                                ayi*ayi+
                                azi*azi)   *   sqrt(bxi*bxi+
                                                    byi*byi+
                                                    bzi*bzi) );
    }
    return result;
};

VectorField.map = function(vector_field, fn, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(result, Float32Array)

    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;

    for (var i = 0, li = result.length; i<li; i++) {
        result[i] = fn(x[i], y[i], z[i]);
    }
    return result;
};

VectorField.magnitude = function(vector_field, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(result, Float32Array)

    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;

    var xi=0, yi=0, zi=0;
    var sqrt = Math.sqrt;
    for (var i = 0, li = result.length; i<li; i++) {
        var xi = x[i];
        var yi = y[i];
        var zi = z[i];
        result[i] = sqrt(    xi * xi + 
                            yi * yi + 
                            zi * zi      );
    }
    return result;
}

VectorField.normalize = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;

    var ox = result.x;
    var oy = result.y;
    var oz = result.z;

    var xi=0., yi=0., zi=0.;
    var sqrt = Math.sqrt;
    var mag = 0.;
    for (var i = 0, li = x.length; i<li; i++) {
        var xi = x[i];
        var yi = y[i];
        var zi = z[i];
        mag = sqrt(    xi * xi + 
                    yi * yi + 
                    zi * zi      );
        ox[i] = xi/(mag||1);
        oy[i] = yi/(mag||1);
        oz[i] = zi/(mag||1);
    }
    return result;
}

// ∂X
// NOTE: should arrow_differential exist at all? 
// Consider moving its code to grid
VectorField.arrow_differential = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.grid.arrows.length, undefined);
    
    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var x1 = vector_field.x;
    var y1 = vector_field.y;
    var z1 = vector_field.z;

    var x = result.x;
    var y = result.y;
    var z = result.z;

    var arrows = vector_field.grid.arrows;
    var from = 0;
    var to = 0;
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];
        x[i] = x1[to] - x1[from];
        y[i] = y1[to] - y1[from];
        z[i] = z1[to] - z1[from];
    }
    return result;
}
// This function computes the divergence of a 3d mesh. 
// The divergence can be thought of as the amount by which vectors diverge around a point
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// This implementation does not have to assume all vertices are equidistant. 
// 
// So for 2d: 
//  ∇⋅f = (fx(x+dx) - fx(x-dx)) / 2dx + 
//        (fy(x+dy) - fy(x-dy)) / 2dy  
//
//  ∇⋅f =  1/2 (fx(x+dx) - fx(x-dx)) / dx + 
//         1/2 (fy(x+dy) - fy(x-dy)) / dy  
//
// Think of it as taking the average change in projection:
// For each neighbor:
//   draw a vector to the neighbor
//   find the projection between that vector and the field, 
//   find how the projection changes along that vector
//   find the average change across all neighbors
VectorField.divergence = function(vector_field, result) {
    result = result || Float32Raster.OfLength(vector_field.x.length, vector_field.grid);
    
    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_ARRAY(result, Float32Array)

    var dlength = vector_field.grid.pos_arrow_distances;

    var arrows = vector_field.grid.arrows;

    var x = vector_field.x;
    var y = vector_field.y;
    var z = vector_field.z;

    var arrow_pos_diff_normalized = vector_field.grid.pos_arrow_differential_normalized;
    var dxhat = arrow_pos_diff_normalized.x;
    var dyhat = arrow_pos_diff_normalized.y;
    var dzhat = arrow_pos_diff_normalized.z;

    var from = 0;
    var to = 0;
    Float32Raster.fill(result, 0);
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];

        result[from] += 
          ( (x[to] - x[from]) * dxhat[i]   
           +(y[to] - y[from]) * dyhat[i]   
           +(z[to] - z[from]) * dzhat[i]) / dlength[i];
    }

    var neighbor_count = vector_field.grid.neighbor_count;
    for (var i = 0, li = neighbor_count.length; i < li; i++) {
        result[i] /= neighbor_count[i] || 1;
    }

    return result;
}

// This function computes the curl of a 3d mesh. 
// The curl can be thought of as the amount by which vectors curl around a point
// By applying it to a surface, we mean it's only done for the 2d surface of a 3d object. 
// This implementation does not have to assume all vertices are equidistant. 
// 
// Think of it as taking the average change in the vector rejection:
// For each neighbor:
//   draw a vector to the neighbor
//   find the vector rejection between that vector and the field, 
//   find how the vector rejection changes along that vector
//   find the average change across all neighbors
VectorField.curl = function(vector_field, result) {
    result = result || VectorRaster.OfLength(vector_field.x.length, vector_field.grid);

    ASSERT_IS_VECTOR_RASTER(vector_field)
    ASSERT_IS_VECTOR_RASTER(result)

    var dlength = vector_field.grid.pos_arrow_distances;

    var arrows = vector_field.grid.arrows;

    var curl_fx = result.x;
    var curl_fy = result.y;
    var curl_fz = result.z;

    var fx = vector_field.x;
    var fy = vector_field.y;
    var fz = vector_field.z;

    var arrow_pos_diff_normalized = vector_field.grid.pos_arrow_differential_normalized;
    var dxhat = arrow_pos_diff_normalized.x;
    var dyhat = arrow_pos_diff_normalized.y;
    var dzhat = arrow_pos_diff_normalized.z;

    var from = 0;
    var to  = 0;
    var dfx = 0;
    var dfy = 0;
    var dfz = 0;
    Float32Raster.fill(curl_fx, 0);
    Float32Raster.fill(curl_fy, 0);
    Float32Raster.fill(curl_fz, 0);
    for (var i = 0, li = arrows.length; i<li; i++) {
        from = arrows[i][0];
        to = arrows[i][1];

        dfx = fx[to] - fx[from];
        dfy = fy[to] - fy[from];
        dfz = fz[to] - fz[from];

        curl_fx[from] += dfx - (dfx * dxhat[i] / dlength[i]);
        curl_fy[from] += dfy - (dfy * dyhat[i] / dlength[i]);
        curl_fz[from] += dfz - (dfz * dzhat[i] / dlength[i]);
    }

    var neighbor_count = vector_field.grid.neighbor_count;
    for (var i = 0, li = neighbor_count.length; i < li; i++) {
        curl_fx[i] /= neighbor_count[i] || 1;
        curl_fy[i] /= neighbor_count[i] || 1;
        curl_fz[i] /= neighbor_count[i] || 1;
    }

    return result;
}