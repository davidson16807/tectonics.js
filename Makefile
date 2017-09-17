CPP=/usr/bin/cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C 

all:src/utils/rasters.js
	cat $^ | $(CPP) > scripts/rasters.js

clean:
	rm -f scripts/rasters.js