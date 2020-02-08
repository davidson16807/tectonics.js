all you need in order to detect collision between a point and a plane are three things: the point position, the normal vector of the plane, and a sample position on the plane
if you also have the velocity of the colliding object you can do collision detection with higher fidelity, and you can estimate where a point would make its closest approach to the sphere, its just the closest approach between a line and sphere
if you have a noise map, that automatically gives you the height over the point of closest approach
then you can sample at several points along the noise map near the point of closest approach to find the gradient
and there is a trivial way to find the surface normal given the gradient, I use it already to generate normal maps for tectonics.js
since sampling the noise map is a simple calculation, it should take far less time than a texture lookup, so any reasonable number of samples shouldn't take any appreciable time
this should work just as long as the distance you travel in a single timestep is not ridiculously large
so you could use this technique to quickly approximate the depth texture you use in your atmo scattering shader, but it would only be an approximation: if something like a tall mountain intersects with your ray before it reaches the point of closest approach, it will go straight through it