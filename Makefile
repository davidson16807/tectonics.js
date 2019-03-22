KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=g++-8
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/Rasters.js postcompiled/Shaders.js postcompiled/Academics.js
SCRIPTS = $(shell find precompiled/ -type f -name '*.js')
SHADERS = $(shell find precompiled/ -type f -name '*.glsl.c')

all: $(OUT)

postcompiled/Rasters.js : precompiled/rasters/Rasters.js $(SCRIPTS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/Shaders.js : precompiled/Shaders.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Shaders.js > $@

postcompiled/Academics.js : precompiled/Academics.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Academics.js > $@

clean:
	rm -f $(OUT)
