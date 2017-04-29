import { Layers } from './Layers';
import { EventDispatcher } from './EventDispatcher';
import { Vector3 } from '../math/Vector3';
import { Matrix3 } from '../math/Matrix3';
import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { Euler } from '../math/Euler';
import { MathTool } from '../math/MathTool';

let object3dId = 0;

export class Object3D extends EventDispatcher {

  public static DefaultUp: Vector3 = new Vector3(0, 1, 0);
  public static DefaultMatrixAutoUpdate: boolean = true;

  public castShadow: boolean;
  public receiveShadow: boolean;
  public frustumCulled: boolean;
  public visible: boolean;

  public parent;
  public children;

  public layers: Layers;

  public readonly uuid: string;
  public readonly id: number;
  public name: string;
  public type: string;
  public renderOrder: number;
  public isObject3D: boolean;

  public isObject: boolean;

  public matrix: Matrix4;
  public matrixWorld: Matrix4;
  public matrixAutoUpdate: boolean;
  public matrixWorldNeedsUpdate: boolean;

  public modelViewMatrix: Matrix4;

  public normalMatrix: Matrix3;

  public position: Vector3;
  public quaternion: Quaternion;
  public rotation: Euler;
  public scale: Vector3;
  public up: Vector3;

  public userData: Object;

  public onBeforeRender: Function;
  public onAfterRender: Function;

  constructor() {
    super();
    this.id = ++object3dId;
    this.uuid = MathTool.generateUUID();

    this.name = '';
    this.type = 'Object3D';
    this.isObject3D = true;

    this.parent = null;
    this.children = [];

    this.up = Object3D.DefaultUp.clone();

    this.position = new Vector3();

    this.rotation = new Euler();
    this.quaternion = new Quaternion();
    this.rotation.onChange(() => {
      this.quaternion.setFromEuler(this.rotation, false);
    });
    this.quaternion.onChange(() => {
      this.rotation.setFromQuaternion(this.quaternion, undefined, false);
    });

    this.scale = new Vector3(1, 1, 1);

    this.modelViewMatrix = new Matrix4();
    this.normalMatrix = new Matrix3();

    this.matrix = new Matrix4();
    this.matrixWorld = new Matrix4();

    this.matrixAutoUpdate = Object3D.DefaultMatrixAutoUpdate;
    this.matrixWorldNeedsUpdate = false;

    this.layers = new Layers();
    this.visible = true;

    this.castShadow = false;
    this.receiveShadow = false;

    this.frustumCulled = true;
    this.renderOrder = 0;
    this.userData = {};

    this.onBeforeRender = () => {};
    this.onAfterRender = () => {};
  }

  public add(...objects: Array<Object3D>): Object3D {
    if (objects.length > 1) {
      for (let i = 0; i < objects.length; ++i) {
        this.add(objects[i]);
      }

      return this;
    }

    let object = objects[0];

    if (object === this) {
      console.error('Object3D.add: object can\'t be added as a child of itself.', object);
      return this;
    }

    if (object && object.isObject3D) {
      if (object.parent !== null) {
        object.parent.remove(object);
      }

      object.parent = this;
      object.dispatchEvent({
        type: 'add'
      });

      this.children.push(object);
    } else {
      console.error('Object3D.add: object not an instance of Object3D.', object);
    }

    return this;

  }

  public clone(recursive: boolean = true): Object3D {
    return (new Object3D()).copy(this, recursive);
  }

  public copy(source: Object3D, recursive: boolean = true): Object3D {
    this.name = source.name;

    this.up.copy(source.up);

    this.position.copy(source.position);
    this.quaternion.copy(source.quaternion);
    this.scale.copy(source.scale);

    this.matrix.copy(source.matrix);
    this.matrixWorld.copy(source.matrixWorld);

    this.matrixAutoUpdate = source.matrixAutoUpdate;
    this.matrixWorldNeedsUpdate = source.matrixWorldNeedsUpdate;

    this.layers.mask = source.layers.mask;
    this.visible = source.visible;

    this.castShadow = source.castShadow;
    this.receiveShadow = source.receiveShadow;

    this.frustumCulled = source.frustumCulled;
    this.renderOrder = source.renderOrder;

    this.userData = JSON.parse(JSON.stringify(source.userData));

    if (recursive === true) {

      for (let i = 0; i < source.children.length; i++) {

        let child = source.children[i];
        this.add(child.clone());

      }

    }

    return this;
  }

  public getObjectById(id: number): Object3D | undefined {
    return this.getObjectByProperty('id', id);
  }

  public getObjectByName(name: string): Object3D | undefined {
    return this.getObjectByProperty('name', name);
  }

