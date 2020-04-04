'use strict';

const Interpolation = (function() {
    const Interpolation = {};

    Interpolation.clamp = function (x, minVal, maxVal) {
        return x > maxVal? maxVal : x < minVal? minVal : x;
    }
    Interpolation.linearstep = function(edge0, edge1, x) {
        const fraction = (x - edge0) / (edge1 - edge0);
        return fraction > 1.? 1.0 : fraction < 0.? 0. : fraction;
    }
    Interpolation.smoothstep = function (edge0, edge1, x) {
        const fraction = (x - edge0) / (edge1 - edge0);
        const linearstep = fraction > 1.? 1.0 : fraction < 0.? 0. : fraction;
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
        const mix = Interpolation.mix;
        const linearstep = Interpolation.linearstep;
        let result = control_point_y[0];
        for (let i = 1; i < control_point_x.length; i++) {
            result = mix(result, control_point_y[i], linearstep(control_point_x[i-1], control_point_x[i], x));
        }
        return result;
    }

    return Interpolation;
})();

