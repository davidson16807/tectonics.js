FUNC(float) get_surface_area_of_sphere(
	IN(float) radius
) {
	return 4.*PI*radius*radius;
}

// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
FUNC(void) get_relation_between_ray_and_point(
	IN(vec3)   point_position, 
	IN(vec3)   ray_origin, 
	IN(vec3)   ray_direction, 
	OUT(float) distance_at_closest_approach2,
	OUT(float) distance_to_closest_approach 
){
	vec3 ray_to_point = point_position - ray_origin;
	
	distance_to_closest_approach = dot(ray_to_point, ray_direction);
	distance_at_closest_approach2 = 
		dot(ray_to_point, ray_to_point) - 
		distance_to_closest_approach * distance_to_closest_approach;
}

FUNC(bool) try_get_relation_between_ray_and_sphere(
	IN(float)  sphere_radius,
	IN(float)  distance_at_closest_approach2,
	IN(float)  distance_to_closest_approach, 
	OUT(float) distance_to_entrance,
	OUT(float) distance_to_exit
){
	VAR(float) sphere_radius2 = sphere_radius * sphere_radius;

	VAR(float) distance_from_closest_approach_to_exit = sqrt(max(sphere_radius2 - distance_at_closest_approach2, 1e-10));
	distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
	distance_to_exit     = distance_to_closest_approach + distance_from_closest_approach_to_exit;

	return (distance_to_exit > 0. && distance_at_closest_approach2 < sphere_radius*sphere_radius);
}
