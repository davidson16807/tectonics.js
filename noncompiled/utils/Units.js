var Units = {};

Units.MICROGRAM = 1e-9;						// kilograms
Units.MILLIGRAM = 1e-6;						// kilograms
Units.GRAM = 1e-3;							// kilograms
Units.KILOGRAM = 1;							// kilograms
Units.TON = 1000.;							// kilograms

Units.MICROMETER = 1e-6;					// meter
Units.MILLIMETER = 1e-3;					// meter
Units.METER = 1;							// meter
Units.KILOMETER = 1000;						// meter

Units.EARTH_MASS = 5.972e24; 				// kilograms
Units.EARTH_RADIUS = 6.367e6;			 	// meters
Units.STANDARD_GRAVITY = 9.80665; 			// meters/second^2
Units.STANDARD_TEMPERATURE = 273.15; 		// kelvin
Units.STANDARD_PRESSURE = 101325; 			// pascals
Units.ASTRONOMICAL_UNIT = 149597870700; 	// meters

Units.JUPITER_MASS = 1.898e27; 				// kilograms
Units.JUPITER_RADIUS = 71e6; 				// meters

Units.SOLAR_MASS = 2e30 					// kilograms
Units.SOLAR_RADIUS = 695.7e6 				// meters
Units.SOLAR_LUMINOSITY = 3.828e26 			// watts

Units.SECOND = 1;							// seconds
Units.MINUTE = 60;							// seconds
Units.HOUR = Units.MINUTE*60;				// seconds
Units.DAY = Units.HOUR*24;					// seconds
Units.WEEK = Units.DAY*7;					// seconds
Units.MONTH = Units.DAY*29.53059;			// seconds
Units.YEAR = Units.DAY*365.25;				// seconds
Units.MEGAYEAR = Units.YEAR*1e6;			// seconds

Units.KELVIN = 1;

Units.NEWTON = Units.KILOGRAM * Units.METER / (Units.SECOND * Units.SECOND)
Units.JOULE = Units.NEWTON * Units.METER;
Units.WATT = Units.JOULE / Units.SECOND;

Units.MOLE = 6.02e23