  public getObjectByProperty(name: string, value): Object3D | undefined {
    if (this[name] === value) {
      return this;
    }

    for (let i = 0, l = this.children.length; i < l; ++i) {
      let child = this.children[i];
      let object = child.getObjectByProperty(name, value);
      if (object !== undefined) {
        return object;
      }
    }

    return undefined;
  }

  public getWorldPosition(optionalTarget: Vector3 = new Vector3()): Vector3 {
    let result = optionalTarget;

    this.updateMatrixWorld(true);

    return result.setFromMatrixPosition(this.matrixWorld);
  }

  public getWorldQuaternion(q: Quaternion = new Quaternion()): Quaternion {
    let position = new Vector3();
    let scale = new Vector3();

    let result = q;
    this.updateMatrixWorld(true);
    this.matrixWorld.decompose(position, result, scale);
    return result;
  }

  public getWorldRotation(optionalTarget: Euler = new Euler()): Euler {
    let quaternion = new Quaternion();
    let result = optionalTarget;
    this.getWorldQuaternion(quaternion);
    return result.setFromQuaternion(quaternion, this.rotation.order, false);
  }

  public getWorldScale(optionalTarget: Vector3 = new Vector3()): Vector3 {
    let position = new Vector3();
    let quaternion = new Quaternion();

    let result = optionalTarget;
    this.updateMatrixWorld(true);
    this.matrixWorld.decompose(position, quaternion, result);
    return result;
  }

  public getWordDirection(optionalTarget: Vector3 = new Vector3()): Vector3 {
    let q = new Quaternion();
    let result = optionalTarget;
    this.getWorldQuaternion(q);
    return result.set(0, 0, 1).applyQuaternion(q);
  }

  public localToWorld(vector: Vector3): Vector3 {
    return vector.applyMatrix4(this.matrixWorld);
  }

  public lookAt(vector: Vector3): void {
    let m = new Matrix4();
    m.lookAt(vector, this.position, this.up);
    this.quaternion.setFromRotationMatrix(m);
  }

  public remove(...objects: Array<Object3D>) {
    if (objects.length > 1) {
      for (let i = 0; i < objects.length; ++i) {
        this.remove(objects[i]);
      }
    }

    let object = objects[0];

    let index = this.children.indexOf(object);
    if (index !== -1) {
      object.parent = null;
      object.dispatchEvent({
        type: 'removed'
      });
      this.children.splice(index, 1);
    }
  }

  public rotateOnAxis(axis: Vector3, angle: number): Object3D {
    let q = new Quaternion();
    q.setFromAxisAngle(axis, angle);
    this.quaternion.multiply(q);

    return this;
  }

  public rotateX(rad: number): Object3D {
    let v = new Vector3(1, 0, 0);
    return this.rotateOnAxis(v, rad);
  }

  public rotateY(rad: number): Object3D {
    let v = new Vector3(0, 1, 0);
    return this.rotateOnAxis(v, rad);
  }

  public rotateZ(rad: number): Object3D {
    let v = new Vector3(0, 0, 1);
    return this.rotateOnAxis(v, rad);
  }

  public translateOnAxis(axis: Vector3, distance: number): Object3D {
    let v = new Vector3();
    v.copy(axis).applyQuaternion(this.quaternion);
    this.position.add(v.multiplyScalar(distance));
    return this;
  }

  public translateX(distance: number): Object3D {
    let v = new Vector3(1, 0, 0);
    return this.translateOnAxis(v, distance);
  }

  public translateY(distance: number): Object3D {
    let v = new Vector3(0, 1, 0);
    return this.translateOnAxis(v, distance);
  }

  public translateZ(distance: number): Object3D {
    let v = new Vector3(0, 0, 1);
    return this.translateOnAxis(v, distance);
  }

  public updateMatrix(): void {
    this.matrix.compose(this.position, this.quaternion, this.scale);
    this.matrixWorldNeedsUpdate = true;
  }

  public updateMatrixWorld(force: boolean): void {
    if (this.matrixAutoUpdate === true) {
      this.updateMatrix();
    }

    if (this.matrixWorldNeedsUpdate === true || force === true) {
      if (this.parent === null) {
        this.matrixWorld.copy(this.matrix);
      } else {
        this.matrixWorld.multiplyMatrix(this.parent.matrixWorld, this.matrix);
      }

      this.matrixWorldNeedsUpdate = false;
      force = true;
    }

    let child = this.children;
    for (let i = 0, l = child.length; i < l; ++i) {
      child[i].updateMatrixWorld(force);
    }
  }

  public worldToLocal(vector: Vector3): Vector3 {
    let m = new Matrix4();
    return vector.applyMatrix4(m.getInverse(this.matrixWorld));
  }

}
