var Units = {};
Units.DEGREE = Math.PI/180.;
Units.RADIAN = 1;

Units.KELVIN = 1;

Units.MICROGRAM = 1e-9;                          // kilogram
Units.MILLIGRAM = 1e-6;                          // kilogram
Units.GRAM = 1e-3;                               // kilogram
Units.KILOGRAM = 1;                              // kilogram
Units.TON = 1000.;                               // kilogram

Units.FEMTOMETER = 1e-12;                        // meter
Units.PICOMETER = 1e-12;                         // meter
Units.NANOMETER = 1e-9;                          // meter
Units.MICROMETER = 1e-6;                         // meter
Units.MILLIMETER = 1e-3;                         // meter
Units.METER = 1;                                 // meter
Units.KILOMETER = 1000;                          // meter

Units.LITER = 0.001*Units.METER*Units.METER*Units.METER; // meter^3

Units.MOLE = 6.02214076e23;
Units.MILLIMOLE = Units.MOLE / 1e3;
Units.MICROMOLE = Units.MOLE / 1e6;
Units.NANOMOLE  = Units.MOLE / 1e9;
Units.FEMTOMOLE = Units.MOLE / 1e12;

Units.SECOND = 1;                                // second
Units.MINUTE = 60;                               // second
Units.HOUR = Units.MINUTE*60;                    // second
Units.DAY = Units.HOUR*24;                       // second
Units.WEEK = Units.DAY*7;                        // second
Units.MONTH = Units.DAY*29.53059;                // second
Units.YEAR = Units.DAY*365.256363004;            // second
Units.MEGAYEAR = Units.YEAR*1e6;                 // second

Units.NEWTON = Units.KILOGRAM * Units.METER / (Units.SECOND * Units.SECOND)
Units.JOULE = Units.NEWTON * Units.METER;
Units.WATT = Units.JOULE / Units.SECOND;
Units.PASCAL = Units.NEWTON / (Units.METER*Units.METER);
Units.DALTON = 1.66054e-27;                      // kilogram

Units.EARTH_MASS = 5.972e24;                     // kilogram
Units.EARTH_RADIUS = 6.367e6;                    // meter
Units.STANDARD_GRAVITY = 9.80665;                // meter/second^2
Units.STANDARD_TEMPERATURE = 273.15;             // kelvin
Units.STANDARD_PRESSURE = 101325;                // pascals
Units.STANDARD_MOLAR_VOLUME = 22.414*Units.LITER;// meter^3
Units.ASTRONOMICAL_UNIT = 149597870700;          // meter
Units.GLOBAL_SOLAR_CONSTANT = 1361               // watt/meter^2

Units.JUPITER_MASS = 1.898e27;                   // kilogram
Units.JUPITER_RADIUS = 71e6;                     // meter

Units.SOLAR_MASS = 2e30                          // kilogram
Units.SOLAR_RADIUS = 695.7e6                     // meter
Units.SOLAR_LUMINOSITY = 3.828e26                // watt
Units.SOLAR_TEMPERATURE = 5772                   // kelvin

