import { Vector2 } from '../math/Vector2';
import { Matrix4 } from '../math/Matrix4';

export class LightShadow {

  public camera;

  public bias: number;
  public radius: number;

  public mapSize: Vector2;

  public map;
  public matrix: Matrix4;

  constructor(camera?) {
    this.camera = camera;

    this.bias = 0;
    this.radius = 1;

    this.mapSize = new Vector2(512, 512);

    this.map = null;
    this.matrix = new Matrix4();
  }

  public copy(source) {
    this.camera = source.camera.clone();

    this.bias = source.bias;
    this.radius = source.radius;

    this.mapSize.copy(source.mapSize);

    return this;
  }

  public clone() {
    return new LightShadow().copy(this);
  }

}
