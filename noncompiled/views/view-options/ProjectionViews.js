'use strict';

window.ProjectionViewOptions = window.ProjectionViewOptions || {};

window.ProjectionViewOptions.equirectangular = {
	projection_view_type: 'GlobeProjectionViewResources',
	vertex_shaders: vertexShaders.equirectangular,
};
window.ProjectionViewOptions.texture = {
	projection_view_type: 'GlobeProjectionViewResources',
	vertex_shaders: vertexShaders.texture,
};
window.ProjectionViewOptions.orthographic = {
	projection_view_type: 'GlobeProjectionViewResources' 
};
