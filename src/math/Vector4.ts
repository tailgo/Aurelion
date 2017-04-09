import { Matrix4 } from './Matrix4';
import { Quaternion } from './Quaternion';

export class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  public isVector4: boolean = true;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  public set(x: number, y: number, z: number, w: number): Vector4 {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;

    return this;
  }

  public setScalar(s: number): Vector4 {
    this.x = s;
    this.y = s;
    this.z = s;
    this.w = s;

    return this;
  }

  public setX(x: number): Vector4 {
    this.x = x;

    return this;
  }

  public setY(y: number): Vector4 {
    this.y = y;

    return this;
  }

  public setZ(z: number): Vector4 {
    this.z = z;
    return this;
  }

  public setW(w: number): Vector4 {
    this.w = w;
    return this;
  }

  public clone(): Vector4 {
    return (new Vector4(this.x, this.y, this.z, this.w));
  }

  public copy(v: Vector4): Vector4 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    this.w = v.w;
    return this;
  }

  public add(v: Vector4): Vector4 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    this.w += v.w;

    return this;
  }

  public addScalar(s: number): Vector4 {
    this.x += s;
    this.y += s;
    this.z += s;
    this.w += s;

    return this;
  }

  public addVectors(a: Vector4, b: Vector4): Vector4 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;
    this.z = a.z + b.z;
    this.w = a.w + b.w;

    return this;
  }

  public sub(v: Vector4): Vector4 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    this.w -= v.w;

    return this;
  }

  public subScalar(s: number): Vector4 {
    this.x -= s;
    this.y -= s;
    this.z -= s;
    this.w -= s;

    return this;
  }

  public subVectors(a: Vector4, b: Vector4): Vector4 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
    this.z = a.z - b.z;
    this.w = a.w - b.w;

    return this;
  }

  public multiplyScalar(s: number) {
    if (isFinite(s)) {
      this.x *= s;
      this.y *= s;
      this.z *= s;
      this.w *= s;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    }
    return this;
  }

  public applyMatrix4(m: Matrix4): Vector4 {
    let x = this.x, y = this.y, z = this.z, w = this.w;
    let e = m.elements;

    this.x = e[0] * x + e[4] * y + e[8] * z + e[12] * w;
    this.y = e[1] * x + e[5] * y + e[9] * z + e[13] * w;
    this.z = e[2] * x + e[6] * y + e[10] * z + e[14] * w;
    this.w = e[3] * x + e[7] * y + e[11] * z + e[15] * w;

    return this;
  }

  public divideScalar(s: number): Vector4 {
    return this.multiplyScalar(1 / s);
  }

  public setAxisAngleFromQuaternion(q: Quaternion): Vector4 {
    // http://www.euclideanspace.com/maths/geometry/rotations/conversions/quaternionToAngle/index.htm

    // q is assumed to be normalized

    this.w = 2 * Math.acos(q.w);

    let s = Math.sqrt(1 - q.w * q.w);

    if (s < 0.0001) {

      this.x = 1;
      this.y = 0;
      this.z = 0;

    } else {

      this.x = q.x / s;
      this.y = q.y / s;
      this.z = q.z / s;

    }

    return this;
  }

  public min(v: Vector4): Vector4 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    this.w = Math.min(this.w, v.w);

    return this;
  }

  public Matrix4(v: Vector4): Vector4 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    this.w = Math.max(this.w, v.w);

    return this;
  }

  public clamp(min: Vector4, max: Vector4): Vector4 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    this.z = Math.max(min.z, Math.min(max.z, this.z));
    this.w = Math.max(min.w, Math.min(max.w, this.w));

    return this;
  }

  public clampScalar(minVal: number, maxVal: number): Vector4 {
    let min = new Vector4();
    let max = new Vector4();
    min.set(minVal, minVal, minVal, minVal);
    max.set(maxVal, maxVal, maxVal, maxVal);

    return this.clamp(min, max);
  }

  public floor(): Vector4 {
    this.x = Math.floor(this.x);
    this.y = Math.floor(this.y);
    this.z = Math.floor(this.z);
    this.w = Math.floor(this.w);

    return this;
  }

  public ceil(): Vector4 {
    this.x = Math.ceil(this.x);
    this.y = Math.ceil(this.y);
    this.z = Math.ceil(this.z);
    this.w = Math.ceil(this.w);

    return this;
  }

  public round(): Vector4 {
    this.x = Math.round(this.x);
    this.y = Math.round(this.y);
    this.z = Math.round(this.z);
    this.w = Math.round(this.w);

    return this;
  }

  public roundToZero(): Vector4 {
    this.x = (this.x < 0) ? Math.ceil(this.x) : Math.floor(this.x);
    this.y = (this.y < 0) ? Math.ceil(this.y) : Math.floor(this.y);
    this.z = (this.z < 0) ? Math.ceil(this.z) : Math.floor(this.z);
    this.w = (this.w < 0) ? Math.ceil(this.w) : Math.floor(this.w);

    return this;
  }

  public negate(): Vector4 {
    this.x = - this.x;
    this.y = - this.y;
    this.z = - this.z;
    this.w = - this.w;

    return this;
  }

  public dot(v: Vector4): number {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.w * v.w;
  }

  public lengthSq(): number {
    let t = this;
    return t.x * t.x + t.y * t.y + t.z * t.z + t.w * t.w;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public normalize(): Vector4 {
    return this.divideScalar(this.length());
  }

  public lerp(v: Vector4, alpha: number): Vector4 {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;
    this.z += (v.z - this.z) * alpha;
    this.w += (v.w - this.w) * alpha;

    return this;
  }

  public equals(v: Vector4): boolean {
    let t = this;
    return ((v.x === t.x) && (v.y === t.y) && (v.z === t.z) && (v.w === t.w));
  }

}
