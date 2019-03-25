'use strict';

#define IS_PROD 1

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


#include "precompiled/rasters/Matrix3x3.js"
#include "precompiled/rasters/Matrix4x4.js"
#include "precompiled/rasters/Vector.js"

#include "precompiled/rasters/rasters/Float32Raster.js"
#include "precompiled/rasters/rasters/Uint16Raster.js"
#include "precompiled/rasters/rasters/Uint8Raster.js"
#include "precompiled/rasters/rasters/VectorRaster.js"

#include "precompiled/rasters/datasets/Float32Dataset.js"
#include "precompiled/rasters/datasets/Uint16Dataset.js"
#include "precompiled/rasters/datasets/Uint8Dataset.js"
#include "precompiled/rasters/datasets/VectorDataset.js"

#include "precompiled/rasters/fields/ScalarField.js"
#include "precompiled/rasters/fields/Uint16Field.js"
#include "precompiled/rasters/fields/Uint8Field.js"
#include "precompiled/rasters/fields/VectorField.js"

#include "precompiled/rasters/raster-graphics/Float32RasterGraphics.js"
#include "precompiled/rasters/raster-graphics/Uint16RasterGraphics.js"
#include "precompiled/rasters/raster-graphics/Uint8RasterGraphics.js"
#include "precompiled/rasters/raster-graphics/VectorRasterGraphics.js"

#include "precompiled/rasters/interpolation/Float32RasterInterpolation.js"
#include "precompiled/rasters/trigonometry/Float32RasterTrigonometry.js"
#include "precompiled/rasters/scalar-transport/ScalarTransport.js"
#include "precompiled/rasters/image-analysis/VectorImageAnalysis.js"
#include "precompiled/rasters/morphology/BinaryMorphology.js"

#include "precompiled/rasters/IntegerLattice.js"
#include "precompiled/rasters/VoronoiSphere.js"
#include "precompiled/rasters/Grid.js"
#include "precompiled/rasters/RasterStackBuffer.js"
