("use strict");
var ScalarField = {};
ScalarField.TypedArray = function (grid_103) {
  return new Float32Array(grid_103.vertices.length);
};
ScalarField.VertexTypedArray = function (grid_104) {
  return new Float32Array(grid_104.vertices.length);
};
ScalarField.EdgeTypedArray = function (grid_105) {
  return new Float32Array(grid_105.edges.length);
};
ScalarField.ArrowTypedArray = function (grid_106) {
  return new Float32Array(grid_106.arrows.length);
};
ScalarField.TypedArrayOfLength = function (length_107) {
  return new Float32Array(length_107);
};
ScalarField.add_field = function (field1_108, field2_109, result_110) {
  result_110 = result_110 || new Float32Array(field1_108.length);
  for (var i = 0, li = result_110.length; i < li; i++) {
    result_110[i] = field1_108[i] + field2_109[i];
  }
  return result_110;
};
ScalarField.sub_field = function (field1_111, field2_112, result_113) {
  result_113 = result_113 || new Float32Array(field1_111.length);
  for (var i = 0, li = result_113.length; i < li; i++) {
    result_113[i] = field1_111[i] - field2_112[i];
  }
  return result_113;
};
ScalarField.mult_field = function (field1_114, field2_115, result_116) {
  result_116 = result_116 || new Float32Array(field1_114.length);
  for (var i = 0, li = result_116.length; i < li; i++) {
    result_116[i] = field1_114[i] * field2_115[i];
  }
  return result_116;
};
ScalarField.div_field = function (field1_117, field2_118, result_119) {
  result_119 = result_119 || new Float32Array(field1_117.length);
  for (var i = 0, li = result_119.length; i < li; i++) {
    result_119[i] = field1_117[i] / field2_118[i];
  }
  return result_119;
};
ScalarField.add_scalar = function (field_120, scalar_121, result_122) {
  result_122 = result_122 || new Float32Array(field_120.length);
  for (var i = 0, li = result_122.length; i < li; i++) {
    result_122[i] = field_120[i] + scalar_121;
  }
  return result_122;
};
ScalarField.sub_scalar = function (field_123, scalar_124, result_125) {
  result_125 = result_125 || new Float32Array(field_123.length);
  for (var i = 0, li = result_125.length; i < li; i++) {
    result_125[i] = field_123[i] - scalar_124;
  }
  return result_125;
};
ScalarField.mult_scalar = function (field_126, scalar_127, result_128) {
  result_128 = result_128 || new Float32Array(field_126.length);
  for (var i = 0, li = result_128.length; i < li; i++) {
    result_128[i] = field_126[i] * scalar_127;
  }
  return result_128;
};
ScalarField.div_scalar = function (field_129, scalar_130, result_131) {
  result_131 = result_131 || new Float32Array(field_129.length);
  for (var i = 0, li = result_131.length; i < li; i++) {
    result_131[i] = field_129[i] / scalar_130;
  }
  return result_131;
};
ScalarField.min = function (field_132) {
  var min_133 = Infinity;
  var value_134;
  for (var i = 0, li = field_132.length; i < li; i++) {
    value_134 = field_132[i];
    if (value_134 < min_133) min_133 = value_134;
  }
  return min_133;
};
ScalarField.max = function (field_135) {
  var max_136 = -Infinity;
  var value_137;
  for (var i = 0, li = field_135.length; i < li; i++) {
    value_137 = field_135[i];
    if (value_137 > max_136) max_136 = value_137;
  }
  return max_136;
};
ScalarField.arrow_differential = function (field_138, grid_139, result_140) {
  result_140 = result_140 || ScalarField.ArrowTypedArray(grid_139);
  var arrows_141 = grid_139.arrows;
  var arrow_142 = [];
  for (var i = 0, li = arrows_141.length; i < li; i++) {
    arrow_142 = arrows_141[i];
    result_140[i] = field_138[arrow_142[1]] - field_138[arrow_142[0]];
  }
  return result_140;
};
ScalarField.edge_differential = function (field_143, grid_144, result_145) {
  result_145 = result_145 || ScalarField.EdgeTypedArray(grid_144);
  var edges_146 = grid_144.edges;
  var edge_147 = [];
  for (var i = 0, li = edges_146.length; i < li; i++) {
    edge_147 = edges_146[i];
    result_145[i] = field_143[edge_147[1]] - field_143[edge_147[0]];
  }
  return result_145;
};
ScalarField.vertex_differential = function (field_148, grid_149, result_150) {
  result_150 = result_150 || VectorField.VertexDataFrame(grid_149);
  var dpos_151 = grid_149.pos_arrow_differential;
  var arrows_152 = grid_149.arrows;
  var arrow_153 = [];
  var from_154 = 0, to_155 = 0;
  var x_156 = result_150.x;
  var y_157 = result_150.y;
  var z_158 = result_150.z;
  for (var i = 0, li = arrows_152.length; i < li; i++) {
    arrow_153 = arrows_152[i];
    from_154 = arrow_153[0];
    to_155 = arrow_153[1];
    x_156[to_155] += field_148[from_154] - field_148[to_155];
    y_157[to_155] += field_148[from_154] - field_148[to_155];
    z_158[to_155] += field_148[from_154] - field_148[to_155];
  }
  var neighbor_lookup_159 = grid_149.neighbor_lookup;
  var neighbor_count_160 = 0;
  for (var i = 0, li = neighbor_lookup_159.length; i < li; i++) {
    neighbor_count_160 = neighbor_lookup_159[i].length;
    x_156[i] /= neighbor_count_160 || 1;
    y_157[i] /= neighbor_count_160 || 1;
    z_158[i] /= neighbor_count_160 || 1;
  }
  return result_150;
};
ScalarField.edge_gradient = function (field_161, grid_162, result_163) {
  result_163 = result_163 || VectorField.EdgeDataFrame(grid_162);
  var dfield_164 = 0;
  var dpos_165 = grid_162.pos_edge_differential;
  var dx_166 = dpos_165.x;
  var dy_167 = dpos_165.y;
  var dz_168 = dpos_165.z;
  var x_169 = result_163.x;
  var y_170 = result_163.y;
  var z_171 = result_163.z;
  var edges_172 = grid_162.edges;
  var edge_173 = [];
  for (var i = 0, li = edges_172.length; i < li; i++) {
    edge_173 = edges_172[i];
    dfield_164 = field_161[edge_173[1]] - field_161[edge_173[0]];
    x_169[i] = dfield_164 / dx_166[i] || 0;
    y_170[i] = dfield_164 / dy_167[i] || 0;
    z_171[i] = dfield_164 / dz_168[i] || 0;
  }
  return result_163;
};
ScalarField.arrow_gradient = function (field_174, grid_175, result_176) {
  result_176 = result_176 || VectorField.ArrowDataFrame(grid_175);
  var dfield_177 = 0;
  var dpos_178 = grid_175.pos_arrow_differential;
  var dx_179 = dpos_178.x;
  var dy_180 = dpos_178.y;
  var dz_181 = dpos_178.z;
  var x_182 = result_176.x;
  var y_183 = result_176.y;
  var z_184 = result_176.z;
  var arrows_185 = grid_175.arrows;
  var arrow_186 = [];
  for (var i = 0, li = arrows_185.length; i < li; i++) {
    arrow_186 = arrows_185[i];
    dfield_177 = field_174[arrow_186[1]] - field_174[arrow_186[0]];
    x_182[i] = dfield_177 / dx_179[i] || 0;
    y_183[i] = dfield_177 / dy_180[i] || 0;
    z_184[i] = dfield_177 / dz_181[i] || 0;
  }
  return result_176;
};
ScalarField.vertex_gradient = function (field_187, grid_188, result_189) {
  result_189 = result_189 || VectorField.VertexDataFrame(grid_188);
  var dfield_190 = 0;
  var dpos_191 = grid_188.pos_arrow_differential;
  var dx_192 = dpos_191.x;
  var dy_193 = dpos_191.y;
  var dz_194 = dpos_191.z;
  var arrows_195 = grid_188.arrows;
  var arrow_196 = [];
  var x_197 = result_189.x;
  var y_198 = result_189.y;
  var z_199 = result_189.z;
  for (var i = 0, li = arrows_195.length; i < li; i++) {
    arrow_196 = arrows_195[i];
    dfield_190 = field_187[arrow_196[1]] - field_187[arrow_196[0]];
    x_197[arrow_196[0]] += dfield_190 / dx_192[i] || 0;
    y_198[arrow_196[0]] += dfield_190 / dy_193[i] || 0;
    z_199[arrow_196[0]] += dfield_190 / dz_194[i] || 0;
  }
  var neighbor_lookup_200 = grid_188.neighbor_lookup;
  var neighbor_count_201 = 0;
  for (var i = 0, li = neighbor_lookup_200.length; i < li; i++) {
    neighbor_count_201 = neighbor_lookup_200[i].length;
    x_197[i] /= neighbor_count_201 || 1;
    y_198[i] /= neighbor_count_201 || 1;
    z_199[i] /= neighbor_count_201 || 1;
  }
  return result_189;
};
ScalarField.edge_gradient_similarity = function (field_202, grid_203, result_204) {
  result_204 = result_204 || ScalarField.EdgeTypedArray(grid_203);
  var gradient_205 = ScalarField.vertex_gradient(field_202, grid_203);
  VectorField.edge_similarity(gradient_205, grid_203, result_204);
  return result_204;
};
ScalarField.arrow_gradient_similarity = function (field_206, grid_207, result_208) {
  result_208 = result_208 || ScalarField.ArrowTypedArray(grid_207);
  var gradient_209 = ScalarField.vertex_gradient(field_206, grid_207);
  VectorField.arrow_similarity(gradient_209, grid_207, result_208);
  return result_208;
};
ScalarField.edge_laplacian = function (field_210, grid_211, result_212) {
  result_212 = result_212 || ScalarField.EdgeTypedArray(grid_211);
  var gradient_213 = ScalarField.vertex_gradient(field_210, grid_211);
  VectorField.edge_divergence(gradient_213, grid_211, result_212);
  return result_212;
};
ScalarField.arrow_laplacian = function (field_214, grid_215, result_216) {
  result_216 = result_216 || ScalarField.ArrowTypedArray(grid_215);
  var gradient_217 = ScalarField.vertex_gradient(field_214, grid_215);
  VectorField.arrow_divergence(gradient_217, grid_215, result_216);
  return result_216;
};

