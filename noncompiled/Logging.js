'use strict';

function stop(message) {
    throw message;
}

const log_once = (function () {
    const logged = {};
    return function(message) {
        if (!logged[message]) {
            logged[message] = true;
            console.log(message);
        }
    }
})();

const throw_once = (function () {
    const thrown = {};
    return function(message) {
        if (!thrown[message]) {
            thrown[message] = true;
            throw message;
        }
    }
})();
