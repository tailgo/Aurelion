import { MathTool } from './MathTool';
import { Euler } from './Euler';
import { Quaternion } from './Quaternion';
import { Matrix3 } from './Matrix3';
import { Matrix4 } from './Matrix4';
import { BufferAttribute } from '../core/BufferAttribute';

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  public isVector3: boolean = true;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  public set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;

    return this;
  }

  public setFromMatrixPosition(m: Matrix4): Vector3 {
    return this.setFromMatrixColumn(m, 3);
  }

  public setFromMatrixColumn(m: Matrix4, index: number): Vector3 {
    return this.fromArray(m.elements, index * 4);
  }

  public setScalar(s: number) {
    this.x = s;
    this.y = s;
    this.z = s;

    return this;
  }

  // --- Add methods --- //
  public add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;

    return this;
  }

  public addScalar(scalar: number): Vector3 {
    this.x += scalar;
    this.y += scalar;
    this.z += scalar;

    return this;
  }

  public addVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;

    return this;
  }

  public addScaledVector(v: Vector3, s: number): Vector3 {
    this.x += v.x * s;
    this.y += v.y * s;
    this.z += v.z * s;

    return this;
  }

  // --- Subtract methods --- //
  public sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;

    return this;
  }

  public subScalar(scalar: number): Vector3 {
    this.x -= scalar;
    this.y -= scalar;
    this.z -= scalar;

    return this;
  }

  public subVectors(a: Vector3, b: Vector3): Vector3 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;

    return this;
  }

  public multiply(v: Vector3): Vector3 {
    this.x *= v.x;
    this.y *= v.y;
    this.z *= v.z;

    return this;
  }

  public multiplyScalar(scalar: number) {
    if (isFinite(scalar)) {
      this.x *= scalar;
      this.y *= scalar;
      this.z *= scalar;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
    return this;
  }

  public divide(v: Vector3): Vector3 {
    this.x /= v.x;
    this.y /= v.y;
    this.z /= v.z;

    return this;
  }

  public divideScalar(scalar: number): Vector3 {
    this.x /= scalar;
    this.y /= scalar;
    this.z /= scalar;

    return this;
  }

  // --- operation methods --- //
  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;

    return this;
  }

  public equals(v: Vector3): boolean {
    return this.x === v.x && this.y === v.y && this.z === v.z;
  }

  // --- get property --- //
  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  public normalize(): Vector3 {
    return this.divideScalar(this.length());
  }

  public dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  public cross(v: Vector3): Vector3 {
    let x = this.x, y = this.y, z = this.z;

    this.x = y * v.z - z * v.y;
    this.y = z * v.x - x * v.z;
    this.z = x * v.y - y * v.x;

    return this;
  }

  public crossVectors(a: Vector3, b: Vector3): Vector3 {
    let ax = a.x, ay = a.y, az = a.z;
    let bx = b.x, by = b.y, bz = b.z;

    this.x = ay * bz - az * by;
    this.y = az * bx - ax * bz;
    this.z = ax * by - ay * bx;

    return this;
  }

  public negate(): Vector3 {
    this.x = -this.x;
    this.y = -this.y;
    this.z = -this.z;

    return this;
  }

  public angleTo(v: Vector3): number {
    let theta = this.dot(v) / (Math.sqrt(this.lengthSq() * v.lengthSq()));
    return Math.acos(MathTool.clamp(theta, -1, 1));
  }

  public lerp(v: Vector3, alpha: number) {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;

    return this;
  }

  public distanceTo(v: Vector3): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector3): number {
    let dx = this.x - v.x;
    let dy = this.y - v.y;
    let dz = this.z - v.z;

    return dx * dx + dy * dy + dz * dz;
  }

  // --- Static methods --- //
  public static AddVector3(v: Vector3, w: Vector3): Vector3 {
    return new Vector3(v.x + w.x, v.y + w.y, v.z + w.z);
  }

  public static Distance(v: Vector3, w: Vector3): number {
    return Math.sqrt(this.DistanceSquared(v, w));
  }

  public static DistanceSquared(v: Vector3, w: Vector3): number {
    let x = v.x - w.x;
    let y = v.y - w.y;
    let z = v.z - w.z;

    return x * x + y * y + z * z;
  }

  public min(v: Vector3): Vector3 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);

    return this;
  }

  public max(v: Vector3): Vector3 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);

    return this;
  }

  public applyEuler(euler: Euler): Vector3 {
    let q = new Quaternion();
    return this.applyQuaternion(q.setFromEuler(euler));
  }

  public applyQuaternion(q: Quaternion): Vector3 {
    let x = this.x, y = this.y, z = this.z;
    let qx = q.x, qy = q.y, qz = q.z, qw = q.w;

    // calculate quat * vector

    let ix = qw * x + qy * z - qz * y;
    let iy = qw * y + qz * x - qx * z;
    let iz = qw * z + qx * y - qy * x;
    let iw = - qx * x - qy * y - qz * z;

    // calculate result * inverse quat

    this.x = ix * qw + iw * - qx + iy * - qz - iz * - qy;
    this.y = iy * qw + iw * - qy + iz * - qx - ix * - qz;
    this.z = iz * qw + iw * - qz + ix * - qy - iy * - qx;

    return this;
  }

  public applyMatrix3(m: Matrix3): Vector3 {
    let x = this.x, y = this.y, z = this.z;
    let e = m.elements;

    this.x = e[0] * x + e[3] * y + e[6] * z;
    this.y = e[1] * x + e[4] * y + e[7] * z;
    this.z = e[2] * x + e[5] * y + e[8] * z;

    return this;
  }

  public applyMatrix4(m: Matrix4): Vector3 {
    let x = this.x, y = this.y, z = this.z;
    let e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z + e[12];
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13];
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14];
    let w = e[3] * x + e[7] * y + e[11] * z + e[15];

    return this.divideScalar(w);
  }

  public fromArray(array: Float32Array, offset: number = 0): Vector3 {
    this.x = array[offset];
    this.y = array[offset + 1];
    this.z = array[offset + 2];

    return this;
  }

  public fromBufferAttribute(atb: BufferAttribute, index: number): Vector3 {
    this.x = atb.getX(index);
    this.y = atb.getY(index);
    this.z = atb.getZ(index);

    return this;
  }

  public transformDirection(m: Matrix4): Vector3 {
    let x = this.x, y = this.y, z = this.z;
    let e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z;
    this.y = e[1] * x + e[5] * y + e[9] * z;
    this.z = e[2] * x + e[6] * y + e[10] * z;

    return this.normalize();
  }

  public unproject(camera) {
    let matrix = new Matrix4();
    matrix.multiplyMatrices(camera.matrixWorld, matrix.getInverse(camera.projectionMatrix));
    return this.applyMatrix4(matrix);
  }
}
