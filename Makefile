KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=g++-8
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/utils/Rasters.js postcompiled/view/Shaders.js
SCRIPTS = $(shell find precompiled/utils/ -type f -name '*.js')
SHADERS = $(shell find precompiled/view/ -type f -name '*.glsl.c')

all: $(OUT)

postcompiled/utils/Rasters.js : precompiled/utils/Rasters.js $(SCRIPTS)
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/view/Shaders.js : precompiled/view/Shaders.js $(SHADERS)
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/view/Shaders.js > $@

clean:
	rm -f $(OUT)
