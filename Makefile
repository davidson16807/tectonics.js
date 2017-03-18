CPP=/usr/bin/cpp -P -undef -Wundef -std=c99 -nostdinc -Wtrigraphs -fdollars-in-identifiers -C 

scripts/rasters.js:src/utils/*/*
	cat $^ | $(CPP) > $@
