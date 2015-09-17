/*Represents a grid of evenly distributed cells upon a sphere.
    Cells are positioned in a pattern resembling the seeds on a sunflower,
    ultimately based upon the golden ratio / the fibonacci sequence.
    This approach allows for any number of cells to be evenly and efficiently
    distributed on a sphere.
    All implementation details are based upon Swinbank & Purser 2006*/

THREEx.FibonacciSphereGeometry = (function () {
	var sqrt = Math.sqrt, 
		pow = Math.pow,
		round = Math.round,
		cos = Math.cos,
		sin = Math.sin;
	function log(val, base) {
	  return Math.log(val) / Math.log(base);
	}
	var golden_ratio = 1.61803399;
	var golden_angle = 2 * Math.PI * golden_ratio;
	var sqrt5 = sqrt(5)
	function fib (n) {
		// Returns the nth fibonacci number
	    return round((pow(golden_ratio, n) - pow(-golden_ratio, -n)) / sqrt(5));
	}
	function _lon(i) {
		return golden_angle*i;
	}
	function _z(i,n) {
		return 2*i/(2*n+1);
	}
	function _xy(z)  {
		return sqrt(1-pow(z,2));
	}
	function _pos(i, n){
		return [];
	}

	return function (radius, pointNum, cached) {
		var pointsPerHemisphere = pointNum / 2;
		var vertices = []
		for (var i = -pointsPerHemisphere, vertex; i < pointsPerHemisphere; i++) {
	       	vertex = new THREE.Vector3(
	       		radius * cos(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
					radius * sin(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
			 		radius * _z(i,pointsPerHemisphere)
			 	)
            vertices.push(vertex);
		};

		function initByNewMethod() {
			THREE.Geometry.call( this_ );
			var faces = [];
			// for i in 0:k where k is largest possible index for a fibonacci number on the grid:
			// 		for j in 0:N-fib(i+2):
			// 			create face with vertices at index j+fib(i), j+fib(i+1), and j+fib(i+2)
			var max_i = log(pointsPerHemisphere * sqrt5, golden_ratio) + 1;
			// console.log("max_i", max_i);
			for (var j = 0; j < vertices.length; j++) {
				var min_distance_i = 1;
				var min_distance = Infinity;
				for (var i = 1; i < max_i; i++) {
					if (j+fib(i) >= vertices.length) {
						break;
					};

					var distance = vertices[j].distanceTo(vertices[j+fib(i)]);
					if (distance < min_distance) {
						min_distance = distance;
						min_distance_i = i;
					};
				};

				var offset = 1;
				if (j+fib(min_distance_i+offset) < vertices.length) {
					faces.push([
						j,
						j+fib(min_distance_i),
						j+fib(min_distance_i+offset),
					 ]);
				};

				offset = 2;
				if (j+fib(min_distance_i+offset) < vertices.length) {
					faces.push([
						j+fib(min_distance_i+offset),
						j,
						j+fib(min_distance_i),
					 ]);
				};
			};

			this_.vertices = vertices;
			this_.faces = [];
			// Convert faces into instances of THREE.Face3
			for ( var i = 0, li = faces.length; i < li; i++ ) {
				this_.faces.push( new THREE.Face3( 
					faces[ i ][ 0 ],
					faces[ i ][ 1 ],
					faces[ i ][ 2 ]
				) );
			}
			// computeUvs();
			// this_.computeFaceNormals();
			// this_.computeVertexNormals();
		}

		function initByHull() {
		}

		function initByCache(cached) {
		}

		
		// THREE.ConvexGeometry.call(this, vertices);
		// return;



		/**
		 * Whether the face is visible from the vertex
		 */
		function visible( face, vertex ) {

			var va = vertices[ face[ 0 ] ];
			var vb = vertices[ face[ 1 ] ];
			var vc = vertices[ face[ 2 ] ];

			var n = normal( va, vb, vc );

			// distance from face to origin
			var dist = n.dot( va );

			return n.dot( vertex ) >= dist; 

		}

		/**
		 * Face normal
		 */
		function normal( va, vb, vc ) {

			var cb = new THREE.Vector3();
			var ab = new THREE.Vector3();

			cb.subVectors( vc, vb );
			ab.subVectors( va, vb );
			cb.cross( ab );

			cb.normalize();

			return cb;

		}

		/**
		 * Detect whether two edges are equal.
		 * Note that when constructing the convex hull, two same edges can only
		 * be of the negative direction.
		 */
		function equalEdge( ea, eb ) {

			return ea[ 0 ] === eb[ 1 ] && ea[ 1 ] === eb[ 0 ]; 

		}

		/**
		 * Create a random offset between -1e-6 and 1e-6.
		 */
		function randomOffset() {

			return ( Math.random() - 0.5 ) * 2 * 1e-6;

		}


		/**
		 * XXX: Not sure if this is the correct approach. Need someone to review.
		 */
		function vertexUv( vertex ) {

			var mag = vertex.length();
			return new THREE.Vector2( vertex.x / mag, vertex.y / mag );

		}

		// Push vertices into `this.vertices`, skipping those inside the hull
		// var id = 0;
		// var newId = new Array( vertices.length ); // map from old vertex id to new id

		// for ( var i = 0, li = faces.length; i < li; i++ ) {

		// 	 var face = faces[ i ];

		// 	 for ( var j = 0; j < 3; j++ ) {

		// 			if ( newId[ face[ j ] ] === undefined ) {

		// 					newId[ face[ j ] ] = id++;
		// 					this.vertices.push( vertices[ face[ j ] ] );

		// 			}

		// 			face[ j ] = newId[ face[ j ] ];

		// 	 }

		// }
		THREE.Geometry.call( this );

		if (cached !== void 0) {
			var faces = cached;
		} else {
			var faces = [ [ 0, 1, 2 ], [ 0, 2, 1 ] ]; 

			var vertex, vertexId, mag, hole, f, face, e, edge, boundary, h;
			for ( var i = 3, li = vertices.length; i < li; i++ ) {
				vertexId = i;
				vertex = vertices[ vertexId ].clone();

				mag = vertex.length();
				vertex.x += mag * randomOffset();
				vertex.y += mag * randomOffset();
				vertex.z += mag * randomOffset();

				hole = [];
				lh = hole.length;

				for ( f = 0, lf = faces.length; f < lf; ) {

					face = faces[ f ];

					// for each face, if the vertex can see it,
					// then we try to add the face's edges into the hole.
					if ( visible( face, vertex ) ) {

						for ( e = 0; e < 3; e++ ) {

							edge = [ face[ e ], face[ ( e + 1 ) % 3 ] ];
							boundary = true;

							// remove duplicated edges.
							for ( h = 0; h < lh; h++) {

								if ( equalEdge( hole[ h ], edge ) ) {

									hole[ h ] = hole[ lh - 1 ];
									hole.pop();
									lh--;
									boundary = false;
									break;

								}

							}

							if ( boundary ) {

								hole.push( edge );
								lh++;

							}

						}

						// remove faces[ f ]
						faces[ f ] = faces[ faces.length - 1 ];
						faces.pop();
						lf--;

					} else { // not visible

						f++;

					}
				}

				// construct the new faces formed by the edges of the hole and the vertex
				for ( var h = 0; h < lh; h++ ) {
					faces.push( [ 
						hole[ h ][ 0 ],
						hole[ h ][ 1 ],
						vertexId
					] );
				}
			}
		}

		this.vertices = vertices;
		// console.log(faces);
		// Convert faces into instances of THREE.Face3
		for ( var i = 0, li = faces.length; i < li; i++ ) {

			this.faces.push( new THREE.Face3( 
					faces[ i ][ 0 ],
					faces[ i ][ 1 ],
					faces[ i ][ 2 ]
			) );

		}

		// Compute UVs
		for ( var i = 0, li = faces.length; i < li; i++ ) {

			var face = this.faces[ i ];

			this.faceVertexUvs[ 0 ].push( [
				vertexUv( this.vertices[ face.a ] ),
				vertexUv( this.vertices[ face.b ] ),
				vertexUv( this.vertices[ face.c ])
			] );

		}

		this.computeFaceNormals();
		this.computeVertexNormals();

	}
	//return function (radius, pointNum) {
	//	THREE.Geometry.call(this);
	//	
	//	this.pointNum = pointNum;
	//	
	//	var pointsPerHemisphere = pointNum / 2;
	//	
	//	for (var i = -pointsPerHemisphere/2, vertex; i < pointsPerHemisphere/2; i++) {
    //    	vertex = new THREE.Vector3(
    //    		radius * cos(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
	// 			radius * sin(_lon(i)) * _xy(_z(i,pointsPerHemisphere)), 
	//	 		radius * _z(i,pointsPerHemisphere)
	//	 	)
    //        this.vertices.push(vertex);
	//	};
	//	console.log(this.vertices);
	//	
	//	THREEx.QuickHull(this);
	//};
})();


THREEx.FibonacciSphereGeometry.prototype = Object.create(THREE.Geometry.prototype);
THREEx.FibonacciSphereGeometry.prototype.constructor = THREEx.FibonacciSphereGeometry;
