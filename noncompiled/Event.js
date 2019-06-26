'use strict';

function Event() {
	this.subscribers = [];
	this.subscribe = function(callback) {
		this.subscribers.push(callback)
	}
	this.fire = function(details) {
		for(var subscriber of this.subscribers){
			try{
				subscriber(details);
			} catch(e){
				// log the failure to the console without interrupting 
				// other subscription events
				console.log(e)
			}
		}
	}
}
