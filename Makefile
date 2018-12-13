KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=g++-8
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/Rasters.js postcompiled/Shaders.js
SCRIPTS = $(shell find precompiled/rasters/ -type f -name '*.js')
SHADERS = $(shell find precompiled/shaders/ -type f -name '*.glsl.c')

all: $(OUT)

postcompiled/Rasters.js : precompiled/rasters/Rasters.js $(SCRIPTS)
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/Shaders.js : precompiled/shaders/Shaders.js $(SHADERS)
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/shaders/Shaders.js > $@

clean:
	rm -f $(OUT)
