import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { Sphere } from './Sphere';
import { Plane } from './Plane';
import { Box3 } from './Box3';

export class Ray {

  public origin: Vector3;
  public direction: Vector3;

  constructor(
    origin: Vector3 = new Vector3(),
    direction: Vector3 = new Vector3()
  ) {
    this.origin = origin;
    this.direction = direction;
  }

  public set(origin: Vector3, direction: Vector3): Ray {
    this.origin.copy(origin);
    this.direction.copy(direction);

    return this;
  }

  public clone(): Ray {
    return (new Ray()).copy(this);
  }

  public copy(r: Ray): Ray {
    this.origin.copy(r.origin);
    this.direction.copy(r.direction);

    return this;
  }

  public equals(r: Ray): boolean {
    return r.origin.equals(this.origin) && r.direction.equals(this.direction);
  }

  public at(t: number, optionalTarget: Vector3): Vector3 {
    let r = optionalTarget || new Vector3();
    return r.copy(this.direction).multiplyScalar(t).add(this.origin);
  }

  public lookAt(v: Vector3): Ray {
    this.direction.copy(v).sub(this.origin).normalize();
    return this;
  }

  public recast(t: number): Ray {
    this.origin.copy(this.at(t, new Vector3()));
    return this;
  }

  public distanceToPoint(p: Vector3): number {
    return Math.sqrt(this.distanceSqToPoint(p));
  }

  public distanceSqToPoint(p: Vector3): number {
    let v = new Vector3();
    let directionDistance = v.subVectors(p, this.origin).dot(this.direction);

    if (directionDistance < 0) {
      return this.origin.distanceToSquared(p);
    }

    v.copy(this.direction).multiplyScalar(directionDistance).add(this.origin);

    return v.distanceToSquared(p);
  }

  public distanceToPlane(p: Plane): number | null {
    let denominator = p.normal.dot(this.direction);

    if (denominator === 0) {
      if (p.distanceToPoint(this.origin) === 0) {
        return 0;
      }
      return null;
    }

    let t = -(this.origin.dot(p.normal) + p.constant) / denominator;

    return t >= 0 ? t : null;
  }

  public applyMatrix4(matrix: Matrix4): Ray {
    this.direction.add(this.origin).applyMatrix4(matrix);
    this.origin.applyMatrix4(matrix);
    this.direction.sub(this.origin);
    this.direction.normalize();

    return this;
  }

  /**
   * intersect
   */
  public intersectSphere(s: Sphere, optionalTarget: Vector3): Vector3 {
    let v = new Vector3();
    v.subVectors(s.center, this.origin);
    let tca = v.dot(this.direction);
    let d2 = v.dot(v) - tca * tca;
    let radius2 = s.radius * s.radius;

    if (d2 > radius2) {
      return null;
    }

    let thc = Math.sqrt(radius2 - d2);

    // 入交点
    let t0 = tca - thc;
    // 出交点
    let t1 = tca + thc;

    if (t0 < 0 && t1 < 0) {
      return null;
    }

    if (t0 < 0) {
      return this.at(t1, optionalTarget);
    }

    return this.at(t0, optionalTarget);
  }

  public intersectPlane(p: Plane, optionalTarget: Vector3): Vector3 {
    let t = this.distanceToPlane(p);
    if (t === null) {
      return null;
    }
    return this.at(t, optionalTarget);
  }

