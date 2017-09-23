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
#define ASSERT_IS_ARRAY(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_TYPE(INPUT, TYPE) \
	if (!(typeof INPUT == #TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define ASSERT_IS_TYPE(INPUT, TYPE)
#endif

#include "src/utils/datasets/Float32Dataset.js"
#include "src/utils/datasets/Uint16Dataset.js"
#include "src/utils/datasets/Uint8Dataset.js"
#include "src/utils/datasets/VectorDataset.js"

#include "src/utils/fields/ScalarField.js"
#include "src/utils/fields/Uint16Field.js"
#include "src/utils/fields/Uint8Field.js"
#include "src/utils/fields/VectorField.js"

#include "src/utils/raster-graphics/Float32RasterGraphics.js"
#include "src/utils/raster-graphics/Uint16RasterGraphics.js"
#include "src/utils/raster-graphics/Uint8RasterGraphics.js"
#include "src/utils/raster-graphics/VectorRasterGraphics.js"

#include "src/utils/rasters/Float32Raster.js"
#include "src/utils/rasters/Uint16Raster.js"
#include "src/utils/rasters/Uint8Raster.js"
#include "src/utils/rasters/VectorRaster.js"

#include "src/utils/interpolation/Float32RasterInterpolation.js"
#include "src/utils/image-analysis/VectorImageAnalysis.js"
#include "src/utils/morphology/BinaryMorphology.js"
