'use strict';


function Memo(initial_value, get_value, is_dirty) {
    is_dirty = is_dirty === void 0? true : is_dirty;
    get_value = get_value === void 0? (result => result) : get_value;
    var value = initial_value;
    this.invalidate = function() {
        is_dirty = true;
    }
    this.value = function(){
        if (is_dirty) {
            // NOTE: we set is_dirty first in order to resolve circular dependencies between memos
            //  e.g. snow coverage depends on temperature which depends on albedo which depends on snow coverage
            is_dirty = false;
            value = get_value(value); 
        }
        return value;
    }
}