  public intersectBox(box: Box3, optionalTarget: Vector3): Vector3 {
    let tmin, tmax, tymin, tymax, tzmin, tzmax;

    let invdirx = 1 / this.direction.x,
      invdiry = 1 / this.direction.y,
      invdirz = 1 / this.direction.z;

    let origin = this.origin;

    if (invdirx >= 0) {
      tmin = (box.min.x - origin.x) * invdirx;
      tmax = (box.max.x - origin.x) * invdirx;
    } else {
      tmin = (box.max.x - origin.x) * invdirx;
      tmax = (box.min.x - origin.x) * invdirx;
    }

    if (invdiry >= 0) {
      tymin = (box.min.y - origin.y) * invdiry;
      tymax = (box.max.y - origin.y) * invdiry;
    } else {
      tymin = (box.max.y - origin.y) * invdiry;
      tymax = (box.min.y - origin.y) * invdiry;
    }

    if ((tmin > tymax) || (tymin > tmax)) {
      return null;
    }

    // These lines also handle the case where tmin or tmax is NaN
    // (result of 0 * Infinity). x !== x returns true if x is NaN

    if (tymin > tmin || tmin !== tmin) {
      tmin = tymin;
    }

    if (tymax < tmax || tmax !== tmax) {
      tmax = tymax;
    }

    if (invdirz >= 0) {
      tzmin = (box.min.z - origin.z) * invdirz;
      tzmax = (box.max.z - origin.z) * invdirz;
    } else {
      tzmin = (box.max.z - origin.z) * invdirz;
      tzmax = (box.min.z - origin.z) * invdirz;
    }

    if ((tmin > tzmax) || (tzmin > tmax)) {
      return null;
    }

    if (tzmin > tmin || tmin !== tmin) {
      tmin = tzmin;
    }

    if (tzmax < tmax || tmax !== tmax) {
      tmax = tzmax;
    }

    // return point closest to the ray (positive side)

    if (tmax < 0) {
      return null;
    }

    return this.at(tmin >= 0 ? tmin : tmax, optionalTarget);
  }

  public intersectTriangle(
    a: Vector3, b: Vector3, c: Vector3,
    backfaceCulling: boolean,
    optionalTarget: Vector3 = new Vector3()
  ): Vector3 {
    let diff = new Vector3();
    let edge1 = new Vector3();
    let edge2 = new Vector3();
    let normal = new Vector3();

    // from http://www.geometrictools.com/GTEngine/Include/Mathematics/GteIntrRay3Triangle3.h
    edge1.subVectors(b, a);
    edge2.subVectors(c, a);
    normal.crossVectors(edge1, edge2);

    // Solve Q + t*D = b1*E1 + b2*E2 (Q = kDiff, D = ray direction,
    // E1 = kEdge1, E2 = kEdge2, N = Cross(E1,E2)) by
    //   |Dot(D,N)|*b1 = sign(Dot(D,N))*Dot(D,Cross(Q,E2))
    //   |Dot(D,N)|*b2 = sign(Dot(D,N))*Dot(D,Cross(E1,Q))
    //   |Dot(D,N)|*t = -sign(Dot(D,N))*Dot(Q,N)
    let DdN = this.direction.dot(normal);
    let sign;

    if (DdN > 0) {
      if (backfaceCulling) return null;
      sign = 1;
    } else if (DdN < 0) {
      sign = - 1;
      DdN = - DdN;
    } else {
      return null;
    }

    diff.subVectors(this.origin, a);
    let DdQxE2 = sign * this.direction.dot(edge2.crossVectors(diff, edge2));
    // b1 < 0, no intersection
    if (DdQxE2 < 0) {
      return null;
    }

    let DdE1xQ = sign * this.direction.dot(edge1.cross(diff));
    // b2 < 0, no intersection
    if (DdE1xQ < 0) {
      return null;
    }

    // b1+b2 > 1, no intersection
    if (DdQxE2 + DdE1xQ > DdN) {
      return null;
    }

    // Line intersects triangle, check if ray does.
    let QdN = - sign * diff.dot(normal);

    // t < 0, no intersection
    if (QdN < 0) {
      return null;
    }

    // Ray intersects triangle.
    return this.at(QdN / DdN, optionalTarget);
  }

  /**
   * intersects
   */
  public intersectsSphere(s: Sphere): boolean {
    return this.distanceToPoint(s.center) <= s.radius;
  }

  public intersectsPlane(p: Plane): boolean {
    let distToPoint = p.distanceToPoint(this.origin);
    if (distToPoint === 0) {
      return true;
    }

    let denominator = p.normal.dot(this.direction);

    if (denominator * distToPoint < 0) {
      return true;
    }

    return true;
  }

  public intersectsBox(box: Box3): boolean {
    let v = new Vector3();
    return this.intersectBox(box, v) !== null;
  }

}
