import { Vector3 } from './Vector3';
import { Quaternion } from './Quaternion';

export class Matrix4 {
  public elements: Float32Array;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    ]);
  }

  public set(
    n11: number, n12: number, n13: number, n14: number,
    n21: number, n22: number, n23: number, n24: number,
    n31: number, n32: number, n33: number, n34: number,
    n41: number, n42: number, n43: number, n44: number
  ): Matrix4 {
    let te = this.elements;

    te[0] = n11, te[4] = n12, te[8] = n13, te[12] = n14;
    te[1] = n21, te[5] = n22, te[9] = n23, te[13] = n24;
    te[2] = n31, te[6] = n32, te[10] = n33, te[14] = n34;
    te[3] = n41, te[7] = n42, te[11] = n43, te[15] = n44;

    return this;
  }

  public multiply(m: Matrix4): Matrix4 {
    return this.multiplyMatrix(this, m);
  }

  public multiplyScalar(s: number): Matrix4 {
    let te = this.elements;

    for (let i = 0; i < 16; ++i) {
      te[i] *= s;
    }

    return this;
  }

  public multiplyMatrix(m: Matrix4, n: Matrix4): Matrix4 {
    let a = m.elements, b = n.elements;
    let te = this.elements;

    let a11 = a[0], a12 = a[4], a13 = a[8], a14 = a[12];
    let a21 = a[1], a22 = a[5], a23 = a[9], a24 = a[13];
    let a31 = a[2], a32 = a[6], a33 = a[10], a34 = a[14];
    let a41 = a[3], a42 = a[7], a43 = a[11], a44 = a[15];

    let b11 = b[0], b12 = b[4], b13 = b[8], b14 = b[12];
    let b21 = b[1], b22 = b[5], b23 = b[9], b24 = b[13];
    let b31 = b[2], b32 = b[6], b33 = b[10], b34 = b[14];
    let b41 = b[3], b42 = b[7], b43 = b[11], b44 = b[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;

    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;

    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;

    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
  }

  public premultiply(m: Matrix4): Matrix4 {
    return this.multiplyMatrix(m, this);
  }

  public equals(m: Matrix4): boolean {
    let te = this.elements;
    let me = m.elements;

    for (let i = 0; i < 16; ++i) {
      if (te[i] !== me[i]) {
        return false;
      }
    }

    return true;
  }

  public transpose(): Matrix4 {
    let te = this.elements;
    te[1] = te[1] + te[4];
    te[4] = te[1] - te[4];
    te[1] = te[1] - te[4];

    te[2] = te[2] + te[8];
    te[8] = te[2] - te[8];
    te[2] = te[2] - te[8];

    te[3] = te[3] + te[12];
    te[12] = te[3] - te[12];
    te[3] = te[3] - te[12];

    te[6] = te[6] + te[9];
    te[9] = te[6] - te[9];
    te[6] = te[6] - te[9];

    te[7] = te[7] + te[13];
    te[13] = te[7] - te[13];
    te[7] = te[7] - te[13];

    te[11] = te[11] + te[14];
    te[14] = te[11] - te[14];
    te[11] = te[11] - te[14];

    return this;
  }

  public transition(x: number, y: number, z: number): Matrix4 {
    this.set(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    );
    return this;
  }

  public rotationX(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(
      1, 0, 0, 0,
      0, c, -s, 0,
      0, s, c, 0,
      0, 0, 0, 1
    );

    return this;
  }

  public rotationY(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(
      c, 0, s, 0,
      0, 1, 0, 0,
      -s, 0, c, 0,
      0, 0, 0, 1
    );

    return this;
  }

  public rotationZ(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(
      c, -s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1
    );

    return this;
  }

  public makeRotationFromQuaternion(q: Quaternion): Matrix4 {
    let te = this.elements;

    let x = q.x, y = q.y, z = q.z, w = q.w;
    let x2 = x + x, y2 = y + y, z2 = z + z;
    let xx = x * x2, xy = x * y2, xz = x * z2;
    let yy = y * y2, yz = y * z2, zz = z * z2;
    let wx = w * x2, wy = w * y2, wz = w * z2;

    te[0] = 1 - (yy + zz);
    te[4] = xy - wz;
    te[8] = xz + wy;

    te[1] = xy + wz;
    te[5] = 1 - (xx + zz);
    te[9] = yz - wx;

    te[2] = xz - wy;
    te[6] = yz + wx;
    te[10] = 1 - (xx + yy);

    // last column
    te[3] = 0;
    te[7] = 0;
    te[11] = 0;

    // bottom row
    te[12] = 0;
    te[13] = 0;
    te[14] = 0;
    te[15] = 1;

    return this;
  }
}
