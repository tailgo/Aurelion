import { BufferAttribute } from '../core/BufferAttribute';

export class Vector2 {
  public x: number;
  public y: number;

  public isVector2: boolean = true;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  get width(): number {
    return this.x;
  }

  set width(x: number) {
    this.x = x;
  }

  get height(): number {
    return this.y;
  }

  set height(y: number) {
    this.y = y;
  }

  public set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;

    return this;
  }

  public setX(x: number): Vector2 {
    this.x = x;
    return this;
  }

  public setY(y: number): Vector2 {
    this.y = y;
    return this;
  }

  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public copy(v: Vector2): Vector2 {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  public add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  public addScalar(s: number): Vector2 {
    this.x += s;
    this.y += s;

    return this;
  }

  public addVectors(a: Vector2, b: Vector2): Vector2 {
    this.x = a.x + b.x;
    this.y = a.y + b.y;

    return this;
  }

  public sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  public subScalar(s: number): Vector2 {
    this.x -= s;
    this.y -= s;

    return this;
  }

  public subVectors(a: Vector2, b: Vector2): Vector2 {
    this.x = a.x - b.x;
    this.y = a.y - b.y;

    return this;
  }

  public multiply(v: Vector2): Vector2 {
    this.x *= v.x;
    this.y *= v.y;

    return this;
  }

  public multiplyScalar(scalar: number): Vector2 {
    if (isFinite(scalar)) {

      this.x *= scalar;
      this.y *= scalar;

    } else {

      this.x = 0;
      this.y = 0;

    }

    return this;
  }

  public divide(v: Vector2): Vector2 {
    this.x /= v.x;
    this.y /= v.y;

    return this;
  }

  public divideScalar(scalar: number): Vector2 {
    return this.multiplyScalar(1 / scalar);
  }

  public min(v: Vector2): Vector2 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);

    return this;
  }

  public max(v: Vector2): Vector2 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);

    return this;
  }

  public clamp(min: Vector2, max: Vector2): Vector2 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));

    return this;
  }

  public clampScalar(minVal: number, maxVal: number): Vector2 {
    let min = new Vector2();
    let max = new Vector2();

    min.set(minVal, minVal);
    max.set(maxVal, maxVal);

    return this.clamp(min, max);
  }

  public clampLength(min: number, max: number): Vector2 {
    let length = this.length();

    return this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
  }

  public negate(): Vector2 {
    this.x = - this.x;
    this.y = - this.y;

    return this;
  }

  public dot(v: Vector2): number {
    return this.x * v.x + this.y * v.y;
  }

  public lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  public length(): number {
    return Math.sqrt(this.lengthSq());
  }

  public lengthManhattan(): number {
    return Math.abs(this.x) + Math.abs(this.y);
  }

  public normalize(): Vector2 {
    return this.divideScalar(this.length());
  }

  public angle(): number {
    let angle = Math.atan2(this.y, this.x);

    if (angle < 0) angle += 2 * Math.PI;

    return angle;
  }

  public distanceToSquared(v: Vector2): number {
    let dx = this.x - v.x, dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  public distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToManhattan(v: Vector2): number {
    return Math.abs(this.x - v.x) + Math.abs(this.y - v.y);
  }

  public lerp(v: Vector2, alpha: number): Vector2 {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;
  }

  public lerpVectors(v1: Vector2, v2: Vector2, alpha: number): Vector2 {
    return this.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }

  public equals(v: Vector2): boolean {
    return ((v.x === this.x) && (v.y === this.y));
  }

  public rotateAround(center: Vector2, angle: number): Vector2 {
    let c = Math.cos(angle), s = Math.sin(angle);

    let x = this.x - center.x;
    let y = this.y - center.y;

    this.x = x * c - y * s + center.x;
    this.y = x * s + y * c + center.y;

    return this;
  }

  public fromBufferAttribute(atb: BufferAttribute, index: number): Vector2 {
    this.x = atb.getX(index);
    this.y = atb.getY(index);

    return this;
  }

  public fromArray(array: Array<number>, offset: number = 0): Vector2 {
    this.x = array[offset];
    this.y = array[offset + 1];

    return this;
  }
}
