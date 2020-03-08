from math import *
import random

import numpy as np

from mpl_toolkits import mplot3d
import matplotlib.pyplot as plt

def seq(start, end, step_count = None, step_size = None):
    assert step_count or step_size, "either step_count or step_size must be defined"
    step_size = step_size or (end-start) / step_count
    step_count = step_count or int(abs(end - start) / step_size)
    for i in range(0,step_count):
        yield start + i*step_size
def integrate(f, start, end, step_count = None, step_size = None):
    return sum([f(x) for x in seq(start, end, step_count, step_size)]) * step_size

def rho(x,y,r): return exp( sqrt(x*x + y*y) - r )
def I(x,y,r):   return integrate(lambda xi: rho(xi,y,r), 0, x, step_count=100)
def F(x,y,r):   return rho(x,y,r)/I(x,y,r) - x/sqrt(x**2+y**2) - 1/x
def x0(x,r):    return sqrt(max(r*r - x*x,0))

SAMPLE_COUNT = 30
R = 10
CACHE = [
    (x, y, F(x,y,R)) 
    for x in seq(-R,R,SAMPLE_COUNT)
    for y in seq(-x0(x,R), x0(x,R), SAMPLE_COUNT)
    if x != 0
]

numerator_basis = [
    '1', 
    'x', 
    #'y',        # F is not assymmetric along y axis
    #'x**2',     # F does not tend towards infinity as x increases, and we do not have 4th degree monomials to prevent this from happening
    #'x*y',      # F is not assymmetric along y axis
    #'y**2',     # F does not tend towards infinity as y increases, and we do not have 3rd degree monomials that could prevent this from happening
    # 'x**3',    # F does not tend towards infinity as x increases, and we do not have 4th degree monomials that could prevent this from happening
    # 'x**2*y',  # F is not assymmetric along y axis 
    'x*y**2',    
    #'y**3',     # F is not assymmetric along y axis
    #'x**4',     # 4th degree monomials omitted due to complexity
    #'x**3*y',
    #'x**2*y**2',
    #'x*y**3',
    #'y**4',
    #'sqrt(x*x+y*y)',
    #'sqrt(x)',
    #'sqrt(y)',
]
denominator_basis = [
    '1', 
    # 'x',       # F has no singularities
    # 'y',       # F has no singularities and is not assymetric along y axis
    'x**2', 
    #'x*y',      # F has no singularities and is not assymetric along y axis
    'y**2', 
    # 'x**3',    # F has no singularities
    #'x**2*y',
    # 'x*y**2',  # F has no singularities
    #'y**3',     # F has no singularities and is not assymetric along y axis
    #'x**4',     # 4th degree monomials omitted due to complexity
    #'x**3*y',
    #'x**2*y**2',
    #'x*y**3',
    #'y**4',
    #'sqrt(x*x+y*y)',
    #'sqrt(x)',
    #'sqrt(y)',
]
def F2(x,y,r, params):
    numerator_basis = [
        1, 
        x, 
        #y,        # F is not assymmetric along y axis
        #x**2,     # F does not tend towards infinity as x increases, and we do not have 4th degree monomials to prevent this from happening
        #x*y,      # F is not assymmetric along y axis
        #y**2,     # F does not tend towards infinity as y increases, and we do not have 3rd degree monomials to prevent this from happening
        # x**3,    # F does not tend towards infinity as x increases, and we do not have 4th degree monomials to prevent this from happening
        # x**2*y,  # F is not assymmetric along y axis 
        x*y**2,    
        #y**3,     # F is not assymmetric along y axis
        #x**4,     # 4th degree monomials omitted due to complexity
        #x**3*y,
        #x**2*y**2,
        #x*y**3,
        #y**4,
        #sqrt(x*x+y*y),
        #sqrt(x),
        #sqrt(y),
    ]
    denominator_basis = [
        1, 
        # x,       # F has no singularities
        # y,       # F has no singularities and is not assymetric along y axis
        x**2, 
        #x*y,      # F has no singularities and is not assymetric along y axis
        y**2, 
        # x**3,    # F has no singularities
        #x**2*y,
        # x*y**2,  # F has no singularities
        #y**3,     # F has no singularities and is not assymetric along y axis
        #x**4,     # 4th degree monomials omitted due to complexity
        #x**3*y,
        #x**2*y**2,
        #x*y**3,
        #y**4,
        #sqrt(x*x+y*y),
        #sqrt(x),
        #sqrt(y),
    ]
    a = params[0:len(numerator_basis)]
    b = params[len(numerator_basis):(len(numerator_basis)+len(denominator_basis))]
    return sum([a[i]*numerator_basis[i] for i in range(len(numerator_basis))]) /      \
           sum([exp(b[i])*denominator_basis[i] for i in range(len(denominator_basis))])

