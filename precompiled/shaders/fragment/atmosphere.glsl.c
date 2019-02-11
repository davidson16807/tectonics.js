#define GL_ES
#include "precompiled/shaders/academics/cross_platform_macros.glsl.c"
#include "precompiled/shaders/academics/units.glsl.c"
#include "precompiled/shaders/academics/math/constants.glsl.c"
#include "precompiled/shaders/academics/math/geometry.glsl.c"
#include "precompiled/shaders/academics/physics/constants.glsl.c"
#include "precompiled/shaders/academics/physics/emission.glsl.c"
#include "precompiled/shaders/academics/physics/scattering.glsl.c"
#include "precompiled/shaders/academics/psychophysics.glsl.c"
#include "precompiled/shaders/academics/electronics.glsl.c"


varying vec2  vUv;
uniform sampler2D surface_light;

// Determines the length of a unit of distance within the view, in meters, 
// it is generally the radius of whatever planet's the focus for the scene.
// The view uses different units for length to prevent certain issues with
// floating point precision. 
uniform float reference_distance;

// CAMERA PROPERTIES -----------------------------------------------------------
uniform mat4  projection_matrix_inverse;
uniform mat4  view_matrix_inverse;

// WORLD PROPERTIES ------------------------------------------------------------
// location for the center of the world, in meters
// currently stuck at 0. until we support multi-planet renders
uniform vec3  world_position;
// radius of the world being rendered, in meters
uniform float world_radius;

// LIGHT SOURCE PROPERTIES -----------------------------------------------------
uniform vec3 light_rgb_intensity;
uniform vec3 light_direction;

// ATMOSPHERE PROPERTIES -------------------------------------------------------
uniform vec3 atmosphere_scale_heights;
uniform vec3 atmosphere_surface_rayleigh_scattering_coefficients; 
uniform vec3 atmosphere_surface_mie_scattering_coefficients; 
uniform vec3 atmosphere_surface_absorption_coefficients; 

vec3 get_density_ratios_at_height_in_atmosphere(
    float height, 
    vec3 atmosphere_scale_heights
){
    return exp(-height/atmosphere_scale_heights);
}


float get_h(float x, float xR, float z2, float R){
    float xfull = x + xR;
    return sqrt(max(xfull*xfull + z2,0.)) - R;
}
float get_dhdx(float x, float xR, float z2){
    float xfull = x + xR;
    return xfull / sqrt(max(xfull*xfull + z2,0.));
}
float approx_h(float x, float xm, float xb, float xR, float z2, float R){
    return get_dhdx(xm,xR,z2) * (x-xb) + get_h(xb,xR,z2,R);
}
float approx_sigma_from_samples(float x, float xm, float xb, float xR, float z2, float R, float H){
    return -H/get_dhdx(xm,xR,z2) * exp(-approx_h(x,xm,xb,xR,z2,R)/H);
}
float approx_sigma_for_segment(float x, float xmin, float dx, float xR, float z2, float R, float H){
    const float fm = 0.5;
    const float fb = 0.2;

    float xm   = xmin + fm*dx;
    float xb   = xmin + fb*dx;
    float xmax = xmin +    dx;

    return approx_sigma_from_samples(clamp(x, xmin, xmax), xm, xb, xR, z2,R,H);
}
float approx_sigma_for_absx(float x, float sigma0, float z2, float R, float H){
    const float nH = 12.0;

    float xR = sqrt(max(R*R - z2, 0.));

    float rtop = nH*H+R;
    float xtop = sqrt(max(rtop*rtop - z2, 0.)) - xR;
    float dx = xtop/3.;
    float absx = abs(x);

    return 
        approx_sigma_for_segment(absx, 0., dx, xR,z2,R,H) +
        approx_sigma_for_segment(absx, dx, dx, xR,z2,R,H) -
        sigma0;
}
float approx_sigma0(float z2, float R, float H){
    return approx_sigma_for_absx(0., 0., z2, R, H);
}
float approx_sigma(float x, float sigma0, float z2, float R, float H){
    return sign(x) * approx_sigma_for_absx(x, sigma0, z2, R, H);
}

