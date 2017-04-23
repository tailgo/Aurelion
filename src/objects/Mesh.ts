import { Vector2 } from '../math/Vector2';
import { Vector3 } from '../math/Vector3';
import { Matrix4 } from '../math/Matrix4';
import { Triangle } from '../math/Triangle';
import { Sphere } from '../math/Sphere';
import { Ray } from '../math/Ray';

import { Object3D } from '../core/Object3D';
import { Face3 } from '../core/Face3';
import { Raycaster } from '../core/Raycaster';
import { Geometry } from '../core/Geometry';
import { BufferGeometry } from '../core/BufferGeometry';
import { BufferAttribute } from '../core/BufferAttribute';

import { Material } from '../materials/Material';
import { MultiMaterial } from '../materials/MultiMaterial';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial';

import { DoubleSide, BackSide, TrianglesDrawMode } from '../Constants';

interface Intersection {
  distance: number;
  point: Vector3;
  object: Mesh;
  face?: Face3;
  faceIndex?: number;
  uv?: Vector2;
  indices?: any;
}

export class Mesh extends Object3D {
  public drawMode: number;

  public isMesh: boolean = true;

  public geometry: Geometry | BufferGeometry;
  public material;

  public morphTargetInfluences;
  public morphTargetDictionary;

  constructor(
    geometry: (Geometry | BufferGeometry) = new BufferGeometry(),
    material?
  ) {
    super();

    this.type = 'Mesh';

    this.geometry = geometry;
    this.material = material
      ? material
      : new MeshBasicMaterial({color: Math.random() * 0xffffff});

    this.drawMode = TrianglesDrawMode;
    this.updateMorphTargets();
  }

  public setDrawMode(value: number) {
    this.drawMode = value;
  }

  public copy(source) {
    super.copy(source);
    this.drawMode = source.drawMode;
    return this;
  }

  public clone() {
    return new Mesh(this.geometry, this.material).copy(this);
  }

