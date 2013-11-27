
function Style(getWorldLayers, getPlateLayers){
	this.getWorldLayers = getWorldLayers
	this.getPlateLayers = getPlateLayers
}


satelliteStyle = new Style(
function(view){
	var geometry	= world.grid.initializer(view.THRESHOLD);
	asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x000000}) );
	asthenosphere.renderDepth = -1;
	view.scene.add(asthenosphere);
	
	var geometry	= world.grid.initializer(view.SEALEVEL);
	ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32}) ); 
	ocean.renderDepth = -2;
	view.scene.add(ocean);
},
function(view, plate){
	var sealevel = view.world.SEALEVEL
	var epipelagic = sealevel - 200;
	var mountain = sealevel + 5000;
	var land = new Layer(view, 1.05, 
		new THREE.MeshBasicMaterial({color: 0x506e1e}), 
		function(cell){return cell.content.displacement > sealevel});
	var ice = new Layer(view, 1.06, 
		new THREE.MeshBasicMaterial({color: 0xffffff}), 
		function(cell){return cell.content.displacement > epipelagic && Math.abs(plate.mesh.localToWorld(cell.clone()).y) > 0.8});
	var shallow = new Layer(view, 1.04, 
		new THREE.MeshBasicMaterial({color: 0x0a968c}), 
		function(cell){return cell.content.displacement > epipelagic});
	return [land, ice, shallow];
});


debugStyle = new Style(
function(view){
	var geometry	= world.grid.initializer(view.THRESHOLD);
	asthenosphere	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x000000}) );
	asthenosphere.renderDepth = -1;
	view.scene.add(asthenosphere);
	
	var geometry	= world.grid.initializer(view.SEALEVEL);
	ocean	= new THREE.Mesh( geometry, new THREE.MeshBasicMaterial({color:0x0a0a32, transparent:true, opacity:0.5}) ); 
	ocean.renderDepth = -2;
	view.scene.add(ocean);
},
function(view, plate){
	var sealevel = view.world.SEALEVEL
	var land = new Layer(view, 1.05, 
		new THREE.MeshBasicMaterial({color: random.random()*0xffffff}), 
		function(cell){return cell.content.displacement > sealevel});
	return [land];
});