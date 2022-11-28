//  This is where most of your code changes belong

function subdivider (input_mesh) {
    this.meshes = [];

    // Initializes this subdivision object with a mesh to use as
    // the control mesh (ie: subdivision level 0).
    this.meshes.push(input_mesh);

    this.create_new_vertex = function(v1, v2) {
        Vec3 pos1 = v1.getPos();
        Vec3 pos2 = v2.getPos();
        var new_x = (pos1.value[0] + pos2.value[0])/2;
        var new_y = (pos1.value[1] + pos2.value[1])/2;
        var new_z = (pos1.value[1] + pos2.value[2])/2;
        Vertex new_vertex = new Vertex(new_x, new_y, new_z, );
        new_vertex.setFlag('isNew');
    }

    this.split_edge = function (he) {
        Vertex origin = he.getOrigin();
        Vertex end = he.getNext().getOrigin();

    }

    this.subdivide = function (level) {
        // Subdivides the control mesh to the given subdivision level  .
        // Returns the subdivided mesh .

        // HINT: Create a new subdivision mesh for each subdivision level and
        // store it in memory for later .
        // If the calling code asks for a level that has already been computed,
        // just return the pre-computed mesh!

        return NULL; // REPLACE THIS!

        //@@@@@
        // YOUR CODE HERE
        //@@@@@
    }

    this.clear = function (m) {
        this.meshes = [];
    }
}
