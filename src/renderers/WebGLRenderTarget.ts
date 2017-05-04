import { EventDispatcher } from '../core/EventDispatcher';
import { Texture } from '../textures/Texture';
import { LinearFilter } from '../Constants';
import { Vector4 } from '../math/Vector4';
import { MathTool } from '../math/MathTool';

export class WebGLRenderTarget extends EventDispatcher {

  public uuid: string;
  public width: number;
  public height: number;

  public scissor: Vector4;
  public scissorTest: boolean;

  public viewport: Vector4;

  public texture: Texture;

  public depthBuffer: boolean;
  public stencilBuffer: boolean;

  public depthTexture;

  public isWebGLRenderTarget: boolean;

  constructor(width: number, height: number, options?) {
    super();

    this.uuid = MathTool.generateUUID();

    this.width = width;
    this.height = height;

    this.scissor = new Vector4(0, 0, width, height);
    this.scissorTest = false;

    this.viewport = new Vector4(0, 0, width, height);

    options = options || {};

    if (options.minFilter === undefined) {
      options.minFilter = LinearFilter;
    }

    this.texture = new Texture(undefined, undefined, options.wrapS, options.wrapT, options.magFilter, options.minFilter, options.format, options.type, options.anisotropy, options.encoding);

    this.depthBuffer = options.depthBuffer !== undefined ? options.depthBuffer : true;
    this.stencilBuffer = options.stencilBuffer !== undefined ? options.stencilBuffer : true;
    this.depthTexture = options.depthTexture !== undefined ? options.depthTexture : null;
  }

  public setSize(width: number, height: number) {
    if (this.width !== width || this.height !== height) {
      this.width = width;
      this.height = height;

      this.dispose();
    }
    this.viewport.set(0, 0, width, height);
    this.scissor.set(0, 0, width, height);
  }

  public clone() {
    return new WebGLRenderTarget(this.width, this.height).copy(this);
  }

  public copy(source: WebGLRenderTarget) {
    this.width = source.width;
    this.height = source.height;

    this.viewport.copy(source.viewport);

    this.texture = source.texture.clone();

    this.depthBuffer = source.depthBuffer;
    this.stencilBuffer = source.stencilBuffer;
    this.depthTexture = source.depthTexture;

    return this;
  }

  public dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }
}
