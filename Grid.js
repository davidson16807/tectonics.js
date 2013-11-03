
function Grid(initializer){
	this.initializer = initializer;
	this.template = initializer(1.0);
	
}

Grid.prototype.getRandomPoint = function() {
	var i = Math.floor(Math.random()*this.template.vertices.length);
	return this.template.vertices[i];
}
