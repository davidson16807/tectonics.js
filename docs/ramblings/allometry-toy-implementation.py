#🦕📏

1600 N/(2*pi*(4.5cm)^2) = 125kPa // human
70000 N/(4*pi*(21cm)^2) = 127kPa // elephant
19000 kN / (1*pi*(5.5m)^2) = 200kPa // general sherman

7000 kg / (980 kg/m^3) = 7.1m^3 // elephant volume
(7.1m^3 *3/(4*pi))^(1/3) = 1.19 meters // elephant radius
4*pi*(1.19m)^2 = 17.8 meters^2 // elephant body surface area
2*2.3m^2 // elephant ear surface area
==
(2*2.0m^2 + 17.8m^2) * (35.8C - 30C) / ( 7.1m^3) = 17.8 K/m // elephant thermal conductivity proxy
===
function leg_width(
		compressive_strength, // pascals
		body_mass, // kg
		leg_count, // unitless
		surface_gravity, // m/s^2
	) {
		var force = body_mass * surface_gravity;
		var leg_area = force / (compressive_strength * Math.PI);
		var leg_width = 2*Math.sqrt(leg_area / leg_count);
		return leg_width;
}
>=
function radiator_area(body_temp, air_temp, body_mass, density) {
	// consider a spherical cow...
	var volume = body_mass / density;
	var radius = Math.pow(volume * (3/4) / Math.PI, 1/3);
	var surface_area = 4 * Math.PI * Math.pow(radius, 2);

	var temp_differential = (body_temp - air_temp)
	var thermal_conductivity_proxy = 17.8

	var target_surface_area = volume * thermal_conductivity_proxy / temp_differential
	return target_surface_area - surface_area;
}