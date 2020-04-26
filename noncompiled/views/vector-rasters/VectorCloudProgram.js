/*
A "VectorCloudProgram" seals off access to resources relating to a WebGLProgram
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
function VectorCloudProgram(gl, initial_view_state) {
    // SHADERS
    const vertex_shader_glsl = `
        uniform   mat4  model_matrix;
        uniform   mat4  view_matrix;
        uniform   mat4  projection_matrix;
        uniform   int   projection_type;
        uniform   float map_projection_offset;
        attribute vec4  vertex_position;
        attribute float vertex_vector_fraction_traversed;
        varying   float fragment_vector_fraction_traversed;
        varying   float fragment_animation_phase_angle;

        ${ProgramUtils.get_default_clipspace_position_glsl}

        void main(){
            fragment_vector_fraction_traversed = vertex_vector_fraction_traversed;
            gl_Position = get_default_clipspace_position(
                vertex_position, model_matrix, view_matrix, 
                projection_matrix, projection_type, map_projection_offset
            );
        }`;
    const vertex_shader_object = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertex_shader_object, vertex_shader_glsl);
    gl.compileShader(vertex_shader_object);
    console.log(gl.getShaderInfoLog(vertex_shader_object));

    const fragment_shader_glsl = `
        precision mediump float;
        uniform float animation_phase_angle;
        varying float fragment_vector_fraction_traversed;

        void main() {
            const float PI = 3.1415926535;
            float state = 0.5 * (cos(2.*PI*fragment_vector_fraction_traversed - animation_phase_angle) + 1.) ;
            gl_FragColor =vec4(state) * vec4(vec3(0.8),1.) + vec4(vec3(0.2),0.);
        }`;
    const fragment_shader_object = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragment_shader_object, fragment_shader_glsl);
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

    const animation_phase_angle_location = gl.getUniformLocation(program, "animation_phase_angle");

    // ATTRIBUTES
    // properties shared by all buffers within the program
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0: advance size*sizeof(type) each iteration to get the next position
    const offset = 0;        // 0: start at the beginning of the buffer

    const position_location = gl.getAttribLocation(program, "vertex_position");
    const position_buffer = gl.createBuffer();

    const vector_fraction_traversed_location = gl.getAttribLocation(program, "vertex_vector_fraction_traversed");
    const vector_fraction_traversed_buffer = gl.createBuffer();
    
    let internal_view_state = Object.assign({}, initial_view_state);
    let is_disposed = false;

    // METHODS
    this.dispose = function() {
        is_disposed = true;
        gl.deleteBuffer(vector_fraction_traversed_buffer);
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
        if(view_state.render_pass_type !== RenderPassType.Solids) { return; }

        // first shader pass
        const array_offset = 0;
        gl.useProgram(program); 
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.enableVertexAttribArray(position_location);
        gl.vertexAttribPointer(position_location, 3, gl.FLOAT, normalize, stride, offset);
        gl.bindBuffer(gl.ARRAY_BUFFER, vector_fraction_traversed_buffer);
        gl.enableVertexAttribArray(vector_fraction_traversed_location);
        gl.vertexAttribPointer(vector_fraction_traversed_location, 1, gl.FLOAT, normalize, stride, offset);
        gl.uniformMatrix4fv(view_matrix_location, false, view_state.view_matrix);
        gl.uniformMatrix4fv(model_matrix_location, false, view_state.model_matrix);
        gl.uniformMatrix4fv(projection_matrix_location, false, view_state.projection_matrix);
        gl.uniform1i (projection_type_location, view_state.projection_type);
        gl.uniform1f (animation_phase_angle_location, view_state.animation_phase_angle || 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, model_state.positions, gl.DYNAMIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, vector_fraction_traversed_buffer);
        gl.bufferData(gl.ARRAY_BUFFER, model_state.vector_fractions_traversed, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.LINES, array_offset, /*count*/ model_state.positions.length / 3);
    }
}
