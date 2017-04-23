import { Box3 } from './Box3';
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';

export class Sphere {

  public center: Vector3;
  public radius: number;

  constructor(center: Vector3 = new Vector3(), radius: number = 0) {
    this.center = center;
    this.radius = radius;
  }

  public set(center: Vector3, radius: number): Sphere {
    this.center.copy(center);
    this.radius = radius;

    return this;
  }

  public setFromPoints(
    points: Array<Vector3>,
    optionalCenter?: Vector3
  ): Sphere {
    let box = new Box3();
    let center = this.center;

    if (optionalCenter) {
      center.copy(optionalCenter);
    } else {
      box.setFromPoints(points).getCenter(center);
    }

    let maxRadiusSq = 0;
    for (let i = 0, il = points.length; i < il; ++i) {
      maxRadiusSq = Math.max(maxRadiusSq, center.distanceToSquared(points[i]));
    }

    this.radius = Math.sqrt(maxRadiusSq);

    return this;

  }

  public clone(): Sphere {
    return (new Sphere()).copy(this);
  }

  public copy(s: Sphere) {
    this.center.copy(s.center);
    this.radius = s.radius;

    return this;
  }

  public equals(s: Sphere): boolean {
    return s.center.equals(this.center) && (s.radius === this.radius);
  }

  public empty(): boolean {
    return (this.radius <= 0);
  }

  public containsPoint(point: Vector3): boolean {
    return point.distanceToSquared(this.center) <= (this.radius * this.radius);
  }

  public distanceToPoint(point: Vector3): number {
    return point.distanceTo(this.center) - this.radius;
  }

  public intersectsSphere(s: Sphere): boolean {
    let radiusSum = this.radius + s.radius;
    return s.center.distanceToSquared(this.center) <= (radiusSum * radiusSum);
  }

  public translate(offset: Vector3): Sphere {
    this.center.add(offset);
    return this;
  }

  public applyMatrix4(matrix: Matrix4): Sphere {
    this.center.applyMatrix4(matrix);
    this.radius = this.radius * matrix.getMaxScaleOnAxis();

    return this;
  }
}
