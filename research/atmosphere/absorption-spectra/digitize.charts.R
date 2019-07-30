# NOTE: 
# "here" is used to ensure to the correct working directory without using global paths
# "digitize" is used to extract point information from png charts
install.packages(c('here','digitize'))
setwd(here::here('research/atmosphere/absorption-spectra'))

#digitize charts manually
charts = lapply( list.files(pattern='png$'),  function(filename) { 
    chart = digitize::digitize(filename) 
    return(chart)
})
#convert x from wave number in 1/cm to wavelength in meters, and y from log10(cm^2/molecule) to m^2/molecule
charts = lapply( charts,  function(chart) { 
    chart$wavelength = 0.01/pmax(chart$x, 0)
    chart$cross.section = 1e-4 * 10^chart$y
    return(chart)
})

# some charts are not provided by HITRAN, 
# these are only meant to corroborate results from HITRAN
# and require custom logic for unit conversion

# H2O liquid
charts$`H2O-liquid.png`$wavelength = 10^(charts$`H2O-liquid.png`$x) * 1e-9
charts$`H2O-liquid.png`$cross.section = 10^(charts$`H2O-liquid.png`$y) / 2.686e25

# NO2 gas
charts$`NO2-vis.png`$wavelength = charts$`NO2-vis.png`$x * 1e-9
charts$`NO2-vis.png`$cross.section = 1e-4 * 1e-20 * 10^(charts$`NO2-vis.png`$y)

# plot comparisons between HITRAN and other sources to determine correctness
# H2O liquid
plot(charts$`H2O-liquid.png`$wavelength, charts$`H2O-liquid.png`$cross.section, log='xy')
points(charts$H2O.png$wavelength, charts$H2O.png$cross.section, col=2)

# NO2 visible
plot(charts$`NO2-vis.png`$wavelength, charts$`NO2-vis.png`$cross.section, log='xy')
plot(charts$`NO2.png`$wavelength, charts$`NO2.png`$cross.section, log='xy')



# save, for the love of god, save
save(charts, file='charts.Rdata')

# NOTE TO SELF: nitrous oxide calibration was messed up during the last digitization effort