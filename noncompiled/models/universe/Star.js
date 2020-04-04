'use strict';


const Star = (function() {
        
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
                type:     'star',
                id:       this.id,
                name:     this.name,
                mass:     this.mass,
            };
        }
        // NOTE: we only include these functions to satisfy depreciated interfaces
        // TODO: remove all instances of these functions,
        //  adopt get_derived_attributes in its state.
        this.initialize      = function() {};
        this.invalidate      = function() {};
        this.setDependencies = function(dependencies) {};
        this.calcChanges     = function(timestep) {};
        this.applyChanges    = function(timestep) {};
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
    Star.get_memos = function(star) {

        // NOTE: "memo" is reimplemented here because it reflects what we want
        //  the memo class to look like in the future.
        // TODO: replace global "Memo" class with this instance.
        function memo(get_value, result) {
            let is_dirty = true;
            return function() {
                if (is_dirty) {
                    // NOTE: we set is_dirty first in order to resolve circular dependencies between memos
                    //  e.g. snow coverage depends on temperature which depends on albedo which depends on snow coverage
                    is_dirty = false;
                    result = get_value(result); 
                }
                return result;
            }
        }

        // NOTE: scaling laws from artifexian: https://www.youtube.com/watch?v=hG1of0MroM8
        const solar_masses       = memo( result => star.mass / Units.SOLAR_MASS );
        const solar_luminosities = memo( result => Math.pow(solar_masses(), 3.5) );
        const solar_radii        = memo( result => star.mass < 1? Math.pow(solar_masses(), 0.8) : Math.pow(solar_masses(), 0.5) );

        const memos = {};
        memos.radius                = memo( result => solar_radii() * Units.SOLAR_RADIUS );
        memos.luminosity            = memo( result => solar_luminosities() * Units.SOLAR_LUMINOSITY );
        memos.surface_area          = memo( result => SphericalGeometry.get_surface_area(memos.radius()) );
        memos.time_on_main_sequence = memo( result => solar_masses()/solar_luminosities() * 10e9 * Units.YEAR );
        memos.intensity             = memo( result => memos.luminosity() / memos.surface_area() );
        memos.surface_temperature   = memo( result => Math.pow(memos.intensity() / Thermodynamics.STEPHAN_BOLTZMANN_CONSTANT, 1/4) );
        return memos;
    }

    return Star;
}) ();
