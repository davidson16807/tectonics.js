---
title: Fasterer Atmospheric Rendering 
layout: default
---

So there's been an improvement to atmospheric scattering that I want to share. You'll want to make sure to read [Alan Zucconi's series](https://www.alanzucconi.com/2017/10/10/atmospheric-scattering-1/) on scattering if you're not familiar with the topic. Also read the earlier blog post on [Fast atmosphere scattering](http://davidson16807.github.io/tectonics.js//2019/03/24/fast-atmospheric-scattering.html) to get yourself acquainted with the problem I'm dealing with. 

We're basically trying to solve this integral:

<img align="right" src="http://davidson16807.github.io/tectonics.js/blog/diagrams/atmospheric-scattering-variables.svg" width="61%">

<p>`int_A^L exp(-(sqrt(x^2 + z^2) - R)/H) dx`</p>

Like many integrals, it has no closed form solution. We have to make approximations.

I've come to learn a few people have worked on this problem before. [Christian Schüler](http://www.thetenthplanet.de/about) was the first person I'm aware of. He wrote a [chapter](https://books.google.com/books?id=aG3y7WQGzmQC&lpg=PA111&ots=IwfuZVpsLr&dq=GPU%20Pro%203%20has%20arrived%20chapman&pg=PA105#v=onepage&q&f=false) of a book that described an approximation for what's known as the "Chapman function". The Chapman function is a related concept. It effectively measures the relative density of particles in the atmosphere, just like we're doing, however it does so using a different method signature. Rather than work with 2d cartesian coordinates relative to the center of the world, it works with viewing angle and altitude. I've found this method signature to be less convenient to work into a classical raymarch algorithm, since for every step of the raymarch I have to calculate an angle relative to the zenith for that step. For that reason I've never gotten around to implementing it. 

The approximation I made [last time](http://davidson16807.github.io/tectonics.js//2019/03/24/fast-atmospheric-scattering.html) doesn't have that problem, but I couldn't escape the nagging feeling that it lacked mathematical elegance. The problem it was trying to prevent was a division by zero. The division by zero occurred when you naïvely solved the integral using integration by substitution:

<p>`int_A^L exp(-(sqrt(x^2 + z^2) - R)/H) dx approx -H sqrt(x^2 + z^2)/x exp((sqrt(x^2 + z^2) - R)/H)`</p>

There was a distance function used to calculate height, and when you swapped it out for a stretched-out quadratic height approximation, you could make sure that division by zero never occurs in the region of interest. But that required defining a region of interest, so we setup some arbitrary fractions a and b from which the slope and intercept for the quadratic approximation could be sampled. 

And that's why it felt so ugly. You had to pick some value for the magic constants a and b, they had to work well together, and they had to work well *for every planet in the universe.*

So I kept revisiting the problem, more than I probably should have, and eventually I was able to reason my way to a better solution. 

My first insight was to reduce the number of parameters to contemplate. I realized that if all distances (both input and output) were expressed in scale heights, we could do away with H:

<p>`int_A^L exp(R-sqrt(x^2 + z^2)) dx approx -sqrt(x^2 + z^2)/x exp(R-sqrt(x^2 + z^2))`</p>

<p>I then thought about what would happen in certain situations. When `z=R` and `x=0`, the behavior for height:</p>

<p>`h(x,z,R) = sqrt(x^2 + z^2) - R`</p>

begins to resemble a parabola:

<p>`h(0,R,R) approx approx x^2 - R`</p>

in which case the integral is approximated by the [error function](https://en.wikipedia.org/wiki/Error_function):

<p>`int_A^L exp(R-x^2) dx = 1/2 sqrt(pi) e^R erf(x)`</p>

<p>however if `z=0` then height is linear:</p>

<p>`h = abs(x) - R`</p>

in which case the integral is trivial:

<p>`int_A^L exp(R - x) dx = -exp(R - x)`</p>

We need some way to switch between these two integral solutions seamlessly. Fortunately, if we attempt a naïve solution using integration by substitution:

<p>`int_A^L exp(R - sqrt(x^2 + z^2)) dx approx - 1/(h') exp(h(x)) approx - sqrt(x^2 + z^2)/x exp(R - sqrt(x^2 + z^2))`</p>

<p>Then we see that the division by zero occurs when `x=0`. That only appreciably occurs when `z=R`. So whatever workaround we use to address the division by zero needs to return under these circumstances the approximation from the error function instead of the bogus results from the naïve integration by substitution.</p>

<p>So how about this: we "nudge" the derivative by some amount before calculating its reciprocal. The amount (let's call it `F`) should be close to 0 when the ray strikes the planet head on. </p>

<p>`int_A^L exp(R - sqrt(x^2 + z^2)) dx approx - 1/(x/sqrt(x^2 + z^2) + F) exp(R - sqrt(x^2 + z^2))`</p>

<p>`F = 0` when `z = 0`</p>

<p>However, if the ray only grazes the planet, `F` should equal the reciprocal of whatever ought to be returned instead of the derivative. Let's call what ought to be returned `G`. As we've mentioned, what the entire approximation should return in those circumstances is `1/2 sqrt(pi) e^R erf(x)`. Since `e^R erf(x)` behaves similarly to the `-exp(R-x)` in our naïve integration by substitution, we will disregard that part and only return `-1/2 sqrt(pi)`, so:</p>

<p>`G = -1/2 sqrt(pi)` when `x=0` and `z=R`</p>

<p>However we still need to modify this so that it is only nonzero when `x = 0`. After some trial and error, I've found `G = sqrt(pi/2 (x^2 + r))` works to a suitable approximation. There is no mathematical reason why I chose this expression, but it does equal zero when the ray strikes the planet head on.</p>

<p>So in other words, we perform the "[o-plus](https://math.stackexchange.com/questions/1785715/finding-properties-of-operation-defined-by-x%E2%8A%95y-frac1-frac1x-frac1y)" operation between `h'` and `G`. I've come to discover o-plus is pretty useful for preventing division by 0, in general.</p>

So chances are if you clicked a link here you'll probably want to see the code more than anything. Well, here it is:

<pre><code class="language-glsl">
// "approx_air_column_density_ratio_along_2d_ray_for_curved_world" 
//   calculates the distance you would need to travel 
//   along the surface to encounter the same number of particles in the column. 
// It does this by finding an integral using integration by substitution, 
//   then tweaking that integral to prevent division by 0. 
// All distances are recorded in scale heights.
// "a" and "b" are distances along the ray from closest approach.
//   The ray is fired in the positive direction.
//   If there is no intersection with the planet, 
//   a and b are distances from the closest approach to the upper bound.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "r0" is the radius of the world.
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    float a, 
    float b, 
    float z2, 
    float R
){
    // GUIDE TO VARIABLE NAMES:
    //  capital letters indicate surface values, e.g. "R" is planet radius
    //  "x*" distance along the ray from closest approach
    //  "z*" distance from the center of the world at closest approach
    //  "R*" distance ("radius") from the center of the world
    //  "h*" distance ("height") from the center of the world
    //  "*0" variable at reference point
    //  "*1" variable at which the top of the atmosphere occurs
    //  "*2" the square of a variable
    //  "d*dx" a derivative, a rate of change over distance along the ray
    float X  = sqrt(max(R*R -z2, 0.));
    float div0_fix = 1./sqrt((X*X+R) * 0.5*PI);
    float ra = sqrt(a*a+z2);
    float rb = sqrt(b*b+z2);
    float sa = 1./(abs(a)/ra + div0_fix) *     exp(R-ra);
    float sb = 1./(abs(b)/rb + div0_fix) *     exp(R-rb);
    float S  = 1./(abs(X)/R  + div0_fix) * min(exp(R-sqrt(z2)),1.);
    return sign(b)*(S-sb) - sign(a)*(S-sa);
}

// "approx_air_column_density_ratio_along_2d_ray_for_curved_world" 
//   calculates column density ratio of air for a ray emitted from the surface of a world to a desired distance, 
//   taking into account the curvature of the world.
// It does this by making a quadratic approximation for the height above the surface.
// The derivative of this approximation never reaches 0, and this allows us to find a closed form solution 
//   for the column density ratio using integration by substitution.
// "x_start" and "x_stop" are distances along the ray from closest approach.
//   If there is no intersection, they are the distances from the closest approach to the upper bound.
//   Negative numbers indicate the rays are firing towards the ground.
// "z2" is the closest distance from the ray to the center of the world, squared.
// "r" is the radius of the world.
// "H" is the scale height of the atmosphere.
float approx_air_column_density_ratio_along_2d_ray_for_curved_world(
    float x_start, 
    float x_stop, 
    float z2, 
    float r, 
    float H
){
    float X = sqrt(max(r*r -z2, 0.));
    // if ray is obstructed
    if (x_start < X && -X < x_stop && z2 < r*r)
    {
        // return ludicrously big number to represent obstruction
        return BIG;
    }
    float sigma = 
        H * approx_air_column_density_ratio_along_2d_ray_for_curved_world(
            x_start / H,
            x_stop  / H,
            z2      /(H*H),
            r       / H
        );
    // NOTE: we clamp the result to prevent the generation of inifinities and nans, 
    // which can cause graphical artifacts.
    return min(abs(sigma),BIG);
}

// "try_approx_air_column_density_ratio_along_ray" is an all-in-one convenience wrapper 
//   for approx_air_column_density_ratio_along_ray_2d() and approx_reference_air_column_density_ratio_along_ray.
// Just pass it the origin and direction of a 3d ray and it will find the column density ratio along its path, 
//   or return false to indicate the ray passes through the surface of the world.
float approx_air_column_density_ratio_along_3d_ray_for_curved_world (
    vec3  P, 
    vec3  V,
    float x,
    float r, 
    float H
){
    float xz = dot(-P,V);           // distance ("radius") from the ray to the center of the world at closest approach, squared
    float z2 = dot( P,P) - xz * xz; // distance from the origin at which closest approach occurs
    return approx_air_column_density_ratio_along_2d_ray_for_curved_world( 0.-xz, x-xz, z2, r, H );
}
</code></pre>
