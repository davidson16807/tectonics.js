
As a general rule, we would like it to be easy to reason with code and to
make changes quickly and with confidence. 
Most important is our ability to state with confidence whether the changes 
we make will not cause an application to produce invalid state.
As an application grows, this becomes harder to accomplish. 

The object oriented solution to invalid state is to use encapsulation, 
restricting state modification to choke points where state validity can be 
enforced using assertions, exception handling, sanitization, or other logic.
However this creates problems of its own. The new logic we create must itself
be vetted. The new logic may be piecemeal. It may neglect certain requirements 
that may still allow invalid state to sneak through. Furthermore, 
the choke points we set up to manage state validity provide us with only a 
single route to modify state, so it becomes much harder to make changes. 
This violates one of our core starting assumptions, that changes can be made quickly.
Using this approach, we often find ourselves struggling with plumbing issues, 
trying to figure out the best way that two classes on opposite ends of the code 
base can modify each others state. Worst of all, encapsulation is often treated as
a priori principle of its own. It is often applied generally without asking whether
it even makes sense in a given context, or it is applied for reasons that have
nothing to do with state validity, such as to reduce the number of changes 
in completely hypothetical circumstances where the developer wants to add 
logic to a getter or setter. Often times, encapsulation is applied in a 
completely superficial way, wrapping every attribute in a getter and setter 
as if to appease some teacher on a homework assignment, never once providing 
any real value in defense against invalid state, or anything for that matter.

A far better solution is to design state in such a way that invalidity is 
inherently impossible. How this is accomplished depends strongly on the 
the requirements that define when state is invalid. 

For example, if some variable exists that cannot possibly assume anything 
other than a positive, nonzero value, we might consider instead representing 
that value within memory on a log scale, so zero or negative values inherently 
cannot occur. 

As another example, if some relationship exists between two variables, 
such as an algabraic expression, it may be best to abandon representing one of
those variables in memory. 

And there you have it! Encapsulation dies and is born again. 
But lets not kid ourselves, we now have a completely different goal in mind 
when we use it. Encapsulation is not an a priori design principle in itself,
it is a tool for accomplishing an objective, and it can be done in a right way 
and a wrong way. As a matter of fact, we would ideally like to avoid using it 
altogether. We would ideally like to maximize the amount of state 
that can be freely modified without fear of introducing invalid state. 
This means that every class in an application has access to it,
and can freely modify it at any time in any manner and still produce 
valid results that are physically sensible for an instant in time. 
This is a core requirement that makes it far easier to reason with code 
and to make changes with confidence. 
