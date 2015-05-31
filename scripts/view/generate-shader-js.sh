cat FragmentShaders.template.js | sed -e '/TEMPLATE.GLSL.C/ r fragment/template.glsl.c' |	sed '/DEBUG.GLSL.C/ r fragment/debug.glsl.c' > FragmentShaders.js

