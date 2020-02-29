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
    snow_coverage_v = snow_coverage;
    surface_temperature_v = surface_temperature;
    scalar_v = scalar;
    position_v = modelMatrix * vec4( position, 1.0 );
    
    float index_offset = map_projection_offset;
    float focus = lon(cameraPosition) + index_offset;
    float lon_focused = mod(lon(position_v.xyz) - focus, 2.*PI) - PI + index_offset;
    float lat_focused = lat(position_v.xyz); //+ (map_projection_offset*PI);

    float height = displacement > sealevel? 0.005 : 0.0;
    gl_Position = vec4(
        lon_focused / PI,
        lat_focused / (PI/2.), 
        -height, 
        1);
    
    view_direction_v = -position_v.xyz;
    view_direction_v.y = 0.;
    view_direction_v = normalize(view_direction_v);
    
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
    view_origin_v.y = 0.;
    view_origin_v = normalize(view_origin_v);
}