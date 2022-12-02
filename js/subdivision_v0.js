//  This is where most of your code changes belong

function subdivider (input_mesh) {
    this.meshes = [];
    this.new_vertices = [];
    this.new_edges = [];
    this.old_vertices = [];
    this.old_edges = []

    // Initializes this subdivision object with a mesh to use as
    // the control mesh (ie: subdivision level 0).
    this.meshes.push(input_mesh);

    this.split_edge = function (he) {
        var origin = he.getOrigin();
        var end = he.getNext().getOrigin();
        var prev = he.getPrev();
        var next = he.getNext();

        var pos1 = origin.getPos();
        var pos2 = end.getPos();
        var new_x = (pos1.value[0] + pos2.value[0])/2;
        var new_y = (pos1.value[1] + pos2.value[1])/2;
        var new_z = (pos1.value[1] + pos2.value[2])/2;

        var vertex_id = this.old_vertices.length + this.new_vertices.length;
        var edge_id = this.old_edges.length + this.new_edges.length;

        var new_vertex = new Vertex(new_x, new_y, new_z, vertex_id);
        var new_he1 = new HalfEdge(edge_id);
        var new_he2 = new HalfEdge(edge_id + 1);

        new_he1.setOrigin(new_vertex);
        new_he2.setOrigin(origin);

        new_he1.setPrev(new_he2);
        new_he1.setNext(next);
        new_he2.setPrev(prev);
        new_he2.setNext(new_he1);
        prev.next.setNext(new_he2);
        next.prev.setPrev(new_he1);

        new_vertex.setEdge(new_he);
        new_he.setOrigin(new_vertex);

        this.new_vertices.push(new_vertex);
        this.new_edges.push(new_he1);
        this.new_edges.push(new_he2);
    }

    // cut a face based on 6 half-edges of the face
    this.cut_a_face = function (id_lo, m) {
        var new_id_lo = this.new_edges.length;
        // triangle one
        var origin = this.new_edges[id_lo+1].getOrigin();
        var end = this.new_edges[id_lo+5].getOirigin();
        var new_edge1 = new HalfEdge();
    }

    this.subdivide_one_level = function(cur_level) {
        var cur_mesh = this.meshes[cur_level];
        var faces = cur_mesh.getFaces();

        // split edges of the same face together
        faces.forEach((face) => {
            var edge1 = face.getEdge();
            var edge2 = edge1.next();
            var edge3 = edge1.prev();
            this.split_edge(edge1);
            this.split_edge(edge2);
            this.split_edge(edge3);
        });

        var num_faces = faces.length;
        assert(this.new_edges.length % 6 == 0);
        for (var i = 0; i < num_faces; i++) {
            this.cur_a_face(i*6);
        }

        // create new mesh
        var new_mesh = new Mesh();
        new_mesh.builMesh(this.new_vertices, [], this.new_faces);
        new_mesh.computeNormal();
        this.meshes.push(new_mesh);
    }

    this.subdivide = function (level) {
        // Subdivides the control mesh to the given subdivision level  .
        // Returns the subdivided mesh .

        // HINT: Create a new subdivision mesh for each subdivision level and
        // store it in memory for later .
        // If the calling code asks for a level that has already been computed,
        // just return the pre-computed mesh!

        // var total_levels = this.meshes.length;
        // if (level > total_levels - 1) {
        //     for (var i = total_levels + 1; i <= level; i++) {
        //         this.new_vertices = [];
        //         this.new_edges = [];
        //         this.old_vertices = this.meshes[i-1].getVertices();
        //         this.old_edges = this.meshes[i-1].getEdges();
        //         this.subdivide_one_level(i);
        //     }
        // }
        // console.log(this.meshes[0].getFaces().length);
        // return this.meshes[level];
        return this.meshes[0];
    }

    this.setMesh = function (mesh) {
        this.clear(mesh);
        this.meshes.push(mesh);
    }

    this.clear = function (m) {
        this.meshes = [];
    }
}
