Consider what happens when you try to achieve polymorphism in the following case:
There are two classes, "World" and "Star" and they each have an applyChanges() method.
World requires insolation and angular_speed in order to update.
These are both supplied by universe.
But Star requires neither, so what do we do?
What does the method signature of applyChanges() look like?

If you answer that star should accept the parameters needed by world,
then you create a very strange interface where developers are required to feed 
empty or invalid parameters to methods that never use them but require them anyways.

If you answer that world should have a unique method signature, 
then you loose the advantage of polymorphism.

If you answer that world should maintain the same sparse method signature
that is used by Star, then you need to supply the parameters some other way,
and the solution that is found by most object oriented programmers is
simply to sneak in the parameters some other way,
This could for instance be done by calling a setter method before the call to applyChanges().
However this has the awful consequence of creating state where none is needed.
So when it comes time to write a unit test for one of these classes, you can't,
because there is so much unnecessary state flying around in order to 
provide work arounds like this one,
and more often than not these requirements will be completely undocumented due to 
the sheer amount of state needing this documentation
So we see that OOP has a nasty tendency of promoting the creation of state,
even in circumstances where doing so is unecessary.
Later on we will indeed see that it is unecessary.

In an earlier version of Tectonics.js this was the exact situation we were confronted with.
The solution at the time was to create "setDependency" methods running throughout the code,
which again served to create state that was required before making calls to applyChanges().
setDependency() for world was called by universe, which meant that you could not modify 
state within universe without then having to go back and call world.setDependency() again.
This wasn't the only instance of this occuring either, so you could imagine the problem on our hands.

Now, how do we get out of this conundrum? Here's a hint:
We mentioned that adopting a unique method signature would mean we no longer the advantage of polymorphism.
But what advantage is that, exactly?

Is it really that important to be able to store stars and worlds in the same list within Universe?
I mean, it sure is neat-o, but what does it really give us?
If you really need write a function that traverses both stars and worlds, 
let's say if you want to calculate gravitational interactions,
then you can still keep stars and worlds in separate lists.
You merely concatenate stars and worlds into a new list of bodies, then traverse the list of bodies.

Now consider the flip side: what if we keep them together?
you no longer have to concatenate the lists, but you now instead have to filter
whenever you have an operation that exclusively requires a list of stars or bodies
We have already seen this occur in our implementation. 
There are several points within the code where we filter the list of bodies to retrieve a list of stars.
We also see another symptom: instances where we set up a method within the star class
only to leave it empty because the only purpose it serves it to create a false polymorphism 
we fully expected these methods to come in handy in the future but it has just never come to fruition.
I'm reminded of the quote that premature optimization is the root of all evil.
Just as well I think that premature achitecture is much the same.

So we drop polymorphism in this case.
This doesn't mean to say that polymorphism is a bad thing,
but all too often it has been hamstrung in just because we adopt the practice by default within OOP.
Without polymorphism, you no longer have to bother with questions like 
what the method signature of a polymorphic interface ought to be.
You no longer have to force some sort of similarity between entities that are inherently different.

I must always sound like I hate OOP when I write this stuff down 
but really I just feel I need to justify my arguments a lot more when circumstances dictate 
that an OOP practice should not be adopted.
OOP is drilled into every programmer from a very early start in their career 
and it's so deeply intrenched in programming culture 
that I feel following its practices are often treated as an objective in and of themself,
as if we were being graded on our use of OOP and not by whether the code we right is actually useful, testable, or maintainable.
So when an OOP practice flies in the face of those things it requires extra attention to justify its disuse.