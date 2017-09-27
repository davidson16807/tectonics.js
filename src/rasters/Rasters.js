'use strict';

#ifndef IS_PROD
#define ASSERT_IS_NOT_EQUAL(INPUT1, INPUT2) \
	if (INPUT1 === INPUT2) { throw #INPUT1 + ' and ' + #INPUT2 + ' cannot be the same'; }
#else
#define ASSERT_IS_NOT_EQUAL(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_DEFINED(INPUT, TYPE) \
	if (INPUT !== void 0) { throw #INPUT + ' is undefined'; }
#else
#define ASSERT_IS_DEFINED(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_ARRAY(INPUT, TYPE) \
	if (!(INPUT instanceof TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define ASSERT_IS_ARRAY(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_ANY_ARRAY(INPUT) \
	if (!(INPUT instanceof Float32Array || INPUT instanceof Uint16Array || INPUT instanceof Uint8Array)) { throw #INPUT + ' is not a typed array'; }
#else
#define ASSERT_IS_ANY_ARRAY(INPUT)
#endif

#ifndef IS_PROD
#define ASSERT_IS_TYPE(INPUT, TYPE) \
	if (!(typeof INPUT == #TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define ASSERT_IS_TYPE(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_VECTOR_RASTER(INPUT) \
	if (!(INPUT.x !== void 0) && !(INPUT.x instanceof Float32Array)) { throw #INPUT + ' is not a vector raster'; }
#else
#define ASSERT_IS_VECTOR_RASTER(INPUT)
#endif

#include "src/rasters/Grid.js"

#include "src/rasters/datasets/Float32Dataset.js"
#include "src/rasters/datasets/Uint16Dataset.js"
#include "src/rasters/datasets/Uint8Dataset.js"
#include "src/rasters/datasets/VectorDataset.js"

#include "src/rasters/fields/ScalarField.js"
#include "src/rasters/fields/Uint16Field.js"
#include "src/rasters/fields/Uint8Field.js"
#include "src/rasters/fields/VectorField.js"

#include "src/rasters/raster-graphics/Float32RasterGraphics.js"
#include "src/rasters/raster-graphics/Uint16RasterGraphics.js"
#include "src/rasters/raster-graphics/Uint8RasterGraphics.js"
#include "src/rasters/raster-graphics/VectorRasterGraphics.js"

#include "src/rasters/rasters/Float32Raster.js"
#include "src/rasters/rasters/Uint16Raster.js"
#include "src/rasters/rasters/Uint8Raster.js"
#include "src/rasters/rasters/VectorRaster.js"

#include "src/rasters/interpolation/Float32RasterInterpolation.js"
#include "src/rasters/image-analysis/VectorImageAnalysis.js"
#include "src/rasters/morphology/BinaryMorphology.js"
