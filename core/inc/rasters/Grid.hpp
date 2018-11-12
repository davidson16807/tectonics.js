#pragma once

#include <unordered_set>

#include <glm/gtx/hash.hpp>

// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is the lowest level data structure in the app - all raster operations under rasters/ depend on it

namespace rasters {

	using glm;
	using composites;

	class Grid
	{
	public:

		// Precomputed map between buffer array ids and grid cell ids
		// This helps with mapping cells within the model to buffer arrays in three.js
		// Map is created by flattening this.parameters.faces
		uints 			buffer_array_vertex_ids;

		//ivecNs 		vertex_neighbor_ids;
		// ints 		vertex_neighbor_count;
		vec3s 			vertex_pos;
		// floats 		vertex_areas;

		uvec3s 			face_vertex_ids;
		//uvec3s 		face_edge_ids;
		//uvec3s 		face_neighbor_ids; // NOTE: only useful because it's constant size, AFAIK
		//mat3x3		face_endpoints;
		//vec3s 		face_midpoints;
		//vec3s 		face_normals;
		//floats 		face_areas;

		uvec2s 			edge_vertex_ids;
		//uvec2s 		edge_face_ids;
		//uvec3s 		edge_neighbor_ids; // NOTE: no known use, only theoretical
		mat2x3			edge_endpoints;
		//vec3s 		edge_midpoints;
		floats 			edge_distances;
		float 			edge_average_distance;

		uvec2s 			arrow_vertex_ids;
		//uvec2s 		arrow_face_ids;
		//uvec3s 		arrow_neighbor_ids; // NOTE: no known use, only theoretical
		mat2x3s			arrow_endpoints;
		//vec3s 		arrow_midpoints;
		// vec3s 		arrow_offset;
		floats 			arrow_distances;
		float 			arrow_average_distance;

