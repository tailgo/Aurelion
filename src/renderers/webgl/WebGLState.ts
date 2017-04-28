import {
  NotEqualDepth, GreaterDepth, GreaterEqualDepth, EqualDepth, LessEqualDepth,
  LessDepth, AlwaysDepth, NeverDepth, CullFaceFront, CullFaceBack, CullFaceNone,
  CustomBlending, MultiplyBlending, SubtractiveBlending, AdditiveBlending,
  NoBlending, NormalBlending
} from '../../constants';
import { Vector4 } from '../../math/Vector4';



export class WebGLState {

  private capabilities = {};

  public buffers;

  public init;
  public initAttributes;
  public enableAttribute;
  public enableAttributeAndDivisor;
  public disableUnusedAttributes;
  public enable;
  public disable;
  public getCompressedTextureFormats;

  public setBlending;

  public setColorWrite;
  public setDepthTest;
  public setDepthWrite;
  public setDepthFunc;
  public setStencilTest;
  public setStencilWrite;
  public setStencilFunc;
  public setStencilOp;

  public setFlipSided;
  public setCullFace;

  public setLineWidth;
  public setPolygonOffset;

  public getScissorTest;
  public setScissorTest;

  public activeTexture;
  public bindTexture;
  public compressedTexImage2D;
  public texImage2D;

  public scissor;
  public viewport;

  public reset;

