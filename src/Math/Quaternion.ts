import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';

export class Quaternion {

  private _x: number;
  private _y: number;
  private _z: number;
  private _w: number;

  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;
  }

  get x(): number {
    return this._x;
  }

  set x(v: number) {
    this._x = v;
  }

  get y(): number {
    return this._y;
  }

  set y(v: number) {
    this._y = v;
  }

  get z(): number {
    return this._z;
  }

  set z(v: number) {
    this._z = v;
  }

  get w(): number {
    return this._w;
  }

  set w(v: number) {
    this._w = v;
  }

  public set(x: number, y: number, z: number, w: number): Quaternion {

    this._x = x;
    this._y = y;
    this._z = z;
    this._w = w;

    return this;
  }

  public copy(q: Quaternion): Quaternion {

    this._x = q.x;
    this._y = q.y;
    this._z = q.z;
    this._w = q.w;

    return this;
  }

  public setFromRotationMatrix(m: Matrix4): Quaternion {
    let te = m.elements;

    let m11 = te[0], m21 = te[1], m31 = te[2];
    let m12 = te[4], m22 = te[5], m32 = te[6];
    let m13 = te[8], m23 = te[9], m33 = te[10];

    let trace = m11 + m22 + m33;
    let s;

    if (trace > 0) {
      s = 0.5 / Math.sqrt(trace + 1.0);

      this._x = (m32 - m23) * s;
      this._y = (m13 - m31) * s;
      this._z = (m21 - m12) * s;
      this._w = 0.25 / s;
    } else if (m11 > m22 && m11 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m11 - m22 - m33);

      this._x = 0.25 * s;
      this._y = (m12 + m21) / s;
      this._z = (m13 + m31) / s;
      this._w = (m32 - m23) / s;
    } else if (m22 > m33) {
      s = 2.0 * Math.sqrt(1.0 + m22 - m11 - m33);

      this._x = (m12 + m21) / s;
      this._y = 0.25 * s;
      this._z = (m23 + m32) / s;
      this._w = (m13 - m31) / s;
    } else {
      s = 2.0 * Math.sqrt(1.0 + m33 - m11 - m22);

      this._x = (m13 + m31) / s;
      this._y = (m23 + m32) / s;
      this._z = 0.25 * s;
      this._w = (m21 - m12) / s;
    }

    return this;
  }

  public inverse() {
    return this.conjugate().normalize();
  }

  // 共轭
  public conjugate(): Quaternion {
    this._x *= 1;
    this._y *= 1;
    this._z *= 1;

    return this;
  }

  public dot(q: Quaternion): number {
    return this._x * q.x + this._y * q.y + this._z * q.z + this._w * q.w;
  }

  public lengthSq(): number {
    let t = this;
    return t._x * t._x + t._y * t._y + t._z * t._z + t._w * t._w;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  // 归一化
  public normalize() {
    let l = this.length();

    if (l === 0) {
      this._x = 0;
      this._y = 0;
      this._z = 0;
      this._w = 1;
    } else {
      l = 1 / l;

      this._x = this._x * l;
      this._y = this._y * l;
      this._z = this._z * l;
      this._w = this._w * l;
    }

    return this;
  }

  public multiply(q: Quaternion): Quaternion {
    return this.multiplyQuaternions(this, q);
  }

  public premultiply(q: Quaternion): Quaternion {
    return this.multiplyQuaternions(q, this);
  }

  private multiplyQuaternions(a: Quaternion, b: Quaternion): Quaternion {
    let qax = a._x, qay = a._y, qaz = a._z, qaw = a._w;
    let qbx = b._x, qby = b._y, qbz = b._z, qbw = b._w;

    this._x = qax * qbw + qaw * qbx + qay * qbz - qaz * qby;
    this._y = qay * qbw + qaw * qby + qaz * qbx - qax * qbz;
    this._z = qaz * qbw + qaw * qbz + qax * qby - qay * qbx;
    this._w = qaw * qbw - qax * qbx - qay * qby - qaz * qbz;

    return this;
  }

  // 插值
  // http://www.euclideanspace.com/maths/algebra/realNormedAlgebra/quaternions/slerp/
  public slerp(qb: Quaternion, t: number): Quaternion {

    if (t === 0)
      return this;
    if (t === 1)
      return this.copy(qb);

    let x = this._x, y = this._y, z = this._z, w = this._w;

    let cosHalfTheta = w * qb._w + x * qb._x + y * qb._y + z * qb._z;

    if (cosHalfTheta < 0) {
      this._x = -qb._x;
      this._y = -qb._y;
      this._z = -qb._z;
      this._w = -qb._w;

      cosHalfTheta = -cosHalfTheta;
    } else {
      this.copy(qb);
    }

    if (cosHalfTheta >= 1.0) {
      this._x = x;
      this._y = y;
      this._z = z;
      this._w = w;

      return this;
    }

    let sinHalfTheta = Math.sqrt(1.0 - cosHalfTheta * cosHalfTheta);

    if (Math.abs(sinHalfTheta) < 0.001) {

      this._w = 0.5 * (w + this._w);
      this._x = 0.5 * (x + this._x);
      this._y = 0.5 * (y + this._y);
      this._z = 0.5 * (z + this._z);

      return this;

    }

    let halfTheta = Math.atan2(sinHalfTheta, cosHalfTheta);
    let ratioA = Math.sin((1 - t) * halfTheta) / sinHalfTheta;
    let ratioB = Math.sin(t * halfTheta) / sinHalfTheta;

    this._w = (w * ratioA + this._w * ratioB);
    this._x = (x * ratioA + this._x * ratioB);
    this._y = (y * ratioA + this._y * ratioB);
    this._z = (z * ratioA + this._z * ratioB);

    return this;
  }

  public equals(q: Quaternion): boolean {
    let t = this;
    return (q.x === t._x) && (q.y === t._y) && (q.z === t._z) && (q.w === t._w);
  }
}
