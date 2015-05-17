---
title: Saves and Exports
layout: default
---

There's been a few recent items in the project's issue tracker. They'd been slowly accumulating while I was busy focused on other projects. I decided to get back to the project to implement some much needed functionality. 

First on the chopping block: implement some way to export a world to a format that's readily consumable as a texture in a 3d model file. For a while now, the application's been able to do this to some capacity through screenshots. Screenshots are a good starting point, but outstanding issues with the display made it arduous to convert from screenshot to texture file. 

Circumstances involving the implementation of the equirectangular projection meant edges of the map were jagged. These jagged edges loosely corresponded to vertices in the icosahedrons used to represent tectonic plates. To resolve this issue, a second mesh is generated for each plate represented by the simulation. This second mesh differs only by an offset that's used to express which side of the screen it should render on. This modification really highlighted the benefit of using a model/view based architecture - meshes used to represent the plate were kept seperate from the meshes that were actually rendered to the screen, so adding an duplicate mesh for the render didn't have to mean duplicating properties of the model. 

There was also a need to generate equirectangular maps in a manner that was able to occupy the whole screen. This was to prevent the user from having to manually crop screenshots in order to make a texture. This was easy enough and amounted to a few lines of shader code.

Textures aren't even the limit to what could be done as far as exporting goes. It's planned at some point to export the entire 3d model, textures and all. I don't see too many things holding this back. The mesh itself is just a sphere - it can be kept as a static file on the server. I expect the bulk of the work will be in packaging this with the texture and sending it off to the user. With textures out of the way, though, exporting meshes assumes a lower priority in comparison to other items in the issue tracker. 

Speaking of which, there was another item in the issue tracker for implementing some means of saving and retrieving model state. The actual ideal is to store the model state in the url itself, allowing a permalink to be generated for any arbitrary world. This link could then be shared effortlessly over the internet, without need for things like file hosting. 

From what I calculate, this is going to be an unrealistic vision. A single model run uses somewhere around 10,000 grid cells, each with at least 8 bytes of floating point data. I'm firm on this number - I won't accept any loss of resolution on account of the save feature. A naive implementation would take 80KB to store the model, at best. By using 2 byte floats, you could reduce this number to 40KB, which is far higher than the 8KB allowed in the address bars of most modern browsers. This says nothing of any future changes I'll want to make to model state, some of which could grossly inflate the size of save files. 

Still, that's not stopping me from doing something I'd already planned to do with model: file saves. File saves are a necessary intermediary if ever it does turn out to be possible to encode model state in a url. One way or another, the model has to be reduced to a form that can be expressed acyclically without functions or other complex data structures. Once you have that, its relatively easy to encode it in a string and save it to a file. 

Current file size is pretty consistently 170KB. As mentioned, I'm reasonably confident this number can go down to 40KB. I'm doubtful whether compression would be able to bring this into the range needed to use a query string parameter, though

At present, the save file format offers no guarantees on forward compatibility. Don't get too attached to the worlds you save.