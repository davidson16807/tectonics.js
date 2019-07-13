// Raster based methods often need to create temporary rasters that the calling function never sees
// Creating new rasters is very costly, so often several "scratch" rasters would be created once then reused multiple times
// This often led to bugs, because it was hard to track what these scratch rasters represented at any point in time
// To solve the problem, RasterStackBuffer was created.
// You can request new rasters without fear of performance penalties or referencing issues
// Additionally, you can push and pop method names to the stack so the stack knows when to deallocate rasters
// Think of it as a dedicated stack based memory for Javascript TypedArrays
function RasterStackBuffer(byte_length, buffer){
    this.buffer = buffer || new ArrayBuffer(byte_length);
    this.pos = 0;
    this.stack = [];
    this.method_names = [];
}
// allocate memory to a method
RasterStackBuffer.prototype.allocate = function(name) {
    this.stack.push(this.pos);
    this.method_names.push(name);
}
// deallocate memory reserved for a method
RasterStackBuffer.prototype.deallocate = function(name) {
    this.pos = this.stack.pop();
    var method = this.method_names.pop();
    if (method !== name) {
        throw `memory was deallocated for the method, ${name} but memory was not allocated. This indicates improper memory management.`;
    }
}
RasterStackBuffer.prototype.getFloat32Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Float32Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Float32Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getUint8Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Uint8Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Uint8Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getUint16Raster = function(grid) {
    var length = grid.vertices.length;
    var new_pos = this.pos + length * Uint16Array.BYTES_PER_ELEMENT;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = new Uint16Array(this.buffer, this.pos, length);
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};
RasterStackBuffer.prototype.getVectorRaster = function(grid) {
    var length = grid.vertices.length;
    var byte_length_per_index = length * 4;
    var new_pos = this.pos + byte_length_per_index * 3;
    if (new_pos >= this.buffer.length) {
        throw `The raster stack buffer is overflowing! Either check for memory leaks, or initialize with more memory`;
    }
    var raster = {
        x: new Float32Array(this.buffer, this.pos + byte_length_per_index * 0, length),
        y: new Float32Array(this.buffer, this.pos + byte_length_per_index * 1, length),
        z: new Float32Array(this.buffer, this.pos + byte_length_per_index * 2, length),
        everything: new Float32Array(this.buffer, this.pos + byte_length_per_index * 0, 3*length),
        grid: grid
    };;
    raster.grid = grid;
    // round to nearest 4 bytes
    this.pos = 4*Math.ceil(new_pos/4);
    return raster;
};

RasterStackBuffer.scratchpad = new RasterStackBuffer(1e7);

// Test code:
// 
// buffer = new RasterStackBuffer(1e6)
// buffer.allocate('1')
// a = buffer.getUint8Raster({vertices:{length:1}})
// b = buffer.getUint8Raster({vertices:{length:1}})
// v = buffer.getVectorRaster({vertices:{length:1}})
// buffer.deallocate('1')