def code(params):
    a = params[0:len(numerator_basis)]
    b = params[len(numerator_basis):(len(numerator_basis)+len(denominator_basis))]
    numerator = '+'.join(f'{a[i]:.3f}*{numerator_basis[i]}' for i in range(len(a)))
    denominator = '+'.join(f'{exp(b[i]):.3f}*{denominator_basis[i]}' for i in range(len(b)))
    return f'({numerator}) / ({denominator})'
def pretty_basis(basis):
    return basis.replace('**3','³').replace('**2','²').replace('*','').replace('sqrt(','√').replace(')','')
def pretty(params):
    a = params[0:len(numerator_basis)]
    b = params[len(numerator_basis):(len(numerator_basis)+len(denominator_basis))]
    numerator = ' '.join(f'{a[i]:+.2f}{pretty_basis(numerator_basis[i])}' for i in range(len(a)))
    denominator = ' '.join(f'{exp(b[i]):+.2f}{pretty_basis(denominator_basis[i])}' for i in range(len(b)))
    return \
f"""({numerator}) 
{'-'*max(len(numerator),len(denominator))}
({denominator})"""


def cost(params): return sum([(f - F2(x,y,R, params)) ** 2 for x,y,f in CACHE]) / SAMPLE_COUNT
solutions = [np.array([random.gauss(0,1) for j in range(len(numerator_basis)+len(denominator_basis))]) for i in range(2000)]

def genetic_algorithm(solutions, survival_rate=0.5):
    def mate(a,b):
        return np.array([random.choice([ai,bi]) for ai,bi in zip(a,b)])
    def mutate(a, rate=0.01):
        return np.array([ai + random.gauss(0,0.2) for ai in a])
    def select(solutions):
        return solutions[int(random.paretovariate(1)) % len(solutions)]
    try:
        while True:
            solutions = sorted(solutions, key=cost)
            cutoff = int(survival_rate*len(solutions))
            solutions[cutoff:len(solutions)] = [
                mutate(mate(select(solutions), select(solutions)))
                for i in solutions[cutoff:len(solutions)]
            ]
            print(pretty(solutions[0]))
            print('cost: ', cost(solutions[0]))
    except KeyboardInterrupt as e:
        return solutions

solutions = genetic_algorithm(solutions)
print(code(solutions[0]))




def gradient(a, delta=1e-5):
    return np.array([ (cost(x+dx_i)-cost(x-dx_i)) / (2.*np.linalg.norm(dx_i)) for dx_i in delta*np.identity(len(x)) ])
def gradient_descent(x, mobility=3e-6, delta=1e-8):
    return x - mobility * gradient(x,delta)
def gradient_descent_algorithm(x, mobility=3e-6, delta=1e-5):
    best, best_cost = x, float('inf')
    grad_cost = 0.*x
    try:
        while True:
            grad_cost = grad(x,delta)
            cost_x = cost(x)
            best, best_cost = x, cost_x if cost_x < best_cost else best, best_cost
            x = gradient_descent(x, mobility, delta)
            print(pretty(x))
            print('cost: ', cost_x)
            print('∇cost:', grad_cost)
    except KeyboardInterrupt as e:
        return best

x = np.outer(np.linspace(-10,10, 30), np.ones(30))
y = x.copy().T # transpose
fig = plt.figure()
ax = plt.axes(projection='3d')
ax.plot_surface(x, y, np.vectorize(F)(x,y,5))
ax.plot_surface(x, y, np.vectorize(lambda x,y,r: 1/(x/sqrt(x**2+y**2)))(x,y,5))
ax.set_xlabel('x')
ax.set_ylabel('y')
ax.set_zlim(-2, 2)
plt.show()

