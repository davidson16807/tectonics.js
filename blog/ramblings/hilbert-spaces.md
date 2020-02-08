#Introduction

Consider a trivial set of basis functions over the real number line: 
they are everywhere set to be 0, except for one particular value, 
so they're like wavelet functions (google it), the dirac delta function (google it)
or a quadrature in a standard integral (google it)

if we have an infinite number of these **basis functions**, 
we can trivially define a function as we would a vector, 
by defining a linear combination of these basis functions
any given function can be identified as a point in "**function space**"

the basis functions do not interact with one another, 
in other words they're **orthogonal**, 
in the same sense that the cartesian basis vectors are orthogonal

as with vectors, orthogonality is determined by a dot product between functions

the dot between functions is analogous to the regular dot product, 
it is denoted `<f,g>`, and defined as follows:
`
<f,g> = ∫ f(x)*g(x) dx
`

we can then take the dot with one of our aforementioned dirac delta basis functions `δₓ` 
to obtain the value of a function for the value corresponding to that basis function `x`:
`
<f,δₓ> = f(x)
`

#Orthonormality

two basis functions (f and g) are said to be orthogonal if:
`
<f,g> = 0
`

the magnitude of a function is then:
`
|f| = √<f,f> = √∫ f(x)*f(x) dx
`

this feeds well into some other concepts, like square integrability and the Lebesgue integral,
but we won't discuss those here 

if we have a concept of magnitude, then we also have a concept of normality, where:

`
|f| = 1
`

and we have a concept of normalization, where:

`
f̂ = f/|f|
`

if functions are both orthogonal and normal, 
they are said to be **orthonormal**

I mentioned earlier our basis functions were like little slices of our function domain, 
but we don't necessarily need to define our basis functions that way
just as with vector spaces, we can use any series of functions to represent vectors,
just as long as they aren't linear multiples of each other
however just like with vectors, it's desireable to have a set of orthonormal basis vectors

#Operators

just as with vectors, we can perform linear maps between functions in function space
with vectors, these maps are called matrices
with functions, these maps are called **operators**
for instance, we could intuit an operator `D` that accepts a function and returns the derivative
we could define this operator using our trivial aforementioned basis functions as follows:

```

D = 
	[ 	-∂/∂x,	 ∂/∂x, 	0,    	... 	0,  	0   	]
	[ 	0,  	-∂/∂x,	∂/∂x, 	... 	0,  	0   	]
	[ 	⋮,  	⋮,   	⋮    	⋱   	0,  	0   	]
	[ 	0,  	0,  	0,   	... 	-∂/∂x,	∂/∂x 	]

```

#Eigenfunctions

just as matrices have eigenvalues and eigenvectors, 
an operator `O` can have eigenvalues `v` and **eigenfunctions** `f`:

`
f = Of / v
`

this is another useful thing for a function to be, 
since if there's a operator that we happen to be dealing with a lot 
(such as with derivatives) we can express the problems we want to solve
in terms of the eigenfunctions to that operator:
we would set our basis functions to be eigenfunctions

this is what the the fourier series does:
the fourier series is a set of orthonormal eigenfunctions of the derivative operator `D`:

#Adjoints

the adjoint, `T*`, of an operator `T` is defined such that:

```
<Tu,v> == <u,T*v>
<Tf,g> == <f,T*g>
```

a self adjoint operator `T` is defined such that:
`
<Tu,v> == <u,Tv>
`
these can be understood as symmetric matrices operating on function space

the dot of a function, f, with 