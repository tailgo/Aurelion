import { LinearFilter, NearestFilter } from '../../Constants';
import {
  NearestMipMapLinearFilter, NearestMipMapNearestFilter
} from '../../constants';
import {
  RGBFormat, RGBAFormat, DepthFormat, DepthStencilFormat
} from '../../Constants';
import {
  UnsignedShortType, UnsignedIntType, UnsignedInt248Type, FloatType,
  HalfFloatType, ClampToEdgeWrapping
} from '../../Constants';
import { MathTool } from '../../math/MathTool';

function clampToMaxSize(image, maxSize) {

  if (image.width > maxSize || image.height > maxSize) {
    // Warning: Scaling through the canvas will only work with images that use
    // premultiplied alpha.
    let scale = maxSize / Math.max(image.width, image.height);

    let canvas = <HTMLCanvasElement>document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = Math.floor(image.width * scale);
    canvas.height = Math.floor(image.height * scale);

    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);

    console.warn('WebGLRenderer: image is too big (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

    return canvas;
  }
  return image;
}

function isPowerOfTwo(image) {
  return MathTool.isPowerOfTwo(image.width)
    && MathTool.isPowerOfTwo(image.height);
}

function makePowerOfTwo(image) {

  if (image instanceof HTMLImageElement || image instanceof HTMLCanvasElement) {
    let canvas = <HTMLCanvasElement>document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');
    canvas.width = MathTool.nearestPowerOfTwo(image.width);
    canvas.height = MathTool.nearestPowerOfTwo(image.height);

    let context = canvas.getContext('2d');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    console.warn('THREE.WebGLRenderer: image is not power of two (' + image.width + 'x' + image.height + '). Resized to ' + canvas.width + 'x' + canvas.height, image);

    return canvas;
  }
  return image;
}

function textureNeedsPowerOfTwo(texture) {
  return (texture.wrapS !== ClampToEdgeWrapping
    || texture.wrapT !== ClampToEdgeWrapping)
    || (texture.minFilter !== NearestFilter
      && texture.minFilter !== LinearFilter);
}

export class WebGLTextures {

  private gl;
  private extensions;
  private state;
  private properties;
  private capabilities;
  private paramThreeToGL;
  private infoMemory;

  private _gl;

  constructor(
    gl, extensions, state, properties, capabilities, paramThreeToGL, info
  ) {
    this.gl = gl;
    this._gl = gl;
    this.extensions = extensions;
    this.state = state;
    this.properties = properties;
    this.capabilities = capabilities;
    this.paramThreeToGL = paramThreeToGL;
    this.infoMemory = info.memory;
  }

  public setTexture2D(texture, slot) {
    let textureProperties = this.properties.get(texture);

    if (texture.version > 0 && textureProperties.__version !== texture.version) {
      let image = texture.image;

      if (image === undefined) {
        console.warn('WebGLRenderer: Texture marked for update but image is undefined', texture);
      } else if (image.complete === false) {
        console.warn('WebGLRenderer: Texture marked for update but image is incomplete', texture);
      } else {
        this.uploadTexture(textureProperties, texture, slot);
        return;
      }
    }
    this.state.activeTexture(this.gl.TEXTURE0 + slot);
    this.state.bindTexture(this.gl.TEXTURE_2D, textureProperties.__webglTexture);
  }

