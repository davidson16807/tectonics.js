'use strict';

function Spin(parameters) {
    var self = this;

    // public variables
    this.axial_tilt         = parameters['axial_tilt']             || 0;
    this.angular_speed         = parameters['angular_speed']         || 2*Math.PI/(60*60*24); // radians/s

    this.getParameters = function() {
        return {
            type: 'spin',
            axial_tilt:     this.axial_tilt,     
            angular_speed:     this.angular_speed,    
        };
    }

    this.period = function(orbit) {
        return 2*Math.PI/this.angular_speed;
    }

    this.get_child_to_parent_matrix = function(rotation_angle) {
        return OrbitalMechanics.get_spin_matrix4x4(
            rotation_angle, 
            this.axial_tilt
        );
    }
    this.get_parent_to_child_matrix = function(rotation_angle) {
        return Matrix4x4.invert(this.get_child_to_parent_matrix(rotation_angle));
    }

    this.iterate = function(rotation_angle, timestep) {
        var period = this.period();
        var TURN = 2*Math.PI;
        return (rotation_angle + TURN*(timestep / period)) % TURN;
    };
}
