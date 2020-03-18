
#ifndef PROD
#define ASSERT(test, color) if (!(test)) { return color; }
#else
#define ASSERT(test, color)
#endif
