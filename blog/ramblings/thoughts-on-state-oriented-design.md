often when you take a look at another's code you feel a sense of frustration about their design
often when you take a look at code you've written month's ago it's like it's written by another person
however when i take a look at code I've written month's or even years ago, not all code fills me with a sense of frustration.
it is true, sometimes i write code that never really fills me with a sense of satisfaction,
there's never really any clear sense of direction on how the code ought to look, 
it's always just trying to accomplish some purpose and this was the most direct way i could do that
when i look back on this code i'm filled with an overwhelming urge to refactor it, to make sense of it again, 
but never in ways i can put to words, and that's part of the problem: words were never applied to the problem
sometimes i do act out on my urges and refactor this code, and i may make marginal improvements, but seldom in a way i feel passionate about
however there is code that i've written that, when i look back on it, i'm filled with a sense of pride
i know when looking at that code, even years after, even though i am a completely different person, even though the code now handles purposes it was never meant to in the first, i know that the code is right

we would like to know what characterizes those two states,
and how do we transition from one state to another?

ideas that inform my process
* what things are beyond my control? (apis, libraries, etc?) how do they manage state? are they stateful? (webgl, dom, event handlers) or stateless (REST)
* what problem do i want to solve? 
  * am i mandating state management in order to reduce the problems i need to manage at this layer? (webgl)
  * am i trying to wrap stateful apis or libraries in a way that allows me to think of them as stateless? (e.g. ip and tcp)
* are there regions of state space that are invalid, regions that don't make sense, or for which behavior cannot possibly be defined in a way that isn't arbitrary? 
  * can i find a way to express state space in such a way that there are no regions of invalidity, thereby allowing a data structure that is free to modify by all? 
  * can there be wrappers put in place to safeguard against entering these regions? (eg. encapsulation)
* are there any performance considerations that mandate stateful design? (e.g. caches) 
* can there be wrappers put in place that allow us to still think statelessly? (e.g. memos, encapsulation) 
* are there ways we can design interfaces to allow us to think statelessly while still respecting performance considerations? ( e.g. "pure" functions where output reference parameters are used instead of return values)
* what is the simplest data structure that can be used to desibe all the values I'm seeing? (e.g. postion vectors, rotation vectors, and matrices)


* traverse all state space, indicate regions of invalidity, minimize them
* reduction of state
* reduction of state transitions

