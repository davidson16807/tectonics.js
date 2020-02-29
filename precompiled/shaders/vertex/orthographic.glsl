#include "precompiled/shaders/vertex/template.glsl"

void main() {
    displacement_v = displacement;
    gradient_v = gradient;
    plant_coverage_v = plant_coverage;
    snow_coverage_v = snow_coverage;
    surface_temperature_v = surface_temperature;
    scalar_v = scalar;
    vector_fraction_traversed_v = vector_fraction_traversed;
    position_v = modelMatrix * vec4( position, 1.0 );
    
    float surface_height = max(displacement - sealevel, 0.);
    vec4 displacement = vec4( position * (world_radius + surface_height) / reference_distance, 1.0 );
    gl_Position = projectionMatrix * modelViewMatrix * displacement;
    
    vec2 clipspace = gl_Position.xy / gl_Position.w;
    view_direction_v = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    view_origin_v = view_matrix_inverse[3].xyz * reference_distance;
}