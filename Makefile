KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=clang++
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/Rasters.js postcompiled/Shaders.js postcompiled/Academics.js
SCRIPTS = $(shell find precompiled/ -type f -name '*.js')
SHADERS = $(shell find precompiled/ -type f -name '*.glsl.c')

SRC=core/src/rasters.cpp
INC:=$(shell find core/inc/ -name "*.hpp") 
OUT=postcompiled/cpp.html postcompiled/Rasters.js postcompiled/Shaders.js

all: $(OUT)

postcompiled/Rasters.js : precompiled/rasters/Rasters.js $(SCRIPTS) Makefile
run:
	emrun --browser chrome index.html
test:
	emrun --browser chrome --serve_root ./ tests/cpp-test.html 

postcompiled/cpp.html : $(INC) $(SRC)
	cd postcompiled && \
	em++ --emrun --bind -std=c++17 \
	-I ../core/inc/ \
	-g ../core/src/rasters.cpp \
	-s EXPORT_NAME="'Cpp'" -s MODULARIZE=1 \
	-s WASM=1 -s DEMANGLE_SUPPORT=1 -s ASSERTIONS=1 -s SAFE_HEAP=1 \
	-s ALLOW_MEMORY_GROWTH=1 \
	-o cpp.html && \
	cd -
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
