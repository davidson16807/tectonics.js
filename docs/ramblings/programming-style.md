Let's look at the principles of Object Oriented Programming:
Inheritance
	 This is A Bad Thing™. 
	 The reason why inheritance is bad is because it forces you to intimately work with the hidden state of a parent class. 
	 In the best case, you own the parent class and the only lasting consequence 
	  is the existance of several tightly coupled entities that are split across several files.
	 In the worst case, you are not the owner of the parent class, 
	  you have no idea what it is that you are modifying, 
	  and you have no idea whether the class you're modifying even supports inherited classes.
	 Inheritance has been known to be problematic for many years now. It is a failed experiment. 
	 There is never an occasion where inheritance should be used in place of composition or interfaces. Move on.
Polymorphism
	 This is the only good thing to have ever come out of object oriented programming.
	 However, it can be abused. 
	 There is a reason physicists use pithy, one line formulas to express complex behavior. 
	 There is a reason these typically do not involve piecewise formula.
	 It's relatively easy to analyze a single nonpiecewise formula, but what happens if you use a piecewise formula?
	 Every additional piece that is added to a formula requires additional analysis.
	 The problem you're working through in your head is then O(N), where N is the number of pieces to your formula. 
	 Now consider what happens when two piecewise formulas interact with one another. Suddenly, the problem becomes O(N²) 
	 If you've ever developed a deep seated fear for long switch statements and conditionals, then well done! It is likely for this reason. 
	 Now, when you use polymorphism, you are effectively accomplishing the same thing that would otherwise be done by a long switch statement or conditional,
	 but now you are creating a set of conditional logic blocks that each offer guarantees about what they are doing. 
	 In other words, each logic block can be described as a method that takes an input and returns an output. 
	 If guarantees are structured well enough, you may even have enough information to reduce your O(N²) problem to O(N) 
	 However without sufficient guarantees you must always remember polymorphism can degenerate into a glorified if statement.
	 This is especially the case if your methods are stateful.
Abstraction
	 Abstraction is a good thing, but it is not an intrinsic property of Object Oriented Programming. 
	 Nevertheless, OOP almost ironically tries to own this concept as if it invented it.
	 I would more accurately describe this as OOP perverting the concept of abstraction to the point where it defies one of the core principles on which it works. 
	 This is a pretty militant thing to say, but I base it on the following reasoning:
	 Abstraction exists for the same reason polymorphism exists.
	 It lets you offer guarantees about your code that you can then later rely on.
	 This way, you no longer need to know the inner state of a function.
	 But of all the guarantees you can regularly offer when writing your code, I can think of none more powerful than to guarantee that your function is pure, stateless, idempotent, or free of side effects (whatever you want to call it).
	 yet OOP outright advocates the dereliction of this guarantee when it sermonizes the use of methods that modify private attributes that can never be known to users.
	 To add insult to injury, OOP then uses the principle of encapsulation to claim that it's actually a good thing that users can never truly understand how the code they rely on operates.
Encapsulation
	 Ask yourself why you need private attributes and methods. 
	 If you need them in order to achieve polymorphism, go ahead and do it.
	 If you are doing it to hide away methods that are only relevant to a section of code, don't use objects as a substitute for namespaces.
	 If you are doing it to hide away attributes, you should further ask yourself why you need to hide attributes away from the user. 
	 An unknowable, hidden state should not instill any sense of confidence in the person using your code. So what are you afraid of? 
	 Is it because you fear the structure of your encapsulated state is intrinsically subject to change? 
	 If so, why do you feel your interface of getters and setters will be any more reliable? 
	 Are you afraid the user might enter an invalid state? 
	 If so, can you think of another way to express state that avoids the issue of invalidity all together?
	 Invalid state should be treated as a code smell.

So where do we go from here?
	Program with the intent to offer guarantees about your code. 
		Enforce your guarantees if you can using your programming language of choice, 
		 Otherwise document your guarantees as profusely as possible. 
		 There's nothing wrong with inline documentation of guarantees if it makes the documentation process easier.
		If you write a function, the easiest way to follow this rule is to guarantee the function is free from side effects.
		If your function is performance limited, guarantee that it will not exceed a certain number of computations. 
		For instance, you can adapt your model resolution to work with a certain number of grid cells, or adapt your raymarch algorithm to work within a certain number of steps.
		If you pass N to a function, guarantee that the function will provide sensible results for all values of N.
		This is a tall order if you set out to do this with a bunch of if statements, so don't.
		Express floating point behavior in terms of relations, not conditional logic.
		Likewise, if you pass a data structure to a function, guarantee it will provide sensible outputs for all possible configurations of the data structure. 
		This leads to my next point...
	Clearly separate independant state from derived state
		If you have derived attributes that could get out of sync with the rest of your data structure, those attributes need to go somewhere else. Create a pure function that generates the derived attribute when given a data structure as input, as much as possible.
		If there are many derived attributes, or if some attributes depend on others, or if some derived attributes require extensive calculation, create a pure function that returns a dictionary of interdependant memos. 
		This may not always be practical, though, so if you are storing derived state together with independant state in the same class, at least make sure to separate them physically and/or label them as derived/independant
	Always strive for transparency. 
		Make it apparent that there is nothing up your sleeves. The developer using your code should have the sense there is no ugly surprise behavior hidden by your code and that he is free to modify state in whatever wacky way he wants, whenever he wants. If he does not feel comfortable doing so, you are not offering enough guarantees about your code.
	Use objects only when polymorphism is needed.
		Unless you need polymorphism, your objects should be nothing more than big dumb data structures, totally free of methods or private attributes. 
	And most importantly: think for yourself. 
		In case you haven't already noticed, I am not advocating you adopt a strictly functional programming paradigm. 
		I am not telling you that your methods cannot handle file I/O or today's date 
		(although if you are generating random numbers, you really should accept your rng as a parameter to your function)
		If I could best summarize my approach, I think it would be a pragmatically minded procedural programming paradigm.
		It should place heavy emphasis on stateless functions.
		It should be transparent and should heavily document guarantees that are not otherwise explicitly stated in code, 
		 whether in code comments or otherwise.
		It should be hard to goof up state.
		It should make use of data oriented design when performance is critical.
		It should make use of lambdas where performance is not critical.
		It should make limited use of OOP when using polymorphism. 
