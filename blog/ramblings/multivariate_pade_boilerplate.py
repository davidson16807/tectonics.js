
numerator_basis = [
    '1', 
    'x', 
    #'y', 
    #'x**2', 
    #'x*y', 
    'y**2', 
    'x**3', 
    #'x**2*y',
    'x*y**2',
    #'y**3',
    #'x**4',
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
    # 'x',     # F has no singularities
    # 'y',     # F has no singularities, and is not 
    'x**2', 
    #'x*y', 
    'y**2', 
    'x**3', 
    #'x**2*y',
    'x*y**2',
    #'y**3',
    #'x**4',
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
        #y, 
        #x**2, 
        #x*y, 
        y**2, 
        x**3, 
        #x**2*y,
        x*y**2,
        #y**3,
        #x**4,
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
        x, 
        # y, 
        x**2, 
        #x*y, 
        y**2, 
        x**3, 
        #x**2*y,
        x*y**2,
        #y**3,
        #x**4,
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
