'use strict';

var _hashPlate = function(plate){
	return plate.uuid;
}

function View(grid, scalarDisplay, vectorDisplay, vertexShader){
	this.grid = grid;
	this._uniforms = {
		sealevel_mod: 1.0
	};
	this.plateViews = new buckets.Dictionary();

	// create a scene
	this.scene = new THREE.Scene();

	// put a camera in the scene
	this.camera	= new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, .01, 10000 );
	this.camera.position.set(0, 0, 5);
	this.scene.add(this.camera);

	this.setScalarDisplay(scalarDisplay);
	this.setVectorDisplay(vectorDisplay);
	this._vertexShader = vertexShader;

	var this_ = this;
	Publisher.subscribe('plate.matrix', 'update', function (content){
		this_.matrix_update(content.uuid, content.value)
	});
	// Publisher.subscribe('plate.cells', 'update', function (content) {
	// 	this_.cell_update(content.uuid, content.value);
	// });
	Publisher.subscribe('world.plates', 'update', function (content) {
		var plate;
		for (var i=0, li=world.plates.length; i<li; ++i) {
		    var plate = world.plates[i];
			this_.cell_update(plate.uuid, plate); 
		}
		// HACK: ideally should not make reference to "world",
		//  but pass the values relevant to the subscriber function
		//  This is so we will be eventually able to implement parallel processing
	});
	Publisher.subscribe('world.plates', 'add', function (content) {
		console.log('world.plates.add')
		this_.add(content.value);
	});
	Publisher.subscribe('world.plates', 'remove', function (content) {
		console.log('world.plates.remove')
		this_.remove(content.value);
	});
	Publisher.subscribe('model.world', 'add', function (content) {
		console.log('model.world.add');
		var world = content.value;
		var plates = world.plates;
		for (var i = 0, li = plates.length; i < li; i++) {
			this_.add(plates[i]);
		};
	});
	Publisher.subscribe('model.world', 'remove', function (content) {
		console.log('model.world.remove');
		var world = content.value;
		var plates = world.plates;
		for (var i = 0, li = plates.length; i < li; i++) {
			this_.remove(plates[i])
		};
	});
	// Publisher.subscribe('model.world', 'update;', function (content) {
	// 	var world = content.value;
	// });
}

View.prototype.setScalarDisplay = function(display) {
	if(this._scalarDisplay === display){
		return;
	}
	var views = this.plateViews.values();

	this._scalarDisplay = display;
	for (var i = 0, li = views.length; i < li; i++) {
		views[i].setScalarDisplay(this._scalarDisplay);
	};
};

View.prototype.setVectorDisplay = function(display) {
	if(this._vectorDisplay === display){
		return;
	}
	var views = this.plateViews.values();

	this._vectorDisplay = display;
	for (var i = 0, li = views.length; i < li; i++) {
		views[i].setVectorDisplay(this._vectorDisplay);
	};
};

View.prototype.vertexShader = function(vertexShader){
	if(this._vertexShader === vertexShader){
		return;
	}
	this._vertexShader = vertexShader;

	var views = this.plateViews.values();
	for (var i = 0, li = views.length; i < li; i++) {
		views[i].vertexShader(vertexShader);
	};
}

View.prototype.uniform = function(key, value){
	if(this._uniforms[key] === value){
		return;
	}
	this._uniforms[key] = value;
	
	var views = this.plateViews.values();
	for (var i = 0, li = views.length; i < li; i++) {
		views[i].uniform(key, value);
	};
}
View.prototype.matrix_update = function(uuid, matrix) {
	var view = this.plateViews.get(uuid);
	if (view.length < 1) {
		console.log('warning: nothing in view matches this plate!')
		return;
	};
	view.matrix_update(matrix);
};

View.prototype.cell_update = function(uuid, plate){
	var view = this.plateViews.get(uuid);
	if (view.length < 1) {
		console.log('warning: nothing in view matches this plate!')
		return;
	};
	view.cell_update(plate);
}

View.prototype.add = function(plate){
	var view = new PlateView(this.scene, plate, 
		this._uniforms, this._vertexShader, this._scalarDisplay, this._vectorDisplay);
	this.plateViews.set(_hashPlate(plate), view);
}

View.prototype.remove = function(plate){
	var view = this.plateViews.get(_hashPlate(plate));
	if (view.length < 1) {
		console.log('warning: nothing in view matches this plate!')
		return;
	};
	view.destroy();
	this.plateViews.remove(_hashPlate(plate));
}