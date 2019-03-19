uniform sampler2D input_texture;
varying vec2 vUv;
void main() {
    gl_FragColor = texture2D( input_texture, vUv );
}