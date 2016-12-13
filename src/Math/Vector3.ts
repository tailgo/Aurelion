namespace AURELION {
  export class Vector3 {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number = 0, y: number = 0, z: number = 0) {
      this.x = x;
      this.y = y;
      this.z = z;
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

    // --- scale methods --- //
    public scale(scale: number): Vector3 {
      this.x *= scale;
      this.y *= scale;
      this.z *= scale;

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
      return Math.sqrt(this.lengthSquared());
    }

    public lengthSquared(): number {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    public normalize(): Vector3 {
      return this.divideScalar(this.length());
    }

    // --- Static methods --- //
    public static AddVector3(v: Vector3, w: Vector3): Vector3 {
      return new Vector3(v.x + w.x, v.y + w.y, v.z + w.z);
    }
  }
}
