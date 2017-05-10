import { Sphere } from '../math/Sphere';
import { Ray } from '../math/Ray';
import { Matrix4 } from '../math/Matrix4';
import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';
import { LineBasicMaterial } from '../materials/LineBasicMaterial';
import { BufferGeometry } from '../core/BufferGeometry';

export class Line extends Object3D {

  public geometry;
  public material;

  public isLine: boolean = true;

  constructor(geometry, material) {
    super();


    this.type = 'Line';

    this.geometry = geometry ? geometry : new BufferGeometry();
    this.material = material
      ? material
      : new LineBasicMaterial({
        color: Math.random() * 0xffffff
      });
  }

  public raycast(raycaster, intersects) {

    let inverseMatrix = new Matrix4();
    let ray = new Ray();
    let sphere = new Sphere();

    let precision = raycaster.linePrecision;
    let precisionSq = precision * precision;

    let geometry = this.geometry;
    let matrixWorld = this.matrixWorld;

    // Checking boundingSphere distance to ray

    if (geometry.boundingSphere === null) {
      geometry.computeBoundingSphere();
    }

    sphere.copy(geometry.boundingSphere);
    sphere.applyMatrix4(matrixWorld);

    if (raycaster.ray.intersectsSphere(sphere) === false) {
      return;
    }

    //
    inverseMatrix.getInverse(matrixWorld);
    ray.copy(raycaster.ray).applyMatrix4(inverseMatrix);

    let vStart = new Vector3();
    let vEnd = new Vector3();
    let interSegment = new Vector3();
    let interRay = new Vector3();
    let step = (this && this.isLineSegments) ? 2 : 1;

    if (geometry.isBufferGeometry) {
      let index = geometry.index;
      let attributes = geometry.attributes;
      let positions = attributes.position.array;

      if (index !== null) {
        let indices = index.array;

        for (let i = 0, l = indices.length - 1; i < l; i += step) {
          let a = indices[i];
          let b = indices[i + 1];

          vStart.fromArray(positions, a * 3);
          vEnd.fromArray(positions, b * 3);

          let distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > precisionSq) {
            continue;
          }

          // Move back to world space for distance calculation
          interRay.applyMatrix4(this.matrixWorld);

          let distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) {
            continue;
          }

          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this
          });
        }
      } else {
        for (let i = 0, l = positions.length / 3 - 1; i < l; i += step) {
          vStart.fromArray(positions, 3 * i);
          vEnd.fromArray(positions, 3 * i + 3);

          let distSq = ray.distanceSqToSegment(vStart, vEnd, interRay, interSegment);

          if (distSq > precisionSq) {
            continue;
          }

          // Move back to world space for distance calculation
          interRay.applyMatrix4(this.matrixWorld);

          let distance = raycaster.ray.origin.distanceTo(interRay);

          if (distance < raycaster.near || distance > raycaster.far) {
            continue;
          }

          intersects.push({
            distance: distance,
            // What do we want? intersection point on the ray or on the segment??
            // point: raycaster.ray.at( distance ),
            point: interSegment.clone().applyMatrix4(this.matrixWorld),
            index: i,
            face: null,
            faceIndex: null,
            object: this
          });

        }

      }
    } else if (geometry.isGeometry) {
      let vertices = geometry.vertices;
      let nbVertices = vertices.length;

      for (let i = 0; i < nbVertices - 1; i += step) {
        let distSq = ray.distanceSqToSegment(vertices[i], vertices[i + 1], interRay, interSegment);

        if (distSq > precisionSq) continue;

        // Move back to world space for distance calculation
        interRay.applyMatrix4(this.matrixWorld);

        let distance = raycaster.ray.origin.distanceTo(interRay);

        if (distance < raycaster.near || distance > raycaster.far) {
          continue;
        }

        intersects.push({
          distance: distance,
          // What do we want? intersection point on the ray or on the segment??
          // point: raycaster.ray.at( distance ),
          point: interSegment.clone().applyMatrix4(this.matrixWorld),
          index: i,
          face: null,
          faceIndex: null,
          object: this
        });

      }
    }
  }

  public clone() {
    return new Line(this.geometry, this.material).copy(this);
  }

}
