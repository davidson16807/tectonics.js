'use strict';

#ifndef IS_PROD
#define TYPE_CHECK_DEFINED(INPUT, TYPE) \
	if (INPUT !== void 0) { throw #INPUT + ' is undefined'; }
#else
#define TYPE_CHECK_DEFINED(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define TYPE_CHECK_ARRAY(INPUT, TYPE) \
	if (!(INPUT instanceof TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define TYPE_CHECK_ARRAY(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define TYPE_CHECK_ANY_ARRAY(INPUT) \
	if (!(INPUT instanceof Float32Array || INPUT instanceof Uint16Array || INPUT instanceof Uint8Array)) { throw #INPUT + ' is not a typed array'; }
#else
#define TYPE_CHECK_ARRAY(INPUT, TYPE)
#endif

#ifndef IS_PROD
#define TYPE_CHECK(INPUT, TYPE) \
	if (!(typeof INPUT == #TYPE)) { throw #INPUT + ' is not a ' + #TYPE; }
#else
#define TYPE_CHECK(INPUT, TYPE)
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

#include "src/utils/image-analysis/VectorImageAnalysis.js"
#include "src/utils/morphology/BinaryMorphology.js"