  constructor(gl, extensions, paramThreeToGL) {

    class ColorBuffer {
      private locked: boolean;
      private color: Vector4;
      private currentColorMask;
      private currentColorClear: Vector4;

      constructor() {
        this.locked = false;
        this.color = new Vector4();
        this.currentColorMask = null;
        this.currentColorClear = new Vector4();
      }

      public setMask(colorMask) {
        if (this.currentColorMask !== colorMask && !this.locked) {
          gl.colorMask(colorMask, colorMask, colorMask, colorMask);
          this.currentColorMask = colorMask;
        }
      }

      public setLocked(lock: boolean) {
        this.locked = lock;
      }

      public setClear(r, g, b, a, premultipliedAlpha?) {
        if (premultipliedAlpha === true) {
          r *= a; g *= a; b *= a;
        }

        this.color.set(r, g, b, a);

        if (this.currentColorClear.equals(this.color) === false) {
          gl.clearColor(r, g, b, a);
          this.currentColorClear.copy(this.color);
        }
      }

      public reset() {
        this.locked = false;
        this.currentColorMask = null;
        this.currentColorClear.set(0, 0, 0, 1);
      }
    }

    class DepthBuffer {
      private locked: boolean;
      private currentDepthMask;
      private currentDepthFunc;
      private currentDepthClear;

      constructor() {
        this.locked = false;
        this.currentDepthMask = null;
        this.currentDepthFunc = null;
        this.currentDepthClear = null;
      }

      public setTest(depthTest) {
        if (depthTest) {
          enable(gl.DEPTH_TEST);
        } else {
          disable(gl.DEPTH_TEST);
        }
      }

      public setMask(depthMask) {
        if (this.currentDepthMask !== depthMask && !this.locked) {
          gl.depthMask(depthMask);
          this.currentDepthMask = depthMask;
        }
      }

      public setFunc(depthFunc) {
        if (this.currentDepthFunc !== depthFunc) {
          if (depthFunc) {
            switch (depthFunc) {
              case NeverDepth:
                gl.depthFunc(gl.NEVER);
                break;

              case AlwaysDepth:
                gl.depthFunc(gl.ALWAYS);
                break;

              case LessDepth:
                gl.depthFunc(gl.LESS);
                break;

              case LessEqualDepth:
                gl.depthFunc(gl.LEQUAL);
                break;

              case EqualDepth:
                gl.depthFunc(gl.EQUAL);
                break;

              case GreaterEqualDepth:
                gl.depthFunc(gl.GEQUAL);
                break;

              case GreaterDepth:
                gl.depthFunc(gl.GREATER);
                break;

              case NotEqualDepth:
                gl.depthFunc(gl.NOTEQUAL);
                break;

              default:
                gl.depthFunc(gl.LEQUAL);
            }
          } else {
            gl.depthFunc(gl.LEQUAL);
          }
          this.currentDepthFunc = depthFunc;
        }
      }

      public setLocked(lock) {
        this.locked = lock;
      }

      public setClear(depth) {
        if (this.currentDepthClear !== depth) {
          gl.clearDepth(depth);
          this.currentDepthClear = depth;
        }
      }

      public reset() {
        this.locked = false;
        this.currentDepthMask = null;
        this.currentDepthFunc = null;
        this.currentDepthClear = null;
      }
    }

    class StencilBuffer {
      private locked: boolean;

      private currentStencilMask;
      private currentStencilFunc;
      private currentStencilRef;
      private currentStencilFuncMask;
      private currentStencilFail;
      private currentStencilZFail;
      private currentStencilZPass;
      private currentStencilClear;

      constructor() {
        this.locked = false;

        this.currentStencilMask = null;
        this.currentStencilFunc = null;
        this.currentStencilRef = null;
        this.currentStencilFuncMask = null;
        this.currentStencilFail = null;
        this.currentStencilZFail = null;
        this.currentStencilZPass = null;
        this.currentStencilClear = null;
      }

      public setTest(stencilTest) {
        if (stencilTest) {
          enable(gl.STENCIL_TEST);
        } else {
          disable(gl.STENCIL_TEST);
        }
      }

      public setMask(stencilMask) {
        if (this.currentStencilMask !== stencilMask && !this.locked) {
          gl.stencilMask(stencilMask);
          this.currentStencilMask = stencilMask;
        }
      }

      public setFunc(stencilFunc, stencilRef, stencilMask) {
        if (this.currentStencilFunc !== stencilFunc ||
          this.currentStencilRef !== stencilRef ||
          this.currentStencilFuncMask !== stencilMask) {

          gl.stencilFunc(stencilFunc, stencilRef, stencilMask);

          this.currentStencilFunc = stencilFunc;
          this.currentStencilRef = stencilRef;
          this.currentStencilFuncMask = stencilMask;
        }
      }

      public setOp(stencilFail, stencilZFail, stencilZPass) {
        if (this.currentStencilFail !== stencilFail ||
          this.currentStencilZFail !== stencilZFail ||
          this.currentStencilZPass !== stencilZPass) {

          gl.stencilOp(stencilFail, stencilZFail, stencilZPass);

          this.currentStencilFail = stencilFail;
          this.currentStencilZFail = stencilZFail;
          this.currentStencilZPass = stencilZPass;

        }
      }

      public setLocked(lock: boolean) {
        this.locked = lock;
      }

      public setClear(stencil) {
        if (this.currentStencilClear !== stencil) {
          gl.clearStencil(stencil);
          this.currentStencilClear = stencil;
        }
      }

      public reset() {
        this.locked = false;

        this.currentStencilMask = null;
        this.currentStencilFunc = null;
        this.currentStencilRef = null;
        this.currentStencilFuncMask = null;
        this.currentStencilFail = null;
        this.currentStencilZFail = null;
        this.currentStencilZPass = null;
        this.currentStencilClear = null;
      }
    }

    //
    let colorBuffer = new ColorBuffer();
    let depthBuffer = new DepthBuffer();
    let stencilBuffer = new StencilBuffer();

    let maxVertexAttributes = gl.getParameter(gl.MAX_VERTEX_ATTRIBS);
    let newAttributes = new Uint8Array(maxVertexAttributes);
    let enabledAttributes = new Uint8Array(maxVertexAttributes);
    let attributeDivisors = new Uint8Array(maxVertexAttributes);

    let capabilities = {};

    let compressedTextureFormats = null;

    let currentBlending = null;
    let currentBlendEquation = null;
    let currentBlendSrc = null;
    let currentBlendDst = null;
    let currentBlendEquationAlpha = null;
    let currentBlendSrcAlpha = null;
    let currentBlendDstAlpha = null;
    let currentPremultipledAlpha = false;

    let currentFlipSided = null;
    let currentCullFace = null;

    let currentLineWidth = null;

    let currentPolygonOffsetFactor = null;
    let currentPolygonOffsetUnits = null;

    let currentScissorTest = null;

    let maxTextures = gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS);

    let version = parseFloat(/^WebGL\ ([0-9])/.exec(gl.getParameter(gl.VERSION))[1]);
    let lineWidthAvailable = parseFloat(version.toString()) >= 1.0;

    let currentTextureSlot = null;
    let currentBoundTextures = {};

