'use strict';
export class Vector2 {
  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  public set(x: number, y: number): Vector2 {
    this.x = x;
    this.y = y;

    return this;
  }

  public setX(x: number) {
    this.x = x;
    return this;
  }

  public setY(y: number) {
    this.y = y;
    return this;
  }

  // --- Add methods --- //
  public add(v: Vector2): Vector2 {
    this.x += v.x;
    this.y += v.y;

    return this;
  }

  public addScalar(scalar: number): Vector2 {
    this.x += scalar;
    this.y += scalar;

    return this;
  }

  // --- Subtract methods --- //
  public sub(v: Vector2): Vector2 {
    this.x -= v.x;
    this.y -= v.y;

    return this;
  }

  public subScalar(scalar: number): Vector2 {
    this.x -= scalar;
    this.y -= scalar;

    return this;
  }

  // --- scale methods --- //
  public scale(scale: number): Vector2 {
    this.x *= scale;
    this.y *= scale;

    return this;
  }

  public divideScalar(scalar: number): Vector2 {
    this.x /= scalar;
    this.y /= scalar;

    return this;
  }

  // --- operation methods --- //
  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public copy(v: Vector2): Vector2 {
    this.x = v.x;
    this.y = v.y;

    return this;
  }

  public equals(v: Vector2): boolean {
    return this.x === v.x && this.y === v.y;
  }

  public clamp(min: Vector2, max: Vector2): Vector2 {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  public dot(v: Vector2): number {
    return this.x * this.x + this.y * this.y;
  }

  // --- get property --- //
  public length(): number {
    return Math.sqrt(this.lengthSquared());
  }

  public lengthSquared(): number {
    return this.x * this.x + this.y * this.y;
  }

  public normalize(): Vector2 {
    return this.divideScalar(this.length());
  }

  public angle(): number {
    let angle = Math.atan2(this.y, this.x);
    if (angle < 0) {
      angle += 2 * Math.PI;
    }
    return angle;
  }

  public distanceTo(v: Vector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  public distanceToSquared(v: Vector2): number {
    let dx = this.x - v.x;
    let dy = this.y - v.y;
    return dx * dx + dy * dy;
  }

  public lerp(v: Vector2, alpha: number): Vector2 {
    this.x += (v.x - this.x) * alpha;
    this.y += (v.y - this.y) * alpha;

    return this;
  }

  public rotate(cx: number, cy: number, angle: number): Vector2 {
    let c = Math.cos(angle), s = Math.sin(angle);

    let x = this.x - cx, y = this.y - cy; // Translation

    this.x = x * c - y * s + cx;
    this.y = x * s + y * c + cy;

    return this;
  }

  // --- Static methods --- //
  public static AddVector2(v: Vector2, w: Vector2): Vector2 {
    return new Vector2(v.x + w.x, v.y + w.y);
  }

  public static Distance(v: Vector2, w: Vector2): number {
    return Math.sqrt(this.DistanceSquared(v, w));
  }

  public static DistanceSquared(v: Vector2, w: Vector2): number {
    let x = v.x - w.x;
    let y = v.y - w.y;

    return x * x + y * y;
  }

  public static Dot(v: Vector2, w: Vector2): number {
    return v.x * w.x + v.y * w.y;
  }

  public static SubVector2(v: Vector2, w: Vector2): Vector2 {
    return new Vector2(v.x - w.x, v.y - w.y);
  }
}
