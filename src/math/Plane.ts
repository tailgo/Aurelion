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

  public setFromNormalAndCoplanarPoint(normal: Vector3, point: Vector3): Plane {
    this.normal.copy(normal);
    this.constant = -point.dot(this.normal);
    return this;
  }

  public setFromCoplanarPoints(a: Vector3, b: Vector3, c: Vector3): Plane {
    let v1 = new Vector3();
    let v2 = new Vector3();

    let normal = v1.subVectors(c, b).cross(v2.subVectors(a, b)).normalize();
    this.setFromNormalAndCoplanarPoint(normal, a);
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

  public projectPoint(point: Vector3, optionalTarget: Vector3) {
    return this.orthoPoint(point, optionalTarget).sub(point).negate();
  }

  public orthoPoint(point: Vector3, ot: Vector3 = new Vector3()): Vector3 {
    let perpendicularMagnitude = this.distanceToPoint(point);

    let result = ot;
    return result.copy(this.normal).multiplyScalar(perpendicularMagnitude);
  }

}
