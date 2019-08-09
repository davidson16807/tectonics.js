# NOTE: 
# "here" is used to ensure to the correct working directory without using global paths
# "digitize" is used to extract point information from png charts
# install.packages(c('here','digitize'))
# setwd(here::here('research/atmosphere/absorption-spectra'))

#digitize charts manually

# what follows are a bunch of functions for fast, crude, well-behaved approximations

# The Zucconni "bump" function is a convenient way to model bell shaped functions
# it's easy to parameterize, integrate, understand, and compute
bump = function(x, edge0, edge1, height){
    center = (edge1 + edge0) / 2.;
    width = (edge1 - edge0) / 2.;
    offset = (x - center) / width;
    return( height * pmax(1. - offset * offset, 0.) )
}
# "clamp" returns the closest approximation of x that exists between lo and hi
clamp = function(x,lo,hi) {
    return(pmin(pmax(x, lo), hi))
}
# "linearstep" returns a fraction indicating how far in x is between lo and hi
#  it can be used with "mix" to easily interpolate between values
linearstep = function(lo, hi, x){
    return(clamp((x - lo) / (hi - lo), 0.0, 1.0));
}
# "lerp" performs basic Linear piecewise intERPolation:
#  given a list of control points mapping 1d space to 1d scalars, 
#  and a point in 1d space, returns a 1d scalar that maps to the point
lerp = function(control_point_x, control_point_y, x) {
    return(sapply(x,function(xi) {
                outi = control_point_y[1];
                for (i in 2:length(control_point_x)) {
                    outi = mix(outi, control_point_y[i], linearstep(control_point_x[i-1], control_point_x[i], xi));
                }
                return(outi)
            }
        )
    );
}
mix = function(x, y, a) {
    return(x*(1.-a) + y*a);
}

load('big-charts.Rdata')
x=seq(0, 5e8, length.out = 30000)

#convert x from wave number in 1/cm to wavenumber in 1/meter, and y from log10(cm^2/molecule) to m^2/molecule
charts = lapply( charts,  function(chart) { 
    chart$wavenumber = 100*chart$V1
    chart$cross.section = 1e-4 * chart$V2
    return(chart)
})
# some charts are not provided by HITRAN
# they're there to corroborate HITRAN and fill in gaps
# they require custom logic for unit conversion
charts$`H2O-liquid.png` = digitize::digitize('H2O-liquid.png')
charts$`H2O-liquid.png`$wavenumber = 1/(10^(charts$`H2O-liquid.png`$x) * 1e-9)
charts$`H2O-liquid.png`$cross.section = 10^(charts$`H2O-liquid.png`$y) / 2.686e25

charts$`H2O-1.jpg` = digitize::digitize('H2O-1.jpg')
charts$`H2O-1.jpg`$wavenumber = 1/(charts$`H2O-1.jpg`$x * 1e-9)
charts$`H2O-1.jpg`$cross.section = 1e-4 * (charts$`H2O-1.jpg`$y)

charts$`H2O-2.jpg` = digitize::digitize('H2O-2.jpg')
charts$`H2O-2.jpg`$wavenumber = 1/(charts$`H2O-2.jpg`$x * 1e-9)
charts$`H2O-2.jpg`$cross.section = 1e-4 * 10^(charts$`H2O-2.jpg`$y)

chart.name='H2O.txt'; with(charts[[chart.name]], plot(wavenumber, log10(cross.section), main=chart.name, type='lines', 
    xlim=c(0,3e8), ylim=c(-36,-18)))
