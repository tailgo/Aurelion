import { Color } from '../math/Color';
import { Vector3 } from '../math/Vector3';

export class Face3 {
  public a: number;
  public b: number;
  public c: number;

  public normal: Vector3;
  public vertexNormals: Array<Vector3>;

  public color: Color;
  public vertexColors: Array<Color>;

  public materialIndex: number;

  constructor(
    a?: number, b?: number, c?: number,
    normal?: Vector3 | Array<Vector3>,
    color?: Color | Array<Color>,
    materialIndex?: number
  ) {
    this.a = a;
    this.b = b;
    this.c = c;

    this.normal = normal instanceof Vector3 ? normal : new Vector3();
    this.vertexNormals = Array.isArray(normal) ? normal : [];

    this.color = color instanceof Color ? color : new Color(1, 1, 1);
    this.vertexColors = Array.isArray(color) ? color : [];

    this.materialIndex = materialIndex || 0;
  }

  public clone(): Face3 {
    return (new Face3()).copy(this);
  }

  public copy(source: Face3): Face3 {
    this.a = source.a;
    this.b = source.b;
    this.c = source.c;

    this.normal.copy(source.normal);
    this.color.copy(source.color);

    this.materialIndex = source.materialIndex;

    for (let i = 0, il = source.vertexNormals.length; i < il; i++) {

      this.vertexNormals[i] = source.vertexNormals[i].clone();

    }

    for (let i = 0, il = source.vertexColors.length; i < il; i++) {

      this.vertexColors[i] = source.vertexColors[i].clone();

    }

    return this;
  }

}
