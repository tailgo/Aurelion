namespace AURELION {

  export class Vector2 {
    public x: number;
    public y: number;

    constructor(x: number = 0, y: number = 0) {
      this.x = x;
      this.y = y;
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
    public scale(scale: number) {
      this.x *= scale;
      this.y *= scale;
    }

    public divideScalar(scalar: number) {
      this.x /= scalar;
      this.y /= scalar;
    }

    // --- operation methods --- //
    public clone() {
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

    // --- get property --- //
    public length(): number {
      return Math.sqrt(this.lengthSquared());
    }

    public lengthSquared(): number {
      return this.x * this.x + this.y * this.y;
    }

    public normalize() {
      this.divideScalar(this.length());
    }

    public rotate(cx: number, cy: number, angle: number) {
      let c = Math.cos(angle), s = Math.sin(angle);

      let x = this.x - cx, y = this.y - cy; // Translation

      this.x = x * c - y * s + cx;
      this.y = x * s + y * c + cy;
    }

    // --- Static methods --- //
    public static AddVector2(v: Vector2, w: Vector2) {
      return new Vector2(v.x + w.x, v.y + w.y);
    }

    public static Distance(v: Vector2, w: Vector2): number {
      return Math.sqrt(Vector2.DistanceSquared(v, w));
    }

    public static DistanceSquared(v: Vector2, w: Vector2): number {
      let x = v.x - w.x;
      let y = v.y - w.y;

      return x * x + y * y;
    }

    public static Dot(v: Vector2, w: Vector2): number {
      return v.x * w.x + v.y * w.y;
    }

    public static SubVector2(v: Vector2, w: Vector2) {
      return new Vector2(v.x - w.x, v.y - w.y);
    }
  }

}

