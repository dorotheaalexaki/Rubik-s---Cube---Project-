AFRAME.registerComponent("rubiks-cube", {
  init: function () {
    
    const root = this.el;
    const cubelets = [];
    const modelURL = "assets/models/rubiks_cube_standard_solid_v3.glb";

    // Ρυθμίσεις Κύβου
    const SCALE   = 2.0;     // <——  Μέγεθος κύβου
    const SPACING = 2.3;    // <——  Απόσταση cubes
    const SPACING_Y = 2.3;
    const BASE_Y  = 0.5;     // Ύψος κύβου
    const BASE_Z  = -7;      // Απόσταση από κάμερα

    const coords = [-1, 0, 1];

    //  Δημιουργία Cubes
    coords.forEach(x => {
      coords.forEach(y => {
        coords.forEach(z => {

          const c = document.createElement("a-entity");
          c.setAttribute("gltf-model", modelURL);
          c.setAttribute("scale", `${SCALE} ${SCALE} ${SCALE}`);

          // Απόαταση μεταξύ κύβων
          const VISUAL = {
            x: x * SPACING,
            y: y * SPACING_Y + BASE_Y,
            z: z * SPACING + BASE_Z
          };

          c.setAttribute("position", `${VISUAL.x} ${VISUAL.y} ${VISUAL.z}`);
          c.setAttribute("rotation", "0 0 0");

          // Συντεταγμένες
          c.dataset.x = x;
          c.dataset.y = y;
          c.dataset.z = z;

          cubelets.push(c);
          root.appendChild(c);

        });
      });
    });

    //  Βοηθητικές Συναρτήσεις
    function round(v) { return Math.round(v); }

    function relRotate(rel, axis, angleDeg) {
      const a = angleDeg * Math.PI / 180;
      let { x, y, z } = rel;

      if (axis === "x")
        return { x, y: y * Math.cos(a) - z * Math.sin(a), z: y * Math.sin(a) + z * Math.cos(a) };

      if (axis === "y")
        return { x: x * Math.cos(a) - z * Math.sin(a), y, z: x * Math.sin(a) + z * Math.cos(a) };

      if (axis === "z")
        return { x: x * Math.cos(a) - y * Math.sin(a), y: x * Math.sin(a) + y * Math.cos(a), z };
    }

    // Slicing
    const slices = {
      U: { axis: "y", value: 1, angle: 90 },
      D: { axis: "y", value: -1, angle: -90 },
      L: { axis: "x", value: -1, angle: -90 },
      R: { axis: "x", value: 1, angle: 90 },
      F: { axis: "z", value: 1, angle: 90 },
      B: { axis: "z", value: -1, angle: -90 }
    };

    //    Περιστροφές cubes
      function rotateSlice(face) {
      const def = slices[face];
      if (!def) return;

      const { axis, value, angle } = def;

      const affected = cubelets.filter(c => Number(c.dataset[axis]) === value);

      affected.forEach(c => {

        let x = Number(c.dataset.x);
        let y = Number(c.dataset.y);
        let z = Number(c.dataset.z);

        const newRel = relRotate({ x, y, z }, axis, angle);

        const nx = round(newRel.x);
        const ny = round(newRel.y);
        const nz = round(newRel.z);

        c.dataset.x = nx;
        c.dataset.y = ny;
        c.dataset.z = nz;

        // Νέες Συντεταγμένες
        const VIS = {
          x: nx * SPACING,
          y: ny * SPACING_Y + BASE_Y,
          z: nz * SPACING + BASE_Z
        };

        gsap.to(c.object3D.position, {
          x: VIS.x,
          y: VIS.y,
          z: VIS.z,
          duration: 0.45,
          ease: "power2.inOut"
        });

        gsap.to(c.object3D.rotation, {
          [axis]: c.object3D.rotation[axis] + angle * Math.PI / 180,
          duration: 0.45,
          ease: "power2.inOut"
        });

      });
    }

    window.rotateSlice = rotateSlice;
  }
});
