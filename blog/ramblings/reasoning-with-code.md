Overarching principle: 
engineer an environment for which it is easy to reason about the state of code
without simulating code in your head

What is not easy to reason with:
* illegal state
* state diagrams
* side effects
* nondeterminism

We will relate some commonly used terms back to the guarantees they offer about code.
In order to do this we must introduce a few terms of our own:
outcomes            the set of all memory that is modified by a function, either as return values, output parameters, or side effects
reads               the set of all memory that is read by a function, either as input, global variables, or other state
legality            the condition where state represents a circumstance that can conceptually occur within the real world problem domain

So in other words:
input ⊆ reads
output ⊆ outcomes

Now, back to our guarantees:
deterministic       ensures all outcomes can be predicted using state that can be known within reason (e.g. nonrandom, no uninitialized variables)
side effect free    ensures all outcomes are documented within function signature (note this definition includes output reference parameters that use the "out" keyword)
"strict"            ensures all reads are documented within function signature (it is a term we introduce to mirror the concept of side effects for input, we use it in the phrase "strict function of")
pure                ensures all outcomes can be predicted using only input (it should be apparent this is what happens when a strict function is also side effect free)
closed form         reduces special cases in state transition that are introduced by conditional logic, encourages reducing illegal state
RAII                reduces special cases in state transition
algebras            reduces special cases in state transition
private             ensures all assignment on a variable occurs within current class
local               ensures all assignment on a variable occurs within current scope
const (javascript)  ensures all assignment on a variable occurs within current statement
const (C++/glsl)    ensures all assignment on a variable occurs within current statement during compilation
total               ensures all possible input described within signature produces legal output
orthogonal          ensures all possible variations across two state subsets are legal


As with vector algebra or functional analysis, orthogonality should imply there is a sort of "dot product" that equates to 0. 
We should find what this dot product is. 
By analogy to vector algebra, it is the condition where the sum of the products across all states sum to 0. 
It does not strictly say 


Approaches:
* ensure all state assignment is described during compilation
    * C++ const/constexpr variables
* ensure all state assignment is described within current statement
    * javascript const variables
* ensure all state assignment is described within current function
    * local variables
    * function purity
* ensure all state assignment is described within current file
    * private members
    * encapsulation
* reduce illegal state
    * function totality
    * closed form expressions
* reduce special cases in state transition
    * algebras 
* reduce state transition
    * RAII
* reduce state
    * RAII
    * consolidate data structures,
      pick the data structure that degenerates to the widest range of possibilities
      and use it exclusively wherever applicable
      (e.g. use matrixes to describe positions and orientation, 
       rather than position and rotation vectors)
* ensure all state is valid
    * orthogonal state variables
    * extensive state variables

Miscellaneous notes:
* use encapsulation only when necessary to prevent illegal state, 
  since it either adds code that is inherently unneeded (trivial getters/setters) 
  or it limits valid state modification
  always prefer the guarantee that there is no illegal state
  to the guarantee that all state assignment is described within a region of code
    * use all public attributes for state that is never illegal
    * use all private attributes when state may be illegal