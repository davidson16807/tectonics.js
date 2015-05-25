// NOTE TO PROJECT CURATORS:
// No modifications are to be made to this file
// This file is not to be referenced by anything outside parallel.js
// Anything to the contrary introduces potential security risk

var isNode = typeof module !== 'undefined' && module.exports;

if (isNode) {
	process.once('message', function (code) {
		eval(JSON.parse(code).data);
	});
} else {
	self.onmessage = function (code) {
		eval(code.data);
	};
}