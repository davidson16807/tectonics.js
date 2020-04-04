// PlantBiology is a namespace isolating all business logic relating to... er... plant biology
// This was written so I could decouple academic concerns (like how to model something mathematically) from architectural concerns (like how a model is represented through classes)
// All functions within the namespace are static and have no side effects
// The only data structures allowed are rasters and grid objects

const PlantBiology = {};

// Net Primary Productivity (NPP)
// This is the net amount of carbon assimilated by plants
// It is the gross primary productivity (GPP) minus the respiration of plants
// It is expressed as the fraction of an modeled maximum (3 kg m-2 yr-1).
// Derived using the Miami model (Lieth et al. 1972). A summary is provided by Grieser et al. 2006
// The model basically make two estimates of npp:
//     * npp based on precip in perfect conditions 
//     * npp based on temp in perfect conditions 
// The lower of the two estimates is the right one. This is the law of the minimum.
PlantBiology.net_primary_productivities = function(temp, precip, npp_max, result) {

    result = result || Float32Raster(temp.grid);
    const npp = result;

    // TODO: perf improvements
    let npp_temperature = 0;
    let npp_precip = 0;

    const exp = Math.exp;
    const min = Math.min;
    for (let i=0, li=temp.length; i<li; ++i) {
        npp_temperature     = 1./(1. + exp(1.315 - (0.5/4.) * (temp[i]-273.15)));                 //temperature limited npp
        npp_precip     = (1. - exp(-(precip[i])/800.));                             //drought limited npp
        npp[i]         = min(npp_temperature, npp_precip);         //realized npp, the most conservative of the two estimates
    }

    return result;
}
// Leaf area index (LAI)
// This is the amount of photosynthetically active leaf area per unit of ground surface area
// In other words, if I draw a vertical line through a plant canopy, 
// this is the average number of times it intersects with leaves. 
// 
// Explanation of model:
// 
// assume the following relation between LAI and light interception (P)
//        P = Pmax (1 - exp(-c lai))
//  (TODO: I got this equation from wikipedia, but there's no citation
//   find refs for this equation
//   https://en.wikipedia.org/wiki/Leaf_area_index)
//  
// assume P∝npp. This means:
//        k npp = 1 - exp(-c lai)
// 
// assume there are max values for npp and lai: "npp_max" and "lai_max"
//  so if npp=npp_max, then lai=lai_max. This can be modeled as:
//     npp/npp_max = (1 - exp(-c lai)) /
//                   (1 - exp(-c lai_max))
PlantBiology.leaf_area_indices = function(npp, npp_max, lai_max, result, growth_factor) {
    result = result || Float32Raster(npp.grid);
    
    const lai = result;

    //  This is a growth factor I haven't bothered parameterizing.
    //  If c=1/∞, then npp∝lai
    const c = growth_factor || 1;

    const exp = Math.exp;
    const ln = Math.log;

    // this is the factor we introduce so that npp=npp_max when lai=lai_max
    const k = 1-exp(-c*lai_max) / npp_max;

    for (let i=0, li=lai.length; i<li; ++i) {
        lai[i] = -ln(1 - k * npp[i])/c;
    }
    return lai;
}
