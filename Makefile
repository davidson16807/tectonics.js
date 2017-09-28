CPP=/usr/bin/cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C 
OUT=scripts/Rasters.js scripts/view/fragment/FragmentShaders.js scripts/view/vertex/VertexShaders.js

all: $(OUT)

scripts/Rasters.js : src/rasters/Rasters.js
	cat $< | $(CPP) > $@

scripts/view/fragment/FragmentShaders.js : src/view/fragment/FragmentShaders.template.js
	cat $< | \
    sed '/TEMPLATE.GLSL.C/ r src/view/fragment/template.glsl.c' | \
    sed '/DEBUG.GLSL.C/ r src/view/fragment/debug.glsl.c' | \
    sed '/VECTOR_FIELD.GLSL.C/ r src/view/fragment/vector_field.glsl.c' \
    > scripts/view/fragment/FragmentShaders.js

scripts/view/vertex/VertexShaders.js : src/view/vertex/VertexShaders.template.js
	cat $< | \
    sed '/TEMPLATE.GLSL.C/ r src/view/vertex/template.glsl.c' | \
    sed '/EQUIRECTANGULAR.GLSL.C/ r src/view/vertex/equirectangular.glsl.c' | \
    sed '/TEXTURE.GLSL.C/ r src/view/vertex/texture.glsl.c' | \
    sed '/ORTHOGRAPHIC.GLSL.C/ r src/view/vertex/orthographic.glsl.c' \
    > scripts/view/vertex/VertexShaders.js

clean:
	rm -f $(OUT)