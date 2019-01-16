
// TODO: try to get this to work with structs!
// See: http://www.lighthouse3d.com/tutorials/maths/ray-sphere-intersection/
void get_relation_between_ray_and_point(
	IN(vec3)   ray_origin, 
	IN(vec3)   ray_direction, 
	IN(vec3)   point_position, 
	OUT(float) distance_at_closest_approach2,
	OUT(float) distance_to_closest_approach 
){
	vec3 ray_to_point = point_position - ray_origin;
	
	distance_to_closest_approach = dot(ray_to_point, ray_direction);
	distance_at_closest_approach2 = 
		dot(ray_to_point, ray_to_point) - 
		distance_to_closest_approach * distance_to_closest_approach;
}

bool try_get_relation_between_ray_and_sphere(
	IN(vec3)   ray_origin, 
	IN(vec3)   ray_direction, 
	IN(vec3)   sphere_origin, 
	IN(float)  sphere_radius,
	OUT(float) distance_at_closest_approach2,
	OUT(float) distance_to_closest_approach, 
	OUT(float) distance_to_entrance,
	OUT(float) distance_to_exit
){
	get_relation_between_ray_and_point(
		ray_origin, ray_direction,
		sphere_origin, 
		distance_at_closest_approach2, distance_to_closest_approach
	);

	float sphere_radius2 = sphere_radius * sphere_radius;
	if (distance_at_closest_approach2 > sphere_radius2) 
		return false;

	float distance_from_closest_approach_to_exit = sqrt(sphere_radius2 - distance_at_closest_approach2);
	distance_to_entrance = distance_to_closest_approach - distance_from_closest_approach_to_exit;
	distance_to_exit     = distance_to_closest_approach + distance_from_closest_approach_to_exit;

	return true;
}
