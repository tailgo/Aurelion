import { Vector3 } from '../math/Vector3';
import { Ray } from '../math/Ray';
import { Object3D } from './Object3D';
import { Camera } from '../cameras/Camera';

interface Intersection {
  distance: number;
  point: Vector3;
  object: Object3D;
};

export class Raycaster {

  public near: number;
  public far: number;

  public linePrecision: number = 1;

  public params;

  public ray: Ray;

  constructor(
    origin: Vector3, direction: Vector3,
    near: number = 0, far: number = Infinity) {
    this.ray = new Ray(origin, direction);

    this.near = near;
    this.far = far;

    this.params = {
      Mesh: {},
      Line: {},
      LOD: {},
      Points: {
        threshold: 1
      },
      Sprite: {}
    };
  }

  public set(origin: Vector3, direction: Vector3) {
    this.ray.set(origin, direction);
  }

  public setFromCamera(coords: Vector3, camera) {
    if ((camera && camera.isPerspectiveCamera)) {
      this.ray.origin.setFromMatrixPosition(camera.matrixWorld);
      this.ray.direction
        .set(coords.x, coords.y, 0.5)
        .unproject(camera)
        .sub(this.ray.origin)
        .normalize();
    } else if ((camera && camera.isOrthographicCamera)) {
      let n = camera.near;
      let f = camera.far;

      this.ray.origin
        .set(coords.x, coords.y, (n + f) / (n - f))
        .unproject(camera); // set origin in plane of camera

      this.ray.direction.set(0, 0, - 1).transformDirection(camera.matrixWorld);
    }
  }

  public intersectObject(object, recursive) {
    let intersects = [];

    this._intersectObject(object, this, intersects, recursive);

    intersects.sort(this._ascSort);

    return intersects;
  }

  public intersectObjects(objects, recursive) {
    let intersects = [];
    if (Array.isArray(objects) === false) {
      console.warn('Raycaster.intersectObjects: objects is not an Array.');
      return intersects;
    }
    for (let i = 0, l = objects.length; i < l; i++) {
      this._intersectObject(objects[i], this, intersects, recursive);
    }

    intersects.sort(this._ascSort);
    return intersects;
  }

  private _ascSort(a: Intersection, b: Intersection) {
    return a.distance - b.distance;
  }

  private _intersectObject(object, raycaster: Raycaster, intersects: Array<Intersection>, recursive: boolean = false): void {
    if (object.visible === false) {
      return;
    }

    object.raycast(raycaster, intersects);

    if (recursive === true) {
      let children = object.children;
      for (let i = 0, l = children.length; i < l; ++i) {
        this._intersectObject(children[i], raycaster, intersects, true);
      }
    }
  }
}
