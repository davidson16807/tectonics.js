Why do we want our model update logic to occur within pure functions?
	Because we do not want to be in a position where we must reason about 
	  our code's behavior when passed on some obscure private state that was 
	  created momentarily when transforming data within 
	  our update function.
	We want all output within a timestep to be calculated using 
	  a single, common, easily visible state that is passed as input. 

Why do we use the entity component systems (ECS) design pattern?
	Because we want to achieve as great a separation of concerns as possible
	  and this is done by breaking data down into the smallest components
	  allowed that still carry cohesive meaning.
	Because the behavior of an entity is sometimes necessarily dependant on 
	  there being a combination of components, interfaces, etc.,
	  and where this occurs, we want to handle it explicitly, and cohesively.
	If a entity behavior changes based upon the presence of a subcomponent, 
	  we do not want that behavior to be duplicated and spread across multiple files
	  as would happen in classic OOP where a system is implemented by methods
	  across several classes that implement the same interface.

Why don't we store components within an Entity class, instead of using lists?
	Because the world class then becomes an empty wrapper full of component attributes
	  that are mostly null and rarely ever relevant to a particular entity.
	It is also due to how the developer will respond to this architecture.
	If a component attribute is applicable to the developer's use case,
	  then he is liable to assume that component is available to him,
	  and he will forget to test in the general case. 
    More likely than not, the majority of component attributes will be null,
      and the developer will be left distracted wondering why these attributes exist at all.
    ECS encourages the developer to only consider those components which are relevant to him,
      yet it also strongly encourages the developer to check whether 
	  a relevant component attribute exists for an entity, since he must find
	  that one component that is applicable to a particular entity. 

How do we handle deltas? Do we store them within components? Do we pass them as input? 
	They should always be calculated where ever exposed, but if so they may not always be used.
	We will leave open the option to store them within components.
	This seems nonideal to me, since deltas are a form of dependant state,
	  and I would like to clearly separate independant state from dependant state,
	  however storing independant state with dependant state does not strictly conflict 
	  with our goal to create pure functions, which is more important.
	Doing it this way also frees us from handling long lists of input to functions,
	  which could result if we required passing them as input. 
	It also allows us to call applicable deltas from within view logic 
	It frees us from having to create delta integration logic, but that is not 
