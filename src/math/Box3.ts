import { Vector3 } from './Vector3';
import { Sphere } from './Sphere';

export class Box3 {
  public min: Vector3;
  public max: Vector3;

  constructor(
    min: Vector3 = new Vector3(Infinity, Infinity, Infinity),
    max: Vector3 = new Vector3(-Infinity, -Infinity, -Infinity)
  ) {
    this.min = min;
    this.max = max;
  }

  public set(min: Vector3, max: Vector3): Box3 {
    this.min.copy(min);
    this.max.copy(max);

    return this;
  }

  public clone() {
    return (new Box3()).copy(this);
  }

  public copy(b: Box3): Box3 {
    this.min.copy(b.min);
    this.max.copy(b.max);

    return this;
  }

  public equals(b: Box3): boolean {
    return b.min.equals(this.min) && b.max.equals(this.max);
  }

  public makeEmpty(): Box3 {
    this.min.x = this.min.y = this.min.z = Infinity;
    this.max.x = this.max.y = this.max.z = -Infinity;

    return this;
  }

  public isEmpty(): boolean {
    return (this.max.x < this.min.x)
      || (this.max.y < this.min.y)
      || (this.max.z < this.min.z);
  }

  public containsPoint(p: Vector3): boolean {
    let ti = this.min;
    let ta = this.max;
    return (p.x < ti.x) || (p.x > ta.x)
      || (p.y < ti.y) || (p.y > ta.y)
      || (p.z < ti.z) || (p.z > ta.z) ? false : true;
  }

  public containsBox(b: Box3): boolean {
    return this.min.x <= b.min.x && b.max.x <= this.max.x
      && this.min.y <= b.min.y && b.max.y <= this.max.y
      && this.min.z <= b.min.z && b.max.z <= this.max.z;
  }

  public translate(offset: Vector3): Box3 {
    this.min.add(offset);
    this.max.add(offset);

    return this;
  }

}
