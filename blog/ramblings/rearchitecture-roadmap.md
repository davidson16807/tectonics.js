We have two main things that require extensive rearchitecture:
	1.) an "entity component system" ("ECS") 
	2.) a move towards pure functions

We have a lot of code to write if we are to perform this rearchitecture. 
We would like it done soon.

We want to do this in as painless a way as possible, with as little of thought as possible,
 since that will let us go quickly towards the actual implementation. 
We do not want to migrate towards the new architecture piece-by-piece,
 since this is slow, it requires thought on a case-by-case basis, it is painful,
 and it is not guaranteed that once we start that we'll be able to finish. 

Rather, we want to use unit tests to be as confident about our implementation as possible.
Errors are discovered quickly and turnaround is rapid, 
 allowing us to complete the rearchitecture in less time. 

We want to think as little about implementing unit tests as possible too,
 so that we can get on with our rearchitecture. 

So we must construct some common unit tests that can be applied with minimal thought to 
 any component within our "entity component system" ("ECS") implementation. 

We want to maximize the bang for our buck, so we identify places within code that 
 are the most error prone, and build unit tests around them.
Already we have prototyped several components and systems within our architecture,
 and we have some great understanding as to what can go wrong. 

Buffer raster declaration is extremely error prone.
The most common errors here are to fail to specify the number of rasters, 
 to mess up the order of rasters within the buffer, 
 or to point two rasters to the same location in buffer memory.
If the number of rasters is too low, the buffer will fail to allocate enough memory,
 and we will get an error when the rasters try to read from their proper space.
 So the easiest test is simply to instantiate the component. 
If the number of rasters is too high, the only consequence is a waste of memory,
 and since there is no good way to write unit tests for this with minimal thought,
 we will leave it open to possibility.
Errors concerning raster ordering or reallocation can be addressed through reuse
 of an existing class, RasterStackBuffer. 

Object serialization is another source for error.
This can be addressed with a unit test that mimics an autoencoder within the context of neural networks:
 serialize the object, deserialize the serialization, then perform a deep comparison with the original object.
So the following returns true: 
 
 deserialize(serialize(a)) == a

In other words, serialize/deserialize function as inverse operators. 
This "autoencoder" unit test has an added benefit:
 it can weed out other errors that occur due to buffer raster declaration.
Another unit test that could be done is to attempt deserializing an example json object,
 however constructing these json objects would be too labor intensive for our consideration,
 and it's functionality is completely subsumed by our autoencoder unit test.

Most components will also likely have a "get_steady_state()" function, 
 and one or more system namespaces with their own various functions.
We expect these functions will be used within certain systems when running above a certain timestep. 
They can also be used during initialization, to ensure that new worlds have physically sensible states.
While we could not easily test for certain behavior within these functions, 
 they do offer some generic guarantees which can be tested with little thought.
First off, we state that these functions are pure: 
 for the same input, we can call them multiple times without changing output.
So for instance the following returns true:

  get_steady_state(a, b)
  get_steady_state(a, c)
  b == c

We should even require them to pure functions for in-place operations, 
 such that the following also returns true:

  get_steady_state(input, output)
  get_steady_state(input, input)
  input == output

Such a test would help guard against problems that arise due to the sequencing 
 of operations within the function.

There is another thing we note about these functions:
It is highly likely that any default state for a component will be far from
 it's steady state, since the default state will likely consist of zero'd out scalars an rasters.
So we should expect these operations to at least do something with output. 
We would expect something like the following to return true:

  a = new Component()
  get_steady_state(..., b)
  a != b

And lastly, if we apply the update function to our steady state, 
 we should expect the result not to differ from the steady state by a certain threshold:

  get_steady_state(input, state1)
  update_state(state1, state2)
  abs(state1-state2) < threshold