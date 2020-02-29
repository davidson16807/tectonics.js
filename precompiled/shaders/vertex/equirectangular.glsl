#include "precompiled/shaders/vertex/template.glsl"

float lon(vec3 pos) {
    return atan(-pos.z, pos.x) + PI;
}
float lat(vec3 pos) {
    return asin(pos.y / length(pos));
}

void main() {
    displacement_v = displacement;
    gradient_v = gradient;
    plant_coverage_v = plant_coverage;
    surface_temperature_v = surface_temperature;
    snow_coverage_v = snow_coverage;
    scalar_v = scalar;
    position_v = modelMatrix * vec4( position, 1.0 );

    float height = displacement > sealevel? 0.005 : 0.0;
    
    float index_offset = map_projection_offset;
    float focus = lon(cameraPosition) + index_offset;
    float lon_focused = mod(lon(position_v.xyz) - focus, 2.*PI) - PI;
    float lat_focused = lat(position_v.xyz); //+ (map_projection_offset*PI);
    bool is_on_edge = lon_focused >  PI*0.9 || lon_focused < -PI*0.9;
    
    vec4 displaced = vec4(
        lon_focused + index_offset,
        lat(position_v.xyz), //+ (map_projection_offset*PI), 
        is_on_edge? 0. : length(position), 
        1);
    mat4 scaleMatrix = mat4(1);
    scaleMatrix[3] = viewMatrix[3] * reference_distance / world_radius;
    gl_Position = projectionMatrix * scaleMatrix * displaced;
    
    view_direction_v = -position_v.xyz;
    view_direction_v.y = 0.;
    view_direction_v = normalize(view_direction_v);
    
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
    view_origin_v.y = 0.;
    view_origin_v = normalize(view_origin_v);
}