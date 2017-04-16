import { CubeTexture } from '../../textures/CubeTexture';
import { Texture } from '../../textures/Texture';

class UniformContainer {

}

export class WebGLUniforms {

  public renderer;

  constructor(gl, program, renderer) {

    this.renderer = renderer;

  }

  public setValue(gl, name, value) {

  }

  public set(gl, object, name) {

  }

  public setOptional(gl, object, name) {

  }

  public static upload(gl, seq, values, renderer) {

  }

  public static seqWithValue(seq, values) {

  }

}
