// Implementation of the Publisher/Subscriber pattern,
// Used in communication between model and view, hence assumes role of a Controller
// Implemented as a Wrapper of the window's event listener functionality

Publisher = {}
Publisher.publish = function (channel, topic, content, serializeFn) {
	window.dispatchEvent(new CustomEvent('publish', {detail: {
			'channel': channel,
			'topic': topic,
			'content': content
		}}));

	//if (false && IsProd && serializeFn) { // NOTE: to be used upon implementing web workers
    //    window.postMessage({
	//		'channel': channel,
	//		'topic': topic,
    //        'content': serializeFn(content)
    //    }, '*'); // NOTE: change this to something else when IsProd == true
	//};
}

Publisher.subscribe = function (channel, topic, callbackFn, deserializeFn) {
	window.addEventListener('publish', function (event) {
		var detail = event.detail;
		
		if (channel !== detail.channel) {
			return;
		};
		if (topic !== void 0 && topic !== detail.topic){
			return;
		};

		callbackFn(detail.content);
	}, false);

	//if (false && IsProd && deserializeFn) { // NOTE: to be used upon implementing web workers
    //	window.addEventListener('message', function (event) {
	//		var data = event.data;
	//		if (channel !== data.channel) {
	//			return;
	//		};
	//		if (!_.isUndefined(topic) && topic != data.topic){
	//			return;
	//		};
	//		callbackFn(data.content);
	//    }, false);
    //}
}