vec3 get_rgb_intensity_of_light_rays_through_atmosphere(
    vec3 view_origin, vec3 view_direction,
    vec3 world_position, float world_radius,
    vec3 light_direction, vec3 light_rgb_intensity,
    vec3 background_rgb_intensity,
    vec3 atmosphere_scale_heights,
    vec3 beta_ray,
    vec3 beta_mie,
    vec3 beta_abs
){

    float unused1, unused2, unused3, unused4;


    bool  view_is_obscured;   // whether view ray will strike the surface of a world
    bool  view_is_obstructed; // whether view ray will strike the surface of a world
    float view_z2;            // distance ("radius") from the view ray to the center of the world at closest approach, squared; never used, but may in the future
    float view_x_z;           // distance along the view ray at which closest approach occurs
    float view_x_enter_atmo;  // distance along the view ray at which the ray enters the atmosphere, never used
    float view_x_exit_atmo;   // distance along the view ray at which the ray exits the atmosphere
    float view_x_strike_world;// distance along the view ray at which the ray strikes the surface of the world

    const float VIEW_STEP_COUNT = 16.;// number of steps taken while marching along the view ray
    float view_dx;            // distance between steps while marching along the view ray
    float view_x;             // distance traversed while marching along the view ray
    float view_h;             // distance ("height") from the surface of the world while marching along the view ray
    vec3  view_pos;           // absolute position while marching along the view ray
    vec3  view_sigma;         // columnar density ratios for rayleigh and mie scattering, found by marching along the view ray. This expresses the quantity of air encountered along the view ray, relative to air density on the surface

    bool  light_is_obscured;  // whether light ray will strike the surface of a world
    bool  light_is_obstructed;// whether light ray will strike the surface of a world
    float light_z2;           // distance ("radius") from the light ray to the center of the world at closest approach, squared
    float light_x_z;          // distance along the light ray at which closest approach occurs
    float light_x_enter_atmo; // distance along the light ray at which the ray enters the atmosphere
    float light_x_strike_world;// distance along the light ray at which the ray strikes the surface of the world
    float light_x_exit_atmo;  // distance along the light ray at which the ray exits the atmosphere
    float light_x_exit_world; // distance along the light ray at which the ray would exit the world, if it could pass through

    const float light_STEP_COUNT = 8.;// number of steps taken while marching along the light ray
    float light_dx;           // distance between steps while marching along the light ray
    float light_x;            // distance traversed while marching along the light ray
    float light_h;            // distance ("height") from the surface of the world while marching along the light ray
    vec3  light_pos;          // absolute position while marching along the light ray
    vec3  light_sigma;        // columnar density ratios for rayleigh and mie scattering, found by marching along the light ray. This expresses the quantity of air encountered along the light ray, relative to air density on the surface


    // cosine of angle between view and light directions
    float cos_scatter_angle = dot(view_direction, light_direction); 

    // fraction of outgoing light transmitted across a given path
    vec3 fraction_outgoing = vec3(0);

    // fraction of incoming light transmitted across a given path
    vec3 fraction_incoming   = vec3(0);

    // total intensity for each color channel, found as the sum of light intensities for each path from the light source to the camera
    vec3  total_rgb_intensity = vec3(0); 

    // Rayleigh and Mie phase factors,
    // A.K.A "gamma" from Alan Zucconi: https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-3/
    // This factor indicates the fraction of sunlight scattered to a given angle (indicated by its cosine, A.K.A. "cos_scatter_angle").
    // It only accounts for a portion of the sunlight that's lost during the scatter, which is irrespective of wavelength or density
    // The rest of the fractional loss is accounted for by the variable "betas", which is dependant on wavelength, 
    // and the density ratio, which is dependant on height
    // So all together, the fraction of sunlight that scatters to a given angle is: beta(wavelength) * gamma(angle) * density_ratio(height)
    float gamma_ray = get_rayleigh_phase_factor(cos_scatter_angle);
    float gamma_mie = get_henyey_greenstein_phase_factor(cos_scatter_angle);
    float gamma_abs = 0.; // NOT USED YET

    // NOTE: 3 scale heights should capture ~95% of the atmosphere's mass,  
    //   so this should be enough to be aesthetically appealing.
    float atmosphere_height = 12. * max(atmosphere_scale_heights.x, atmosphere_scale_heights.y);

    view_is_obscured   = try_get_relation_between_ray_and_sphere(
        view_origin,     view_direction,
        world_position,  world_radius + atmosphere_height,
        unused1,         unused2, 
        view_x_enter_atmo,    view_x_exit_atmo
    );
    view_is_obstructed = try_get_relation_between_ray_and_sphere(
        view_origin,     view_direction,
        world_position,  world_radius,
        unused1,         unused2,
        view_x_strike_world,   unused3 
    );

    if (view_is_obstructed)
    {
        view_x_exit_atmo = view_x_strike_world;
    }

    view_dx = (view_x_exit_atmo - view_x_enter_atmo) / VIEW_STEP_COUNT;
    view_x  =  view_x_enter_atmo + 0.5 * view_dx;
    view_sigma = vec3(0.);

    for (float i = 0.; i < VIEW_STEP_COUNT; ++i)
    {
        view_pos = view_origin + view_direction * view_x;
        view_h   = length(view_pos - world_position) - world_radius;

        view_sigma += view_dx * exp(-view_h/atmosphere_scale_heights);

        if (!view_is_obscured)
        {
            // continue;
        }

        light_is_obscured = try_get_relation_between_ray_and_sphere( 
            view_pos,            light_direction,
            world_position,      world_radius + atmosphere_height,
            light_z2,            light_x_z, 
            light_x_enter_atmo,  light_x_exit_atmo 
        );
        light_is_obstructed = try_get_relation_between_ray_and_sphere( 
            view_pos,            light_direction,
            world_position,      world_radius,
            unused1,             unused2,
            light_x_strike_world,light_x_exit_world
        );

        // check if light will eventually intersect with the ground
        if (light_is_obstructed)
        {
            // continue;
        }



        light_dx = (light_x_exit_atmo-light_x_z) / light_STEP_COUNT;
        light_x  = 0.5 * light_dx;
        vec3   light_sigma2 = vec3(0.);
        light_sigma = vec3(0.);
        for (float j = 0.; j < light_STEP_COUNT; ++j)
        {
            light_pos = view_pos + light_direction * light_x;
            light_h   = length(light_pos - world_position) - world_radius;
            light_sigma += light_dx * exp(-light_h/atmosphere_scale_heights);
            light_x += light_dx;
        }


        vec3  H = atmosphere_scale_heights;
        float R = world_radius;
        float rtop = world_radius+12.*H.x;
        float z2 = light_z2;
        float r    = length(view_pos - world_position);
        float xR   = sqrt(max(R*R - z2, 0.));
        float x    = -light_x_z;
        // r is the distance from the center of the world at which we check for scattered light
        // R is the radius of the world
        // if r<R, then the position we're sampling from is inside the planet, 
        // so no light scatters and no past this point can reach the camera
        // 
        // NOTE: please consider this line if checking for multiple light sources 
        //   within the same viewray raymarching loop, it could cause insidious problems
        if (r<R)
        {
            break;
        }
        // if the light ray from the point of scatter encounters the surface of the planet,
        // no light will reach the sample point
        // this doesn't necessarily mean that light past this point will scatter 
        // (at least I haven't proven otherwise - need to think about this more)
        if (light_is_obstructed)
        {
            continue;
        }
        // if (r<rtop &&  - light_x_exit_world > 30.*H.x)
        // { 
        //     total_rgb_intensity += vec3(3,0,0);
        // }

        // float sigma0x = approx_sigma0(z2, R, H.x);
        // float sigma0y = approx_sigma0(z2, R, H.y);
        // float sigma0z = approx_sigma0(z2, R, H.z);
        // float sigma = 
        //     approx_sigma( light_x_exit_atmo -light_x_exit_world, sigma0x, z2, R, H.x)-
        //     approx_sigma(                   -light_x_exit_world, sigma0x, z2, R, H.x);
        // if (exp(-beta_ray.r * (view_sigma.x + sigma)) < 1.)
        // { 
        //     total_rgb_intensity += vec3(3,0,0);
        // }
        
        // light_sigma = vec3(
            // 0.,
            // remember: all values passed to approx_sigma() are distances relative to *planet's surface*
            // approx_sigma( light_x_exit_atmo -light_x_exit_world, sigma0x, z2, R, H.x)-
            // approx_sigma(                   -light_x_exit_world, sigma0x, z2, R, H.x),
            // 0.,
            // approx_sigma(10.*R,   sigma0y, z2, R, H.y)-
            // approx_sigma(x-xR,    sigma0y, z2, R, H.y),
            // 0.
        // );



        fraction_outgoing    = exp(-beta_ray * (view_sigma.x + light_sigma.x) - beta_abs * view_sigma.z);
        fraction_incoming    = beta_ray * gamma_ray * view_dx * exp(-view_h/atmosphere_scale_heights.x);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

        fraction_outgoing    = exp(-beta_mie * (view_sigma.y + light_sigma.y) - beta_abs * view_sigma.z);
        fraction_incoming    = beta_mie * gamma_mie * view_dx* exp(-view_h/atmosphere_scale_heights.y);
        total_rgb_intensity += light_rgb_intensity * fraction_incoming * fraction_outgoing;

        view_x += view_dx;
    }

    //// now calculate intensity of light that traveled straight in from the background, and add it to the total
    fraction_outgoing = exp(-beta_abs * (view_sigma.z));
    total_rgb_intensity += background_rgb_intensity * fraction_outgoing;

    return total_rgb_intensity;
}

