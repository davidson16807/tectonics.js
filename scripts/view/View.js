'use strict';

var _hashPlate = function(plate){
	return plate.uuid;
}

function View(grid, fragmentShader, vertexShader){
	this.grid = grid;
	this._fragmentShader = fragmentShader;
	this._vertexShader = vertexShader;
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

	var this_ = this;
	Publisher.subscribe('plate.matrix', 'update', function (content){
		this_.matrix_update(content.uuid, content.value)
	});
	Publisher.subscribe('plate.cells', 'update', function (content) {
		this_.cell_update(content.uuid, content.value);
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

View.prototype.fragmentShader = function(fragmentShader){
	if(this._fragmentShader === fragmentShader){
		return;
	}
	this._fragmentShader = fragmentShader;

	var views = this.plateViews.values();
	for (var i = 0, li = views.length; i < li; i++) {
		views[i].fragmentShader(fragmentShader);
	};
}

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
View.prototype.cell_update = function(uuid, cells){
	var view = this.plateViews.get(uuid);
	if (view.length < 1) {
		console.log('warning: nothing in view matches this plate!')
		return;
	};
	view.cell_update(cells);
}

View.prototype.add = function(plate){
	var view = new PlateView(this.scene, plate, 
		this._uniforms, this._vertexShader, this._fragmentShader);
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