import { Texture } from './Texture';

export class CompressedTexture extends Texture {

  public isCompressedTexture: boolean = true;

  constructor(
    mipmaps?, width?, height?, format?, type?, mapping?,
    wrapS?, wrapT?, magFilter?, minFilter?, anisotropy?, encoding?
  ) {
    super(null, mapping, wrapS, wrapT, magFilter, minFilter, format, type, anisotropy, encoding);

    this.image = { width: width, height: height };
    this.mipmaps = mipmaps;

    this.flipY = false;

    this.generateMipmaps = false;

  }
}
