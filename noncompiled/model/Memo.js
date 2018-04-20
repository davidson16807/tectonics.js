'use strict';


function Memo(initial_value, get_value, is_dirty) {
	is_dirty = is_dirty === void 0? true : is_dirty;
	var value = initial_value;
	this.invalidate = function() {
		is_dirty = true;
	}
	this.value = function(){
		if (is_dirty) {
			// NOTE: we set is_dirty first in order to resolve circular dependencies between memos
			//  e.g. ice coverage depends on temperature which depends on albedo which depends on ice coverage
			is_dirty = false;
			value = get_value(value); 
		}
		return value;
	}
}
