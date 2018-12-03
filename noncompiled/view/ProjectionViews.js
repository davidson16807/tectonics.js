'use strict';

var projectionViews = {};
projectionViews.equirectangular	= new MapProjectionView(vertexShaders.equirectangular);
projectionViews.texture			= new MapProjectionView(vertexShaders.texture);
projectionViews.orthographic	= new GlobeProjectionView();
