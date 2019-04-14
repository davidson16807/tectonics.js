#pragma once

#include "../raster.hpp"

namespace rasters
{
	typedef raster<glm::vec<2, bool,         glm::defaultp>> bvec2_raster;
	typedef raster<glm::vec<2, int,          glm::defaultp>> ivec2_raster;
	typedef raster<glm::vec<2, unsigned int, glm::defaultp>> uvec2_raster;
	typedef raster<glm::vec<2, float,        glm::defaultp>>  vec2_raster;
	typedef raster<glm::vec<2, double,       glm::defaultp>> dvec2_raster;

	typedef raster<glm::vec<3, bool,         glm::defaultp>> bvec3_raster;
	typedef raster<glm::vec<3, int,          glm::defaultp>> ivec3_raster;
	typedef raster<glm::vec<3, unsigned int, glm::defaultp>> uvec3_raster;
	typedef raster<glm::vec<3, float,        glm::defaultp>>  vec3_raster;
	typedef raster<glm::vec<3, double,       glm::defaultp>> dvec3_raster;

	typedef raster<glm::vec<4, bool,         glm::defaultp>> bvec4_raster;
	typedef raster<glm::vec<4, int,          glm::defaultp>> ivec4_raster;
	typedef raster<glm::vec<4, unsigned int, glm::defaultp>> uvec4_raster;
	typedef raster<glm::vec<4, float,        glm::defaultp>>  vec4_raster;
	typedef raster<glm::vec<4, double,       glm::defaultp>> dvec4_raster;
}