  public setTextureCube(texture, slot) {
    let textureProperties = this.properties.get(texture);

    if (texture.image.length === 6) {
      if (texture.version > 0 && textureProperties.__version !== texture.version) {
        if (!textureProperties.__image__webglTextureCube) {
          texture.addEventListener('dispose', (event) => {
            this.onTextureDispose(event);
          });
          textureProperties.__image__webglTextureCube = this.gl.createTexture();
          this.infoMemory.textures++;
        }

        this.state.activeTexture(this.gl.TEXTURE0 + slot);
        this.state.bindTexture(this.gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);

        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);

        let isCompressed = (texture && texture.isCompressedTexture);
        let isDataTexture = (texture.image[0] && texture.image[0].isDataTexture);

        let cubeImage = [];

        for (let i = 0; i < 6; i++) {
          if (!isCompressed && !isDataTexture) {
            cubeImage[i] = clampToMaxSize(texture.image[i], this.capabilities.maxCubemapSize);
          } else {
            cubeImage[i] = isDataTexture ? texture.image[i].image : texture.image[i];
          }
        }

        let image = cubeImage[0],
          isPowerOfTwoImage = isPowerOfTwo(image),
          glFormat = this.paramThreeToGL(texture.format),
          glType = this.paramThreeToGL(texture.type);

        this.setTextureParameters(this.gl.TEXTURE_CUBE_MAP, texture, isPowerOfTwoImage);

        for (let i = 0; i < 6; i++) {
          if (!isCompressed) {
            if (isDataTexture) {
              this.state.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, cubeImage[i].width, cubeImage[i].height, 0, glFormat, glType, cubeImage[i].data);
            } else {
              this.state.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, glFormat, glFormat, glType, cubeImage[i]);
            }
          } else {
            let mipmap, mipmaps = cubeImage[i].mipmaps;

            for (let j = 0, jl = mipmaps.length; j < jl; j++) {
              mipmap = mipmaps[j];
              if (texture.format !== RGBAFormat && texture.format !== RGBFormat) {
                if (this.state.getCompressedTextureFormats().indexOf(glFormat) > - 1) {
                  this.state.compressedTexImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
                } else {
                  console.warn('WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()');
                }
              } else {
                this.state.texImage2D(this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, j, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
              }
            }
          }
        }

        if (texture.generateMipmaps && isPowerOfTwoImage) {
          this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
        }

        textureProperties.__version = texture.version;

        if (texture.onUpdate) texture.onUpdate(texture);
      } else {
        this.state.activeTexture(this.gl.TEXTURE0 + slot);
        this.state.bindTexture(this.gl.TEXTURE_CUBE_MAP, textureProperties.__image__webglTextureCube);
      }
    }
  }

  public setTextureCubeDynamic(texture, slot) {
    this.state.activeTexture(this.gl.TEXTURE0 + slot);
    this.state.bindTexture(this.gl.TEXTURE_CUBE_MAP, this.properties.get(texture).__webglTexture);
  }

  public setupRenderTarget(renderTarget) {
    let renderTargetProperties = this.properties.get(renderTarget);
    let textureProperties = this.properties.get(renderTarget.texture);

    renderTarget.addEventListener('dispose', (event) => {
      this.onRenderTargetDispose(event);
    });

    textureProperties.__webglTexture = this.gl.createTexture();

    this.infoMemory.textures++;

    let isCube = (renderTarget.isWebGLRenderTargetCube === true);
    let isTargetPowerOfTwo = isPowerOfTwo(renderTarget);

    // Setup framebuffer
    if (isCube) {
      renderTargetProperties.__webglFramebuffer = [];
      for (let i = 0; i < 6; i++) {
        renderTargetProperties.__webglFramebuffer[i] = this.gl.createFramebuffer();
      }
    } else {
      renderTargetProperties.__webglFramebuffer = this.gl.createFramebuffer();
    }

    // Setup color buffer
    if (isCube) {
      this.state.bindTexture(this.gl.TEXTURE_CUBE_MAP, textureProperties.__webglTexture);
      this.setTextureParameters(this.gl.TEXTURE_CUBE_MAP, renderTarget.texture, isTargetPowerOfTwo);

      for (let i = 0; i < 6; i++) {
        this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer[i], renderTarget, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_CUBE_MAP_POSITIVE_X + i);
      }

      if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) {
        this.gl.generateMipmap(this.gl.TEXTURE_CUBE_MAP);
      }
      this.state.bindTexture(this.gl.TEXTURE_CUBE_MAP, null);
    } else {
      this.state.bindTexture(this.gl.TEXTURE_2D, textureProperties.__webglTexture);
      this.setTextureParameters(this.gl.TEXTURE_2D, renderTarget.texture, isTargetPowerOfTwo);
      this.setupFrameBufferTexture(renderTargetProperties.__webglFramebuffer, renderTarget, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D);

      if (renderTarget.texture.generateMipmaps && isTargetPowerOfTwo) this.gl.generateMipmap(this.gl.TEXTURE_2D);
      this.state.bindTexture(this.gl.TEXTURE_2D, null);
    }

    // Setup depth and stencil buffers
    if (renderTarget.depthBuffer) {
      this.setupDepthRenderbuffer(renderTarget);
    }
  }

  public updateRenderTargetMipmap(renderTarget) {
    let texture = renderTarget.texture;

    if (texture.generateMipmaps && isPowerOfTwo(renderTarget) &&
      texture.minFilter !== NearestFilter &&
      texture.minFilter !== LinearFilter) {

      let target = (renderTarget && renderTarget.isWebGLRenderTargetCube) ? this.gl.TEXTURE_CUBE_MAP : this.gl.TEXTURE_2D;
      let webglTexture = this.properties.get(texture).__webglTexture;

      this.state.bindTexture(target, webglTexture);
      this.gl.generateMipmap(target);
      this.state.bindTexture(target, null);
    }
  }

  // private methods
  private filterFallback(f) {
    if (f === NearestFilter || f === NearestMipMapNearestFilter
      || f === NearestMipMapLinearFilter) {
      return this.gl.NEAREST;
    }

    return this.gl.LINEAR;
  }

  private onTextureDispose(event) {
    let texture = event.target;
    let eventName = this.onTextureDispose;
    texture.removeEventListener('dispose', eventName);

    this.deallocateTexture(texture);

    this.infoMemory.textures--;
  }

  private onRenderTargetDispose(event) {
    let renderTarget = event.target;
    let eventName = this.onRenderTargetDispose;
    renderTarget.removeEventListener('dispose', eventName);

    this.deallocateRenderTarget(renderTarget);

    this.infoMemory.textures--;
  }

  private deallocateTexture(texture) {
    let textureProperties = this.properties.get(texture);

    if (texture.image && textureProperties.__image__webglTextureCube) {
      // cube texture
      this.gl.deleteTexture(textureProperties.__image__webglTextureCube);
    } else {
      // 2D texture
      if (textureProperties.__webglInit === undefined) return;
      this.gl.deleteTexture(textureProperties.__webglTexture);
    }
    // remove all webgl properties
    this.properties.delete(texture);
  }

  private deallocateRenderTarget(renderTarget) {
    let renderTargetProperties = this.properties.get(renderTarget);
    let textureProperties = this.properties.get(renderTarget.texture);

    if (!renderTarget) return;

    if (textureProperties.__webglTexture !== undefined) {
      this.gl.deleteTexture(textureProperties.__webglTexture);
    }

    if (renderTarget.depthTexture) {
      renderTarget.depthTexture.dispose();
    }

    if (renderTarget.isWebGLRenderTargetCube) {
      for (let i = 0; i < 6; i++) {
        this.gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer[i]);
        if (renderTargetProperties.__webglDepthbuffer) this.gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer[i]);
      }
    } else {
      this.gl.deleteFramebuffer(renderTargetProperties.__webglFramebuffer);
      if (renderTargetProperties.__webglDepthbuffer) this.gl.deleteRenderbuffer(renderTargetProperties.__webglDepthbuffer);
    }

    this.properties.delete(renderTarget.texture);
    this.properties.delete(renderTarget);
  }

  //
  private setTextureParameters(textureType, texture, isPowerOfTwoImage) {
    let extension;

    if (isPowerOfTwoImage) {
      this.gl.texParameteri(textureType, this.gl.TEXTURE_WRAP_S, this.paramThreeToGL(texture.wrapS));
      this.gl.texParameteri(textureType, this.gl.TEXTURE_WRAP_T, this.paramThreeToGL(texture.wrapT));

      this.gl.texParameteri(textureType, this.gl.TEXTURE_MAG_FILTER, this.paramThreeToGL(texture.magFilter));
      this.gl.texParameteri(textureType, this.gl.TEXTURE_MIN_FILTER, this.paramThreeToGL(texture.minFilter));
    } else {
      this.gl.texParameteri(textureType, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(textureType, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

      if (texture.wrapS !== ClampToEdgeWrapping || texture.wrapT !== ClampToEdgeWrapping) {
        console.warn('WebGLRenderer: Texture is not power of two. Texture.wrapS and Texture.wrapT should be set to ClampToEdgeWrapping.', texture);
      }

      this.gl.texParameteri(textureType, this.gl.TEXTURE_MAG_FILTER, this.filterFallback(texture.magFilter));
      this.gl.texParameteri(textureType, this.gl.TEXTURE_MIN_FILTER, this.filterFallback(texture.minFilter));

      if (texture.minFilter !== NearestFilter && texture.minFilter !== LinearFilter) {
        console.warn('WebGLRenderer: Texture is not power of two. Texture.minFilter should be set to NearestFilter or LinearFilter.', texture);
      }
    }

    extension = this.extensions.get('EXT_texture_filter_anisotropic');

    if (extension) {
      if (texture.type === FloatType && this.extensions.get('OES_texture_float_linear') === null) return;
      if (texture.type === HalfFloatType && this.extensions.get('OES_texture_half_float_linear') === null) return;

      if (texture.anisotropy > 1 || this.properties.get(texture).__currentAnisotropy) {
        this.gl.texParameterf(textureType, extension.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(texture.anisotropy, this.capabilities.getMaxAnisotropy()));
        this.properties.get(texture).__currentAnisotropy = texture.anisotropy;
      }

    }
  }

  private uploadTexture(textureProperties, texture, slot) {
    if (textureProperties.__webglInit === undefined) {
      textureProperties.__webglInit = true;

      texture.addEventListener('dispose', (event) => {
        this.onTextureDispose(event);
      });

      textureProperties.__webglTexture = this.gl.createTexture();

      this.infoMemory.textures++;
    }

    this.state.activeTexture(this.gl.TEXTURE0 + slot);
    this.state.bindTexture(this.gl.TEXTURE_2D, textureProperties.__webglTexture);

    this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, texture.flipY);
    this.gl.pixelStorei(this.gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha);
    this.gl.pixelStorei(this.gl.UNPACK_ALIGNMENT, texture.unpackAlignment);

    let image = clampToMaxSize(texture.image, this.capabilities.maxTextureSize);

    if (textureNeedsPowerOfTwo(texture) && isPowerOfTwo(image) === false) {
      image = makePowerOfTwo(image);
    }

    let isPowerOfTwoImage = isPowerOfTwo(image),
      glFormat = this.paramThreeToGL(texture.format),
      glType = this.paramThreeToGL(texture.type);

    this.setTextureParameters(this.gl.TEXTURE_2D, texture, isPowerOfTwoImage);

    let mipmap, mipmaps = texture.mipmaps;

    if (texture.isDepthTexture) {
      // populate depth texture with dummy data
      let internalFormat = this.gl.DEPTH_COMPONENT;
      // if (texture.type === FloatType) {
      //   if (!_isWebGL2) throw new Error('Float Depth Texture only supported in WebGL2.0');
      //   internalFormat = this.gl.DEPTH_COMPONENT32F;
      // } else if (_isWebGL2) {
      //   // WebGL 2.0 requires signed internalformat for glTexImage2D
      //   internalFormat = this.gl.DEPTH_COMPONENT16;
      // }

      if (texture.format === DepthFormat && internalFormat === this.gl.DEPTH_COMPONENT) {
        // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
        // DEPTH_COMPONENT and type is not UNSIGNED_SHORT or UNSIGNED_INT
        // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
        if (texture.type !== UnsignedShortType && texture.type !== UnsignedIntType) {
          console.warn('WebGLRenderer: Use UnsignedShortType or UnsignedIntType for DepthFormat DepthTexture.');

          texture.type = UnsignedShortType;
          glType = this.paramThreeToGL(texture.type);
        }
      }

      // Depth stencil textures need the DEPTH_STENCIL internal format
      // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
      if (texture.format === DepthStencilFormat) {
        internalFormat = this.gl.DEPTH_STENCIL;
        // The error INVALID_OPERATION is generated by texImage2D if format and internalformat are
        // DEPTH_STENCIL and type is not UNSIGNED_INT_24_8_WEBGL.
        // (https://www.khronos.org/registry/webgl/extensions/WEBGL_depth_texture/)
        if (texture.type !== UnsignedInt248Type) {
          console.warn('WebGLRenderer: Use UnsignedInt248Type for DepthStencilFormat DepthTexture.');

          texture.type = UnsignedInt248Type;
          glType = this.paramThreeToGL(texture.type);
        }
      }

      this.state.texImage2D(this.gl.TEXTURE_2D, 0, internalFormat, image.width, image.height, 0, glFormat, glType, null);
    } else if (texture.isDataTexture) {
      // use manually created mipmaps if available
      // if there are no manual mipmaps
      // set 0 level mipmap and then use GL to generate other mipmap levels
      if (mipmaps.length > 0 && isPowerOfTwoImage) {
        for (let i = 0, il = mipmaps.length; i < il; i++) {
          mipmap = mipmaps[i];
          this.state.texImage2D(this.gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
        }

        texture.generateMipmaps = false;
      } else {
        this.state.texImage2D(this.gl.TEXTURE_2D, 0, glFormat, image.width, image.height, 0, glFormat, glType, image.data);
      }
    } else if (texture.isCompressedTexture) {
      for (let i = 0, il = mipmaps.length; i < il; i++) {
        mipmap = mipmaps[i];
        if (texture.format !== RGBAFormat && texture.format !== RGBFormat) {
          if (this.state.getCompressedTextureFormats().indexOf(glFormat) > - 1) {
            this.state.compressedTexImage2D(this.gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, mipmap.data);
          } else {
            console.warn('WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()');
          }
        } else {
          this.state.texImage2D(this.gl.TEXTURE_2D, i, glFormat, mipmap.width, mipmap.height, 0, glFormat, glType, mipmap.data);
        }
      }
    } else {
      // regular Texture (image, video, canvas)

      // use manually created mipmaps if available
      // if there are no manual mipmaps
      // set 0 level mipmap and then use GL to generate other mipmap levels
      if (mipmaps.length > 0 && isPowerOfTwoImage) {
        for (let i = 0, il = mipmaps.length; i < il; i++) {
          mipmap = mipmaps[i];
          this.state.texImage2D(this.gl.TEXTURE_2D, i, glFormat, glFormat, glType, mipmap);
        }
        texture.generateMipmaps = false;
      } else {
        this.state.texImage2D(this.gl.TEXTURE_2D, 0, glFormat, glFormat, glType, image);
      }
    }

    if (texture.generateMipmaps && isPowerOfTwoImage) {
      this.gl.generateMipmap(this.gl.TEXTURE_2D);
    }

    textureProperties.__version = texture.version;

    if (texture.onUpdate) {
      texture.onUpdate(texture);
    }

  }

  //
  private setupFrameBufferTexture(framebuffer, renderTarget, attachment, textureTarget) {
    let glFormat = this.paramThreeToGL(renderTarget.texture.format);
    let glType = this.paramThreeToGL(renderTarget.texture.type);
    this.state.texImage2D(textureTarget, 0, glFormat, renderTarget.width, renderTarget.height, 0, glFormat, glType, null);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);
    this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, attachment, textureTarget, this.properties.get(renderTarget.texture).__webglTexture, 0);
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

  private setupRenderBufferStorage(renderbuffer, renderTarget) {
    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, renderbuffer);

    if (renderTarget.depthBuffer && !renderTarget.stencilBuffer) {
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, renderTarget.width, renderTarget.height);
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);
    } else if (renderTarget.depthBuffer && renderTarget.stencilBuffer) {
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, renderTarget.width, renderTarget.height);
      this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, renderbuffer);
    } else {
      // FIXME: We don't support !depth !stencil
      this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.RGBA4, renderTarget.width, renderTarget.height);
    }

    this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, null);
  }

  private setupDepthTexture(framebuffer, renderTarget) {
    let isCube = (renderTarget && renderTarget.isWebGLRenderTargetCube);
    if (isCube) {
      throw new Error('Depth Texture with cube render targets is not supported!');
    }

    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, framebuffer);

    if (!(renderTarget.depthTexture && renderTarget.depthTexture.isDepthTexture)) {

      throw new Error('renderTarget.depthTexture must be an instance of THREE.DepthTexture');

    }

    // upload an empty depth texture with framebuffer size
    if (!this.properties.get(renderTarget.depthTexture).__webglTexture ||
      renderTarget.depthTexture.image.width !== renderTarget.width ||
      renderTarget.depthTexture.image.height !== renderTarget.height) {
      renderTarget.depthTexture.image.width = renderTarget.width;
      renderTarget.depthTexture.image.height = renderTarget.height;
      renderTarget.depthTexture.needsUpdate = true;
    }

    this.setTexture2D(renderTarget.depthTexture, 0);

    let webglDepthTexture = this.properties.get(renderTarget.depthTexture).__webglTexture;

    if (renderTarget.depthTexture.format === DepthFormat) {

      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.TEXTURE_2D, webglDepthTexture, 0);

    } else if (renderTarget.depthTexture.format === DepthStencilFormat) {

      this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.TEXTURE_2D, webglDepthTexture, 0);

    } else {
      throw new Error('Unknown depthTexture format');
    }
  }

  private setupDepthRenderbuffer(renderTarget) {
    let renderTargetProperties = this.properties.get(renderTarget);

    let isCube = (renderTarget.isWebGLRenderTargetCube === true);

    if (renderTarget.depthTexture) {
      if (isCube) {
        throw new Error('target.depthTexture not supported in Cube render targets');
      }

      this.setupDepthTexture(renderTargetProperties.__webglFramebuffer, renderTarget);
    } else {
      if (isCube) {
        renderTargetProperties.__webglDepthbuffer = [];

        for (let i = 0; i < 6; i++) {
          this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer[i]);
          renderTargetProperties.__webglDepthbuffer[i] = this.gl.createRenderbuffer();
          this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer[i], renderTarget);
        }
      } else {
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, renderTargetProperties.__webglFramebuffer);
        renderTargetProperties.__webglDepthbuffer = this.gl.createRenderbuffer();
        this.setupRenderBufferStorage(renderTargetProperties.__webglDepthbuffer, renderTarget);
      }
    }
    this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
  }

}
