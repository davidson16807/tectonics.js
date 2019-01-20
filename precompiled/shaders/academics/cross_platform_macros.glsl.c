// NOTE: these macros are here to allow porting the code between several languages

#ifdef GL_ES
#define IN(T) in T
#define INOUT(T) inout T
#define OUT(T) out T
#define CONST(T) const T
#define VAR(T) T
#define FUNC(T) T
#endif

#ifdef CPP
#define IN(T) const T
#define INOUT(T) T&
#define OUT(T) T&
#define CONST(T) const T
#define VAR(T) T
#define FUNC(T) T
#endif

#ifdef JS
#define IN(T)
#define INOUT(T)
#define OUT(T)
#define CONST(T) const T
#define VAR(T) var T
#define FUNC(T) function T
#endif