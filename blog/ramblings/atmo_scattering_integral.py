from sympy import *
init_plotting(num_columns=120)
v0,l0,dv,dl,y,zv,zl0,dzl,r,B,t = symbols('v0,l0,dv,dl,y,zv,zl,dzl,r,B,t')
def r2(x,y)   : return sqrt(x**2 + y**2)

def r3(x,y,z) : return sqrt(x**2 + y**2 + z**2)

def x0(y,z)   : return sqrt(r**2 - y**2 - z**2)

def Ch(x,y,z) : return sqrt(r2(y,z) * pi/2) * (1/(2*r3(x,y,z)) + 1)

def s (x,y,z) : return exp( r - r3(x,y,z) ) / ( x/r3(x,y,z) + Ch(x,y,z) )

def S (a,b,y,z):return sign(b)*(s(0,y,z)-s(b,y,z)) - sign(a)*(s(0,y,z)-s(a,y,z))

def T (v0,v1,l0,y,zv,zl,B): return r3(v1,y,zv) - r + B*(S(v0,v1,y,zv) + S(l0,3*r,y,zl))

def F (v0,v1,l0,y,zv,zl,B): return exp(-T(v0,v1,l0,y,zv,zl,B))

I = integrate(F(v0,vt, lt, y, zv, zlt, B), t)
def dTdt(v0,v1,l0,y,zv,zl,B): 
	vt=v0+dv*t
	lt=l0+dl*t
	zlt=zl0+dzl*t
	return diff(T(v0,vt, lt, y, zv, zlt, B), t)

