KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=g++-8
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/Rasters.js postcompiled/Shaders.js postcompiled/Academics.js
SCRIPTS = $(shell find precompiled/ -type f -name '*.js')
SHADERS = $(shell find precompiled/ -type f -name '*.glsl.c')

SRC=core/src/rasters.cpp
INC:=$(shell find core/inc/ -name "*.hpp") 
OUT=postcompiled/utils/Rasters.cpp.js postcompiled/utils/Rasters.js postcompiled/view/FragmentShaders.js postcompiled/view/VertexShaders.js

all: $(OUT)

postcompiled/Rasters.js : precompiled/rasters/Rasters.js $(SCRIPTS) Makefile
run:
	emrun --browser chrome postcompiled/utils/Rasters.cpp.html
test:
	emrun --browser chrome test.cpp.html

postcompiled/utils/Rasters.cpp.js : $(INC) $(SRC)
	em++ --emrun --bind --profiling-funcs -std=c++17 \
	-I core/inc/ \
	-g core/src/rasters.cpp \
	-s EXPORT_NAME="'Rasters'" -s MODULARIZE=1 \
	-s WASM=1 -s DEMANGLE_SUPPORT=1 -s ASSERTIONS=1 -s SAFE_HEAP=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-o postcompiled/utils/Rasters.cpp.html
	# -g4 \
	# -Werror \
	# -g core/src/*.cpp \

postcompiled/utils/Rasters.js : precompiled/utils/Rasters.js
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/Shaders.js : precompiled/Shaders.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Shaders.js > $@

postcompiled/Academics.js : precompiled/Academics.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Academics.js > $@

clean:
	rm -f $(OUT)
