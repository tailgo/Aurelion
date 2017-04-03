import { Matrix4 } from './Matrix4';

export class Matrix3 {

  public elements;

  constructor() {
    this.elements = new Float32Array([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    ]);
  }

  public set(
    n11: number, n12: number, n13: number,
    n21: number, n22: number, n23: number,
    n31: number, n32: number, n33: number
  ): Matrix3 {

    let te = this.elements;

    te[0] = n11; te[3] = n12; te[6] = n13;
    te[1] = n21; te[4] = n22; te[7] = n23;
    te[2] = n31; te[5] = n32; te[8] = n33;

    return this;
  }

  public identity(): Matrix3 {

    this.set(
      1, 0, 0,
      0, 1, 0,
      0, 0, 1
    );

    return this;

  }

  public copy(m: Matrix3): Matrix3 {

    let me = m.elements;

    this.set(
      me[0], me[3], me[6],
      me[1], me[4], me[7],
      me[2], me[5], me[8]
    );

    return this;
  }

  public setFromMatrix4(m: Matrix4): Matrix3 {

    let me = m.elements;

    this.set(
      me[0], me[4], me[8],
      me[1], me[5], me[9],
      me[2], me[6], me[10]
    );

    return this;
  }

  public multiplyScalar(s: number): Matrix3 {

    let te = this.elements;

    for (let i = 0; i < te.length; ++i) {
      te[i] *= s;
    }

    return this;
  }

  public transpose(): Matrix3 {

    let t, m = this.elements;

    t = m[1]; m[1] = m[3]; m[3] = t;
    t = m[2]; m[2] = m[6]; m[6] = t;
    t = m[5]; m[5] = m[7]; m[7] = t;

    return this;
  }

  public getNormalMatrix(matrix4: Matrix4): Matrix3 {
    return this.setFromMatrix4( matrix4 ).getInverse( this ).transpose();
  }

  public getInverse(
    matrix: Matrix3,
    throwOnDegenerate: boolean = false
  ): Matrix3 {
    let me = matrix.elements,
      te = this.elements,

      n11 = me[0], n21 = me[1], n31 = me[2],
      n12 = me[3], n22 = me[4], n32 = me[5],
      n13 = me[6], n23 = me[7], n33 = me[8],

      t11 = n33 * n22 - n32 * n23,
      t12 = n32 * n13 - n33 * n12,
      t13 = n23 * n12 - n22 * n13,

      det = n11 * t11 + n21 * t12 + n31 * t13;

    if (det === 0) {

      let msg = 'Matrix3.getInverse(): can\'t invert matrix, determinant is 0';

      if (throwOnDegenerate === true) {

        throw new Error(msg);

      } else {

        console.warn(msg);

      }

      return this.identity();
    }

    let detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n31 * n23 - n33 * n21) * detInv;
    te[2] = (n32 * n21 - n31 * n22) * detInv;

    te[3] = t12 * detInv;
    te[4] = (n33 * n11 - n31 * n13) * detInv;
    te[5] = (n31 * n12 - n32 * n11) * detInv;

    te[6] = t13 * detInv;
    te[7] = (n21 * n13 - n23 * n11) * detInv;
    te[8] = (n22 * n11 - n21 * n12) * detInv;

    return this;
  }

}
