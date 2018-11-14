#pragma once

#include <unordered_set>
#include <vector>

#include <glm/vec2.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <glm/vec3.hpp>     // vec3, bvec3, dvec3, ivec3 and uvec3
#include <composites/composites.hpp>     // vec2, bvec2, dvec2, ivec2 and uvec2
#include <composites/glm/glm.hpp>     // vec*, bvec*, dvec*, ivec* and uvec*

#define GLM_ENABLE_EXPERIMENTAL
#include <glm/gtx/hash.hpp>

// The Grid class is the one stop shop for high performance grid cell operations
// You can find grid cells by neighbor, by position, and by the index of a WebGL buffer array
// It is the lowest level data structure in the app - all raster operations under rasters/ depend on it

namespace rasters {

	using namespace glm;
	using namespace composites;

	class Grid
	{
	public:

		// Precomputed map between buffer array ids and grid cell ids
		// This helps with mapping cells within the model to buffer arrays in three.js
		// Map is created by flattening this.parameters.faces
		uints 		buffer_array_vertex_ids;

		//ivecNs 	vertex_neighbor_ids;
		//ints 		vertex_neighbor_count;
		vec3s 		vertex_pos;
		vec3s 		vertex_normals;
		floats 		vertex_areas;
		float		vertex_average_distance;


		uints 		face_vertex_id_a;
		uints 		face_vertex_id_b;
		uints 		face_vertex_id_c;
		//uints 	face_edge_id_a;
		//uints 	face_edge_id_b;
		//uints 	face_edge_id_c;
		vec3s 		face_endpoint_a;
		vec3s 		face_endpoint_b;
		vec3s 		face_endpoint_c;
		vec3s 		face_midpoints;
		vec3s 		face_normals;
		floats 		face_areas;
		float 		face_average_area;

		uints 		edge_vertex_id_a;
		uints 		edge_vertex_id_b;
		//uints 	edge_face_id_a;
		//uints 	edge_face_id_b;
		vec3s 		edge_endpoint_a;
		vec3s 		edge_endpoint_b;
		vec3s 		edge_midpoints;
		floats 		edge_distances;
		float		edge_average_distance;
		vec3s 		edge_normals;
		//floats 	edge_areas;
		
		uints 		arrow_vertex_id_from;
		uints 		arrow_vertex_id_to;
		//uints 	arrow_face_id_a;
		//uints 	arrow_face_id_b;
		vec3s 		arrow_endpoint_from;
		vec3s 		arrow_endpoint_to;
		vec3s 		arrow_midpoints;
		vec3s 		arrow_offsets;
		floats 		arrow_distances;
		float		arrow_average_distance;
		vec3s 		arrow_normals;
		//floats 	arrow_areas;

		~Grid()
		{

		}
		Grid(vec3s vertices, uvec3s faces)
			: 
			  	buffer_array_vertex_ids(faces.size() * 3),

			//	vertex_neighbor_ids(0),
			//	vertex_neighbor_count(0),
				vertex_pos(vertices),
				vertex_normals(vertices.size()),
				vertex_areas(vertices.size()),
				vertex_average_distance(0),

				face_vertex_id_a(faces.size()),
				face_vertex_id_b(faces.size()),
				face_vertex_id_c(faces.size()),
			//	face_edge_id_a(faces.size()),
			//	face_edge_id_b(faces.size()),
			//	face_edge_id_c(faces.size()),
				face_endpoint_a(faces.size()),
				face_endpoint_b(faces.size()),
				face_endpoint_c(faces.size()),
				face_midpoints(faces.size()),
				face_normals(faces.size()),
				face_areas(faces.size()),
				face_average_area(0),

				edge_vertex_id_a(0),
				edge_vertex_id_b(0),
			//	edge_face_id_a(0),
			//	edge_face_id_b(0),
				edge_endpoint_a(0),
				edge_endpoint_b(0),
				edge_midpoints(0),
				edge_distances(0),
				edge_average_distance(0),
				edge_normals(0),
			//	edge_areas(0),
				
