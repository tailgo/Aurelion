export class Renderer {

  private _canvas: HTMLCanvasElement;
  private _context: WebGLRenderingContext;

  constructor() {
    // this._canvas = <HTMLCanvasElement>document.getElementById('canvas');
    this._canvas = <HTMLCanvasElement>document.createElement('canvas');
    let width: number = window.innerWidth;
    let height: number = window.innerHeight;
    this._canvas.width = width;
    this._canvas.height = height;
    document.body.appendChild(this._canvas);
  }
}
