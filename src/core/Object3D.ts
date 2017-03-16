import { Layers } from './Layers';
import { EventDispatcher } from './EventDispatcher';
import { Vector3 } from '../math/Vector3';
import { Matrix3 } from '../math/Matrix3';
import { Matrix4 } from '../math/Matrix4';
import { Quaternion } from '../math/Quaternion';
import { Euler } from '../math/Euler';
import { MathTool } from '../math/MathTool';

let object3dId = 0;

export class Object3D {

  public static DefaultUp: Vector3 = new Vector3(0, 1, 0);
  public static DefaultMatrixAutoUpdate: boolean = true;

  public castShadow: boolean;
  public receiveShadow: boolean;
  public frustumCulled: boolean;
  public visible: boolean;

  public parent: Object3D;
  public children: Array<Object3D>;

  public layers: Layers;

  public readonly uuid: string;
  public readonly id: number;
  public name: string;
  public renderOrder: number;

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

  }

  public add(object: Object3D) {

  }

  public clone(recursive: boolean = true) {

  }

  public copy(object: Object3D, recursive: boolean = true) {

  }

  public getObjectById(id: number) {

  }

  public getObjectByName(name: string) {

  }

  public getWorldPosition(optionalTarget: Vector3) {

  }

  public getWorldQuaternion(optionalTarget: Quaternion) {

  }

  public getWorldScale(optionalTarget: Vector3) {

  }

  public getWordDirection(optionalTarget: Vector3) {

  }

  public localToWorld(vector: Vector3) {

  }

  public lookAt(vector: Vector3) {

  }

  public remove(object: Object3D) {

  }

  public rotateOnAxis(axis: Vector3, angle: number) {

  }

  public rotateX(rad: number) {

  }

  public rotateY(rad: number) {

  }

  public rotateZ(rad: number) {

  }

  public translateX(distance: number) {

  }

  public translateY(distance: number) {

  }

  public translateZ(distance: number) {

  }

  public worldToLocal(vector: Vector3) {

  }

}
