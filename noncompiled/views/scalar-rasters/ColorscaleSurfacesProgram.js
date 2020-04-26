/*
A "ColorscaleSurfacesProgram" seals off access to resources relating to a WebGLProgram
within a WebGL Context, allowing view state to be managed statelessly elsewhere. 

It guarantees the following:
* all internal resources are created on initialization to minimize state (RAII)
* all internal resources are strictly encapsulated
* the program can be in only one of two states: "created" and "disposed"
* the disposed state can be entered at any time but never exited
* all methods will continue to produce sensible behavior in the disposed state
* the output that draw() sends to the currently bound framebuffer is 
  a pure function of its input

Any attempt to relax guarantees made here will severely cripple 
your ability to reason with the code base. 
*/
const ColorscaleType = {
    Heatscale: 0,
    Topographic: 1,
    Monochrome: 2,
};
function ColorscaleSurfacesProgram(gl, initial_view_state) {
    // SHADERS
    const vertex_shader_source = `
        uniform   mat4  model_matrix;
        uniform   mat4  view_matrix;
        uniform   mat4  projection_matrix;
        uniform   int   projection_type;
        uniform   float map_projection_offset;
        attribute vec4  vertex_position;
        attribute float vertex_color_value;
        attribute float vertex_displacement;
        varying   float fragment_color_value;
        varying   float fragment_displacement;

        ${ProgramUtils.get_default_clipspace_position_glsl}

        void main(){
            fragment_color_value = vertex_color_value;
            fragment_displacement = vertex_displacement;
            gl_Position = get_default_clipspace_position(
                vertex_position, model_matrix, view_matrix, 
                projection_matrix, projection_type, map_projection_offset
            );
        }`;
    const vertex_shader_object = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex_shader_object, vertex_shader_source);
    gl.compileShader(vertex_shader_object);
    console.log(gl.getShaderInfoLog(vertex_shader_object));

    const fragment_shader_source = `
        precision mediump float;
        uniform int   colorscale_type;
        uniform vec3  min_color;
        uniform vec3  max_color;
        uniform float min_value;
        uniform float max_value;
        uniform float sealevel;
        uniform float ocean_visibility;
        varying float fragment_color_value;
        varying float fragment_displacement;

        /*
        converts float from 0-1 to a heat map visualization
        credit goes to Gaëtan Renaudeau: http://greweb.me/glsl.js/examples/heatmap/
        */
        vec4 get_rgb_signal_of_fraction_for_heatmap (float v) {
            float value = 1.0-v;
            return vec4((0.5+0.5*smoothstep(0.0, 0.1, value))*vec3(
                smoothstep(0.5, 0.3, value),
                value < 0.3 ? smoothstep(0.0, 0.3, value) : smoothstep(1.0, 0.6, value),
                smoothstep(0.4, 0.6, value)
            ), 1);
        }

        //converts a float ranging from [-1,1] to a topographic map visualization
        vec4 get_rgb_signal_of_fraction_for_topomap(float value) {
            //deep ocean
            vec3 color = vec3(0,0,0.8);
            //shallow ocean
            color = mix(color, vec3(0.5,0.5,1), smoothstep(-1., -0.01, value));
            //lowland
            color = mix(color, vec3(0,0.55,0), smoothstep(-0.01, 0.01, value));
            //highland
            color = mix(color, vec3(0.95,0.95,0), smoothstep(0., 0.45, value));
            //mountain
            color = mix(color, vec3(0.5,0.5,0), smoothstep(0.2, 0.7, value));
            //mountain
            color = mix(color, vec3(0.5,0.5,0.5), smoothstep(0.4, 0.8, value));
            //snow cap
            color = mix(color, vec3(0.95), smoothstep(0.75, 1., value));
            return vec4(color, 1.);
        }

        void main() {
            vec4 color_without_ocean = 
              colorscale_type == 0? get_rgb_signal_of_fraction_for_heatmap(fragment_color_value) 
            : colorscale_type == 1? get_rgb_signal_of_fraction_for_topomap(fragment_color_value)
            :                       vec4( mix( min_color, max_color, fragment_color_value ), 1.0);
            vec4 color_with_ocean = mix(
                vec4(0.), 
                color_without_ocean, 
                fragment_displacement < sealevel * ocean_visibility? 0.5 : 1.0
            );
            gl_FragColor = color_with_ocean;
        }`;
    const fragment_shader_object = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment_shader_object, fragment_shader_source);
    gl.compileShader(fragment_shader_object);
    console.log(gl.getShaderInfoLog(fragment_shader_object));

    // PROGRAM
    const program = gl.createProgram();
    gl.attachShader(program, vertex_shader_object);
    gl.attachShader(program, fragment_shader_object);
    gl.linkProgram(program);
    console.log(gl.getProgramInfoLog(program));

    // UNIFORMS
    const view_matrix_location = gl.getUniformLocation(program, "view_matrix");
    const model_matrix_location = gl.getUniformLocation(program, "model_matrix");
    const projection_matrix_location = gl.getUniformLocation(program, "projection_matrix");
    const projection_type_location = gl.getUniformLocation(program, "projection_type");

    const colorscale_type_location = gl.getUniformLocation(program, "colorscale_type");
    const min_color_location = gl.getUniformLocation(program, "min_color");
    const max_color_location = gl.getUniformLocation(program, "max_color");
    const min_value_location = gl.getUniformLocation(program, "min_value");
    const max_value_location = gl.getUniformLocation(program, "max_value");
    const sealevel_location = gl.getUniformLocation(program, "sealevel");
    const ocean_visibility_location = gl.getUniformLocation(program, "ocean_visibility");

    // ATTRIBUTES
    // properties shared by all buffers within the program
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0: advance size*sizeof(type) each iteration to get the next position
    const offset = 0;        // 0: start at the beginning of the buffer

    const position_location = gl.getAttribLocation(program, "vertex_position");
    const position_buffer = gl.createBuffer();

    const color_value_location = gl.getAttribLocation(program, "vertex_color_value");
    const color_value_buffer = gl.createBuffer();
    
    let internal_view_state = Object.assign({}, initial_view_state);
    let is_disposed = false;

    // METHODS
    this.dispose = function() {
        is_disposed = true;
        gl.deleteBuffer(color_value_buffer);
        gl.deleteBuffer(position_buffer);
        gl.deleteProgram(program);
        gl.deleteShader(fragment_shader_object);
        gl.deleteShader(vertex_shader_object);
    }
    /*
    Returns whether this instance can fully depict a model using the given
    view state upon calling `.draw()`.
    If it cannot, the view state should be used to create a new instance, 
    and the old instance should be disposed before falling out of scope.
    This is not a test for whether the WebGL context or the view state 
    is well formatted. It is strictly a test of the program's private state.

    This demonstrates our approach to handling WebGL state management.
    If changing something is trivial, like uniforms or attributes, 
    we simply change it during the draw call without disposing resources.
    If changing something requires managing highly intertwined private 
    resources like shaders or programs, we simply wipe the slate clean
    on the first sign that anything falls out of sync.
    */
    this.canDepict = function(view_state) {
        return (!is_disposed);
    }
    /*
    Adds a depiction of a given model to the framebuffer that is currently 
    bound to the program's context using options from a given view state
    */
    this.draw = function(model_state, view_state) {
        if (is_disposed) { return; }
        if(view_state.render_pass_type !== 'solids') { return; }

        // first shader pass
        const array_offset = 0;
        gl.useProgram(program); 
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.enableVertexAttribArray(position_location);
        gl.vertexAttribPointer(position_location, 3, gl.FLOAT, normalize, stride, offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, color_value_buffer);
        gl.enableVertexAttribArray(color_value_location);
        gl.vertexAttribPointer(color_value_location, 1, gl.FLOAT, normalize, stride, offset);
        gl.uniformMatrix4fv(view_matrix_location, false, view_state.view_matrix);
        gl.uniformMatrix4fv(model_matrix_location, false, view_state.model_matrix);
        gl.uniformMatrix4fv(projection_matrix_location, false, view_state.projection_matrix);
        gl.uniform1i (projection_type_location, view_state.projection_type);
        gl.uniform1i (colorscale_type_location, view_state.colorscale_type);
        gl.uniform1f (sealevel_location, view_state.sealevel);
        gl.uniform1f (ocean_visibility_location, view_state.ocean_visibility);
        gl.uniform3fv(min_color_location, view_state.min_color || [0,0,0]);
        gl.uniform3fv(max_color_location, view_state.max_color || [1,1,1]);
        gl.uniform1f (min_value_location, view_state.min_value || 0);
        gl.uniform1f (max_value_location, view_state.max_value || 1);
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, model_state.positions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, color_value_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, model_state.color_values, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, array_offset, /*count*/ model_state.positions.length / 3);
    }
}
