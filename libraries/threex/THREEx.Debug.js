//just a bunch of throw away function that make it easy to debug from the developer console

function point (position, color, size) {
	var colors = {
		'red': 0xFF0000,
		'green': 0x00FF00,
		'blue': 0x0000FF,
		'white': 0xFFFFFF,
	};

	size = size || 0.05;
	color = colors[color] || color || colors['white'];
	material = new THREE.MeshBasicMaterial( { color: color } );

	geometry = new THREE.BoxGeometry(size,size,size);
	mesh = new THREE.Mesh(geometry, material);
	mesh.position = position;
	view.scene.add(mesh);
}

function basis (matrix) {
	point(new THREE.Vector3(1,0,0).applyMatrix4(matrix), 'red')
	point(new THREE.Vector3(0,1,0).applyMatrix4(matrix), 'green')
	point(new THREE.Vector3(0,0,1).applyMatrix4(matrix), 'blue')
}