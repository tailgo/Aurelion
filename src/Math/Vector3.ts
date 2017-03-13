'use strict';
import { MathTool } from './MathTool';

export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

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

  public negete(): Vector3 {
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
}
