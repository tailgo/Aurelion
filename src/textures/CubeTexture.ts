import { Texture } from './Texture';
import { CubeReflectionMapping } from '../Constants';

export class CubeTexture extends Texture {

  public isCubeTexture: boolean = true;

  constructor(
    images: Array<HTMLImageElement> = [],
    mapping: number = CubeReflectionMapping,
    wrapS, wrapT,
    magFilter, minFilter, format, type, anisotropy, encoding
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
