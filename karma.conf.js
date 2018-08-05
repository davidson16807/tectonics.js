/* eslint-env node */
module.exports = function (config) {
	config.set({
		// To debug, run `npm run karma-debug` and press the "Debug" button in the browser window
		browsers: [ 'ChromeHeadless' ],
		frameworks: [ 'qunit' ],
		files: [
			'src/MyLib.js',
			'test/MyLib.test.js'
		],
		autoWatch: false,
		singleRun: true,
		preprocessors: {
			'src/*.js': [ 'coverage' ]
		},
		reporters: [ 'dots', 'coverage' ],
		coverageReporter: {
			reporters: [
				{ type: 'text-summary' },
				{ type: 'html', dir:'coverage/' },
				{ type: 'lcovonly', dir: 'coverage/' },
			],
			check: { global: {
				functions: 90,
				statements: 50,
				branches: 50,
				lines: 50
			} }
		}
	});
};