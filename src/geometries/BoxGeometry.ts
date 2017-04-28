import { Geometry } from '../core/Geometry';

import { Float32BufferAttribute } from '../core/BufferAttribute';
import { BufferGeometry } from '../core/BufferGeometry';
import { Vector3 } from '../math/Vector3';

interface GeometryParameters {
  width: number;
  height: number;
  depth: number;
  widthSegments: number;
  heightSegments: number;
  depthSegments: number;
}

export class BoxGeometry extends Geometry {

  public parameters: GeometryParameters;
  public type: string;

  constructor(
    width: number, height: number, depth: number,
    widthSegments: number, heightSegments: number, depthSegments: number
  ) {
    super();

    this.type = 'BoxGeometry';

    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
      depthSegments: depthSegments
    };

    this.fromBufferGeometry(new BoxBufferGeometry(width, height, depth, widthSegments, heightSegments, depthSegments));
    this.mergeVertices();
  }

}

export class BoxBufferGeometry extends BufferGeometry {

  public type: string;
  public parameters: GeometryParameters;

  constructor(width: number, height: number, depth: number,
  widthSegments: number = 1, heightSegments: number = 1,
  depthSegments: number = 1
  ) {
    super();

    this.type = 'BoxBufferGeometry';

    this.parameters = {
      width: width,
      height: height,
      depth: depth,
      widthSegments: widthSegments,
      heightSegments: heightSegments,
      depthSegments: depthSegments
    };

    let scope = this;

    // segments
    widthSegments = Math.floor(widthSegments) || 1;
    heightSegments = Math.floor(heightSegments) || 1;
    depthSegments = Math.floor(depthSegments) || 1;

    // buffers
    let indices = [];
    let vertices = [];
    let normals = [];
    let uvs = [];

    // helper variables
    let numberOfVertices = 0;
    let groupStart = 0;

    // build each side of the box geometry
    buildPlane('z', 'y', 'x', - 1, - 1, depth, height, width, depthSegments, heightSegments, 0); // px
    buildPlane('z', 'y', 'x', 1, - 1, depth, height, - width, depthSegments, heightSegments, 1); // nx
    buildPlane('x', 'z', 'y', 1, 1, width, depth, height, widthSegments, depthSegments, 2); // py
    buildPlane('x', 'z', 'y', 1, - 1, width, depth, - height, widthSegments, depthSegments, 3); // ny
    buildPlane('x', 'y', 'z', 1, - 1, width, height, depth, widthSegments, heightSegments, 4); // pz
    buildPlane('x', 'y', 'z', - 1, - 1, width, height, - depth, widthSegments, heightSegments, 5); // nz

    // build geometry
    this.setIndex(indices);
    this.addAttribute('position', new Float32BufferAttribute(vertices, 3));
    this.addAttribute('normal', new Float32BufferAttribute(normals, 3));
    this.addAttribute('uv', new Float32BufferAttribute(uvs, 2));

    function buildPlane(u, v, w, udir, vdir, width, height, depth, gridX, gridY, materialIndex) {

      let segmentWidth = width / gridX;
      let segmentHeight = height / gridY;

      let widthHalf = width / 2;
      let heightHalf = height / 2;
      let depthHalf = depth / 2;

      let gridX1 = gridX + 1;
      let gridY1 = gridY + 1;

      let vertexCounter = 0;
      let groupCount = 0;

      let ix, iy;

      let vector = new Vector3();

      // generate vertices, normals and uvs
      for (iy = 0; iy < gridY1; iy++) {
        let y = iy * segmentHeight - heightHalf;

        for (ix = 0; ix < gridX1; ix++) {
          let x = ix * segmentWidth - widthHalf;

          // set values to correct vector component
          vector[u] = x * udir;
          vector[v] = y * vdir;
          vector[w] = depthHalf;

          // now apply vector to vertex buffer
          vertices.push(vector.x, vector.y, vector.z);

          // set values to correct vector component
          vector[u] = 0;
          vector[v] = 0;
          vector[w] = depth > 0 ? 1 : - 1;

          // now apply vector to normal buffer
          normals.push(vector.x, vector.y, vector.z);

          // uvs
          uvs.push(ix / gridX);
          uvs.push(1 - (iy / gridY));

          // counters
          vertexCounter += 1;
        }
      }

      // indices
      // 1. you need three indices to draw a single face
      // 2. a single segment consists of two faces
      // 3. so we need to generate six (2*3) indices per segment
      for (iy = 0; iy < gridY; iy++) {
        for (ix = 0; ix < gridX; ix++) {
          let a = numberOfVertices + ix + gridX1 * iy;
          let b = numberOfVertices + ix + gridX1 * (iy + 1);
          let c = numberOfVertices + (ix + 1) + gridX1 * (iy + 1);
          let d = numberOfVertices + (ix + 1) + gridX1 * iy;

          // faces
          indices.push(a, b, d);
          indices.push(b, c, d);

          // increase counter
          groupCount += 6;
        }

      }

      // add a group to the geometry. this will ensure multi material support
      scope.addGroup(groupStart, groupCount, materialIndex);

      // calculate new start value for groups
      groupStart += groupCount;

      // update total number of vertices
      numberOfVertices += vertexCounter;
    }
  }

}
