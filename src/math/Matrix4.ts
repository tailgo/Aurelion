import { Vector3 } from './Vector3';
import { Quaternion } from './Quaternion';

export class Matrix4 {
  public elements: Float32Array;

  public isMatrix4: boolean = true;

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

  public copy(m: Matrix4): Matrix4 {
    this.elements.set(m.elements);

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

  public multiplyMatrices(a: Matrix4, b: Matrix4): Matrix4 {
    let ae = a.elements;
    let be = b.elements;
    let te = this.elements;

    let a11 = ae[0], a12 = ae[4], a13 = ae[8], a14 = ae[12];
    let a21 = ae[1], a22 = ae[5], a23 = ae[9], a24 = ae[13];
    let a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
    let a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

    let b11 = be[0], b12 = be[4], b13 = be[8], b14 = be[12];
    let b21 = be[1], b22 = be[5], b23 = be[9], b24 = be[13];
    let b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
    let b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

    te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
    te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
    te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
    te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

    te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
    te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
    te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
    te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

    te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
    te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
    te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
    te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

    te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
    te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
    te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
    te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

    return this;
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

  public makePerspective(
    left: number, right: number,
    top: number, bottom: number,
    near: number, far: number
  ): Matrix4 {
    let te = this.elements;
    let x = 2 * near / (right - left);
    let y = 2 * near / (top - bottom);

    let a = (right + left) / (right - left);
    let b = (top + bottom) / (top - bottom);
    let c = - (far + near) / (far - near);
    let d = - 2 * far * near / (far - near);

    te[0] = x; te[4] = 0; te[8] = a; te[12] = 0;
    te[1] = 0; te[5] = y; te[9] = b; te[13] = 0;
    te[2] = 0; te[6] = 0; te[10] = c; te[14] = d;
    te[3] = 0; te[7] = 0; te[11] = - 1; te[15] = 0;

    return this;
  }

  public makeOrthographic(
    left: number, right: number,
    top: number, bottom: number,
    near: number, far: number
  ): Matrix4 {
    let te = this.elements;
    let w = 1.0 / (right - left);
    let h = 1.0 / (top - bottom);
    let p = 1.0 / (far - near);

    let x = (right + left) * w;
    let y = (top + bottom) * h;
    let z = (far + near) * p;

    te[0] = 2 * w; te[4] = 0; te[8] = 0; te[12] = - x;
    te[1] = 0; te[5] = 2 * h; te[9] = 0; te[13] = - y;
    te[2] = 0; te[6] = 0; te[10] = - 2 * p; te[14] = - z;
    te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;

    return this;
  }

  public makeRotationX(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      1, 0, 0, 0,
      0, c, - s, 0,
      0, s, c, 0,
      0, 0, 0, 1

    );

    return this;
  }

  public makeRotationY(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      c, 0, s, 0,
      0, 1, 0, 0,
      - s, 0, c, 0,
      0, 0, 0, 1

    );

    return this;
  }

  public makeRotationZ(theta: number): Matrix4 {
    let c = Math.cos(theta), s = Math.sin(theta);

    this.set(

      c, - s, 0, 0,
      s, c, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1

    );

    return this;
  }

  public makeTranslation(x: number, y: number, z: number): Matrix4 {
    this.set(
      1, 0, 0, x,
      0, 1, 0, y,
      0, 0, 1, z,
      0, 0, 0, 1
    );

    return this;
  }

  public makeScale(x: number, y: number, z: number): Matrix4 {
    this.set(
      x, 0, 0, 0,
      0, y, 0, 0,
      0, 0, z, 0,
      0, 0, 0, 1
    );

    return this;
  }

  // 行列式求和
  public determinant() {
    let te = this.elements;

    let n11 = te[0], n12 = te[4], n13 = te[8], n14 = te[12];
    let n21 = te[1], n22 = te[5], n23 = te[9], n24 = te[13];
    let n31 = te[2], n32 = te[6], n33 = te[10], n34 = te[14];
    let n41 = te[3], n42 = te[7], n43 = te[11], n44 = te[15];

    // http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm

    return (
      n41 * (
        + n14 * n23 * n32
        - n13 * n24 * n32
        - n14 * n22 * n33
        + n12 * n24 * n33
        + n13 * n22 * n34
        - n12 * n23 * n34
      ) +
      n42 * (
        + n11 * n23 * n34
        - n11 * n24 * n33
        + n14 * n21 * n33
        - n13 * n21 * n34
        + n13 * n24 * n31
        - n14 * n23 * n31
      ) +
      n43 * (
        + n11 * n24 * n32
        - n11 * n22 * n34
        - n14 * n21 * n32
        + n12 * n21 * n34
        + n14 * n22 * n31
        - n12 * n24 * n31
      ) +
      n44 * (
        - n13 * n22 * n31
        - n11 * n23 * n32
        + n11 * n22 * n33
        + n13 * n21 * n32
        - n12 * n21 * n33
        + n12 * n23 * n31
      )

    );
  }

