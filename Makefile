KNAME := $(shell uname)
ifeq (Darwin,$(findstring Darwin,$(KNAME)))
	CPP=clang++
else
	CPP=/usr/bin/cpp
endif
OUT=postcompiled/Rasters.js postcompiled/Shaders.js postcompiled/Academics.js
SCRIPTS = $(shell find precompiled/ -type f -name '*.js')
SHADERS = $(shell find precompiled/ -type f -name '*.glsl.c')

SRC=core/src/wasm.cpp
INC:=$(shell find core/inc/ -name "*.hpp") 
OUT=postcompiled/wasm.html postcompiled/Rasters.js postcompiled/Shaders.js

all: $(OUT)

postcompiled/Rasters.js : precompiled/rasters/Rasters.js $(SCRIPTS) Makefile
run:
	emrun --browser chrome index.html
test:
	emrun --browser chrome --serve_root ./ tests/wasm-test.html 

postcompiled/wasm.html : $(INC) $(SRC)
	cd postcompiled && \
	em++ --emrun --bind -std=c++17 \
	-I ../core/inc/ \
	-g ../core/src/wasm.cpp \
	-s EXPORT_NAME="'Cpp'" -s MODULARIZE=1 \
	-s WASM=1 \
	-s TOTAL_MEMORY=67108864 \
	-s ASSERTIONS=1 \
	-s SAFE_HEAP=1 \
	-s DEMANGLE_SUPPORT=1 \
	-o wasm.html && \
	cd -
	# -s ALLOW_MEMORY_GROWTH=1 \
	# -g4 \
	# -Werror \
	# -g core/src/*.cpp \

postcompiled/Rasters.js : precompiled/rasters/Rasters.js
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C $< > $@

postcompiled/Shaders.js : precompiled/Shaders.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Shaders.js > $@

postcompiled/Academics.js : precompiled/Academics.js $(SHADERS) Makefile
	$(CPP) -E -P -I. -xc -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C precompiled/Academics.js > $@

clean:
	rm -f $(OUT) postcompiled/cpp.*
