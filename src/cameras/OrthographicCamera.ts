import { Object3D } from '../core/Object3D';
import { Camera } from './Camera';

interface ViewingFrustum {
  fullWidth: number;
  fullHeight: number;
  offsetX: number;
  offsetY: number;
  width: number;
  height: number;
}

export class OrthographicCamera extends Camera {

  public left: number;
  public right: number;
  public top: number;
  public bottom: number;
  public near: number;
  public far: number;

  public zoom: number;

  public isOrthographicCamera: boolean = true;

  public view: ViewingFrustum;

  constructor(
    left: number, right: number,
    top: number, bottom: number,
    near: number = 0.1, far: number = 2000
  ) {
    super();

    this.type = 'OrthographicCamera';

    this.zoom = 1;
    this.view = null;

    this.left = left;
    this.right = right;
    this.top = top;
    this.bottom = bottom;
    this.near = near;
    this.far = far;

    this.updateProjectionMatrix();
  }

  public setViewOffset(
    fullWidth: number, fullHeight: number,
    x: number, y: number,
    width: number, height: number
  ): void {
    this.view = {
      fullWidth: fullWidth,
      fullHeight: fullHeight,
      offsetX: x,
      offsetY: y,
      width: width,
      height: height
    };

    this.updateProjectionMatrix();
  }

  public clearViewOffset(): void {
    this.view = null;
    this.updateProjectionMatrix();
  }

  public updateProjectionMatrix(): void {
    let dx = (this.right - this.left) / (2 * this.zoom);
    let dy = (this.top - this.bottom) / (2 * this.zoom);
    let cx = (this.right + this.left) / 2;
    let cy = (this.top + this.bottom) / 2;

    let left = cx - dx;
    let right = cx + dx;
    let top = cy + dy;
    let bottom = cy - dy;

    if (this.view !== null) {

      let zoomW = this.zoom / (this.view.width / this.view.fullWidth);
      let zoomH = this.zoom / (this.view.height / this.view.fullHeight);
      let scaleW = (this.right - this.left) / this.view.width;
      let scaleH = (this.top - this.bottom) / this.view.height;

      left += scaleW * (this.view.offsetX / zoomW);
      right = left + scaleW * (this.view.width / zoomW);
      top -= scaleH * (this.view.offsetY / zoomH);
      bottom = top - scaleH * (this.view.height / zoomH);

    }

    this.projectionMatrix.makeOrthographic(left, right, top, bottom, this.near, this.far);
  }

  public copy(source): OrthographicCamera {
    super.copy(source);

    this.left = source.left;
    this.right = source.right;
    this.top = source.top;
    this.bottom = source.bottom;
    this.near = source.near;
    this.far = source.far;

    this.zoom = source.zoom;
    this.view = source.view === null ? null : Object.assign({}, source.view);

    return this;
  }

}
