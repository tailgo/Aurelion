import { EventDispatcher } from '../core/EventDispatcher';
import { UVMapping, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping,
   LinearEncoding, UnsignedByteType, RGBAFormat, LinearMipMapLinearFilter,
   LinearFilter } from '../Constants';
import { MathTool } from '../math/MathTool';
import { Vector2 } from '../math/Vector2';

let textureId = 0;

export class Texture extends EventDispatcher {

  public static DEFAULT_IMAGE = undefined;
  public static DEFAULT_MAPPING: number = UVMapping;

  public isTexture: boolean = true;

  public readonly id: number;

  public uuid: string;
  public name: string;

  public image: HTMLImageElement | Array<HTMLImageElement>;
  public mipmaps;

  public mapping: number;

  public wrapS: number;
  public wrapT: number;

  public magFilter: number;
  public minFilter: number;

  public anisotropy: number;

  public format: number;
  public type: number;

  public offset: Vector2;
  public repeat: Vector2;

  public generateMipmaps: boolean;
  public premultiplyAlpha: boolean;
  public flipY: boolean;
  public unpackAlignment: number;

  public encoding: number;

  public version: number;

  public onUpdate: Function;
  public needsUpdate: boolean;

  constructor(
    image: HTMLImageElement | Array<HTMLImageElement> = Texture.DEFAULT_IMAGE,
    mapping: number = Texture.DEFAULT_MAPPING,
    wrapS: number = ClampToEdgeWrapping, wrapT: number = ClampToEdgeWrapping,
    magFilter: number = LinearFilter,
    minFilter: number = LinearMipMapLinearFilter,
    format: number = RGBAFormat, type: number = UnsignedByteType,
    anisotropy: number = 1, encoding: number = LinearEncoding) {
    super();

    this.id = textureId++;
    this.uuid = MathTool.generateUUID();
    this.name = '';

    this.image = image;
    this.mipmaps = [];

    this.wrapS = wrapS;
    this.wrapT = wrapT;

    this.magFilter = magFilter;
    this.minFilter = minFilter;

    this.anisotropy = anisotropy;

    this.format = format;
    this.type = UnsignedByteType;

    this.offset = new Vector2(0, 0);
    this.repeat = new Vector2(1, 1);

    this.generateMipmaps = true;
    this.premultiplyAlpha = false;
    this.flipY = true;
    this.unpackAlignment = 4;

    this.encoding = encoding;

    this.version = 0;
    this.onUpdate = null;
  }

  public clone(): Texture {
    return (new Texture()).copy(this);
  }

  public copy(source: Texture): Texture {
    this.image = source.image;
    this.mipmaps = source.mipmaps.slice(0);

    this.mapping = source.mapping;

    this.wrapS = source.wrapS;
    this.wrapT = source.wrapT;

    this.magFilter = source.magFilter;
    this.minFilter = source.minFilter;

    this.anisotropy = source.anisotropy;

    this.format = source.format;
    this.type = source.type;

    this.offset.copy(source.offset);
    this.repeat.copy(source.repeat);

    this.generateMipmaps = source.generateMipmaps;
    this.premultiplyAlpha = source.premultiplyAlpha;
    this.flipY = source.flipY;
    this.unpackAlignment = source.unpackAlignment;
    this.encoding = source.encoding;

    return this;
  }

  public dispose() {
    this.dispatchEvent({ type: 'dispose' });
  }

  public transformUv(uv: Vector2): void {
    if (this.mapping !== UVMapping) return;

    uv.multiply(this.repeat);
    uv.add(this.offset);

    if (uv.x < 0 || uv.x > 1) {

      switch (this.wrapS) {

        case RepeatWrapping:

          uv.x = uv.x - Math.floor(uv.x);
          break;

        case ClampToEdgeWrapping:

          uv.x = uv.x < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.x) % 2) === 1) {

            uv.x = Math.ceil(uv.x) - uv.x;

          } else {

            uv.x = uv.x - Math.floor(uv.x);

          }
          break;

      }

    }

    if (uv.y < 0 || uv.y > 1) {

      switch (this.wrapT) {

        case RepeatWrapping:

          uv.y = uv.y - Math.floor(uv.y);
          break;

        case ClampToEdgeWrapping:

          uv.y = uv.y < 0 ? 0 : 1;
          break;

        case MirroredRepeatWrapping:

          if (Math.abs(Math.floor(uv.y) % 2) === 1) {

            uv.y = Math.ceil(uv.y) - uv.y;

          } else {

            uv.y = uv.y - Math.floor(uv.y);

          }
          break;

      }

    }

    if (this.flipY) {

      uv.y = 1 - uv.y;

    }
  }

}
