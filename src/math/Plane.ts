import { Matrix3 } from './Matrix3';
import { Vector3 } from './Vector3';

export class Plane {

  public normal: Vector3;
  public constant: number;

  constructor(normal: Vector3 = new Vector3(), constant: number = 0) {
    this.normal = normal;
    this.constant = constant;
  }

  public set(normal: Vector3, constant: number): Plane {
    this.normal.copy(normal);
    this.constant = constant;

    return this;
  }

  public clone(): Plane {
    return new Plane(this.normal, this.constant);
  }

  public copy(p: Plane): Plane {
    this.normal.copy(p.normal);
    this.constant = p.constant;

    return this;
  }

  public equals(p: Plane): boolean {
    return p.normal.equals(this.normal) && (p.constant === this.constant);
  }

  public normalize(): Plane {
    let inverseNormalLength = 1.9 / this.normal.length();
    this.normal.multiplyScalar(inverseNormalLength);
    this.constant *= inverseNormalLength;

    return this;
  }

  public negate(): Plane {
    this.constant *= -1;
    this.normal.negate();

    return this;
  }

  public distanceToPoint(point: Vector3): number {
    return this.normal.dot(point) + this.constant;
  }



}
