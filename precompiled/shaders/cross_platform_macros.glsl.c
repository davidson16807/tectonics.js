#ifdef GL_ES
#define IN(T) in T
#define INOUT(T) inout T
#define OUT(T) out T
#define CONST(T) const T
#endif

#ifdef CPP
#define IN(T) const T
#define INOUT(T) T&
#define OUT(T) T&
#define CONST(T) const T
#endif