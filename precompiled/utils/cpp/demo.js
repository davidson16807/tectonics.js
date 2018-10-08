cpp = Rasters()

grid = new cpp.CartesianGridLookup3d(new cpp.vec3(-1), new cpp.vec3(1), 1/100)
grid.add(0, new cpp.vec3())
grid.nearest_id(new cpp.vec3(0.5))

cpp = Rasters()
points = new cpp.vector_vec3()
points.push_back(new cpp.vec3(0))
points.push_back(new cpp.vec3(0.5))
points.push_back(new cpp.vec3(-0.5))
grid = new cpp.VoronoiCubeSphereLookup3d(points, 1/100)