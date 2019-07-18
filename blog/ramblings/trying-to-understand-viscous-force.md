
So consider a spring. When you pull the spring, how much does the spring pull back?
Simple high school physics. The force is proportionate to the distance it's been stretched. Hooke's law.
Now apply this concept to a stretchy membrane. 
The membrane is depressed, the membrane stretches, and there's a force that resists the stretching. 
There's a downward and horizontal component to this force. 
The downward force component in region 1 is proportionate to the downward distance stretched (Δu):
 F = τ Δu
Over a small enough region, we assume downward distance stretched (du) changes linearly with horizontal distance (dx), so
 Δu = du/dx * Δx
But there's an opposing force just right across from this region on the stretchy membrane,
 so we have to cancel them out
 ΔF = τ₂ du/dx * Δx - τ₁ du/dx * Δx
But we can simplify this as the change in du/dx over a horizontal distance (dx)
 ΔF = d/dx (τ du/dx) * Δx * Δy

You kinda see this pattern where every time there's a relative value, like a distance, 
we make it explicit how it's the product of a derivative and some other relative value. 
Since we're interested in expressing this stuff with vector calculus, 
it's obvious that other value should be distance. 

Anyways, the same logic applies to a 2d stretchy membrane, we just add a term for the other axis
 ΔF = d/dx (τ du/dx) * Δx * Δy + 
      d/dy (τ du/dy) * Δx * Δy

Aand there we have our laplacian:
 ΔF = ∇⋅(τ∇u)

So we can see the laplacian comes in by simply considering how the displacement and force change across multiple components. 

But u is just one axis that displacement can occur on. 
What if we consider the other axes?
Let's call them u and v. 
 ΔFᵤ = ∇⋅(τ∇u) ΔxΔy
 ΔFᵥ = ∇⋅(τ∇v) ΔxΔy

So if we have a displacement vector 𝐮, then the force vector 𝐅 is:

Δ𝐅 = ∇⋅(τ∇𝐮)

and we can define a force per unit area (a kind of "pressure") that might be useful in certain problems
f =           Δ𝐅 / (ΔxΔy) 
  = ∇⋅(τ∇v) ΔxΔy / (ΔxΔy) 

and since displacement can be described as a velocity over time, 
we start to see how it ties in with fluid simulation. 
We start to see why flexible solids ought to behave like viscous fluids. 

So I stepped out of this logical stupor and I'm left trying to fit this in with our previous understanding. 
I previously wasn't sure how to visualize vector laplacian ∇⋅∇𝐮.
When I tried to visualize it in my head, 
I thought it was like a vector where each component was the spatially averaged difference of a component in u. 
But that didn't make sense to me, since it seemed like ∇⋅∇𝐮 would represent some abstract vector that was divorced from reality
that would change value dependant on which coordinate system you were using. 
I thought it should involve a lot more interactions between components than what it did. 

There were two lynchpins to understanding it:
First,  𝐮 is a displacement that can be optionally described by a velocity over time. 
This is the same displacement that's used in Hooke's law.
Second, 𝐮 is a displacement that is resisted by the force. 
So it makes sense why any component of the force vector should only 
depend on the corresponding component of the displacement vector.

So ∇⋅(τ∇v) is just a statement for how displacement (and by proxy, a net elastic force) changes over space.
You can summarize it as this:

	displacement changes over space, which is resisted by a force, 
	and this force itself changes over space, which causes a net force.

And that's why we use the vector laplacian.

Now, as far as how to visualize it...


Consider a block of jello. 

Stress manifests as a force acting across a predetermined 2d cross section. 
The force can occur in any direction, it need not be normal to the cross section like pressure. 
Neither does it need to be tangent to the cross section. 
However, it has components which can be expressed as normal or tangent to the cross section. 
If it's tangent, it's called shear, and if it's normal, 
it's called compression or tension (essentially positive or negative pressure)
Also keep in mind there is a unique force vector for every possible 2d cross section. 
So how do we go about representing this?

Pick any arbitrary coordinate basis within the jello.
The basis vectors are each orthogonal to one another. 
You can think of these basis vectors as the surface normals to a set of 2d cross sections we mentioned earlier. 
Now, map each basis vector to a vector indicating the force that occurs through the corresponding cross section.
You have now visualized the stress tensor. 

Now, picture a region within the jello. 
It looks like a cube. 
The cube has a finite size, so the force acting on one side might be different from the other side.
So the total force acting on the cube is the sum of all forces on all sides. 
Each pair of sides is represented by a coordinate basis, like the one mentioned above.
And we are interested in the net force across all sides, 
so we want to know how the force changes across the length of the cube.
The cube is very small, so we can assume force changes linearly across the cube. 

There are two kinds of forces that need to be considered for each side.

The first kind of force is found like so:
For each surface on the cube, force is determined by whether the velocity comes together or apart.
And when we consider the net force across the cube, we have to consider how that divergence changes across each of the three axes. 
In other words, the first kind of force is the gradient of divergence of velocity. 
It can be visualized as a vector that always points to the region of greatest velocity divergence.
In other words, the force resists the material coming apart or together.
If a fluid or solid is incompressible (∇⋅v=0), then there is no gradient, and this kind of force is not present.

The second kind of force is found like so:
For each surface on the cube, the force resists the motion along the surface normal (velocity⋅normal)
And when we consider the net force across the cube, we have to consider whether force vectors along that normal (force⋅normal) are pushing or pulling on the surface of the cube. 
In other words, the second kind of force is the divergence of gradient of velocity (A.K.A. the vector laplacian).
It can be visualized as a vector that points in the direction of the net pushing/pulling of the vector field. 

∇(∇⋅v): 	the change in divergence along each axis	
∇⋅(∇v): 	the net change along each axis.

We can see both kinds of force have some aspect of pressure, 
both have some way to resist stretching or compression within the material,
but they do it in different ways. 
Neither really corresponds perfectly to shear, compression, or tension.
This caused me a lot of hesitation as I was learning, 
since I thought the force could be broken into components of each.
However, it makes sense this way:
the motion of our cube of jello could only ever be described using a vector,
and since shear by definition requires a combination of two axes,
it can only ever be represented with a matrix.
So we could never expect our answer to be divided into a shear component. 
