import { Camera } from './Camera';
import { Object3D } from '../core/Object3D';
import { MathTool } from '../math/MathTool';

export class PerspectiveCamera extends Camera {

  public fov: number;
  public zoom: number;

  public near: number;
  public far: number;
  public focus: number;

  public aspect: number;
  public view;

  public filmGauge: number;
  public filmOffset: number;

  public isPerspectiveCamera: boolean = true;

  constructor(
    fov: number = 5,
    aspect: number = 1,
    near: number = 0.1,
    far: number = 2000
  ) {
    super();

    this.type = 'PerspectiveCamera';
    this.fov = fov;
    this.zoom = 1;

    this.near = near;
    this.far = far;
    this.focus = 10;

    this.aspect = aspect;
    this.view = null;

    this.filmGauge = 35;
    this.filmOffset = 0;

    this.updateProjectionMatrix();
  }

  public copy(source: PerspectiveCamera): PerspectiveCamera {
    super.copy(<Camera>source);

    this.fov = source.fov;
    this.zoom = source.zoom;

    this.near = source.near;
    this.far = source.far;
    this.focus = source.focus;

    this.aspect = source.aspect;
    this.view = source.view === null ? null : Object.assign({}, source.view);

    this.filmGauge = source.filmGauge;
    this.filmOffset = source.filmOffset;

    return this;
  }

  public updateProjectionMatrix(): void {
    let near = this.near;
    let top = near * Math.tan(
        MathTool.DEG2RAD * 0.5 * this.fov) / this.zoom;
    let height = 2 * top;
    let width = this.aspect * height;
    let left = - 0.5 * width;
    let view = this.view;

    if (view !== null) {

      let fullWidth = view.fullWidth;
      let fullHeight = view.fullHeight;

      left += view.offsetX * width / fullWidth;
      top -= view.offsetY * height / fullHeight;
      width *= view.width / fullWidth;
      height *= view.height / fullHeight;

    }

    var skew = this.filmOffset;
    if (skew !== 0) {
      left += near * skew / this.getFilmWidth();
    }

    this.projectionMatrix.makePerspective(
      left, left + width,
      top, top - height,
      near, this.far
    );
  }

  public setFocalLength(focalLength) {
    // see http://www.bobatkins.com/photography/technical/field_of_view.html
    let vExtentSlope = 0.5 * this.getFilmHeight() / focalLength;

    this.fov = MathTool.RAD2DEG * 2 * Math.atan(vExtentSlope);
    this.updateProjectionMatrix();
  }

  public setViewOffset(
    fullWidth: number, fullHeight: number,
    x: number, y: number,
    width: number, height: number
  ): void {
    this.aspect = fullWidth / fullHeight;

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

  public getFocalLength(): number {
    let vExtentSlope = Math.tan(MathTool.DEG2RAD * 0.5 * this.fov);

    return 0.5 * this.getFilmHeight() / vExtentSlope;
  }

  public getFilmWidth(): number {
    return this.filmGauge * Math.min( this.aspect, 1 );
  }

  public getFilmHeight(): number {
    return this.filmGauge / Math.max( this.aspect, 1 );
  }

  public clearViewOffset(): void {
    this.view = null;
    this.updateProjectionMatrix();
  }

}
