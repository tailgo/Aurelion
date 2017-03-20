import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { Object3D } from '../core/Object3D';
import { Vector3 } from '../math/Vector3';

export class Camera extends Object3D {

  public matrixWorldInverse: Matrix4;
  public projectionMatrix: Matrix4;

  public isCamera: boolean;

  constructor() {
    super();
    this.type = 'Camera';
    this.isCamera = true;
    this.matrixWorldInverse = new Matrix4();
    this.projectionMatrix = new Matrix4();
  }

  public getWorldDirection(optionalTarget: Vector3): Vector3 {
    let q = new Quaternion();
    let result = optionalTarget || new Vector3();
    this.getWorldQuaternion(q);
    return result.set(0, 0, -1).applyQuaternion(q);
  }

  public lookAt(vector: Vector3): void {
    let m = new Matrix4();
    m.lookAt(this.position, vector, this.up);
    this.quaternion.setFromRotationMatrix(m);
  }

  public clone(): Camera {
    return (new Camera()).copy(this);
  }

  public copy(source: Camera): Camera {
    super.copy(<Object3D>source);

    this.matrixWorldInverse.copy(source.matrixWorldInverse);
    this.projectionMatrix.copy(source.projectionMatrix);

    return this;
  }

}
