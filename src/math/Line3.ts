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

  public set(start: Vector3, end: Vector3): Line3 {
    this.start.copy(start);
    this.end.copy(end);
    return this;
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

  public delta(optionTarget: Vector3 = new Vector3()): Vector3 {
    return optionTarget.subVectors(this.end, this.start);
  }

  public closestPointToPoint(
    point: Vector3, clampToLine: boolean, ot: Vector3 = new Vector3()
  ): Vector3 {
    let t = this.closestPointToPointParameter(point, clampToLine);
    let result = ot;
    return this.delta(result).multiplyScalar(t).add(this.start);
  }

  public closestPointToPointParameter(
    point: Vector3, clampToLine: boolean
  ): number {
    let startP = new Vector3();
    let startEnd = new Vector3();

    startP.subVectors(point, this.start);
    startEnd.subVectors(this.end, this.start);

    let startEnd2 = startEnd.dot(startEnd);
    let startEnd_startP = startEnd.dot(startP);

    let t = startEnd_startP / startEnd2;

    if (clampToLine) {
      t = MathTool.clamp(t, 0, 1);
    }

    return t;
  }

}
