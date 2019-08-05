One of the simplest compulsion loops that can be devised is as follows:
	play game
	earn points

The whole "earn points" thing strikes me as disgusting on a profound level,
 and I will never implement it. 
A points system has utterly no place in a simulation such as this one. 
No words could describe how disingenous, shoe horned, ham fisted, 
 or contemptuous towards users this would be. 

Nevertheless, there needs to be a reason for people to use this simulation. 
Considering the amount of time spent developing it, 
 there does need to be a reason as to why people would spend 
 more than just a cursory glance at it. 
I feel the simulation deserves as much. 

I think one of the halmarks of a good game is that
 you get a continuous sense of growth and progression while playing it. 
Games like Civilization mastered this concept: 
 no matter where you were in the game, 
 provided you had not yet seen all it had to offer,
 it always felt as if there were something new to explore:
  a new technology or mechanic to unlock, 
  a new age of progression, 
  or new territory to conquer.
I would like to replicate that feeling, 
 not so much by introducing new assets to the game, 
 but by instilling that sense of continunous growth and progression within the person themself. 
I want the user to look back on his time spent playing the game, 
 and realized how much he's learned about the world,
 how much more he knows that he didn't before,
 and how worthwhile it has been to play the game. 

It is hard to achieve this goal, 
 much harder than shoe horning a points system 
 or exploiting some primitive part of the user's brain,
 but I think it is achievable.
Already I see an inkling of it when I play the game.
Sometimes, when messing with parameters,
 I discover some obscure region of parameter space 
 that offers something I hadn't considered before,
 and I feel as if I am opened up to the possibilities of what could be. 
I get a small glimpse of how great our universe is,
 and how little we otherwise see of it. 
The game still suffers bugs that question the integrity of the simulation.
We need more mechanics, and a steady sense of progression,
 so as to not overwelm the user or create some flash in the pan. 
We also need to give some thought as to how to achieve this goal
 with the limited development resources available. 
But I feel it is tractable, and worth it. 





But enough with the motivational speaking, let's talk game design.

For any application, when adding any feature, you have to consider two complexities:
	
	* What is the complexity of cost to the developer? 
	* What is the complexity of benefit to the user? 

Both of these complexities are expressed using "big-O" notation. 
Both of these complexities are described with respect to the number of existing features. 

So for instance, in Minecraft, when adding a basic block to the game (such as stone), 
the cost complexity is O(1) and the value complexity is O(1). It pretty much takes a constant amount of time to implement, and when the user sees it in the game, he will treat it just like any other block. 

If you implemented a mob (like a dog) that is meant to have unique reactions to 
every other entity in the game, then the cost complexity is O(N), 
since for every other entity you have to code some behavior.
If this becomes a central aspect of the game, 
so that virtually every user wants to see every reaction the dog has,
then the benefit complexity is also O(N), 
since the user gets to see something new for every other entity in the game.
However, if the dog isn't very relevant to gameplay,
there is a danger most users will only take a cursory glance at the dog 
and not care to appreciate all its unique reactions. 
In this case, the cost complexity is still O(N) but the benefit complexity is O(1).
As a developer, this is a very bad place to be.

But what if instead you were to implement a feature like fire.
Fire follows a simple set of rules within the game. 
Implementing these rules takes more effort to implement than a stone block,
but the time it takes to implement does not vary with the number of features in the game,
so the cost complexity is still O(1).
However, fire interacts combinatorially with the rest of the game,
 introducing new concepts when combining it with existing features:
 arson, trash disposal, forest fires, etc. 
Some of these features are very unique, you simply don't see them in other games,
 and some might not have even been conceived at the time the feature was added,
 yet they all behave in a fairly sensible fashion.
It may have been implemented in O(1) time, 
 yet the benefits you reap are O(N) complexity. 

We need more features like fire and less features like dogs. 
We need features that offer the highest cost:benefit complexity ratio. 
We need mechanics that are implemented in constant time,
 without having to consider all the ways it could interact with existing components,
 yet when the users see them, they combine together to create many
 behaviors and situations, both surprising and reasonable. 
