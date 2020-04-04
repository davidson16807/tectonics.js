// Considerations:
//   anthropic principle (model need only generate habitable stars, at least for now)
//   star type frequency (Stellar Initial Mass Function)
//   star metallicity (affects frequency of gas giants)
//   conservation of angular momentum (for binary stars)
//   planetary mass distributions
//   Titus-Bode law / Dermott's law
//   hill spheres
//   statistical mechanics
//
// Outline:
//   What is the combined mass of the system?
//   how many stars (function of combined mass)
//   what is the mass of each star?
//   what is the period of binary stars? (log normal distribution, expected value of 100 years)
//   what is the eccentricity of binary stars? (function of period)
//   what is the orbital plane of stars relative to galaxy? (assume uniform distrubtion of rotation vectors/coord basis)
//   type of system: p type, s type, frost line, hot jupiter, adopted planets
//   planetary periods, semi-major axes, and eccentricities
//   original semi-major axes at which they formed
//   time of stellar ignition
//   composition (determined by stellar distance and time of stellar ignition: ice giants formed after ignition)
//   ...
//   
// Jcloud = 
// Jp = m sqrt(MGa(1-e^2))
// J* = γMRvsin(i*)
// Jsys = mᵃ where a=2
// J*/Jsys = 95%
// 
// 
const StarSystemGenerator = {};
StarSystemGenerator.generate = function (random, system_mass) {

    // Returns a function that generates a weighted random choice 
    // Weights are indicated by a dict representing a stat distribution
    // TODO: put this to its own namespace
    // we use it again under NameGenerator
    random_weighted_choice = function(distribution) {
      const table=[];
      let i, j;
      for (i in distribution) {
        // The constant 10 below should be computed based on the
        // weights in the distribution for a correct and optimal table size.
        // E.g. the distribution {0:0.999, 1:0.001} will break this impl.
        for (j=0; j<distribution[i]*10; j++) {
          table.push(i);
        }
      }
      return function() {
        return table[Math.floor(random.random() * table.length)];
      }
    }

    const log = Math.log;
    const exp = Math.exp;

    // See Chabrier 2003
    system_mass = system_mass || 
        Units.SOLAR_MASS * exp(random.normal(log(0.2), 0.6));

    // system_ref_frame = 

    // semi major axis of system's galactic orbit 
    const galactic_sma = 3e4 * Units.LIGHT_YEAR;

    // 1/3 of binary stars have planets
    if (random.uniform(0,1) < 1/3){
        // mass of subsystem1 vs mass of other star
        const system_mass_ratio = exp(random.normal(log(0.2), 0.6)) / exp(random.normal(log(0.2), 0.6)) 
        // mass of each subsystem vs total system mass
        const subsystem1_mass_fraction = system_mass_ratio/(system_mass_ratio+1);
        const subsystem2_mass_fraction = 1.-subsystem1_mass_fraction;
        // mass of each subsystem
        const subsystem1 = StarSystemGenerator.generate(random, system_mass*subsystem1_mass_fraction);
        const subsystem2 = StarSystemGenerator.generate(random, system_mass*subsystem2_mass_fraction);

        // eccentricity of subsystems orbiting themselves
        const eccentricity = random.uniform(0,1) // TODO: model this as a beta distribution
        // semi major axis of subsystem1, from Malkov et al.
        const subsystem1_sma = Units.ASTRONOMICAL_UNIT * exp(random.normal(log(12), log(2))); 
        // semi major axis of subsystem2, given conservation of momentum/center of mass
        const subsystem2_sma = subsystem1_sma / system_mass_ratio;


        return new System({
            // TODO: galactic orbit
            motion: new Orbit({
                semi_major_axis: galactic_sma,
            }),
            children: [
                new System({
                    motion: new Orbit({
                        semi_major_axis: subsystem1_sma,
                        eccentricity: eccentricity,
                    }),
                    children: [subsystem1],
                }),

                new System({
                    motion: new Orbit({
                        semi_major_axis: subsystem2_sma,
                        eccentricity: eccentricity,
                    }),
                    children: [subsystem2],
                }),
            ],
        })
    }
}