import { Texture } from './Texture';
import { CubeReflectionMapping } from '../Constants';
import {
  UVMapping, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping,
  LinearEncoding, UnsignedByteType, RGBAFormat, LinearMipMapLinearFilter,
  LinearFilter
} from '../Constants';

export class CubeTexture extends Texture {

  public isCubeTexture: boolean = true;

  constructor(
    images: Array<HTMLImageElement> = [],
    mapping: number = CubeReflectionMapping,
    wrapS: number = ClampToEdgeWrapping, wrapT: number = ClampToEdgeWrapping,
    magFilter: number = LinearFilter,
    minFilter: number = LinearMipMapLinearFilter,
    format: number = RGBAFormat, type: number = UnsignedByteType,
    anisotropy: number = 1, encoding: number = LinearEncoding
  ) {
    super(
      images, mapping, wrapS, wrapT, magFilter, minFilter,
      format, type, anisotropy, encoding
    );

    this.flipY = false;
  }

  get images() {
    return <Array<HTMLImageElement> >this.image;
  }

  set images(v: Array<HTMLImageElement>) {
    this.image = v;
  }

}
