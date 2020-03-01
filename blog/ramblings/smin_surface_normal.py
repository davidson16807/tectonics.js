from sympy import *
x,y,k = symbols('x,y,k')
def smax(u,v): return log(exp(k*u) + exp(k*v))/k
def smin(u,v): return -smax(-u,-v)
def union(u,v): return smin(u,v)
def intersection(u,v): return smax(u,v)
def negation(u,v): return intersection(u,-v)
u = Function('u')
v = Function('v')

diff( union(u(x),v(x)), x )
diff( intersection(u(x),v(x)), x )
diff( negation(u(x),v(x)), x )