  public raycast(raycaster: Raycaster, intersects: Array<Intersection>) {

    let inverseMatrix: Matrix4 = new Matrix4();
    let ray: Ray = new Ray();
    let sphere: Sphere = new Sphere();

    let vA: Vector3 = new Vector3();
    let vB: Vector3 = new Vector3();
    let vC: Vector3 = new Vector3();

    let tempA: Vector3 = new Vector3();
    let tempB: Vector3 = new Vector3();
    let tempC: Vector3 = new Vector3();

    let uvA: Vector2 = new Vector2();
    let uvB: Vector2 = new Vector2();
    let uvC: Vector2 = new Vector2();

    let barycoord: Vector3 = new Vector3();

    let intersectionPoint: Vector3 = new Vector3();
    let intersectionPointWorld: Vector3 = new Vector3();

    function uvIntersection(
      point: Vector3,
      p1: Vector3, p2: Vector3, p3: Vector3,
      uv1: Vector2, uv2: Vector2, uv3: Vector2
    ): Vector2 {
      Triangle.barycoordFromPoint(point, p1, p2, p3, barycoord);

      uv1.multiplyScalar(barycoord.x);
      uv2.multiplyScalar(barycoord.y);
      uv3.multiplyScalar(barycoord.z);

      uv1.add(uv2).add(uv3);
      return uv1.clone();
    }

    function checkIntersection(
      object: Mesh, raycaster: Raycaster, ray: Ray,
      pA: Vector3, pB: Vector3, pC: Vector3, point: Vector3
    ): Intersection {
      let intersect;
      let material = object.material;

      if (material.side === BackSide) {
        intersect = ray.intersectTriangle(pC, pB, pA, true, point);
      } else {
        intersect = ray.intersectTriangle(pA, pB, pC, material.side !== DoubleSide, point);
      }

      if (intersect === null) {
        return null;
      }

      intersectionPointWorld.copy(point);
      intersectionPointWorld.applyMatrix4(object.matrixWorld);

      let distance = raycaster.ray.origin.distanceTo(intersectionPointWorld);

      if (distance < raycaster.near || distance > raycaster.far) {
        return null;
      }

      return {
        distance: distance,
        point: intersectionPointWorld.clone(),
        object: object
      };
    }

    function checkBufferGeometryIntersection(
      object: Mesh, raycaster: Raycaster, ray: Ray,
      position: BufferAttribute, uv: BufferAttribute,
      a: number, b: number, c: number
    ): Intersection {
      vA.fromBufferAttribute(position, a);
      vB.fromBufferAttribute(position, b);
      vC.fromBufferAttribute(position, c);

      let intersection = checkIntersection(object, raycaster, ray, vA, vB, vC, intersectionPoint);

      if (intersection) {
        if (uv) {
          uvA.fromBufferAttribute(uv, a);
          uvB.fromBufferAttribute(uv, b);
          uvC.fromBufferAttribute(uv, c);

          intersection.uv = uvIntersection(intersectionPoint, vA, vB, vC, uvA, uvB, uvC);
        }
        intersection.face = new Face3(a, b, c, Triangle.normal(vA, vB, vC));
        intersection.faceIndex = a;
      }
      return intersection;
    }

    let geometry = this.geometry;
    let material = this.material;
    let matrixWorld = this.matrixWorld;

    if (material === undefined) {
      return;
    }

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

    // Check boundingBox before continuing
    if (geometry.boundingBox !== null) {
      if (ray.intersectsBox(geometry.boundingBox) === false) {
        return;
      }
    }

    let intersection;

    if (geometry instanceof BufferGeometry && geometry.isBufferGeometry) {
      let a, b, c;
      let index = geometry.index;
      let position = geometry.attributes.position;
      let uv = geometry.attributes.uv;
      let i, l;

      if (index !== null) {
        // indexed buffer geometry
        for (i = 0, l = index.count; i < l; i += 3) {
          a = index.getX(i);
          b = index.getX(i + 1);
          c = index.getX(i + 2);

          intersection = checkBufferGeometryIntersection(this, raycaster, ray, position, uv, a, b, c);

          if (intersection) {
            intersection.faceIndex = Math.floor(i / 3); // triangle number in indices buffer semantics
            intersects.push(intersection);
          }
        }
      } else {
        // non-indexed buffer geometry
        for (i = 0, l = position.count; i < l; i += 3) {
          a = i;
          b = i + 1;
          c = i + 2;

          intersection = checkBufferGeometryIntersection(this, raycaster, ray, position, uv, a, b, c);

          if (intersection) {
            intersection.index = a; // triangle number in positions buffer semantics
            intersects.push(intersection);
          }
        }
      }

    } else if (geometry instanceof Geometry && geometry.isGeometry) {

      let fvA, fvB, fvC;
      let isFaceMaterial = (material && material.isMultiMaterial);
      let materials = isFaceMaterial === true ? material.materials : null;

      let vertices = geometry.vertices;
      let faces = geometry.faces;
      let uvs;

      let faceVertexUvs = geometry.faceVertexUvs[0];
      if (faceVertexUvs.length > 0) uvs = faceVertexUvs;

      for (let f = 0, fl = faces.length; f < fl; f++) {
        let face = faces[f];
        let faceMaterial = isFaceMaterial === true ? materials[face.materialIndex] : material;

        if (faceMaterial === undefined) {
          continue;
        }

        fvA = vertices[face.a];
        fvB = vertices[face.b];
        fvC = vertices[face.c];

        if (faceMaterial.morphTargets === true) {
          let morphTargets = geometry.morphTargets;
          let morphInfluences = this.morphTargetInfluences;

          vA.set(0, 0, 0);
          vB.set(0, 0, 0);
          vC.set(0, 0, 0);

          for (let t = 0, tl = morphTargets.length; t < tl; t++) {
            let influence = morphInfluences[t];

            if (influence === 0) {
              continue;
            }

            let targets = morphTargets[t].vertices;

            vA.addScaledVector(tempA.subVectors(targets[face.a], fvA), influence);
            vB.addScaledVector(tempB.subVectors(targets[face.b], fvB), influence);
            vC.addScaledVector(tempC.subVectors(targets[face.c], fvC), influence);
          }

          vA.add(fvA);
          vB.add(fvB);
          vC.add(fvC);

          fvA = vA;
          fvB = vB;
          fvC = vC;
        }

        intersection = checkIntersection(this, raycaster, ray, fvA, fvB, fvC, intersectionPoint);

        if (intersection) {
          if (uvs) {
            let uvs_f = uvs[f];
            uvA.copy(uvs_f[0]);
            uvB.copy(uvs_f[1]);
            uvC.copy(uvs_f[2]);

            intersection.uv = uvIntersection(intersectionPoint, fvA, fvB, fvC, uvA, uvB, uvC);
          }

          intersection.face = face;
          intersection.faceIndex = f;
          intersects.push(intersection);
        }

      }

    }
  }

  public updateMorphTargets() {
    if (this.geometry instanceof Geometry) {
      let morphTargets = this.geometry.morphTargets;

      if (morphTargets.length > 0) {
        this.morphTargetInfluences = [];
        this.morphTargetDictionary = {};

        for (let m = 0, ml = morphTargets.length; m < ml; ++m) {
          this.morphTargetInfluences.push(0);
          this.morphTargetDictionary[morphTargets[m].name] = m;
        }
      }
    }
  }
}
