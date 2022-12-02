//  This is where most of your code changes belong

function subdivider (input_mesh) {
    this.meshes = [];

    this.alpha = 0;
    this.alpha_n = 0;
    this.valence = 0;

    this.new_edges = [];
    this.new_faces = [];
    this.new_vertices = [];
    this.old_vertices = [];
    this.old_vertices_updated = [];

    this.vertex_map = new Map();
    this.edge_map = new Map();

    // Initializes this subdivision object with a mesh to use as
    // the control mesh (ie: subdivision level 0).
    this.meshes.push(input_mesh);

    this.vertex_to_array = function (vertices) {
        for (var i = 0; i < vertices.length; i++) {
            var vertex = vertices[i];
            var pos = vertex.getPos();
            vertices[i] = [pos.x(),pos.y(),pos.z()];
        }
    }

    // this.get_surround_vertices = function(v) {
    //     var ret = [];
    //     return ret;
    // }

    // update old vertex position
    this.calculate_old_vertex_pos = function(v) {
        var vertices = v.getVertices(); // this.get_surround_vertices(v);
        var new_x = 0; var new_y = 0; var new_z = 0;
        for (var i = 0; i < this.valence; i++) {
            new_x += alpha_n * vertices[i].getPos().x();
            new_y += alpha_n * vertices[i].getPos().y();
            new_z += alpha_n * vertices[i].getPos().z();
        }
        new_x += (1 - alpha) * v.getPos().x();
        new_y += (1 - alpha) * v.getPos().y();
        new_z += (1 - alpha) * v.getPos().z();
        return [new_x, new_y, new_z];
    }

    // new vertex on segment v1-v2
    this.calculate_new_vertex_pos = function(edge) {
        var v1 = edge.getOrigin();
        var v2 = edge.getNext().getOrigin();
        var v3 = edge.getTwin().getPrev().getOrigin();
        var v4 = edge.getPrev().getOrigin();

        var pos1 = v1.getPos();var pos2 = v2.getPos();
        var pos3 = v3.getPos();var pos4 = v4.getPos();

        var new_x = (3*pos1.x() + 3*pos2.x() + pos3.x() + pos4.x()) / 8;
        var new_y = (3*pos1.y() + 3*pos2.y() + pos3.y() + pos4.y()) / 8;
        var new_z = (3*pos1.z() + 3*pos2.z() + pos3.z() + pos4.z()) / 8;

        return [new_x,new_y,new_z];
    }

    this.add_vertex = function(origin, end, edge) {
        var id1 = origin.getId();
        var id2 = end.getId();
        if (id1 > id2) [id1, id2] = [id2, id1];
        var key = String(id1) + "," + String(id2);

        if (this.vertex_map.has(key))
            return this.vertex_map.get(key);

        var pos = this.calculate_new_vertex_pos(edge);
        var id = this.old_vertices.length + this.new_vertices.length;
        var vertex = new Vertex(pos[0], pos[1], pos[2], id);
        vertex.setEdge(edge);

        this.new_vertices.push(vertex);
        this.vertex_map.set(key, vertex);
        return vertex;
    }

    //this.add_edge = function(origin_id, id) {
    this.add_edge = function(v1, v2) {
        //var v1 = this.new_edges[origin_id].getOrigin();
        //var v2 = this.new_edges[origin_id].getNext().getOrigin();
        var key = String(v1.getId()) + "," + String(v2.getId());
        if (this.edge_map.has(key))
            return this.edge_map.get(key);

        var he = new HalfEdge(this.new_edges.length);

        // Associate edge with its origin vertex
        he.setOrigin(v1);
        if (v1.getEdge() === undefined)
            v1.setEdge(he);

        // Associate edge with its twin, if it exists
        var t_key = String(v2.getId()) + "," + String(v1.getId());
        if (this.edge_map.has(t_key)) {
            var t_he = this.edge_map.get(t_key);
            he.setTwin(t_he);
            t_he.setTwin(he);
        }

        this.new_edges.push(he);
        this.edge_map.set(key, he);
        return he;
    }

    this.link_edges = function (edge1, edge2, edge3) {
        edge1.setNext(edge2);edge2.setPrev(edge1);
        edge2.setNext(edge3);edge3.setPrev(edge2);
        edge3.setNext(edge1);edge1.setPrev(edge3);
    }

    this.add_face = function(edge) {
        var edge1 = edge;
        var edge2 = edge.getNext();
        var edge3 = edge.getPrev();
        var new_face = [[edge1.getOrigin().getId()],
                        [edge2.getOrigin().getId()],
                        [edge3.getOrigin().getId()]];
        this.new_faces.push(new_face);
    }

    this.split_edge = function (he) {
        var origin = he.getOrigin();
        var end = he.getNext().getOrigin();
        var new_vertex = this.add_vertex(origin, end, he);
        var new_he1 = this.add_edge(origin, new_vertex);
        var new_he2 = this.add_edge(new_vertex, end);

        //var edge_id = this.new_edges.length;
        //var new_he1 = new HalfEdge(edge_id);
        //var new_he2 = new HalfEdge(edge_id + 1);
        //this.new_edges.push(new_he1);
        //this.new_edges.push(new_he2);
        //new_he1.setOrigin(new_vertex);
        //new_he2.setOrigin(origin);

        var prev = he.getPrev();
        var next = he.getNext();
        new_he1.setPrev(prev);prev.setNext(new_he1);
        new_he2.setNext(next);next.setPrev(new_he2);
        new_he2.setPrev(new_he1);new_he1.setNext(new_he2);
    }

    // cut a face based on 6 half-edges created during split for one face
    this.cut_a_face = function (id_lo) {
        // add three new edges
        var edge1 = this.add_edge(this.new_edges[id_lo + 3].getOrigin(),
                                  this.new_edges[id_lo + 1].getOrigin());
        var edge2 = this.add_edge(this.new_edges[id_lo + 1].getOrigin(),
                                  this.new_edges[id_lo + 5].getOrigin());
        var edge3 = this.add_edge(this.new_edges[id_lo + 5].getOrigin(),
                                  this.new_edges[id_lo + 3].getOrigin());

        this.link_edges(edge1, this.new_edges[id_lo+1], this.new_edges[id_lo+2]);
        this.link_edges(edge2, this.new_edges[id_lo+5], this.new_edges[id_lo]);
        this.link_edges(edge3, this.new_edges[id_lo+3], this.new_edges[id_lo+4]);
        this.add_face(edge1);this.add_face(edge2);this.add_face(edge3);

        // twin edges of the three edges above, these three form the center triangle
        var edge1t = this.add_edge(this.new_edges[id_lo + 1].getOrigin(),
                                   this.new_edges[id_lo + 3].getOrigin());
        var edge2t = this.add_edge(this.new_edges[id_lo + 3].getOrigin(),
                                   this.new_edges[id_lo + 5].getOrigin());
        var edge3t = this.add_edge(this.new_edges[id_lo + 5].getOrigin(),
                                   this.new_edges[id_lo + 1].getOrigin());
        this.link_edges(edge1t, edge2t, edge3t);
        this.add_face(edge1t);
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

    this.finalize_vertices = function () {
        // var old_vertices_updated = []
        // for (var i = 0; i < this.old_vertices.length; i++) {
        //     old_vertices_updated.push(
        //         this.calculate_old_vertex_pos(this.old_vertices[i])
        //     );
        // }

        // for (var i = 0; i < this.old_vertices.length; i++) {
        //     var pos = old_vertices_updated[i];
        //     this.old_vertices[i].setPos(pos[0],pos[1],pos[2]);
        // }
        // var vertices = old_vertices_updated.concat(this.new_vertices);
        var vertices = this.old_vertices.concat(this.new_vertices);
        this.vertex_to_array(vertices);
        return vertices;
    }

    this.create_new_mesh = function (vertices) {
        var new_mesh = new Mesh();
        new_mesh.builMesh(vertices, [], this.new_faces);
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

        var highest_level = this.meshes.length - 1;
        if (level > highest_level) {
            for (var prev_level = highest_level; prev_level < level; prev_level++) {
                this.init(prev_level);
                this.subdivide_one_level(prev_level);
                var final_vertices = this.finalize_vertices();
                this.create_new_mesh(final_vertices);
            }
        }
        return this.meshes[level];
    }


    this.get_valence = function() {
        this.valence = 0;
        var e = this.meshes[0].getEdges()[0];

        while (e.getFlag() != "VMarked") {
            e.setFlag("VMarked");
            e = e.getTwin().getPrev();
            this.valence += 1;
        }

        alpha = 1/64 * (40 - (3 + 2 * Math.cos(2* Math.PI / this.valence))^2 );
        alpha_n = alpha / this.valence;
    }

    this.setMesh = function (mesh) {
        this.clear(mesh);
        this.meshes.push(mesh);
        this.get_valence();
    }

    this.init = function (level) {
        this.new_edges = [];
        this.new_faces = [];
        this.new_vertices = [];
        this.old_vertices = this.meshes[level].getVertices();
        this.vertex_map = new Map();
        this.edge_map = new Map();
    }

    this.clear = function (m) {
        this.meshes = [];
    }
}