		~Grid()
		{

		}
		Grid(vec3s vertices, uvec3s faces)
			: vertex_pos(vertices), 
			  face_vertex_ids(faces)
		{
			buffer_array_vertex_ids = ints(face_vertex_ids.size() * 3);
			for (unsigned int i=0, i3=0; i<face_vertex_ids.size(); i++, i3+=3) 
			{
				buffer_array_vertex_ids[i3+0] = face_vertex_ids[i].x;
				buffer_array_vertex_ids[i3+1] = face_vertex_ids[i].y;
				buffer_array_vertex_ids[i3+2] = face_vertex_ids[i].z;
			};

			// Step 1: generate arrows from face_vertex_ids
			// TODO: REMOVE DUPLICATE ARROWS!
			std::unordered_set<uvec2> arrow_vertex_ids_set = std::unordered_set<uvec2>(faces.size()*3);
			for (unsigned int i=0; i<face_vertex_ids.size(); i++) 
			{
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].x, face_vertex_ids[i].y));
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].y, face_vertex_ids[i].x));
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].x, face_vertex_ids[i].z));
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].z, face_vertex_ids[i].x));
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].y, face_vertex_ids[i].z));
				arrow_vertex_ids_set.insert(uvec2(face_vertex_ids[i].z, face_vertex_ids[i].y));
			}
		    // sort arrows using a vector to avoid cache misses when retrieving indices
			std::vector<uvec2> arrow_vertex_ids_vector = std::vector<uvec2>(arrow_vertex_ids_set.begin(), arrow_vertex_ids_set.end());
		    std::sort(
		    	arrow_vertex_ids_vector.begin(), 
		    	arrow_vertex_ids_vector.end(), 
		    	[](uvec2 a, uvec2 b) 
		    	{ 
		    		return std::min(a.x,a.y) > std::min(b.x,b.y) || 
		    		      (std::min(a.x,a.y) == std::min(b.x,b.y) && std::max(a.x,a.y) > std::max(b.x,b.y)); 
		    	}
	    	);
			arrow_vertex_ids = uvec2s(arrow_vertex_ids_vector.begin(), arrow_vertex_ids_vector.end());


			arrow_vertex_ids = vec2s(arrow_vertex_ids.size());
			for (unsigned int i=0; i<arrow_vertex_ids.size(); ++i)
			{
				arrow_vertex_ids[i] = distance(vertex_pos[arrow_vertex_ids[i].x], vertex_pos[arrow_vertex_ids[i].y]);
			}
			for (unsigned int i=0; i<arrow_vertex_ids.size(); ++i)
			{
				arrow_endpoints[i] = mat2x3(vertex_pos[arrow_vertex_ids[i].x], vertex_pos[arrow_vertex_ids[i].y]);
				
			}
			arrow_average_distance = mean(arrow_vertex_ids);


			// Step 2: generate edges from arrows,
			//  an arrow should only become an edge if y > x
			std::vector<uvec2> edge_vertex_ids_vector = std::vector<uvec2>();
			std::copy_if (
				arrow_vertex_ids_vector.begin(), 
				arrow_vertex_ids_vector.end(), 
				std::back_inserter(edge_vertex_ids_vector), 
				[](uvec2 a){return a.y > a.x;} 
			);
			edge_vertex_ids = uvec2s(edge_vertex_ids_vector.begin(), edge_vertex_ids_vector.end());


			edge_distances = floats(edge_vertex_ids.size());
			for (unsigned int i=0; i<edge_vertex_ids.size(); ++i)
			{
				edge_distances[i] = distance(vertex_pos[edge_vertex_ids[i].x], vertex_pos[edge_vertex_ids[i].y]);
			}
			edge_average_distance = mean(edge_distances);
		}
	};

	function Grid(parameters, options){
		options = options || {};
		var voronoi_generator = options.voronoi_generator;
		var neighbor_lookup, face, points, vertex;

		this.parameters = parameters;
		

		var neighbor_count = Uint8Raster(this);
		for (var i = 0, li=neighbor_lookup.length; i<li; i++) { 
			neighbor_count[i] = neighbor_lookup[i].length;
		}
		this.neighbor_count = neighbor_count;

		// an "edge" in graph theory is a unordered set of vertices 
		// i.e. this.edges does not contain duplicate neighbor pairs 
		// e.g. it includes [1,2] but not [2,1] 
		var edges = []; 
		var edge_lookup = []; 
		// an "arrow" in graph theory is an ordered set of vertices 
		// it is also known as a directed edge 
		// i.e. this.arrows contains duplicate neighbor pairs 
		// e.g. it includes [1,2] *and* [2,1] 
		var arrows = [];  
		var arrow_lookup = []; 

		var neighbors = []; 
		var neighbor = 0; 
		
		//Precompute a list of neighboring vertex pairs for O(N) traversal 
		for (var i = 0, li=neighbor_lookup.length; i<li; i++) { 
		  neighbors = neighbor_lookup[i]; 
		  for (var j = 0, lj=neighbors.length; j<lj; j++) { 
		    neighbor = neighbors[j]; 
		    arrows.push([i, neighbor]); 
		
		    arrow_lookup[i] = arrow_lookup[i] || []; 
		    arrow_lookup[i].push(arrows.length-1); 
		
		    if (i < neighbor) { 
		      edges.push([i, neighbor]); 
		
		      edge_lookup[i] = edge_lookup[i] || []; 
		      edge_lookup[i].push(edges.length-1); 
		
		      edge_lookup[neighbor] = edge_lookup[neighbor] || []; 
		      edge_lookup[neighbor].push(edges.length-1); 
		    } 
		  } 
		} 

		this.edges = edges; 
		this.edge_lookup = edge_lookup; 
		this.arrows = arrows; 
		this.arrow_lookup = arrow_lookup; 
		
		this.pos_arrow_differential = VectorField.arrow_differential(this.pos); 
	    this.pos_arrow_differential_normalized = VectorRaster.OfLength(arrows.length, undefined)
	    this.pos_arrow_differential_normalized = VectorField.normalize(this.pos_arrow_differential, this.pos_arrow_differential_normalized); 
		this.pos_arrow_distances = Float32Raster.OfLength(arrows.length, undefined)
		VectorField.magnitude(this.pos_arrow_differential, this.pos_arrow_distances);
		this.average_distance = Float32Dataset.average(this.pos_arrow_distances);
		this.average_area = this.average_distance * this.average_distance;

		if (voronoi_generator){
			this._voronoi = voronoi_generator(this.pos, Float32Dataset.max(this.pos_arrow_distances));
		}
	}

	Grid.prototype.getNearestId = function(vertex) { 
		return this._voronoi.getNearestId(vertex); 
	}

	Grid.prototype.getNearestIds = function(pos_field, result) {
		result = result || Uint16Raster(pos_field.grid);
		return this._voronoi.getNearestIds(pos_field, result);
	}

	Grid.prototype.getNeighborIds = function(id) {
		return this.neighbor_lookup[id];
	}

}