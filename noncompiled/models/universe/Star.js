'use strict';


var Star = (function() {
        
    function Star(parameters) {
        // "id" is used to reference the world within the rest of the universe
        // It remains unique to the world regardless of name changes. 
        // It is not visible to the user.
        // It is effectively the primary key within the context of database design.
        this.id   = parameters.id;
        // "name" is the name of the world as understood by the user.
        // It is randomly generated and can be modified by the user at any time. 
        this.name = parameters.name;

        this.mass = parameters['mass'] || stop('missing parameter: "mass"')

        this.getParameters = function() {
            return {
                id:       this.id,
                name:     this.name,
                mass:     this.mass,
            };
        };
    }

    // NOTE: All derived attributes are calculated within stateless functions!
    //  Do not create getter/setter attributes within the "Star" class!
    //  We do it this way for two reasons:
    //   1.) To prevent introducing state within code that relies on the Star class.
    //       Developers do not have to worry about the state of is_dirty flags, memos, 
    //       or derived attributes within "Star" objects. 
    //       Star is guaranteed to be a simple data structure. 
    //       All functions that calculate derived attributes are guaranteed to be stateless. 
    //   2.) To achieve a separation of concerns:
    //       The "Star" class concerns itself only with storing the inherent state of a star.
    //       The "Star namespace" concerns itself only with pure, stateless functions 
    //        that describe the transformation of state and the calculation of derived attributes.
    // 
    Star.get_memos = function(star, memos_out) {
        // NOTE: scaling laws from artifexian: https://www.youtube.com/watch?v=hG1of0MroM8
        var solar_masses       = new Memo(0, result => star.mass / Units.SOLAR_MASS );
        var solar_luminosities = new Memo(0, result => Math.pow(solar_masses.value(), 3.5) );
        var solar_radii        = new Memo(0, result => star.mass < 1? Math.pow(solar_masses.value(), 0.8) : Math.pow(solar_masses.value(), 0.5) );

        memos_out = memos_out || {
            radius                : new Memo(0, result => solar_radii.value() * Units.SOLAR_RADIUS ),
            luminosity            : new Memo(0, result => solar_luminosities.value() * Units.SOLAR_LUMINOSITY ),
            surface_area          : new Memo(0, result => SphericalGeometry.get_surface_area(memos_out.radius.value()) ),
            time_on_main_sequence : new Memo(0, result => solar_masses.value()/solar_luminosities.value() * 10e9 * Units.YEAR ),
            intensity             : new Memo(0, result => memos_out.luminosity.value() / memos_out.surface_area.value() ),
            surface_temperature   : new Memo(0, result => Math.pow(memos_out.intensity.value() / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4) ),            
        };

        for (var memo_id in memos_out){
            memos_out[memo_id].invalidate();
        }

        return memos_out;
    }

    return Star;
}) ();