vec2 get_chartspace(vec2 bottomleft, vec2 topright, vec2 screenspace){
    return screenspace * abs(topright - bottomleft) + bottomleft;
}

vec3 line(float y, vec2 chartspace, float line_width, vec3 line_color){
    return abs(y-chartspace.y) < line_width? line_color : vec3(1.);
}

vec3 chart_scratch(vec2 screenspace){
    vec2 bottomleft = vec2(-500e3, -100e3);
    vec2 topright   = vec2( 500e3,  100e3);
    vec2 chartspace = get_chartspace(bottomleft, topright, screenspace);
    float line_width = 0.01 * abs(topright - bottomleft).y;

    float z = 6.35e6;
    float z2 = z*z;
    float light_x_strike_world = sqrt(max(world_radius*world_radius - z2, 0.));
    float sigma0 = approx_sigma0(z2, world_radius, atmosphere_scale_heights.x);
    float closed_form_approximation = approx_sigma(chartspace.x, sigma0, z2, world_radius, atmosphere_scale_heights.x);

    const float LIGHT_STEP_COUNT = 8.;
    float light_dx = (chartspace.x) / LIGHT_STEP_COUNT;
    float light_x  = 0.5 * light_dx;
    float light_h = 0.;
    float iterative_approximation = 0.;
    for (float j = 0.; j < LIGHT_STEP_COUNT; ++j)
    {
        light_h = sqrt((light_x+light_x_strike_world)*(light_x+light_x_strike_world) + z2) - world_radius;

        iterative_approximation += light_dx * exp(-light_h/atmosphere_scale_heights.x);

        light_x += light_dx;
    }

    return 
        line(iterative_approximation,   chartspace, line_width, vec3(1,0,0)) * 
        line(closed_form_approximation, chartspace, line_width, vec3(0,1,0));
}

