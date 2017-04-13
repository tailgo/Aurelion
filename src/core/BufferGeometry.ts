import { Vector3 } from '../math/Vector3';
import { Box3 } from '../math/Box3';
import { EventDispatcher } from './EventDispatcher';
import { BufferAttribute, Float32BufferAttribute, Uint16BufferAttribute, Uint32BufferAttribute } from './BufferAttribute';
import { Sphere } from '../math/Sphere';
import { DirectGeometry } from './DirectGeometry';
import { Object3D } from './Object3D';
import { Matrix4 } from '../math/Matrix4';
import { Matrix3 } from '../math/Matrix3';
import { MathTool } from '../math/MathTool';
import { arrayMax } from '../utils';
import { GeometryIdCount } from './Geometry';

export class BufferGeometry {

  public readonly id: number;
  public uuid: string;
  public name: string;
  public type: string;

  public index;
  public attributes;

  public morphAttributes;
  public groups;

  public boundingBox;
  public boundingSphere;

  public drawRange;

}
