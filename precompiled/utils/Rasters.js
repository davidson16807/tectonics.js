'use strict';

#define IS_PROD

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
#define ASSERT_IS_SCALAR(INPUT) \
	if (typeof INPUT != "number" || isNaN(INPUT) || !isFinite(INPUT)) { throw #INPUT + ' is not a real number'; }
#else
#define ASSERT_IS_SCALAR(INPUT)
#endif

#ifndef IS_PROD
#define ASSERT_IS_TYPE(INPUT, TYPE) \
	if (!(typeof INPUT == #TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define ASSERT_IS_TYPE(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define ASSERT_IS_VECTOR_RASTER(INPUT) \
	if ((INPUT.everything === void 0) || !(INPUT.everything instanceof Float32Array)) { throw #INPUT + ' is not a vector raster'; }
#else
#define ASSERT_IS_VECTOR_RASTER(INPUT)
#endif

#ifndef IS_PROD
#define ASSERT_IS_3X3_MATRIX(INPUT) \
	if ((INPUT.length !== 9) || !(INPUT instanceof Float32Array)) { throw #INPUT + ' is not a 3x3 matrix'; }
#else
#define ASSERT_IS_3X3_MATRIX(INPUT)
#endif

#include "precompiled/utils/Grid.js"
#include "precompiled/utils/Matrix.js"
#include "precompiled/utils/Matrix4x4.js"
#include "precompiled/utils/Vector.js"
#include "precompiled/utils/RasterStackBuffer.js"

#include "precompiled/utils/datasets/Float32Dataset.js"
#include "precompiled/utils/datasets/Uint16Dataset.js"
#include "precompiled/utils/datasets/Uint8Dataset.js"
#include "precompiled/utils/datasets/VectorDataset.js"

#include "precompiled/utils/fields/ScalarField.js"
#include "precompiled/utils/fields/Uint16Field.js"
#include "precompiled/utils/fields/Uint8Field.js"
#include "precompiled/utils/fields/VectorField.js"

#include "precompiled/utils/raster-graphics/Float32RasterGraphics.js"
#include "precompiled/utils/raster-graphics/Uint16RasterGraphics.js"
#include "precompiled/utils/raster-graphics/Uint8RasterGraphics.js"
#include "precompiled/utils/raster-graphics/VectorRasterGraphics.js"

#include "precompiled/utils/rasters/Float32Raster.js"
#include "precompiled/utils/rasters/Uint16Raster.js"
#include "precompiled/utils/rasters/Uint8Raster.js"
#include "precompiled/utils/rasters/VectorRaster.js"

#include "precompiled/utils/interpolation/Float32RasterInterpolation.js"
#include "precompiled/utils/trigonometry/Float32RasterTrigonometry.js"
#include "precompiled/utils/scalar-transport/ScalarTransport.js"
#include "precompiled/utils/image-analysis/VectorImageAnalysis.js"
#include "precompiled/utils/morphology/BinaryMorphology.js"