    let currentScissor = new Vector4();
    let currentViewport = new Vector4();

    let emptyTextures = {};
    emptyTextures[gl.TEXTURE_2D] = createTexture(gl.TEXTURE_2D, gl.TEXTURE_2D, 1);
    emptyTextures[gl.TEXTURE_CUBE_MAP] = createTexture(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_CUBE_MAP_POSITIVE_X, 6);

    /**
     * support function
     */
    function enable(id) {
      if (capabilities[id] !== true) {
        gl.enable(id);
        capabilities[id] = true;
      }
    }

    function disable(id) {
      if (capabilities[id] !== false) {
        gl.disable(id);
        capabilities[id] = false;
      }
    }

    function getCompressedTextureFormats() {
      if (compressedTextureFormats === null) {
        compressedTextureFormats = [];
        if (extensions.get('WEBGL_compressed_texture_pvrtc') ||
          extensions.get('WEBGL_compressed_texture_s3tc') ||
          extensions.get('WEBGL_compressed_texture_etc1')) {
          let formats = gl.getParameter(gl.COMPRESSED_TEXTURE_FORMATS);
          for (let i = 0; i < formats.length; i++) {
            compressedTextureFormats.push(formats[i]);
          }
        }
      }
      return compressedTextureFormats;
    }

    function setBlending(blending, blendEquation?, blendSrc?, blendDst?, blendEquationAlpha?, blendSrcAlpha?, blendDstAlpha?, premultipliedAlpha?) {

      if (blending !== NoBlending) {
        enable(gl.BLEND);
      } else {
        disable(gl.BLEND);
      }

      if (blending !== currentBlending || premultipliedAlpha !== currentPremultipledAlpha) {
        if (blending === AdditiveBlending) {
          if (premultipliedAlpha) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE, gl.ONE, gl.ONE);
          } else {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
          }
        } else if (blending === SubtractiveBlending) {
          if (premultipliedAlpha) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ZERO, gl.ZERO, gl.ONE_MINUS_SRC_COLOR, gl.ONE_MINUS_SRC_ALPHA);
          } else {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.ZERO, gl.ONE_MINUS_SRC_COLOR);
          }
        } else if (blending === MultiplyBlending) {
          if (premultipliedAlpha) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ZERO, gl.SRC_COLOR, gl.ZERO, gl.SRC_ALPHA);
          } else {
            gl.blendEquation(gl.FUNC_ADD);
            gl.blendFunc(gl.ZERO, gl.SRC_COLOR);
          }
        } else {
          if (premultipliedAlpha) {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          } else {
            gl.blendEquationSeparate(gl.FUNC_ADD, gl.FUNC_ADD);
            gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
          }
        }

        currentBlending = blending;
        currentPremultipledAlpha = premultipliedAlpha;

      }

      if (blending === CustomBlending) {
        blendEquationAlpha = blendEquationAlpha || blendEquation;
        blendSrcAlpha = blendSrcAlpha || blendSrc;
        blendDstAlpha = blendDstAlpha || blendDst;
        if (blendEquation !== currentBlendEquation || blendEquationAlpha !== currentBlendEquationAlpha) {
          gl.blendEquationSeparate(paramThreeToGL(blendEquation), paramThreeToGL(blendEquationAlpha));
          currentBlendEquation = blendEquation;
          currentBlendEquationAlpha = blendEquationAlpha;
        }
        if (blendSrc !== currentBlendSrc || blendDst !== currentBlendDst || blendSrcAlpha !== currentBlendSrcAlpha || blendDstAlpha !== currentBlendDstAlpha) {
          gl.blendFuncSeparate(paramThreeToGL(blendSrc), paramThreeToGL(blendDst), paramThreeToGL(blendSrcAlpha), paramThreeToGL(blendDstAlpha));

          currentBlendSrc = blendSrc;
          currentBlendDst = blendDst;
          currentBlendSrcAlpha = blendSrcAlpha;
          currentBlendDstAlpha = blendDstAlpha;
        }
      } else {
        currentBlendEquation = null;
        currentBlendSrc = null;
        currentBlendDst = null;
        currentBlendEquationAlpha = null;
        currentBlendSrcAlpha = null;
        currentBlendDstAlpha = null;
      }
    }

    function createTexture(type, target, count) {
      let data = new Uint8Array(4); // 4 is required to match default unpack alignment of 4.
      let texture = gl.createTexture();

      gl.bindTexture(type, texture);
      gl.texParameteri(type, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(type, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      for (let i = 0; i < count; i++) {
        gl.texImage2D(target + i, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
      }
      return texture;
    }

    function init() {
      colorBuffer.setClear(0, 0, 0, 1);
      depthBuffer.setClear(1);
      stencilBuffer.setClear(0);

      enable(gl.DEPTH_TEST);
      setDepthFunc(LessEqualDepth);

      setFlipSided(false);
      setCullFace(CullFaceBack);
      enable(gl.CULL_FACE);

      enable(gl.BLEND);
      setBlending(NormalBlending);
    }

    function initAttributes() {

      for (let i = 0, l = newAttributes.length; i < l; i++) {
        newAttributes[i] = 0;
      }
    }

    function enableAttribute(attribute) {
      newAttributes[attribute] = 1;
      if (enabledAttributes[attribute] === 0) {
        gl.enableVertexAttribArray(attribute);
        enabledAttributes[attribute] = 1;
      }
      if (attributeDivisors[attribute] !== 0) {
        let extension = extensions.get('ANGLE_instanced_arrays');
        extension.vertexAttribDivisorANGLE(attribute, 0);
        attributeDivisors[attribute] = 0;
      }
    }

    function enableAttributeAndDivisor(attribute, meshPerAttribute, extension) {
      newAttributes[attribute] = 1;
      if (enabledAttributes[attribute] === 0) {
        gl.enableVertexAttribArray(attribute);
        enabledAttributes[attribute] = 1;
      }
      if (attributeDivisors[attribute] !== meshPerAttribute) {
        extension.vertexAttribDivisorANGLE(attribute, meshPerAttribute);
        attributeDivisors[attribute] = meshPerAttribute;
      }
    }

    function disableUnusedAttributes() {
      for (let i = 0, l = enabledAttributes.length; i !== l; ++i) {
        if (enabledAttributes[i] !== newAttributes[i]) {
          gl.disableVertexAttribArray(i);
          enabledAttributes[i] = 0;
        }
      }
    }

    function setColorWrite(colorWrite) {
      colorBuffer.setMask(colorWrite);
    }

    function setDepthTest(depthTest) {
      depthBuffer.setTest(depthTest);
    }

    function setDepthWrite(depthWrite) {
      depthBuffer.setMask(depthWrite);
    }

    function setDepthFunc(depthFunc) {
      depthBuffer.setFunc(depthFunc);
    }

    function setStencilTest(stencilTest) {
      stencilBuffer.setTest(stencilTest);
    }

    function setStencilWrite(stencilWrite) {
      stencilBuffer.setMask(stencilWrite);
    }

    function setStencilFunc(stencilFunc, stencilRef, stencilMask) {
      stencilBuffer.setFunc(stencilFunc, stencilRef, stencilMask);
    }

    function setStencilOp(stencilFail, stencilZFail, stencilZPass) {
      stencilBuffer.setOp(stencilFail, stencilZFail, stencilZPass);
    }

    //
    function setFlipSided(flipSided) {
      if (currentFlipSided !== flipSided) {
        if (flipSided) {
          gl.frontFace(gl.CW);
        } else {
          gl.frontFace(gl.CCW);
        }
        currentFlipSided = flipSided;
      }
    }

    function setCullFace(cullFace) {
      if (cullFace !== CullFaceNone) {
        enable(gl.CULL_FACE);
        if (cullFace !== currentCullFace) {
          if (cullFace === CullFaceBack) {
            gl.cullFace(gl.BACK);
          } else if (cullFace === CullFaceFront) {
            gl.cullFace(gl.FRONT);
          } else {
            gl.cullFace(gl.FRONT_AND_BACK);
          }
        }
      } else {
        disable(gl.CULL_FACE);
      }
      currentCullFace = cullFace;
    }

    function setLineWidth(width) {
      if (width !== currentLineWidth) {
        if (lineWidthAvailable) gl.lineWidth(width);
        currentLineWidth = width;
      }
    }

    function setPolygonOffset(polygonOffset, factor, units) {
      if (polygonOffset) {
        enable(gl.POLYGON_OFFSET_FILL);
        if (currentPolygonOffsetFactor !== factor || currentPolygonOffsetUnits !== units) {
          gl.polygonOffset(factor, units);
          currentPolygonOffsetFactor = factor;
          currentPolygonOffsetUnits = units;
        }
      } else {
        disable(gl.POLYGON_OFFSET_FILL);
      }
    }

    function getScissorTest() {
      return currentScissorTest;
    }

    function setScissorTest(scissorTest) {
      currentScissorTest = scissorTest;
      if (scissorTest) {
        enable(gl.SCISSOR_TEST);
      } else {
        disable(gl.SCISSOR_TEST);
      }
    }

    // texture
    function activeTexture(webglSlot?) {
      if (webglSlot === undefined) webglSlot = gl.TEXTURE0 + maxTextures - 1;
      if (currentTextureSlot !== webglSlot) {
        gl.activeTexture(webglSlot);
        currentTextureSlot = webglSlot;
      }
    }

    function bindTexture(webglType, webglTexture) {
      if (currentTextureSlot === null) {
        activeTexture();
      }

      let boundTexture = currentBoundTextures[currentTextureSlot];
      if (boundTexture === undefined) {
        boundTexture = { type: undefined, texture: undefined };
        currentBoundTextures[currentTextureSlot] = boundTexture;
      }

      if (boundTexture.type !== webglType || boundTexture.texture !== webglTexture) {
        gl.bindTexture(webglType, webglTexture || emptyTextures[webglType]);

        boundTexture.type = webglType;
        boundTexture.texture = webglTexture;
      }
    }

    function compressedTexImage2D() {
      try {
        gl.compressedTexImage2D.apply(gl, arguments);
      } catch (error) {
        console.error(error);
      }
    }

    function texImage2D() {
      try {
        gl.texImage2D.apply(gl, arguments);
      } catch (error) {
        console.error(error);
      }
    }

    //
    function scissor(scissor) {
      if (currentScissor.equals(scissor) === false) {
        gl.scissor(scissor.x, scissor.y, scissor.z, scissor.w);
        currentScissor.copy(scissor);
      }
    }

    function viewport(viewport) {
      if (currentViewport.equals(viewport) === false) {
        gl.viewport(viewport.x, viewport.y, viewport.z, viewport.w);
        currentViewport.copy(viewport);
      }
    }

    //
    function reset() {
      for (let i = 0; i < enabledAttributes.length; i++) {
        if (enabledAttributes[i] === 1) {
          gl.disableVertexAttribArray(i);
          enabledAttributes[i] = 0;
        }
      }
      capabilities = {};

      compressedTextureFormats = null;

      currentTextureSlot = null;
      currentBoundTextures = {};

      currentBlending = null;

      currentFlipSided = null;
      currentCullFace = null;

      colorBuffer.reset();
      depthBuffer.reset();
      stencilBuffer.reset();

    }

    this.buffers = {
      color: colorBuffer,
      depth: depthBuffer,
      stencil: stencilBuffer
    };

    this.capabilities = capabilities;

    this.init = init;
    this.initAttributes = initAttributes;
    this.enableAttribute = enableAttribute;
    this.enableAttributeAndDivisor = enableAttributeAndDivisor;
    this.disableUnusedAttributes = disableUnusedAttributes;
    this.enable = enable;
    this.disable = disable;
    this.getCompressedTextureFormats = getCompressedTextureFormats;

    this.setBlending = setBlending;

    this.setColorWrite = setColorWrite;
    this.setDepthTest = setDepthTest;
    this.setDepthWrite = setDepthWrite;
    this.setDepthFunc = setDepthFunc;
    this.setStencilTest = setStencilTest;
    this.setStencilWrite = setStencilWrite;
    this.setStencilFunc = setStencilFunc;
    this.setStencilOp = setStencilOp;

    this.setFlipSided = setFlipSided;
    this.setCullFace = setCullFace;

    this.setLineWidth = setLineWidth;
    this.setPolygonOffset = setPolygonOffset;

    this.getScissorTest = getScissorTest;
    this.setScissorTest = setScissorTest;

    this.activeTexture = activeTexture;
    this.bindTexture = bindTexture;
    this.compressedTexImage2D = compressedTexImage2D;
    this.texImage2D = texImage2D;

    this.scissor = scissor;
    this.viewport = viewport;

    this.reset = reset;
  }

}