  public compose(p: Vector3, q: Quaternion, s: Vector3): Matrix4 {
    this.makeRotationFromQuaternion(q);
    this.scale(s);
    this.setPosition(p);

    return this;
  }

  public decompose(
    position: Vector3,
    quaternion: Quaternion,
    scale: Vector3
  ): Matrix4 {
    let vector: Vector3 = new Vector3();
    let matrix: Matrix4 = new Matrix4();

    let te = this.elements;

    let sx = vector.set(te[0], te[1], te[2]).length();
    let sy = vector.set(te[4], te[5], te[6]).length();
    let sz = vector.set(te[8], te[9], te[10]).length();

    let det = this.determinant();

    if (det < 0) {
      sx = -sx;
    }

    position.x = te[12];
    position.y = te[13];
    position.z = te[14];

    // scale the rotation part
    matrix.elements.set(this.elements);

    let invSX = 1 / sx;
    let invSY = 1 / sy;
    let invSZ = 1 / sz;

    matrix.elements[0] *= invSX;
    matrix.elements[1] *= invSX;
    matrix.elements[2] *= invSX;

    matrix.elements[4] *= invSY;
    matrix.elements[5] *= invSY;
    matrix.elements[6] *= invSY;

    matrix.elements[8] *= invSZ;
    matrix.elements[9] *= invSZ;
    matrix.elements[10] *= invSZ;

    quaternion.setFromRotationMatrix(matrix);

    scale.x = sx;
    scale.y = sy;
    scale.z = sz;

    return this;
  }

  public identity() {
    this.set(

      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1

    );

    return this;
  }

  public getInverse(m: Matrix4, throwOnDegenerate: boolean = true) {
    // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
    let te = this.elements,
      me = m.elements,

      n11 = me[0], n21 = me[1], n31 = me[2], n41 = me[3],
      n12 = me[4], n22 = me[5], n32 = me[6], n42 = me[7],
      n13 = me[8], n23 = me[9], n33 = me[10], n43 = me[11],
      n14 = me[12], n24 = me[13], n34 = me[14], n44 = me[15],

      t11 = n23 * n34 * n42 - n24 * n33 * n42 + n24 * n32 * n43 - n22 * n34 * n43 - n23 * n32 * n44 + n22 * n33 * n44,
      t12 = n14 * n33 * n42 - n13 * n34 * n42 - n14 * n32 * n43 + n12 * n34 * n43 + n13 * n32 * n44 - n12 * n33 * n44,
      t13 = n13 * n24 * n42 - n14 * n23 * n42 + n14 * n22 * n43 - n12 * n24 * n43 - n13 * n22 * n44 + n12 * n23 * n44,
      t14 = n14 * n23 * n32 - n13 * n24 * n32 - n14 * n22 * n33 + n12 * n24 * n33 + n13 * n22 * n34 - n12 * n23 * n34;

    let det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;

    if (det === 0) {

      let msg = 'Matrix4.getInverse(): can\'t invert matrix, determinant is 0';

      if (throwOnDegenerate === true) {

        throw new Error(msg);

      } else {

        console.warn(msg);

      }

      return this.identity();

    }

    let detInv = 1 / det;

    te[0] = t11 * detInv;
    te[1] = (n24 * n33 * n41 - n23 * n34 * n41 - n24 * n31 * n43 + n21 * n34 * n43 + n23 * n31 * n44 - n21 * n33 * n44) * detInv;
    te[2] = (n22 * n34 * n41 - n24 * n32 * n41 + n24 * n31 * n42 - n21 * n34 * n42 - n22 * n31 * n44 + n21 * n32 * n44) * detInv;
    te[3] = (n23 * n32 * n41 - n22 * n33 * n41 - n23 * n31 * n42 + n21 * n33 * n42 + n22 * n31 * n43 - n21 * n32 * n43) * detInv;

    te[4] = t12 * detInv;
    te[5] = (n13 * n34 * n41 - n14 * n33 * n41 + n14 * n31 * n43 - n11 * n34 * n43 - n13 * n31 * n44 + n11 * n33 * n44) * detInv;
    te[6] = (n14 * n32 * n41 - n12 * n34 * n41 - n14 * n31 * n42 + n11 * n34 * n42 + n12 * n31 * n44 - n11 * n32 * n44) * detInv;
    te[7] = (n12 * n33 * n41 - n13 * n32 * n41 + n13 * n31 * n42 - n11 * n33 * n42 - n12 * n31 * n43 + n11 * n32 * n43) * detInv;

    te[8] = t13 * detInv;
    te[9] = (n14 * n23 * n41 - n13 * n24 * n41 - n14 * n21 * n43 + n11 * n24 * n43 + n13 * n21 * n44 - n11 * n23 * n44) * detInv;
    te[10] = (n12 * n24 * n41 - n14 * n22 * n41 + n14 * n21 * n42 - n11 * n24 * n42 - n12 * n21 * n44 + n11 * n22 * n44) * detInv;
    te[11] = (n13 * n22 * n41 - n12 * n23 * n41 - n13 * n21 * n42 + n11 * n23 * n42 + n12 * n21 * n43 - n11 * n22 * n43) * detInv;

    te[12] = t14 * detInv;
    te[13] = (n13 * n24 * n31 - n14 * n23 * n31 + n14 * n21 * n33 - n11 * n24 * n33 - n13 * n21 * n34 + n11 * n23 * n34) * detInv;
    te[14] = (n14 * n22 * n31 - n12 * n24 * n31 - n14 * n21 * n32 + n11 * n24 * n32 + n12 * n21 * n34 - n11 * n22 * n34) * detInv;
    te[15] = (n12 * n23 * n31 - n13 * n22 * n31 + n13 * n21 * n32 - n11 * n23 * n32 - n12 * n21 * n33 + n11 * n22 * n33) * detInv;

    return this;
  }

