'use strict';

function RealisticPointLightSourceView(options) {
    const invariant_options = options || {};
    this.clone = function() {
        return new  RealisticPointLightSourceView(invariant_options);
    }
    const vertexShader = `
        void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.);
            gl_PointSize = 10.0;
        }
    `;
    const fragmentShader = `
        void main() {
            float radius = 2.0*length(2.0*gl_PointCoord-1.0);
            if(radius > 2.0) { discard; }
            vec3 I = vec3(1,1,1);
            vec3 I_bloom = exp(-radius*radius) * I;
            gl_FragColor = vec4(I_bloom,1);
        }
    `;

    let mesh = void 0;

    function create_mesh(options) {
        const N = 1e4;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(3*N);
        geometry.addAttribute('position', { itemSize: 3, array: positions, __proto__: THREE.BufferAttribute.prototype });

        const material = new THREE.ShaderMaterial({
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            uniforms: {}
        });

        for (let i = 0; i < N; i++) {
            positions[3*i+0] = (Math.random() - Math.random()) * 100*9.4e10;
            positions[3*i+1] = (Math.random() - Math.random()) * 100*9.4e10;
            positions[3*i+2] = (Math.random() - Math.random()) * 100*9.4e10;
        };
        return new THREE.ParticleSystem(geometry, material);
    }

    this.updateScene = function(gl_state, options) {
        if (mesh === void 0) {
            mesh = create_mesh(options);
            gl_state.scene.add(mesh);
        } 
    };
    this.removeFromScene = function(gl_state) {
        if (mesh !== void 0) {
            gl_state.scene.remove(mesh);
            mesh.geometry.dispose();
            mesh.material.dispose();
            mesh = void 0;
        }
    };
}