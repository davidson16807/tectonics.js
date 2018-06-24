function Model (parameters) {
	var _subject 			= void 0;
	this.paused 			= parameters.paused || false;
	this.speed 				= parameters.speed || 1;
	this.elapsed_time		= parameters.elapsed_time || 0;
	this.seed 				= parameters.seed || 0;
	this._last_update_timestamp = 0;

	// the "subject" is the singular entity we are modeling
	// it can anything that implements the correct interface: a universe, a planet, an atmosphere, etc.
	this.subject = parameters['subject'];

	this.subject = function(subject) {
		if (subject === void 0) {
			return _subject;
		};
		_subject = subject;
		subject.initialize();
	};
	this.subject(parameters.subject);

	this.update = function() {
		var now = performance.now();
		var seconds = (now - this._last_update_timestamp)/1000;
		this._last_update_timestamp = now;

		//minimum refresh rate of 5fps
		if (seconds > 1/5){
			return;
		}

		if (this.paused){
			return;
		}

		if (_subject === void 0) {
			return;
		}

		this.elapsed_time += this.speed * seconds;

		var timestep = this.speed * seconds / Units.SECONDS_IN_MEGAYEAR;

		_subject.invalidate(timestep);
		_subject.calcChanges(timestep);
		_subject.applyChanges(timestep);
	};

	this.toggle_pause = function () {
		this.paused = !this.paused;
	}
}