  public getMaxScaleOnAxis(): number {
    let te = this.elements;

    let scaleXSq = te[0] * te[0] + te[1] * te[1] + te[2] * te[2];
    let scaleYSq = te[4] * te[4] + te[5] * te[5] + te[6] * te[6];
    let scaleZSq = te[8] * te[8] + te[9] * te[9] + te[10] * te[10];

    return Math.sqrt(Math.max(scaleXSq, scaleYSq, scaleZSq));
  }

  public scale(v: Vector3): Matrix4 {
    let te = this.elements;
    let x = v.x, y = v.y, z = v.z;

    te[0] *= x; te[4] *= y; te[8] *= z;
    te[1] *= x; te[5] *= y; te[9] *= z;
    te[2] *= x; te[6] *= y; te[10] *= z;
    te[3] *= x; te[7] *= y; te[11] *= z;

    return this;
  }

  public setPosition(v: Vector3): Matrix4 {
    let te = this.elements;

    te[12] = v.x;
    te[13] = v.y;
    te[14] = v.z;

    return this;
  }

  public lookAt(eye: Vector3, target: Vector3, up: Vector3) {
    let x = new Vector3();
    let y = new Vector3();
    let z = new Vector3();

    let te = this.elements;

    z.subVectors(eye, target).normalize();

    if (z.lengthSq() === 0) {

      z.z = 1;

    }

    x.crossVectors(up, z).normalize();

    if (x.lengthSq() === 0) {

      z.z += 0.0001;
      x.crossVectors(up, z).normalize();

    }

    y.crossVectors(z, x);


    te[0] = x.x; te[4] = y.x; te[8] = z.x;
    te[1] = x.y; te[5] = y.y; te[9] = z.y;
    te[2] = x.z; te[6] = y.z; te[10] = z.z;

    return this;
  }

  public applyToBufferAttribute(attribute) {
    let v1 = new Vector3();
    for (let i = 0, l = attribute.count; i < l; i++) {

      v1.x = attribute.getX(i);
      v1.y = attribute.getY(i);
      v1.z = attribute.getZ(i);

      v1.applyMatrix4(this);

      attribute.setXYZ(i, v1.x, v1.y, v1.z);

    }

    return attribute;
  }

  public extractRotation(m: Matrix4): Matrix4 {
    let v1 = new Vector3();
    let te = this.elements;
    let me = m.elements;

    let scaleX = 1 / v1.setFromMatrixColumn(m, 0).length();
    let scaleY = 1 / v1.setFromMatrixColumn(m, 1).length();
    let scaleZ = 1 / v1.setFromMatrixColumn(m, 2).length();

    te[0] = me[0] * scaleX;
    te[1] = me[1] * scaleX;
    te[2] = me[2] * scaleX;

    te[4] = me[4] * scaleY;
    te[5] = me[5] * scaleY;
    te[6] = me[6] * scaleY;

    te[8] = me[8] * scaleZ;
    te[9] = me[9] * scaleZ;
    te[10] = me[10] * scaleZ;

    return this;
  }

  public toArray(array: Array<number> = [], offset: number = 0): Array<number> {
    let te = this.elements;

    array[offset] = te[0];
    array[offset + 1] = te[1];
    array[offset + 2] = te[2];
    array[offset + 3] = te[3];

    array[offset + 4] = te[4];
    array[offset + 5] = te[5];
    array[offset + 6] = te[6];
    array[offset + 7] = te[7];

    array[offset + 8] = te[8];
    array[offset + 9] = te[9];
    array[offset + 10] = te[10];
    array[offset + 11] = te[11];

    array[offset + 12] = te[12];
    array[offset + 13] = te[13];
    array[offset + 14] = te[14];
    array[offset + 15] = te[15];

    return array;
  }
}
