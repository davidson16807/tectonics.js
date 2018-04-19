'use strict';


function Memo(initial_value, get_value, is_dirty) {
	is_dirty = is_dirty || true;
	var value = initial_value;
	this.invalidate = function() {
		is_dirty = true;
	}
	this.value = function(){
		if (is_dirty) {
			value = get_value(value)
			is_dirty = false;
		}
		return value;
	}
}
