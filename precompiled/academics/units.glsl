
const float DEGREE = 3.141592653589793238462643383279502884197169399/180.;
const float RADIAN = 1.0;

const float KELVIN = 1.0;

const float DALTON     = 1.66053907e-27;       // kilograms
const float MICROGRAM  = 1e-9;                 // kilograms
const float MILLIGRAM  = 1e-6;                 // kilograms
const float GRAM       = 1e-3;                 // kilograms
const float KILOGRAM   = 1.0;                  // kilograms
const float TON        = 1000.;                // kilograms

const float PICOMETER  = 1e-12;                // meters
const float NANOMETER  = 1e-9;                 // meters
const float MICROMETER = 1e-6;                 // meters
const float MILLIMETER = 1e-3;                 // meters
const float METER      = 1.0;                  // meters
const float KILOMETER  = 1000.;                // meters

const float MOLE       = 6.02214076e23;
const float MILLIMOLE  = MOLE / 1e3;
const float MICROMOLE  = MOLE / 1e6;
const float NANOMOLE   = MOLE / 1e9;
const float PICOMOLE   = MOLE / 1e12;
const float FEMTOMOLE  = MOLE / 1e15;

const float SECOND     = 1.0;                  // seconds
const float MINUTE     = 60.0;                 // seconds
const float HOUR       = MINUTE*60.0;          // seconds
const float DAY        = HOUR*24.0;            // seconds
const float WEEK       = DAY*7.0;              // seconds
const float MONTH      = DAY*29.53059;         // seconds
const float YEAR       = DAY*365.256363004;    // seconds
const float MEGAYEAR   = YEAR*1e6;             // seconds

const float NEWTON     = KILOGRAM * METER / (SECOND * SECOND);
const float JOULE      = NEWTON * METER;
const float WATT       = JOULE / SECOND;

const float EARTH_MASS            = 5.972e24;  // kilograms
const float EARTH_RADIUS          = 6.367e6;   // meters
const float STANDARD_GRAVITY      = 9.80665;   // meters/second^2
const float STANDARD_TEMPERATURE  = 273.15;    // kelvin
const float STANDARD_PRESSURE     = 101325.;   // pascals
const float ASTRONOMICAL_UNIT     = 149597870700.;// meters
const float GLOBAL_SOLAR_CONSTANT = 1361.;     // watts/meter^2

const float JUPITER_MASS = 1.898e27;           // kilograms
const float JUPITER_RADIUS = 71e6;             // meters

const float SOLAR_MASS = 2e30;                 // kilograms
const float SOLAR_RADIUS = 695.7e6;            // meters
const float SOLAR_LUMINOSITY = 3.828e26;       // watts
const float SOLAR_TEMPERATURE = 5772.;         // kelvin

const float LIGHT_YEAR = 9.4607304725808e15;   // meters
const float PARSEC = 3.08567758149136727891393;//meters

const float GALACTIC_MASS = 2e12*SOLAR_MASS;   // kilograms
const float GALACTIC_YEAR = 250.0*MEGAYEAR;    // seconds
const float GALACTIC_RADIUS = 120e3*LIGHT_YEAR;// meters