void main() {
    vec2  screenspace   = vUv;
    gl_FragColor = vec4(chart_scratch(screenspace), 1);
    // return;

    vec2  clipspace     = 2.0 * screenspace - 1.0;
    vec3  view_direction = normalize(view_matrix_inverse * projection_matrix_inverse * vec4(clipspace, 1, 1)).xyz;
    vec3  view_origin    = view_matrix_inverse[3].xyz * reference_distance;

    float AESTHETIC_FACTOR1 = 0.5;
    vec4  background_rgb_signal    = texture2D( surface_light, vUv );
    vec3  background_rgb_intensity = AESTHETIC_FACTOR1 * light_rgb_intensity * get_rgb_intensity_of_rgb_signal(background_rgb_signal.rgb);
        
    vec3 rgb_intensity = get_rgb_intensity_of_light_rays_through_atmosphere(
        view_origin,                view_direction,
        world_position,             world_radius,
        light_direction,            light_rgb_intensity,  // light direction and rgb intensity
        background_rgb_intensity,
        atmosphere_scale_heights,
        atmosphere_surface_rayleigh_scattering_coefficients, 
        atmosphere_surface_mie_scattering_coefficients, 
        vec3(0.)// atmosphere_surface_absorption_coefficients 
        
    );

    // rgb_intensity = 1.0 - exp2( rgb_intensity * -1.0 ); // simple tonemap

    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_direction),1), 0.5);
    // return;
    // if (!is_interaction) {
    //  gl_FragColor = vec4(0);
    //  return;
    // } 
    // gl_FragColor = mix(background_rgb_signal, vec4(normalize(view_origin),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(vec3(distance_to_exit/reference_distance/5.),1), 0.5);
    // gl_FragColor = mix(background_rgb_signal, vec4(10.0*get_rgb_signal_of_rgb_intensity(rgb_intensity),1), 0.5);
    float AESTHETIC_FACTOR2 = 0.1;
    gl_FragColor = vec4(AESTHETIC_FACTOR2*get_rgb_signal_of_rgb_intensity(rgb_intensity),1);
    // gl_FragColor = background_rgb_signal;


    // NOTES:
    // solids are modeled as a gas where attenuation coefficient is super high
    // space is   modeled as a gas where attenuation coefficient is super low
}
