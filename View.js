function View(world){
	this.world = world;
}

View.prototype.update = function(){
	for(var i=0, li = this.world.plates.length, plates = this.world.plates; i<li; i++){
		for(var j=0, lj = plates[i]._vertices.length, vertices = plates[i]._vertices; j<lj; j++){
			var vertex = vertices[j];
			if(vertex.content){
				vertices[j].setLength(vertices[j].content.elevation);
			} else {
				vertices[j].setLength(world.NA);
			}
		}
	}
}