				arrow_vertex_id_from(0),
				arrow_vertex_id_to(0),
			//	arrow_face_id_a(0),
			//	arrow_face_id_b(0),
				arrow_endpoint_from(0),
				arrow_endpoint_to(0),
				arrow_midpoints(0),
				arrow_offsets(0),
				arrow_distances(0),
				arrow_average_distance(0),
				arrow_normals(0)
			//	arrow_areas(0),
		{
			for (unsigned int i=0, i3=0; i<faces.size(); i++, i3+=3) 
			{
				buffer_array_vertex_ids[i3+0] = faces[i].x;
				buffer_array_vertex_ids[i3+1] = faces[i].y;
				buffer_array_vertex_ids[i3+2] = faces[i].z;
			};

			// Step 1: generate arrows from faces
			// TODO: REMOVE DUPLICATE ARROWS!
			std::unordered_set<uvec2> arrow_vertex_ids_set;
			for (unsigned int i=0; i<faces.size(); i++) 
			{
				arrow_vertex_ids_set.insert(uvec2(faces[i].x, faces[i].y));
				arrow_vertex_ids_set.insert(uvec2(faces[i].y, faces[i].x));
				arrow_vertex_ids_set.insert(uvec2(faces[i].x, faces[i].z));
				arrow_vertex_ids_set.insert(uvec2(faces[i].z, faces[i].x));
				arrow_vertex_ids_set.insert(uvec2(faces[i].y, faces[i].z));
				arrow_vertex_ids_set.insert(uvec2(faces[i].z, faces[i].y));
			}
		    // sort arrows using a vector to avoid cache misses when retrieving indices
			std::vector<uvec2> arrow_vertex_ids_vector(arrow_vertex_ids_set.begin(), arrow_vertex_ids_set.end());
		    std::sort(
		    	arrow_vertex_ids_vector.begin(), 
		    	arrow_vertex_ids_vector.end(), 
		    	[](uvec2 a, uvec2 b) 
		    	{ 
		    		return std::min(a.x,a.y) > std::min(b.x,b.y) || 
		    		      (std::min(a.x,a.y) == std::min(b.x,b.y) && std::max(a.x,a.y) > std::max(b.x,b.y)); 
		    	}
	    	);


			// Step 2: generate edges from arrows,
			//  an arrow should only become an edge if y > x
			std::vector<uvec2> edge_vertex_ids_vector;
			std::copy_if (
				arrow_vertex_ids_vector.begin(), 
				arrow_vertex_ids_vector.end(), 
				std::back_inserter(edge_vertex_ids_vector), 
				[](uvec2 a){return a.y > a.x;} 
			);

			uvec2s edge_vertex_ids  (edge_vertex_ids_vector.begin(), edge_vertex_ids_vector.end());
			uvec2s arrow_vertex_ids (arrow_vertex_ids_vector.begin(), arrow_vertex_ids_vector.end());

			get_x(faces, face_vertex_id_a);
			get_y(faces, face_vertex_id_a);
			get_z(faces, face_vertex_id_a);
			get(vertex_pos, face_vertex_id_a, face_endpoint_a);
			get(vertex_pos, face_vertex_id_b, face_endpoint_b);
			get(vertex_pos, face_vertex_id_c, face_endpoint_c);
			face_midpoints = (face_endpoint_a + face_endpoint_b + face_endpoint_c) / 3.;
			face_normals   = normalize(cross(face_endpoint_c - face_endpoint_b, face_endpoint_a - face_endpoint_b)); 
			face_areas     = length   (cross(face_endpoint_c - face_endpoint_b, face_endpoint_a - face_endpoint_b)) / 2.; 
			// ^^^ NOTE: the magnitude of cross product is the area of a parallelogram, so half that is the area of a triangle
			face_average_area = mean(face_areas);

			vertex_areas = floats(vertices.size());
			floats face_vertex_areas_a = length(cross((face_endpoint_c - face_endpoint_a)/2., (face_endpoint_b - face_endpoint_a)/2.)) / 2.; 
			floats face_vertex_areas_b = length(cross((face_endpoint_a - face_endpoint_b)/2., (face_endpoint_c - face_endpoint_b)/2.)) / 2.; 
			floats face_vertex_areas_c = length(cross((face_endpoint_b - face_endpoint_c)/2., (face_endpoint_a - face_endpoint_c)/2.)) / 2.; 
			// ^^^ NOTE: these 3 represent the surface area of the face that lies within a vertex's region of influence
			aggregate_into(face_vertex_areas_a, face_vertex_id_a, [](float a, float b){ return a+b; }, vertex_areas);
			aggregate_into(face_vertex_areas_b, face_vertex_id_b, [](float a, float b){ return a+b; }, vertex_areas);
			aggregate_into(face_vertex_areas_c, face_vertex_id_c, [](float a, float b){ return a+b; }, vertex_areas);
			vertex_average_area = mean(vertex_areas);

			vertex_normals = floats(vertices.size());
			vec3s face_area_weighted_normals = face_normals * face_areas;
			aggregate_into(face_area_weighted_normals, face_vertex_id_a, [](vec3 a, vec3 b){ return a+b; }, vertex_normals);
			aggregate_into(face_area_weighted_normals, face_vertex_id_b, [](vec3 a, vec3 b){ return a+b; }, vertex_normals);
			aggregate_into(face_area_weighted_normals, face_vertex_id_c, [](vec3 a, vec3 b){ return a+b; }, vertex_normals);
			normalize(vertex_normals, vertex_normals);

			edge_vertex_id_a 		= get_x(edge_vertex_ids);
			edge_vertex_id_b 		= get_y(edge_vertex_ids);
			edge_endpoint_a 		= get(pos, edge_vertex_id_a);
			edge_endpoint_b 		= get(pos, edge_vertex_id_b);
			edge_midpoints 			= (edge_endpoint_a + edge_endpoint_b) / 2.;
			edge_distances 			= distance(edge_endpoint_a, edge_endpoint_b);
			edge_average_distance 	= mean(edge_distances);
			edge_normals 			= (get(vertex_normals, edge_vertex_id_a) + get(vertex_normals, edge_vertex_id_b)) / 2.;

			arrow_vertex_id_from 	= get_x(arrow_vertex_ids);
			arrow_vertex_id_to   	= get_y(arrow_vertex_ids);
			arrow_endpoint_from 	= get(pos, arrow_vertex_id_from);
			arrow_endpoint_to   	= get(pos, arrow_vertex_id_to);
			arrow_midpoints 		= (arrow_endpoint_from + arrow_endpoint_to) / 2.;
			arrow_distances 		= distance(arrow_endpoint_from, arrow_endpoint_to);
			arrow_offsets 			= arrow_endpoint_to - arrow_endpoint_from;
			arrow_average_distance 	= mean(arrow_distances);
			arrow_normals 			= (get(vertex_normals, arrowvertex_id_a) + get(vertex_normals, arrowvertex_id_b)) / 2.; 

		}
	};

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