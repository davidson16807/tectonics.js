'use strict';

var Interpolation = (function() {
    var Interpolation = {};

    Interpolation.clamp = function (x, minVal, maxVal) {
        return x > maxVal? maxVal : x < minVal? minVal : x;
    }
    Interpolation.linearstep = function(edge0, edge1, x) {
        var fraction = (x - edge0) / (edge1 - edge0);
        return fraction > 1.? 1.0 : fraction < 0.? 0. : fraction;
    }
    Interpolation.smoothstep = function (edge0, edge1, x) {
        var fraction = (x - edge0) / (edge1 - edge0);
        var linearstep = fraction > 1.? 1.0 : fraction < 0.? 0. : fraction;
        return linearstep * linearstep * (3.0 - 2.0 * linearstep);
    }
    Interpolation.step = function(edge, x) {
        return x < edge? 0. : 1;
    }
    Interpolation.mix = function(x, y, a) {
        return x*(1.-a) + y*a;
    }
    
    // performs basic Linear piecewise intERPolation:
    // given a list of control points mapping 1d space to 1d scalars, 
    // and a point in 1d space, returns a 1d scalar that maps to the point
    Interpolation.lerp = function(control_point_x, control_point_y, x) {
        var mix = Interpolation.mix;
        var linearstep = Interpolation.linearstep;
        var result = control_point_y[0];
        for (var i = 1; i < control_point_x.length; i++) {
            result = mix(result, control_point_y[i], linearstep(control_point_x[i-1], control_point_x[i], x));
        }
        return result;
    }
    // finds the integral of the lerp() function from a to b
    Interpolation.integral_of_lerp = function(control_point_x, control_point_y, a, b) {
        var mix = Interpolation.mix;
        var linearstep = Interpolation.linearstep;
        var fa, fb, ya, yb, dydf, dxdf;
        var li = control_point_x.length;
        var I  = b < control_point_x[0]?    (b - a) * control_point_y[0]    : 0
               + a > control_point_x[li-1]? (b - a) * control_point_y[li-1] : 0;
        for (var i = 1; i < li; i++) {
            // "f*" is fraction through the control point for a or b
            fa = linearstep(control_point_x[i-1], control_point_x[i], a);
            fb = linearstep(control_point_x[i-1], control_point_x[i], b);
            dydf = control_point_y[i] - control_point_y[i-1];
            dxdf = control_point_x[i] - control_point_x[i-1];
            yb = dydf * fb * fb / 2 + fb * control_point_y[i-1];
            ya = dydf * fa * fa / 2 + fa * control_point_y[i-1];
            I += (yb - ya) * dxdf;
        }
        return I;
    }

    return Interpolation;
})();

