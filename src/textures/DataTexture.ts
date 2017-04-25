import { Texture } from './Texture';
import { NearestFilter } from '../Constants';
import {
  UVMapping, MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping,
  LinearEncoding, UnsignedByteType, RGBAFormat, LinearMipMapLinearFilter,
  LinearFilter
} from '../Constants';

export class DataTexture extends Texture {

  public image;
  public isDataTexture: boolean = true;

  constructor(
    data,
    width: number, height: number,
    format: number = RGBAFormat, type: number = UnsignedByteType,
    mapping: number = Texture.DEFAULT_MAPPING,
    wrapS: number = ClampToEdgeWrapping, wrapT: number = ClampToEdgeWrapping,
    magFilter: number = NearestFilter,
    minFilter: number = NearestFilter,
    anisotropy: number = 1, encoding: number = LinearEncoding
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

    this.image = { data: data, width: width, height: height };

    this.magFilter = magFilter;
    this.minFilter = minFilter;

    this.generateMipmaps = false;
    this.flipY = false;
    this.unpackAlignment = 1;
  }

}
