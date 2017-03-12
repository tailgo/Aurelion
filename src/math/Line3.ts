import { Vector3 } from './Vector3';
import { MathTool } from './MathTool';

export class Line3 {

  public start: Vector3;
  public end: Vector3;

  constructor(
    start: Vector3 = new Vector3(),
    end: Vector3 = new Vector3()
  ) {
    this.start = start;
    this.end = end;
  }

  public clone(): Line3 {
    return new Line3(this.start, this.end);
  }

  public copy(l: Line3): Line3 {
    this.start.copy(l.start);
    this.end.copy(l.end);
    return this;
  }

  public distance(): number {
    return this.start.distanceTo(this.end);
  }

  public distanceSq(): number {
    return this.start.distanceToSquared(this.end);
  }

  public equals(l: Line3): boolean {
    return l.start.equals(this.start) && l.end.equals(this.end);
  }

}