with(charts$`H2O-liquid.png`, points(wavenumber, log10(cross.section), type='lines', col=3))
with(charts$`H2O-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=4))
with(charts$`H2O-2.jpg`, points(wavenumber, log10(cross.section), type='lines', col=5))
lines(x, lerp(c(0,  100, 2.1e6, 2.7e6, 6e6,   1.3e7, 2e8  ), 
              c(-26,-24, -31.5, -29.5, -21.5, -20.5, -22.5), x)
        + lerp(c(0,4e6), c(4,0), x)*sin(x*2*pi*6/1e6)
        , col=2)

# O3 gas
charts$`O3-1.png` = digitize::digitize('O3-1.png')
charts$`O3-1.png`$wavenumber = 1/(charts$`O3-1.png`$x * 1e-9)
charts$`O3-1.png`$cross.section = 1e-4 * 10^(charts$`O3-1.png`$y)

charts$`O2O3-O2.png` = digitize::digitize('O2O3.png')
charts$`O2O3-O2.png`$wavenumber = 1/(charts$`O2O3-O2.png`$x * 1e-9)
charts$`O2O3-O2.png`$cross.section = 10^(charts$`O2O3-O2.png`$y)

charts$`O2O3-O3.png` = digitize::digitize('O2O3.png')
charts$`O2O3-O3.png`$wavenumber = 1/(charts$`O2O3-O3.png`$x * 1e-9)
charts$`O2O3-O3.png`$cross.section = 10^(charts$`O2O3-O3.png`$y)

charts$`O3-2.png` = digitize::digitize('O3-2.png')
charts$`O3-2.png`$wavenumber = 1/(charts$`O3-2.png`$x * 1e-9)
charts$`O3-2.png`$cross.section = 1e-4 * 10^(charts$`O3-2.png`$y)

with(charts$`O3.txt`, plot(wavenumber, log10(cross.section), main='O3', type='lines', xlim=c(0,1.5e7), ylim=c(-36,-20)))
with(charts$`O2O3-O2.png`, points(wavenumber, log10(cross.section), type='lines', col=3))
with(charts$`O2O3-O3.png`, points(wavenumber, log10(cross.section), type='lines', col=4))
with(charts$`O3-1.png`,    points(wavenumber, log10(cross.section), type='lines', col=5))
with(charts$`O3-2.png`,    points(wavenumber, log10(cross.section), type='lines', col=6))
# O3 estimate
lines(x, lerp(c(0,  2e5,7e5,9e5,1.6e6,2e6,2.5e6,2.8e6,3e6,3.5e6,4.6e6,6e6,7.7e6,1.2e7), 
              c(-28,-26,-31,-28,-24,  -25,-27,  -24.5,-23,-21,  -22.5,-22,-21,  -21  ), x), col=2)
# O2 estimate
lines(x, lerp(c(3e6, 3.5e6, 4.8e6, 6.1e6, 7.3e6, 8.1e6, 9.6e6, 1.2e7), 
              c(-35, -26.8, -26.5, -21.3, -20.8, -22.3, -23.3, -22.0), x), col=2)

charts$`CO2-1.jpg` = digitize::digitize('CO2-1.jpg')
charts$`CO2-1.jpg`$wavenumber = 1/(charts$`CO2-1.jpg`$x * 1e-9)
charts$`CO2-1.jpg`$cross.section = 1e-4 * 10^(charts$`CO2-1.jpg`$y)

with(charts$`CO2.txt`, plot(wavenumber, log10(cross.section), main='CO2', type='lines', xlim=c(0,1e8), ylim=c(-36,-20)))
with(charts$`CO2-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
lines(x, lerp(c( 0,  1.5e6,5e6,  6.6e6,7.5e6,9e6,  4.7e7,1.5e8,5e8,2e9), 
              c(-26,-34,  -30.5,-22.5,-22,   -20.5,-21,  -22,  -23,-26), x), col=2)

charts$`CH4-1.jpg` = digitize::digitize('CH4-1.jpg')
charts$`CH4-1.jpg`$wavenumber = 1/(charts$`CH4-1.jpg`$x * 1e-9)
charts$`CH4-1.jpg`$cross.section = 1e-4 * 10^(charts$`CH4-1.jpg`$y)

charts$`CH4-2.jpg` = digitize::digitize('CH4-2.jpg')
charts$`CH4-2.jpg`$wavenumber = 1/(charts$`CH4-2.jpg`$x * 1e-9)
charts$`CH4-2.jpg`$cross.section = 1e-4 * (charts$`CH4-2.jpg`$y) * 1e-17

charts$`CH4-3.jpg` = digitize::digitize('CH4-3.jpg')
charts$`CH4-3.jpg`$wavenumber = 1/(charts$`CH4-3.jpg`$x * 1e-9)
charts$`CH4-3.jpg`$cross.section = 1e-4 * 10^(charts$`CH4-3.jpg`$y)

with(charts$`CH4.txt`,   plot(wavenumber,   log10(cross.section), main='CH4', type='lines', xlim=c(0,8e7), ylim=c(-36,-20)))
with(charts$`CH4-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
with(charts$`CH4-2.jpg`, points(wavenumber, log10(cross.section), type='lines', col=4))
with(charts$`CH4-3.jpg`, points(wavenumber, log10(cross.section), type='lines', col=5))
lines(x, lerp(c(3.7e4, 2.9e5, 1.9e6, 2.3e6, 2.4e6, 6.2e6, 7.6e6, 1e7, 7e7), 
              c(-31,   -25,   -31,   -31,   -31,   -27,   -21,   -20.3, -22.5), x)
         # * abs(sin(x/(2*170e3))) 
         ,col=2)

charts$`N2-1.jpg` = digitize::digitize('N2-1.jpg')
charts$`N2-1.jpg`$wavenumber = 1/(charts$`N2-1.jpg`$x * 1e-9)
charts$`N2-1.jpg`$cross.section = 1e-4 * 10^(charts$`N2-1.jpg`$y)

with(charts$`N2.txt`,   plot(wavenumber,   log10(cross.section), main='N2', type='lines', xlim=c(0,3e9), ylim=c(-36,-20)))
with(charts$`N2-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
lines(x, lerp(c(6.5e6, 1e7,   8e7,   1e9), 
              c(-35,   -20.5, -21.5, -23), x)
         # * abs(sin(x/(2*170e3))) 
         ,col=2)

charts$`H2-1.jpg` = digitize::digitize('H2-1.jpg')
charts$`H2-1.jpg`$wavenumber = 1/(charts$`H2-1.jpg`$x * 1e-9)
charts$`H2-1.jpg`$cross.section = 1e-4 * 10^(charts$`H2-1.jpg`$y)

with(charts$`H2.txt`,   plot(wavenumber,   log10(cross.section), main='H2', type='lines', xlim=c(0,7e7), ylim=c(-36,-20)))
with(charts$`H2-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
lines(x, lerp(c(5e6,  1e7,   2.6e7, 5.7e7), 
              c(-35,  -20.6, -21.6, -22.6), x)
         # * abs(sin(x/(2*170e3))) 
         ,col=2)

charts$`C2H6-1.jpg` = digitize::digitize('C2H6-1.jpg')
charts$`C2H6-1.jpg`$wavenumber = 1/(charts$`C2H6-1.jpg`$x * 1e-9)
charts$`C2H6-1.jpg`$cross.section = 1e-4 * 10^(charts$`C2H6-1.jpg`$y)

with(charts$`C2H6.txt`,   plot(wavenumber,   log10(cross.section), main='C2H6', type='lines', xlim=c(0,1e9), ylim=c(-36,-20)))
with(charts$`C2H6-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
lines(x, lerp(c(5.6e6, 7.6e6, 1.2e7, 5.3e7, 1.9e8), 
              c(-35,   -20.6, -20,   -21.5, -22.6), x)
         # * abs(sin(x/(2*170e3))) 
         ,col=2)

charts$`N2O-1.jpg` = digitize::digitize('N2O-1.jpg')
charts$`N2O-1.jpg`$wavenumber = 1/(charts$`N2O-1.jpg`$x * 1e-9)
charts$`N2O-1.jpg`$cross.section = 1e-4 * 10^(charts$`N2O-1.jpg`$y)

charts$`N2O-2.jpg` = digitize::digitize('N2O-2.jpg')
charts$`N2O-2.jpg`$wavenumber = 1/(charts$`N2O-2.jpg`$x * 1e-9)
charts$`N2O-2.jpg`$cross.section = 1e-4 * 10^(charts$`N2O-2.jpg`$y)

with(charts$`N2O.txt`,   plot(wavenumber,   log10(cross.section), main='N2O', type='lines', xlim=c(0,1e9), ylim=c(-36,-20)))
with(charts$`N2O-1.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
with(charts$`N2O-2.jpg`, points(wavenumber, log10(cross.section), type='lines', col=3))
lines(x, lerp(c(5e4, 6e4, 2.6e5, 7.7e5, 2.7e6, 7.6e6, 7.8e7, 2.1e8, 4.4e8), 
              c(-35, -25, -24.4, -29,   -35,   -20.4, -21.4, -22.4, -21.8), x)
         # * abs(sin(x/(2*170e3))) 
         ,col=2)

# save, for the love of god, save
save(charts, file='charts.Rdata')

# NOTE TO SELF: nitrous oxide calibration was messed up during the last digitization effort