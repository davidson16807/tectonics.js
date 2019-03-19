'use strict';

function stop(message) {
    throw message;
}

var log_once = (function () {
    var logged = {};
    return function(message) {
        if (!logged[message]) {
            logged[message] = true;
            console.log(message);
        }
    }
})();

var throw_once = (function () {
    var thrown = {};
    return function(message) {
        if (!thrown[message]) {
            thrown[message] = true;
            throw message;
        }
    }
})();
