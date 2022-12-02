//  This is where most of your code changes belong

function subdivider (input_mesh) {
    this.meshes = [];

    this.new_edges = [];
    this.new_faces = [];
    this.new_vertices = [];
    this.old_vertices = [];

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
        var edge_id = this.new_edges.length;

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

        this.new_vertices.push(new_vertex);
        this.new_edges.push(new_he1);
        this.new_edges.push(new_he2);
    }

    this.set_face = function(id1, id2, new_edge) {
        this.new_edges[id1].setNext(new_edge);
        new_edge.setNext(this.new_edges[id2]);
        this.new_edges[id2].setPrev(new_edge);
        new_edge.setPrev(this.new_edges[id1]);
        var new_face = new Face();
        new_face.setEdge(new_edge);

        this.new_edges.push(new_edge);
        this.new_faces.push(new_face);
    }

    // cut a face based on 6 half-edges created during split for one face
    this.cut_a_face = function (id_lo) {
        var new_id_lo = this.new_edges.length;

        var origin = this.new_edges[id_lo+1].getOrigin();
        var new_edge1 = new HalfEdge(new_id_lo);
        new_edge1.setOrigin(origin);

        var origin = this.new_edges[id_lo+3].getOrigin();
        var new_edge2 = new HalfEdge(new_id_lo + 1);
        new_edge2.setOrigin(origin);

        var origin = this.new_edges[id_lo+5].getOrigin();
        var new_edge3 = new HalfEdge(new_id_lo + 2);
        new_edge3.setOrigin(origin);

        // set up faces properly
        this.set_face(id_lo, id_lo+5, new_edge1);
        this.set_face(id_lo+2, id_lo+1, new_edge2);
        this.set_face(id_lo+4, id_lo+3, new_edge3);
    }

    this.subdivide_one_level = function(prev_level) {
        var cur_mesh = this.meshes[prev_level];
        var faces = cur_mesh.getFaces();

        // split 3 edges of the same face together
        // so 6 resulting half-edges will be consecutive
        faces.forEach((face) => {
            var edge1 = face.getEdge();
            var edge2 = edge1.getNext();
            var edge3 = edge1.getPrev();
            this.split_edge(edge1);
            this.split_edge(edge2);
            this.split_edge(edge3);
        });

        var num_faces = faces.length;
        console.assert(this.new_edges.length % 6 == 0);
        for (var i = 0; i < num_faces; i++) {
            this.cut_a_face(i*6);
        }
    }

    this.create_new_mesh = function () {
        // create new mesh
        console.log('creat new mesh');
        var vertices = this.old_vertices.concat(this.new_vertices);
        var new_mesh = new Mesh();
        console.log(vertices);
        console.log(this.new_faces);
        new_mesh.builMesh(vertices, [], this.new_faces);
        new_mesh.computeNormal();
        console.log('add new mesh');
        this.meshes.push(new_mesh);
        console.log(this.meshes);
    }

    this.subdivide = function (level) {
        // Subdivides the control mesh to the given subdivision level  .
        // Returns the subdivided mesh .

        // HINT: Create a new subdivision mesh for each subdivision level and
        // store it in memory for later .
        // If the calling code asks for a level that has already been computed,
        // just return the pre-computed mesh!

        var highest_level = this.meshes.length - 1;
        if (level > highest_level) {
            for (var prev_level = highest_level; prev_level < level; prev_level++) {
                console.log(prev_level+1);
                this.new_edges = [];
                this.new_vertices = [];
                this.old_vertices = this.meshes[prev_level].getVertices();
                // this.old_edges = this.meshes[i-1].getEdges();
                this.subdivide_one_level(prev_level);
                this.create_new_mesh();
            }
        }
        console.log('*');
        console.log(this.meshes);
        return this.meshes[level];
        // console.log(this.meshes[0].getFaces().length);
        // return this.meshes[0];
    }

    this.setMesh = function (mesh) {
        this.clear(mesh);
        this.meshes.push(mesh);
    }

    this.clear = function (m) {
        this.meshes = [];
    }
}
