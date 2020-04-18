'use strict';

/*
A "ViewResources" class seals off the resources that are needed by a graphics 
library to allow view state to be managed statelessly elsewhere. 
It practices strict encapsulation. Absolutely no state here is to be made publicly accessible.
This is offered as a guarantee to the rest of the code base,
and any attempt to circumvent this behavior will severely cripple your ability 
to reason with the rest of the code base. 
It practices resource allocation as initialization (RAII) 
to avoid painful issues involving the management of internal state.
It practices polymorphism so that a common frame of mind can be reused 
amongst similar ViewResources despite differences in internal state.
*/
function RealisticPointLightSourcesViewResources(initial_view_state) {
    const vertex_shader = `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            gl_PointSize = 10.0;
        }
    `;
    const fragment_shader = `
        void main() {
            float radius = 2.0*length(2.0*gl_PointCoord-1.0);
            if(radius > 2.0) { discard; }
            vec3 I = vec3(1,1,1);
            vec3 I_bloom = exp(-radius*radius) * I;
            gl_FragColor = vec4(I_bloom,1);
        }
    `;
    const N = 1e4;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(3*N);
    geometry.addAttribute('position', { itemSize: 3, array: positions, __proto__: THREE.BufferAttribute.prototype });

    const material = new THREE.ShaderMaterial({
        vertexShader: vertex_shader,
        fragmentShader: fragment_shader,
        uniforms: {}
    });

    for (let i = 0; i < N; i++) {
        positions[3*i+0] = (Math.random() - Math.random()) * 100*9.4e10;
        positions[3*i+1] = (Math.random() - Math.random()) * 100*9.4e10;
        positions[3*i+2] = (Math.random() - Math.random()) * 100*9.4e10;
    };
    const mesh = THREE.ParticleSystem(geometry, material);

    /*
    Returns whether the ViewResource is unable to update to reflect the given model and view state.
    If this is the case, then the ViewResource will have to be removed and replaced with a new one.
    This can occur if for instance the grid resolution changes in a RasterViewResource and 
    a raster no longer shares the same length as a vertex attribute buffer.
    */
    this.needsRemoval = function(model, view_state) {
        return false;
    }
    /*
    Modifies a given gl_state to include the ViewResource.
    This modifies the state elsewhere, so it must be kept separate from the constructor.
    */
    this.addToScene = function(gl_state) {
        gl_state.scene.add(mesh);
    };
    /*
    Updates the ViewResource to reflect the most current state of the raster and view_state
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.updateScene = function(gl_state, starfield, view_state) {

    };
    /*
    Updates the ViewResource to reflect the most current state of the raster and view_state
    `raster` and `view_state` provide a complete description of all state that is to be depicted by the ViewResource.
    The ViewResource determines what needs to change and changes it. 
    */
    this.removeFromScene = function(gl_state) {
        gl_state.scene.remove(mesh);
        mesh.geometry.dispose();
        mesh.material.dispose();
    };
}

window.VIEW_RESOURCES = window.VIEW_RESOURCES || {};
window.VIEW_RESOURCES['RealisticPointLightSourcesViewResources'] = RealisticPointLightSourcesViewResources;