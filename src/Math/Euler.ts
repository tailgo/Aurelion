import { Quaternion } from './Quaternion';
import { Vector3 } from './Vector3';
import { Matrix4 } from './Matrix4';
import { MathTool } from './MathTool';

export class Euler {

  private _x: number;
  private _y: number;
  private _z: number;
  private _order: string;

  public static DefaultOrder: string = 'XYZ';
  public static RotationOrders: string[] = [
    'XYZ', 'YZX', 'ZXY',
    'XZY', 'YXZ', 'ZYX'
  ];

  constructor(
    x: number = 0,
    y: number = 0,
    z: number = 0,
    order: string = Euler.DefaultOrder
  ) {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
  }

  public get x() {
    return this._x;
  }

  public set x(v: number) {
    this._x = v;
  }

  public get y() {
    return this._y;
  }

  public set y(v: number) {
    this._y = v;
  }

  public get z() {
    return this._z;
  }

  public set z(v: number) {
    this._z = v;
  }

  public get order() {
    return this._order;
  }

  public set order(v: string) {
    this._order = v;
  }

  public set(x: number, y: number, z: number, order: string): Euler {
    this._x = x;
    this._y = y;
    this._z = z;
    this._order = order;
    return this;
  }

  public copy(euler: Euler): Euler {
    this._x = euler._x;
    this._y = euler._y;
    this._z = euler._z;
    this._order = euler._order;

    return this;
  }

  public setFromRotationMatrix(m: Matrix4, order: string = this._order): Euler {
    let clamp = MathTool.clamp;

    let te = m.elements;
    let m11 = te[0], m12 = te[4], m13 = te[8];
    let m21 = te[1], m22 = te[5], m23 = te[9];
    let m31 = te[2], m32 = te[6], m33 = te[10];

    switch (order) {
      case 'XYZ':
        this._y = Math.asin(clamp(m13, -1, 1));

        if (Math.abs(m13) < 0.99999) {
          this._x = Math.atan2(-m23, m33);
          this._z = Math.atan2(-m12, m11);
        } else {
          this._x = Math.atan2(m32, m22);
          this._z = 0;
        }

        break;
      case 'YXZ':
        this._x = Math.asin(-clamp(m23, -1, 1));

        if (Math.abs(m23) < 0.99999) {
          this._y = Math.atan2(m13, m33);
          this._z = Math.atan2(m21, m22);
        } else {
          this._y = Math.atan2(-m31, m11);
          this._z = 0;
        }

        break;
      case 'ZXY':
        this._x = Math.asin(clamp(m32, -1, 1));

        if (Math.abs(m32) < 0.99999) {
          this._y = Math.atan2(-m31, m33);
          this._z = Math.atan2(-m12, m22);
        } else {
          this._y = 0;
          this._z = Math.atan2(m21, m11);
        }

        break;
      case 'ZYX':
        this._y = Math.asin(-clamp(m31, -1, 1));
        if (Math.abs(m31) < 0.99999) {
          this._x = Math.atan2(m32, m33);
          this._z = Math.atan2(m21, m11);
        } else {
          this._x = 0;
          this._z = Math.atan2(-m12, m22);
        }

        break;
      case 'YZX':
        this._z = Math.asin(clamp(m21, -1, 1));

        if (Math.abs(m21) < 0.99999) {
          this._x = Math.atan2(-m23, m22);
          this._y = Math.atan2(-m31, m11);
        } else {
          this._x = 0;
          this._y = Math.atan2(m13, m33);
        }

        break;
      case 'XZY':
        this._z = Math.asin(-clamp(m12, -1, 1));

        if (Math.abs(m12) < 0.99999) {
          this._x = Math.atan2(m32, m22);
          this._y = Math.atan2(m13, m11);
        } else {
          this._x = Math.atan2(-m23, m33);
          this._y = 0;
        }

        break;
      default:
        console.warn('Euler:.setFromRotationMatrix() has error order:' + order);
        break;
    }

    this._order = order;

    return this;
  }

  public setFromVector3(v: Vector3, order: string = this._order): Euler {
    return this.set(v.x, v.y, v.z, order);
  }

  public equals(e: Euler): boolean {
    return (e.x === this._x)
      && (e.y === this._y)
      && (e.z === this._z)
      && (e.order === this._order);
  }
}
