/**
 * @author spite / http://www.clicktorelease.com/
 * @author mrdoob / http://mrdoob.com/
 */

THREE.BufferGeometryUtils = {

	fromGeometry: function geometryToBufferGeometry( geometry ) {

		if ( geometry instanceof THREE.BufferGeometry ) {

			return geometry;

		}

		var vertices = geometry.vertices;
		var faces = geometry.faces;
		var hasFaceVertexNormals = faces[ 0 ].vertexNormals.length == 3;

		var bufferGeometry = {
		    id: THREE.GeometryIdCount++,
		    uuid: THREE.Math.generateUUID(),
		    name: "",
		    attributes: {
				position: {
					itemSize: 3,
					array: new Float32Array( faces.length * 3 * 3 )
				},
				normal: {
					itemSize: 3,
					array: new Float32Array( faces.length * 3 * 3 )
				}
		    },
		    offsets: [],
		    boundingSphere: null,
		    boundingBox: null,
		    __proto__: THREE.BufferGeometry.prototype
		};

		var positions = bufferGeometry.attributes.position.array;

		for ( var i = 0, i2 = 0, i3 = 0; i < faces.length; i ++, i2 += 6, i3 += 9 ) {

			var face = faces[ i ];

			var a = vertices[ face.a ];
			var b = vertices[ face.b ];
			var c = vertices[ face.c ];

			positions[ i3     ] = a.x;
			positions[ i3 + 1 ] = a.y;
			positions[ i3 + 2 ] = a.z;
			
			positions[ i3 + 3 ] = b.x;
			positions[ i3 + 4 ] = b.y;
			positions[ i3 + 5 ] = b.z;
			
			positions[ i3 + 6 ] = c.x;
			positions[ i3 + 7 ] = c.y;
			positions[ i3 + 8 ] = c.z;

		}

		return bufferGeometry;

	}

}