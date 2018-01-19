KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
    CPP=g++-7
else
    CPP=/usr/bin/cpp
endif
OUT=postcompiled/utils/Rasters.js postcompiled/view/FragmentShaders.js postcompiled/view/VertexShaders.js

all: $(OUT)

postcompiled/utils/Rasters.js : precompiled/utils/Rasters.js
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/view/FragmentShaders.js : precompiled/view/fragment/FragmentShaders.template.js
	cat $< | \
    sed '/TEMPLATE.GLSL.C/ r precompiled/view/fragment/template.glsl.c' | \
    sed '/DEBUG.GLSL.C/ r precompiled/view/fragment/debug.glsl.c' | \
    sed '/VECTOR_FIELD.GLSL.C/ r precompiled/view/fragment/vector_field.glsl.c' \
    > postcompiled/view/FragmentShaders.js

postcompiled/view/VertexShaders.js : precompiled/view/vertex/VertexShaders.template.js
	cat $< | \
    sed '/TEMPLATE.GLSL.C/ r precompiled/view/vertex/template.glsl.c' | \
    sed '/EQUIRECTANGULAR.GLSL.C/ r precompiled/view/vertex/equirectangular.glsl.c' | \
    sed '/TEXTURE.GLSL.C/ r precompiled/view/vertex/texture.glsl.c' | \
    sed '/ORTHOGRAPHIC.GLSL.C/ r precompiled/view/vertex/orthographic.glsl.c' \
    > postcompiled/view/VertexShaders.js

clean:
	rm -f $(OUT)
