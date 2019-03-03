/* eslint-env node */
module.exports = function (config) {
    config.set({
        // To debug, run `npm run karma-debug` and press the "Debug" button in the browser window
        browsers: [ 'ChromeHeadless' ],
        frameworks: [ 'qunit' ],
        files: [
            'libraries/random-0.26.js',
            'libraries/three.js/Three.js',
            
            'tests/scripts/QUnitx.approx.js',
            'tests/scripts/AlgebraHelpers.js',
              'tests/scripts/RangeHelpers.js',

            'postcompiled/Rasters.js',
            'tests/scripts/Rasters.js',

              'noncompiled/Units.js',
              'noncompiled/academics/SphericalGeometry.js',
              'noncompiled/academics/Thermodynamics.js',
              'noncompiled/academics/OrbitalMechanics.js',
              'tests/scripts/Academics.js',

              'noncompiled/models/Memo.js',
              'noncompiled/generators/CrustGenerator.js',
              'noncompiled/academics/Hydrology.js',
              'noncompiled/academics/FluidMechanics.js',
              'noncompiled/academics/Tectonophysics.js',
              'noncompiled/models/lithosphere/RockColumn.js',
              'noncompiled/models/lithosphere/Lithosphere.js',
              'noncompiled/models/lithosphere/Crust.js',
              'noncompiled/models/lithosphere/Plate.js',
              'noncompiled/models/lithosphere/SupercontinentCycle.js',
              'tests/scripts/Lithosphere.js',
        ],
        autoWatch: false,
        singleRun: true,
        preprocessors: {
            'src/*.js': [ 'coverage' ]
        },
        reporters: [ 'dots', 'coverage' ],
        coverageReporter: {
            reporters: [
                { type: 'text-summary' },
                { type: 'html', dir:'coverage/' },
                { type: 'lcovonly', dir: 'coverage/' },
            ],
            check: { global: {
                functions: 90,
                statements: 50,
                branches: 50,
                lines: 50
            } }
        }
    });
};
