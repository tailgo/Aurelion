import { MaxEquation, MinEquation } from '../Constants';
import { RGB_ETC1_Format } from '../Constants';
import {
  RGBA_PVRTC_2BPPV1_Format, RGBA_PVRTC_4BPPV1_Format,
  RGB_PVRTC_2BPPV1_Format, RGB_PVRTC_4BPPV1_Format
} from '../Constants';
import {
  RGBA_S3TC_DXT5_Format, RGBA_S3TC_DXT3_Format,
  RGBA_S3TC_DXT1_Format, RGB_S3TC_DXT1_Format
} from '../Constants';
import {
  SrcAlphaSaturateFactor, OneMinusDstColorFactor, DstColorFactor,
  OneMinusDstAlphaFactor, DstAlphaFactor, OneMinusSrcAlphaFactor,
  SrcAlphaFactor, OneMinusSrcColorFactor, SrcColorFactor,
  OneFactor, ZeroFactor
} from '../Constants';
import {
  ReverseSubtractEquation, SubtractEquation, AddEquation
} from '../Constants';
import { DepthFormat, DepthStencilFormat } from '../Constants';
import { LuminanceAlphaFormat, LuminanceFormat } from '../Constants';
import { RGBAFormat, RGBFormat, AlphaFormat } from '../Constants';
import { HalfFloatType, FloatType } from '../Constants';
import { UnsignedIntType, IntType } from '../Constants';
import { UnsignedShortType, ShortType } from '../Constants';
import { ByteType, UnsignedByteType } from '../Constants';
import {
  UnsignedInt248Type, UnsignedShort565Type,
  UnsignedShort5551Type, UnsignedShort4444Type
} from '../Constants';
import {
  LinearMipMapLinearFilter, LinearMipMapNearestFilter, LinearFilter
} from '../Constants';
import {
  NearestMipMapLinearFilter, NearestMipMapNearestFilter, NearestFilter
} from '../Constants';
import {
  MirroredRepeatWrapping, ClampToEdgeWrapping, RepeatWrapping
} from '../Constants';
import {
  FrontFaceDirectionCW, NoBlending, BackSide, DoubleSide
} from '../Constants';
import {
  TriangleFanDrawMode, TriangleStripDrawMode, TrianglesDrawMode,
  NoColors, FlatShading, LinearToneMapping
} from '../Constants';

import { Color } from '../math/Color';
import { Vector3 } from '../math/Vector3';
import { Vector4 } from '../math/Vector4';
import { Matrix4 } from '../math/Matrix4';
import { Sphere } from '../math/Sphere';
import { Frustum } from '../math/Frustum';

import { BufferGeometry } from '../core/BufferGeometry';
import { BoxBufferGeometry } from '../geometries/BoxGeometry';
import { PlaneBufferGeometry } from '../geometries/PlaneGeometry';

import { Mesh } from '../objects/Mesh';
import { Scene } from '../scenes/Scene';
import { Camera } from '../cameras/Camera';

import { PerspectiveCamera } from '../cameras/PerspectiveCamera';
import { OrthographicCamera } from '../cameras/OrthographicCamera';

import { ShaderMaterial } from '../materials/ShaderMaterial';
import { MeshBasicMaterial } from '../materials/MeshBasicMaterial';

import { WebGLUniforms } from './webgl/WebGLUniforms';
import { WebGLPrograms } from './webgl/WebGLPrograms';
import { WebGLState } from './webgl/WebGLState';
import { WebGLCapabilities } from './webgl/WebGLCapabilities';
import { WebGLProperties } from './webgl/WebGLProperties';
import { WebGLExtensions } from './webgl/WebGLExtensions';
import { WebGLShadowMap } from './webgl/WebGLShadowMap';
import { WebGLIndexedBufferRenderer } from './webgl/WebGLIndexedBufferRenderer';
import { WebGLBufferRenderer } from './webgl/WebGLBufferRenderer';
import { WebGLLights } from './webgl/WebGLLights';
import { WebGLObjects } from './webgl/WebGLObjects';
import { WebGLTextures } from './webgl/WebGLTextures';
import { WebGLClipping } from './webgl/WebGLClipping';
// import { LensFlarePlugin } from './webgl/plugins/LensFlarePlugin';
// import { SpritePlugin } from './webgl/plugins/SpritePlugin';

import { UniformsUtils } from './shaders/UniformsUtils';
import { ShaderLib } from './shaders/ShaderLib';

function painterSortStable(a, b) {
  if (a.object.renderOrder !== b.object.renderOrder) {

    return a.object.renderOrder - b.object.renderOrder;

  } else if (a.material.program && b.material.program && a.material.program !== b.material.program) {

    return a.material.program.id - b.material.program.id;

  } else if (a.material.id !== b.material.id) {

    return a.material.id - b.material.id;

  } else if (a.z !== b.z) {

    return a.z - b.z;

  } else {

    return a.id - b.id;

  }
}

function reversePainterSortStable(a, b) {
  if (a.object.renderOrder !== b.object.renderOrder) {

    return a.object.renderOrder - b.object.renderOrder;

  } if (a.z !== b.z) {

    return b.z - a.z;

  } else {

    return a.id - b.id;

  }
}

function absNumericalSort(a, b) {
  return Math.abs(b[0]) - Math.abs(a[0]);
}

function markUniformsLightsNeedsUpdate(uniforms, value) {

  uniforms.ambientLightColor.needsUpdate = value;

  uniforms.directionalLights.needsUpdate = value;
  uniforms.pointLights.needsUpdate = value;
  uniforms.spotLights.needsUpdate = value;
  uniforms.rectAreaLights.needsUpdate = value;
  uniforms.hemisphereLights.needsUpdate = value;

}

function refreshUniformsCommon(uniforms, material) {

  uniforms.opacity.value = material.opacity;

  uniforms.diffuse.value = material.color;

  if (material.emissive) {

    uniforms.emissive.value.copy(material.emissive).multiplyScalar(material.emissiveIntensity);

  }

  uniforms.map.value = material.map;
  uniforms.specularMap.value = material.specularMap;
  uniforms.alphaMap.value = material.alphaMap;

  if (material.lightMap) {

    uniforms.lightMap.value = material.lightMap;
    uniforms.lightMapIntensity.value = material.lightMapIntensity;

  }

  if (material.aoMap) {

    uniforms.aoMap.value = material.aoMap;
    uniforms.aoMapIntensity.value = material.aoMapIntensity;

  }

  // uv repeat and offset setting priorities
  // 1. color map
  // 2. specular map
  // 3. normal map
  // 4. bump map
  // 5. alpha map
  // 6. emissive map

  let uvScaleMap;

  if (material.map) {

    uvScaleMap = material.map;

  } else if (material.specularMap) {

    uvScaleMap = material.specularMap;

  } else if (material.displacementMap) {

    uvScaleMap = material.displacementMap;

  } else if (material.normalMap) {

    uvScaleMap = material.normalMap;

  } else if (material.bumpMap) {

    uvScaleMap = material.bumpMap;

  } else if (material.roughnessMap) {

    uvScaleMap = material.roughnessMap;

  } else if (material.metalnessMap) {

    uvScaleMap = material.metalnessMap;

  } else if (material.alphaMap) {

    uvScaleMap = material.alphaMap;

  } else if (material.emissiveMap) {

    uvScaleMap = material.emissiveMap;

  }

  if (uvScaleMap !== undefined) {

    // backwards compatibility
    if (uvScaleMap.isWebGLRenderTarget) {

      uvScaleMap = uvScaleMap.texture;

    }

    let offset = uvScaleMap.offset;
    let repeat = uvScaleMap.repeat;

    uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);

  }

  uniforms.envMap.value = material.envMap;

  // don't flip CubeTexture envMaps, flip everything else:
  //  WebGLRenderTargetCube will be flipped for backwards compatibility
  //  WebGLRenderTargetCube.texture will be flipped because it's a Texture and NOT a CubeTexture
  // this check must be handled differently, or removed entirely, if WebGLRenderTargetCube uses a CubeTexture in the future
  uniforms.flipEnvMap.value = (!(material.envMap && material.envMap.isCubeTexture)) ? 1 : - 1;

  uniforms.reflectivity.value = material.reflectivity;
  uniforms.refractionRatio.value = material.refractionRatio;

}

function refreshUniformsLine(uniforms, material) {

  uniforms.diffuse.value = material.color;
  uniforms.opacity.value = material.opacity;

}

function refreshUniformsDash(uniforms, material) {

  uniforms.dashSize.value = material.dashSize;
  uniforms.totalSize.value = material.dashSize + material.gapSize;
  uniforms.scale.value = material.scale;

}

function refreshUniformsPoints(uniforms, material, height, pixelRatio) {
  uniforms.diffuse.value = material.color;
  uniforms.opacity.value = material.opacity;
  uniforms.size.value = material.size * pixelRatio;
  uniforms.scale.value = height * 0.5;

  uniforms.map.value = material.map;

  if (material.map !== null) {

    let offset = material.map.offset;
    let repeat = material.map.repeat;

    uniforms.offsetRepeat.value.set(offset.x, offset.y, repeat.x, repeat.y);

  }
}

function refreshUniformsFog(uniforms, fog) {
  uniforms.fogColor.value = fog.color;

  if (fog.isFog) {
    uniforms.fogNear.value = fog.near;
    uniforms.fogFar.value = fog.far;
  } else if (fog.isFogExp2) {
    uniforms.fogDensity.value = fog.density;
  }
}

function refreshUniformsLambert(uniforms, material) {
  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }
}

function refreshUniformsPhong(uniforms, material) {
  uniforms.specular.value = material.specular;
  uniforms.shininess.value = Math.max(material.shininess, 1e-4); // to prevent pow( 0.0, 0.0 )

  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }

  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }

}

function refreshUniformsToon(uniforms, material) {
  refreshUniformsPhong(uniforms, material);
  if (material.gradientMap) {
    uniforms.gradientMap.value = material.gradientMap;
  }
}

function refreshUniformsStandard(uniforms, material) {
  uniforms.roughness.value = material.roughness;
  uniforms.metalness.value = material.metalness;
  if (material.roughnessMap) {
    uniforms.roughnessMap.value = material.roughnessMap;
  }

  if (material.metalnessMap) {
    uniforms.metalnessMap.value = material.metalnessMap;
  }

  if (material.emissiveMap) {
    uniforms.emissiveMap.value = material.emissiveMap;
  }

  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }

  if (material.envMap) {
    // uniforms.envMap.value = material.envMap; // part of uniforms common
    uniforms.envMapIntensity.value = material.envMapIntensity;
  }

}

function refreshUniformsPhysical(uniforms, material) {

  uniforms.clearCoat.value = material.clearCoat;
  uniforms.clearCoatRoughness.value = material.clearCoatRoughness;

  refreshUniformsStandard(uniforms, material);

}

function refreshUniformsNormal(uniforms, material) {

  if (material.bumpMap) {
    uniforms.bumpMap.value = material.bumpMap;
    uniforms.bumpScale.value = material.bumpScale;
  }

  if (material.normalMap) {
    uniforms.normalMap.value = material.normalMap;
    uniforms.normalScale.value.copy(material.normalScale);
  }

  if (material.displacementMap) {
    uniforms.displacementMap.value = material.displacementMap;
    uniforms.displacementScale.value = material.displacementScale;
    uniforms.displacementBias.value = material.displacementBias;
  }
}

export class WebGLRenderer {

  // public
  public autoClear: boolean;
  public autoClearColor: boolean;
  public autoClearDepth: boolean;
  public autoClearStencil: boolean;

  public capabilities: WebGLCapabilities;

  public clippingPlanes;

  public context: WebGLRenderingContext;
  public domElement: HTMLCanvasElement;

  public extensions: WebGLExtensions;

  public gammaFactor: number;
  public gammaInput: boolean;
  public gammaOutput: boolean;

  public info;

  public localClippingEnabled: boolean;

  public maxMorphTargets: number;
  public maxMorphNormals: number;

  public physicallyCorrectLights: boolean;

  public properties: WebGLProperties;

  public shadowMap;

  public sortObjects: boolean;

  public state: WebGLState;

  public toneMapping;
  public toneMappingExposure;
  public toneMappingWhitePoint;

  // private
  private _canvas: HTMLCanvasElement;
  private _context;

  private _alpha: boolean;
  private _depth: boolean;
  private _stencil: boolean;

  private _antialias: boolean;
  private _premultipliedAlpha: boolean;
  private _preserveDrawingBuffer: boolean;

  private lights;

  private opaqueObjects;
  private opaqueObjectsLastIndex: number;
  private transparentObjects;
  private transparentObjectsLastIndex: number;

  private morphInfluences: Float32Array;

  private sprites;
  private lensFlares;

  private _gl;

  // internal cache
  private _currentProgram;
  private _currentRenderTarget;
  private _currentFramebuffer;
  private _currentMaterialId: number;
  private _currentGeometryProgram;
  private _currentCamera;

  private _currentScissor: Vector4;
  private _currentScissorTest;

  private _currentViewport: Vector4;

  //
  private _usedTextureUnits;

  //
  private _clearColor: Color;
  private _clearAlpha: number;

  private _width: number;
  private _height: number;
  private _pixelRatio: number;

  private _scissor: Vector4;
  private _scissorTest: boolean;

  private _viewport: Vector4;

  // frustum
  private _frustum: Frustum;

  // clipping
  private _clipping: WebGLClipping;
  private _clippingEnabled: boolean;
  private _localClippingEnabled: boolean;
  private _sphere: Sphere;

  // camera cache
  private _projScreenMatrix: Matrix4;
  private _vector3: Vector3;
  private _matrix4: Matrix4;
  private _matrix42: Matrix4;

  // light cache
  private _lights;

  // info
  private _infoRender;

  // temporary
  private textures: WebGLTextures;
  private objects: WebGLObjects;
  private programCache: WebGLPrograms;
  private lightCache: WebGLLights;
  private bufferRenderer: WebGLBufferRenderer;
  private indexedBufferRenderer: WebGLIndexedBufferRenderer;

  private backgroundPlaneCamera;
  private backgroundPlaneMesh;
  private backgroundBoxCamera;
  private backgroundBoxMesh;

  constructor(parameters?) {
    parameters = parameters || {};

    this._canvas = parameters.canvas !== undefined
      ? parameters.canvas
      : <HTMLCanvasElement>document.createElementNS('http://www.w3.org/1999/xhtml', 'canvas');

    this._context = parameters.context !== undefined ? parameters.context : null;

    this._alpha = parameters.alpha ? parameters.alpha : false;
    this._depth = parameters.depth ? parameters.depth : true;
    this._stencil = parameters.stencil ? parameters.stencil : true;
    this._antialias = parameters.antialias ? parameters.antialias : false;
    this._premultipliedAlpha = parameters.premultipliedAlpha ? parameters.premultipliedAlpha : true;
    this._preserveDrawingBuffer = parameters.preserveDrawingBuffer ? parameters.preserveDrawingBuffer : false;

    this.lights = [];

    this.opaqueObjects = [];
    this.opaqueObjectsLastIndex = -1;
    this.transparentObjects = [];
    this.transparentObjectsLastIndex = -1;

    this.morphInfluences = new Float32Array(8);

    this.sprites = [];
    this.lensFlares = [];

    // public
    this.domElement = this._canvas;
    this.context = null;

    this.autoClear = true;
    this.autoClearColor = true;
    this.autoClearDepth = true;
    this.autoClearStencil = true;

    this.sortObjects = true;

    this.clippingPlanes = [];
    this.localClippingEnabled = false;

    this.gammaFactor = 2.0;
    this.gammaInput = false;
    this.gammaOutput = false;

    this.physicallyCorrectLights = false;

    this.toneMapping = LinearToneMapping;
    this.toneMappingExposure = 1.0;
    this.toneMappingWhitePoint = 1.0;

    this.maxMorphTargets = 8;
    this.maxMorphNormals = 4;

    // internal state cache
    this._currentProgram = null;
    this._currentRenderTarget = null;
    this._currentFramebuffer = null;
    this._currentMaterialId = - 1;
    this._currentGeometryProgram = '';
    this._currentCamera = null;

    this._currentScissor = new Vector4();
    this._currentScissorTest = null;

    this._currentViewport = new Vector4();

    //
    this._usedTextureUnits = 0;

    this._clearColor = new Color(0, 0, 0);
    this._clearAlpha = 0;

    this._width = this._canvas.width;
    this._height = this._canvas.height;
    this._pixelRatio = 1;

    this._scissor = new Vector4(0, 0, this._width, this._height);
    this._scissorTest = false;

    this._viewport = new Vector4(0, 0, this._width, this._height);

    this._frustum = new Frustum();

    this._clipping = new WebGLClipping();
    this._clippingEnabled = false;
    this._localClippingEnabled = false;
    this._sphere = new Sphere();

    this._projScreenMatrix = new Matrix4();
    this._vector3 = new Vector3();
    this._matrix4 = new Matrix4();
    this._matrix42 = new Matrix4();

    this._lights = {
      hash: '',

      ambient: [0, 0, 0],
      directional: [],
      directionalShadowMap: [],
      directionalShadowMatrix: [],
      spot: [],
      spotShadowMap: [],
      spotShadowMatrix: [],
      rectArea: [],
      point: [],
      pointShadowMap: [],
      pointShadowMatrix: [],
      hemi: [],

      shadows: []
    };

    this._infoRender = {
      calls: 0,
      vertices: 0,
      faces: 0,
      points: 0
    };

    this.info = {
      render: this._infoRender,
      memory: {
        geometries: 0,
        textures: 0
      },
      programs: null
    };

    // initialize
    let attributes = {
      alpha: this._alpha,
      depth: this._depth,
      stencil: this._stencil,
      antialias: this._antialias,
      premultipliedAlpha: this._premultipliedAlpha,
      preserveDrawingBuffer: this._preserveDrawingBuffer
    };

    this._gl = this._context || this._canvas.getContext('webgl', attributes)
      || this._canvas.getContext('experimental-webgl', attributes);

    if (this._gl === null) {
      if (this._canvas.getContext('webgl') !== null) {
        throw 'Error creating WebGL context with your selected attributes.';
      } else {
        throw 'Error creating WebGL context.';
      }
    }

    if (this._gl.getShaderPrecisionFormat === undefined) {
      this._gl.getShaderPrecisionFormat = function () {
        return { 'rangeMin': 1, 'rangeMax': 1, 'precision': 1 };
      };
    }
    this._canvas.addEventListener('webglcontentlost', this.onContextLost, false);

    // another things
    this.extensions = new WebGLExtensions(this._gl);

    this.extensions.get('WEBGL_depth_texture');
    this.extensions.get('OES_texture_float');
    this.extensions.get('OES_texture_float_linear');
    this.extensions.get('OES_texture_half_float');
    this.extensions.get('OES_texture_half_float_linear');
    this.extensions.get('OES_standard_derivatives');
    this.extensions.get('ANGLE_instanced_arrays');

    if (this.extensions.get('OES_element_index_uint')) {
      BufferGeometry.MaxIndex = 4294967296;
    }

    this.capabilities = new WebGLCapabilities(this._gl, this.extensions, parameters);
    this.state = new WebGLState(this._gl, this.extensions, this.paramThreeToGL);
    this.properties = new WebGLProperties();
    this.textures = new WebGLTextures(this._gl, this.extensions, this.state, this.properties, this.capabilities, this.paramThreeToGL, this.info);
    this.objects = new WebGLObjects(this._gl, this.properties, this.info);
    this.programCache = new WebGLPrograms(this, this.capabilities);
    this.lightCache = new WebGLLights();

    this.info.programs = this.programCache.programs;

    this.bufferRenderer = new WebGLBufferRenderer(this._gl, this.extensions, this._infoRender);
    this.indexedBufferRenderer = new WebGLIndexedBufferRenderer(this._gl, this.extensions, this._infoRender);

    this.setDefaultGLState();

    this.context = this._gl;

    this.shadowMap = new WebGLShadowMap(this, this._lights, this.objects, this.capabilities);
    // TODO：plugins
  }

  public allocTextureUnit() {
    let textureUnit = this._usedTextureUnits;

    if (textureUnit >= this.capabilities.maxTextures) {
      console.warn('WebGLRenderer: trying to use ' + textureUnit + ' texture units while this GPU supports only ' + this.capabilities.maxTextures);
    }

    this._usedTextureUnits += 1;

    return textureUnit;
  }

  public clear(color?, depth?, stencil?) {
    let bits = 0;

    if (color === undefined || color) bits |= this._gl.COLOR_BUFFER_BIT;
    if (depth === undefined || depth) bits |= this._gl.DEPTH_BUFFER_BIT;
    if (stencil === undefined || stencil) bits |= this._gl.STENCIL_BUFFER_BIT;

    this._gl.clear(bits);
  }

  public clearColor() {
    this.clear(true, false, false);
  }

  public clearDepth() {
    this.clear(false, true, false);
  }

  public clearStencil() {
    this.clear(false, false, true);
  }

  public clearTarget(renderTarget, color, depth, stencil) {
    this.setRenderTarget(renderTarget);
    this.clear(color, depth, stencil);
  }

  public dispose() {
    this.transparentObjects = [];
    this.transparentObjectsLastIndex = -1;
    this.opaqueObjects = [];
    this.opaqueObjectsLastIndex = -1;

    this._canvas.removeEventListener('webglcontextlost', this.onContextLost, false);
  }

  public forceContextLoss() {
    this.extensions.get('WEBGL_lose_context').loseContext();
  }

  // getter
  public getClearAlpha() {
    return this._clearAlpha;
  }

  public getClearColor() {
    return this._clearColor;
  }

  public getContext() {
    return this._gl;
  }

  public getContextAttributes() {
    return this._gl.getContextAttributes();
  }

  public getCurrentRenderTarget() {
    return this._currentRenderTarget;
  }

  public getMaxAnisotropy() {
    return this.capabilities.getMaxAnisotropy();
  }

  public getPixelRatio() {
    return this._pixelRatio;
  }

  public getPrecision() {
    return this.capabilities.precision;
  }

  public getSize() {
    return {
      width: this._width,
      height: this._height
    };
  }
  // getter done.

  public resetGLState() {
    this._currentProgram = null;
    this._currentCamera = null;

    this._currentGeometryProgram = '';
    this._currentMaterialId = - 1;

    this.state.reset();
  }

  public readRenderTargetPixels(renderTarget, x, y, width, height, buffer) {
    if ((renderTarget && renderTarget.isWebGLRenderTarget) === false) {
      console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not WebGLRenderTarget.');
      return;
    }

    let framebuffer = this.properties.get(renderTarget).__webglFramebuffer;

    if (framebuffer) {
      let restore = false;

      if (framebuffer !== this._currentFramebuffer) {
        this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
        restore = true;
      }

      try {
        let texture = renderTarget.texture;
        let textureFormat = texture.format;
        let textureType = texture.type;

        if (textureFormat !== RGBAFormat && this.paramThreeToGL(textureFormat) !== this._gl.getParameter(this._gl.IMPLEMENTATION_COLOR_READ_FORMAT)) {
          console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.');
          return;
        }

        if (textureType !== UnsignedByteType && this.paramThreeToGL(textureType) !== this._gl.getParameter(this._gl.IMPLEMENTATION_COLOR_READ_TYPE) && // IE11, Edge and Chrome Mac < 52 (#9513)
          !(textureType === FloatType && (this.extensions.get('OES_texture_float') || this.extensions.get('WEBGL_color_buffer_float'))) && // Chrome Mac >= 52 and Firefox
          !(textureType === HalfFloatType && this.extensions.get('EXT_color_buffer_half_float'))) {

          console.error('WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.');
          return;
        }

        if (this._gl.checkFramebufferStatus(this._gl.FRAMEBUFFER) === this._gl.FRAMEBUFFER_COMPLETE) {
          // the following if statement ensures valid read requests (no out-of-bounds pixels, see #8604)
          if ((x >= 0 && x <= (renderTarget.width - width)) && (y >= 0 && y <= (renderTarget.height - height))) {
            this._gl.readPixels(x, y, width, height, this.paramThreeToGL(textureFormat), this.paramThreeToGL(textureType), buffer);
          }
        } else {
          console.error('WebGLRenderer.readRenderTargetPixels: readPixels from renderTarget failed. Framebuffer not complete.');
        }
      } finally {
        if (restore) {
          this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, this._currentFramebuffer);
        }
      }
    }
  }

  public render(scene: Scene, camera: Camera, renderTarget?, forceClear?) {
    // reset cache
    this._currentGeometryProgram = '';
    this._currentMaterialId = - 1;
    this._currentCamera = null;

    // update scene graph
    if (scene.autoUpdate) {
      scene.updateMatrixWorld(false);
    }

    // update camera
    if (camera.parent === null) {
      camera.updateMatrixWorld(false);
    }

    camera.matrixWorldInverse.getInverse(camera.matrixWorld);

    this._projScreenMatrix.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
    this._frustum.setFromMatrix(this._projScreenMatrix);

    this.lights.length = 0;

    this.opaqueObjectsLastIndex = -1;
    this.transparentObjectsLastIndex = -1;

    this.sprites.length = 0;
    this.lensFlares.length = 0;

    this._localClippingEnabled = this.localClippingEnabled;
    this._clippingEnabled = this._clipping.init(
      this.clippingPlanes, this._localClippingEnabled, camera
    );

    this.projectObject(scene, camera);

    this.opaqueObjects.length = this.opaqueObjectsLastIndex + 1;
    this.transparentObjects.length = this.transparentObjectsLastIndex + 1;

    if (this.sortObjects === true) {
      this.opaqueObjects.sort(painterSortStable);
      this.transparentObjects.sort(reversePainterSortStable);
    }

    //
    if (this._clippingEnabled) {
      this._clipping.beginShadows();
    }

    this.setupShadows(this.lights);

    // TODO： shadow map render
    this.shadowMap.render( scene, camera );

    this.setupLights(this.lights, camera);

    if (this._clippingEnabled) {
      this._clipping.endShadows();
    }

    //
    this._infoRender.calls = 0;
    this._infoRender.vertices = 0;
    this._infoRender.faces = 0;
    this._infoRender.points = 0;

    if (renderTarget === undefined) {
      renderTarget = null;
    }
    this.setRenderTarget(renderTarget);

    //
    let background = scene.background;

    if ( background === null ) {
      this.state.buffers.color.setClear(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha, this._premultipliedAlpha);
    } else if (background && background.isColor) {
      this.state.buffers.color.setClear(background.r, background.g, background.b, 1, this._premultipliedAlpha);
      forceClear = true;
    }

    if (this.autoClear || forceClear) {
      this.clear(this.autoClearColor, this.autoClearDepth, this.autoClearStencil);
    }

    if (background && background.isCubeTexture) {
      if (this.backgroundBoxCamera === undefined) {
        this.backgroundBoxCamera = new PerspectiveCamera();
        this.backgroundBoxMesh = new Mesh(
          new BoxBufferGeometry(5, 5, 5),
          new ShaderMaterial({
            uniforms: ShaderLib.cube.uniforms,
            vertexShader: ShaderLib.cube.vertexShader,
            fragmentShader: ShaderLib.cube.fragmentShader,
            side: BackSide,
            depthTest: false,
            depthWrite: false,
            fog: false
          })
        );
      }
      this.backgroundBoxCamera.projectionMatrix.copy(camera.projectionMatrix);

      this.backgroundBoxCamera.matrixWorld.extractRotation(camera.matrixWorld);
      this.backgroundBoxCamera.matrixWorldInverse.getInverse(this.backgroundBoxCamera.matrixWorld);


      this.backgroundBoxMesh.material.uniforms['tCube'].value = background;
      this.backgroundBoxMesh.modelViewMatrix.multiplyMatrices(this.backgroundBoxCamera.matrixWorldInverse, this.backgroundBoxMesh.matrixWorld);

      this.objects.update(this.backgroundBoxMesh);

      this.renderBufferDirect(this.backgroundBoxCamera, null, this.backgroundBoxMesh.geometry, this.backgroundBoxMesh.material, this.backgroundBoxMesh, null);
    } else if (background && background.isTexture) {
      if (this.backgroundPlaneCamera === undefined) {
        this.backgroundPlaneCamera = new OrthographicCamera(- 1, 1, 1, - 1, 0, 1);

        this.backgroundPlaneMesh = new Mesh(
          new PlaneBufferGeometry(2, 2),
          new MeshBasicMaterial({ depthTest: false, depthWrite: false, fog: false })
        );
      }

      this.backgroundPlaneMesh.material.map = background;

      this.objects.update(this.backgroundPlaneMesh);

      this.renderBufferDirect(this.backgroundPlaneCamera, null, this.backgroundPlaneMesh.geometry, this.backgroundPlaneMesh.material, this.backgroundPlaneMesh, null);
    }

    //
    if (scene.overrideMaterial) {
      let overrideMaterial = scene.overrideMaterial;

      this.renderObjects(this.opaqueObjects, scene, camera, overrideMaterial);
      this.renderObjects(this.transparentObjects, scene, camera, overrideMaterial);
    } else {
      // opaque pass (front-to-back order)
      this.state.setBlending(NoBlending);
      this.renderObjects(this.opaqueObjects, scene, camera);

      // transparent pass (back-to-front order)
      this.renderObjects(this.transparentObjects, scene, camera);
    }

    // custom render plugins (post pass)
    // spritePlugin.render(scene, camera);
    // lensFlarePlugin.render(scene, camera, _currentViewport);

    // Generate mipmap if we're using any kind of mipmap filtering
    if (renderTarget) {
      this.textures.updateRenderTargetMipmap(renderTarget);
    }

    // Ensure depth buffer writing is enabled so it can be cleared on next render
    this.state.setDepthTest(true);
    this.state.setDepthWrite(true);
    this.state.setColorWrite(true);

  }

  public renderBufferDirect(camera, fog, geometry, material, object, group) {
    this.setMaterial(material);

    let program = this.setProgram(camera, fog, material, object);

    let updateBuffers = false;
    let geometryProgram = geometry.id + '_' + program.id + '_' + material.wireframe;

    if (geometryProgram !== this._currentGeometryProgram) {
      this._currentGeometryProgram = geometryProgram;
      updateBuffers = true;
    }

    // morph targets
    let morphTargetInfluences = object.morphTargetInfluences;

    if (morphTargetInfluences !== undefined) {
      let activeInfluences = [];

      for (let i = 0, l = morphTargetInfluences.length; i < l; i++) {
        let influence = morphTargetInfluences[i];
        activeInfluences.push([influence, i]);
      }

      activeInfluences.sort(absNumericalSort);

      if (activeInfluences.length > 8) {
        activeInfluences.length = 8;
      }

      let morphAttributes = geometry.morphAttributes;

      for (let i = 0, l = activeInfluences.length; i < l; i++) {
        let influence = activeInfluences[i];
        this.morphInfluences[i] = influence[0];

        if (influence[0] !== 0) {
          let index = influence[1];

          if (material.morphTargets === true && morphAttributes.position) geometry.addAttribute('morphTarget' + i, morphAttributes.position[index]);
          if (material.morphNormals === true && morphAttributes.normal) geometry.addAttribute('morphNormal' + i, morphAttributes.normal[index]);
        } else {
          if (material.morphTargets === true) geometry.removeAttribute('morphTarget' + i);
          if (material.morphNormals === true) geometry.removeAttribute('morphNormal' + i);
        }
      }

      for (let i = activeInfluences.length, il = this.morphInfluences.length; i < il; i++) {
        this.morphInfluences[i] = 0.0;
      }

      program.getUniforms().setValue(
        this._gl, 'morphTargetInfluences', this.morphInfluences);

      updateBuffers = true;
    }

    //
    let index = geometry.index;
    let position = geometry.attributes.position;
    let rangeFactor = 1;

    if (material.wireframe === true) {
      index = this.objects.getWireframeAttribute(geometry);
      rangeFactor = 2;
    }

    let renderer;

    if (index !== null) {
      renderer = this.indexedBufferRenderer;
      renderer.setIndex(index);
    } else {
      renderer = this.bufferRenderer;
    }

    if (updateBuffers) {
      this.setupVertexAttributes(material, program, geometry);

      if (index !== null) {
        this._gl.bindBuffer(this._gl.ELEMENT_ARRAY_BUFFER, this.objects.getAttributeBuffer(index));
      }

    }

    //
    let dataCount = 0;

    if (index !== null) {
      dataCount = index.count;
    } else if (position !== undefined) {
      dataCount = position.count;
    }

    let rangeStart = geometry.drawRange.start * rangeFactor;
    let rangeCount = geometry.drawRange.count * rangeFactor;

    let groupStart = group !== null ? group.start * rangeFactor : 0;
    let groupCount = group !== null ? group.count * rangeFactor : Infinity;

    let drawStart = Math.max(rangeStart, groupStart);
    let drawEnd = Math.min(dataCount, rangeStart + rangeCount, groupStart + groupCount) - 1;

    let drawCount = Math.max(0, drawEnd - drawStart + 1);

    if (drawCount === 0) return;

    //
    if (object.isMesh) {
      if (material.wireframe === true) {
        this.state.setLineWidth(material.wireframeLinewidth * this.getTargetPixelRatio());
        renderer.setMode(this._gl.LINES);
      } else {
        switch (object.drawMode) {

          case TrianglesDrawMode:
            renderer.setMode(this._gl.TRIANGLES);
            break;

          case TriangleStripDrawMode:
            renderer.setMode(this._gl.TRIANGLE_STRIP);
            break;

          case TriangleFanDrawMode:
            renderer.setMode(this._gl.TRIANGLE_FAN);
            break;

        }
      }
    } else if (object.isLine) {
      let lineWidth = material.linewidth;

      if (lineWidth === undefined) lineWidth = 1; // Not using Line*Material

      this.state.setLineWidth(lineWidth * this.getTargetPixelRatio());

      if (object.isLineSegments) {
        renderer.setMode(this._gl.LINES);
      } else {
        renderer.setMode(this._gl.LINE_STRIP);
      }
    } else if (object.isPoints) {
      renderer.setMode(this._gl.POINTS);
    }

    if (geometry && geometry.isInstancedBufferGeometry) {
      if (geometry.maxInstancedCount > 0) {
        renderer.renderInstances(geometry, drawStart, drawCount);
      }
    } else {
      renderer.render(drawStart, drawCount);
    }
  }

  public renderBufferImediate(object, program, material) {
    this.state.initAttributes();

    let buffers = this.properties.get(object);

    if (object.hasPositions && !buffers.position) {
      buffers.position = this._gl.createBuffer();
    }
    if (object.hasNormals && !buffers.normal) {
      buffers.normal = this._gl.createBuffer();
    }
    if (object.hasUvs && !buffers.uv) {
      buffers.uv = this._gl.createBuffer();
    }
    if (object.hasColors && !buffers.color) {
      buffers.color = this._gl.createBuffer();
    }

    let attributes = program.getAttributes();

    if (object.hasPositions) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.position);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.positionArray, this._gl.DYNAMIC_DRAW);

      this.state.enableAttribute(attributes.position);
      this._gl.vertexAttribPointer(attributes.position, 3, this._gl.FLOAT, false, 0, 0);
    }

    if (object.hasNormals) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.normal);

      if (!material.isMeshPhongMaterial &&
        !material.isMeshStandardMaterial &&
        !material.isMeshNormalMaterial &&
        material.shading === FlatShading) {

        for (let i = 0, l = object.count * 3; i < l; i += 9) {
          let array = object.normalArray;

          let nx = (array[i + 0] + array[i + 3] + array[i + 6]) / 3;
          let ny = (array[i + 1] + array[i + 4] + array[i + 7]) / 3;
          let nz = (array[i + 2] + array[i + 5] + array[i + 8]) / 3;

          array[i + 0] = nx;
          array[i + 1] = ny;
          array[i + 2] = nz;

          array[i + 3] = nx;
          array[i + 4] = ny;
          array[i + 5] = nz;

          array[i + 6] = nx;
          array[i + 7] = ny;
          array[i + 8] = nz;
        }
      }

      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.normalArray, this._gl.DYNAMIC_DRAW);

      this.state.enableAttribute(attributes.normal);

      this._gl.vertexAttribPointer(attributes.normal, 3, this._gl.FLOAT, false, 0, 0);
    }

    if (object.hasUvs && material.map) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.uv);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.uvArray, this._gl.DYNAMIC_DRAW);

      this.state.enableAttribute(attributes.uv);

      this._gl.vertexAttribPointer(attributes.uv, 2, this._gl.FLOAT, false, 0, 0);
    }

    if (object.hasColors && material.vertexColors !== NoColors) {
      this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffers.color);
      this._gl.bufferData(this._gl.ARRAY_BUFFER, object.colorArray, this._gl.DYNAMIC_DRAW);

      this.state.enableAttribute(attributes.color);

      this._gl.vertexAttribPointer(attributes.color, 3, this._gl.FLOAT, false, 0, 0);
    }

    this.state.disableUnusedAttributes();

    this._gl.drawArrays(this._gl.TRIANGLES, 0, object.count);

    object.count = 0;

  }

  // setter
  public setClearAlpha(alpha) {
    this._clearAlpha = alpha;

    this.state.buffers.color.setClear(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha, this._premultipliedAlpha);
  }

  public setClearColor(color, alpha?) {
    this._clearColor.set(color);

    this._clearAlpha = alpha !== undefined ? alpha : 1;

    this.state.buffers.color.setClear(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha, this._premultipliedAlpha);
  }

  public setFaceCulling(cullFace, frontFaceDirection) {
    this.state.setCullFace( cullFace );
    this.state.setFlipSided( frontFaceDirection === FrontFaceDirectionCW );
  }

  public setPixelRatio(value?: number) {
    if (value === undefined) {
      return;
    }

    this._pixelRatio = value;
    this.setSize(this._viewport.z, this._viewport.w, false);
  }

  public setRenderTarget(renderTarget) {
    this._currentRenderTarget = renderTarget;

    if (renderTarget && this.properties.get(renderTarget).__webglFramebuffer === undefined) {
      this.textures.setupRenderTarget(renderTarget);
    }

    let isCube = (renderTarget && renderTarget.isWebGLRenderTargetCube);
    let framebuffer;

    if (renderTarget) {
      let renderTargetProperties = this.properties.get(renderTarget);
      if (isCube) {
        framebuffer = renderTargetProperties.__webglFramebuffer[renderTarget.activeCubeFace];
      } else {
        framebuffer = renderTargetProperties.__webglFramebuffer;
      }

      this._currentScissor.copy(renderTarget.scissor);
      this._currentScissorTest = renderTarget.scissorTest;

      this._currentViewport.copy(renderTarget.viewport);
    } else {
      framebuffer = null;

      this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio);
      this._currentScissorTest = this._scissorTest;

      this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio);
    }

    if (this._currentFramebuffer !== framebuffer) {
      this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
      this._currentFramebuffer = framebuffer;
    }

    this.state.scissor(this._currentScissor);
    this.state.setScissorTest(this._currentScissorTest);

    this.state.viewport(this._currentViewport);

    if (isCube) {
      let textureProperties = this.properties.get(renderTarget.texture);
      this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_CUBE_MAP_POSITIVE_X + renderTarget.activeCubeFace, textureProperties.__webglTexture, renderTarget.activeMipMapLevel);
    }
  }

  public setScissor(x, y, width, height) {
    this.state.scissor(this._scissor.set(x, y, width, height));
  }

  public setScissorTest(v: boolean) {
    this.state.setScissorTest(this._scissorTest = v);
  }

  public setSize(width: number, height: number, updateStyle?) {
    this._width = width;
    this._height = height;

    this._canvas.width = width * this._pixelRatio;
    this._canvas.height = height * this._pixelRatio;

    if (updateStyle !== false) {
      this._canvas.style.width = width + 'px';
      this._canvas.style.height = height + 'px';
    }

    this.setViewPort(0, 0, width, height);
  }

  public setTexture2D(texture, slot) {
    let warned = false;
    if (texture && texture.isWebGLRenderTarget) {
      if (!warned) {
        console.warn('WebGLRenderer.setTexture2D: don\'t use render targets as textures. Use their .texture property instead.');
        warned = true;
      }

      texture = texture.texture;
    }

    this.textures.setTexture2D(texture, slot);
  }

  public setViewPort(x: number, y: number, width: number, height: number) {
    this.state.viewport(this._viewport.set(x, y, width, height));
  }
  // setter done.

  // private
  private projectObject(object, camera) {
    if (object.visible === false) {
      return;
    }

    let visible = (object.layers.mask & camera.layers.mask) !== 0;

    if (visible) {
      if (object.isLight) {
        this.lights.push(object);
      } else if (object.isSprite) {
        if (object.frustumCulled === false || this.isSpriteViewable(object)) {
          this.sprites.push(object);
        }
      } else if (object.isLensFlare) {
        this.lensFlares.push(object);
      } else if (object.isImmediateRenderObject) {
        if (this.sortObjects === true) {
          this._vector3.setFromMatrixPosition(object.matrixWorld);
          this._vector3.applyMatrix4(this._projScreenMatrix);
        }
        this.pushRenderItem(object, null, object.material, this._vector3.z, null);
      } else if (object.isMesh || object.isLine || object.isPoints) {
        if (object.isSkinnedMesh) {
          object.skeleton.update();
        }
        if (object.frustumCulled === false || this.isObjectViewable(object)) {
          let material = object.material;
          if (material.visible === true) {
            if (this.sortObjects === true) {
              this._vector3.setFromMatrixPosition(object.matrixWorld);
              this._vector3.applyMatrix4(this._projScreenMatrix);
            }

            let geometry = this.objects.update(object);

            if (material.isMultiMaterial) {
              let groups = geometry.groups;
              let materials = material.materials;

              for (let i = 0, l = groups.length; i < l; i++) {
                let group = groups[i];
                let groupMaterial = materials[group.materialIndex];

                if (groupMaterial.visible === true) {
                  this.pushRenderItem(object, geometry, groupMaterial, this._vector3.z, group);
                }
              }
            } else {
              this.pushRenderItem(object, geometry, material, this._vector3.z, null);
            }
          }
        }
      }
    }

    let children = object.children;
    for (let i = 0, l = children.length; i < l; i++) {
      this.projectObject(children[i], camera);
    }
  }

  private renderObjects(renderList, scene, camera, overrideMaterial?) {
    for (let i = 0, l = renderList.length; i < l; i++) {

      let renderItem = renderList[i];

      let object = renderItem.object;
      let geometry = renderItem.geometry;
      let material = overrideMaterial === undefined ? renderItem.material : overrideMaterial;
      let group = renderItem.group;

      object.modelViewMatrix.multiplyMatrices(camera.matrixWorldInverse, object.matrixWorld);
      object.normalMatrix.getNormalMatrix(object.modelViewMatrix);

      object.onBeforeRender(this, scene, camera, geometry, material, group);

      if (object.isImmediateRenderObject) {
        this.setMaterial(material);
        let program = this.setProgram(camera, scene.fog, material, object);

        this._currentGeometryProgram = '';

        object.render(function (object) {
          this.renderBufferImmediate(object, program, material);
        });
      } else {
        this.renderBufferDirect(camera, scene.fog, geometry, material, object, group);
      }
      object.onAfterRender(this, scene, camera, geometry, material, group);
    }
  }

  private isObjectViewable(object) {
    let geometry = object.geometry;

    if (geometry.boundingSphere === null)
      geometry.computeBoundingSphere();

    this._sphere.copy(geometry.boundingSphere).
      applyMatrix4(object.matrixWorld);

    return this.isSphereViewable(this._sphere);
  }

  private isSpriteViewable(sprite) {
    this._sphere.center.set(0, 0, 0);
    this._sphere.radius = 0.7071067811865476;
    this._sphere.applyMatrix4(sprite.matrixWorld);

    return this.isSphereViewable(this._sphere);
  }

  private isSphereViewable(sphere: Sphere) {
    if (!this._frustum.intersectsSphere(sphere)) {
      return false;
    }

    let numPlanes = this._clipping.numPlanes;

    if (numPlanes === 0) {
      return true;
    }

    let planes = this.clippingPlanes,

      center = sphere.center,
      negRad = - sphere.radius,
      i = 0;

    do {
      // out when deeper than radius in the negative halfspace
      if (planes[i].distanceToPoint(center) < negRad) {
        return false;
      }
    } while (++i !== numPlanes);

    return true;
  }

  private pushRenderItem(object, geometry, material, z, group) {
    let array, index;

    // allocate the next position in the appropriate array
    if (material.transparent) {
      array = this.transparentObjects;
      index = ++this.transparentObjectsLastIndex;
    } else {
      array = this.opaqueObjects;
      index = ++this.opaqueObjectsLastIndex;
    }

    // recycle existing render item or grow the array
    let renderItem = array[index];

    if (renderItem !== undefined) {
      renderItem.id = object.id;
      renderItem.object = object;
      renderItem.geometry = geometry;
      renderItem.material = material;
      renderItem.z = this._vector3.z;
      renderItem.group = group;
    } else {
      renderItem = {
        id: object.id,
        object: object,
        geometry: geometry,
        material: material,
        z: this._vector3.z,
        group: group
      };
      // assert( index === array.length );
      array.push(renderItem);
    }
  }

  private initMaterial(material, fog, object) {
    let materialProperties = this.properties.get(material);

    let parameters = this.programCache.getParameters(
      material, this._lights, fog, this._clipping.numPlanes, this._clipping.numIntersection, object);

    let code = this.programCache.getProgramCode(material, parameters);

    let program = materialProperties.program;
    let programChange = true;

    if (program === undefined) {
      // new material
      material.addEventListener('dispose', this.onMaterialDispose);
    } else if (program.code !== code) {
      // changed glsl or parameters
      this.releaseMaterialProgramReference(material);
    } else if (parameters.shaderID !== undefined) {
      // same glsl and uniform list
      return;
    } else {
      // only rebuild uniform list
      programChange = false;
    }

    if (programChange) {
      if (parameters.shaderID) {
        let shader = ShaderLib[parameters.shaderID];

        materialProperties.__webglShader = {
          name: material.type,
          uniforms: UniformsUtils.clone(shader.uniforms),
          vertexShader: shader.vertexShader,
          fragmentShader: shader.fragmentShader
        };
      } else {
        materialProperties.__webglShader = {
          name: material.type,
          uniforms: material.uniforms,
          vertexShader: material.vertexShader,
          fragmentShader: material.fragmentShader
        };
      }
      material.__webglShader = materialProperties.__webglShader;

      program = this.programCache.acquireProgram(material, parameters, code);

      materialProperties.program = program;
      material.program = program;
    }

    let attributes = program.getAttributes();

    if (material.morphTargets) {
      material.numSupportedMorphTargets = 0;
      for (let i = 0; i < this.maxMorphTargets; i++) {
        if (attributes['morphTarget' + i] >= 0) {
          material.numSupportedMorphTargets++;
        }
      }
    }

    if (material.morphNormals) {
      material.numSupportedMorphNormals = 0;

      for (let i = 0; i < this.maxMorphNormals; i++) {
        if (attributes['morphNormal' + i] >= 0) {
          material.numSupportedMorphNormals++;
        }
      }
    }

    let uniforms = materialProperties.__webglShader.uniforms;

    if (!material.isShaderMaterial &&
      !material.isRawShaderMaterial ||
      material.clipping === true) {

      materialProperties.numClippingPlanes = this._clipping.numPlanes;
      materialProperties.numIntersection = this._clipping.numIntersection;
      uniforms.clippingPlanes = this._clipping.uniform;
    }

    materialProperties.fog = fog;

    // store the light setup it was created for
    materialProperties.lightsHash = this._lights.hash;

    if (material.lights) {
      // wire up the material to this renderer's lighting state
      uniforms.ambientLightColor.value = this._lights.ambient;
      uniforms.directionalLights.value = this._lights.directional;
      uniforms.spotLights.value = this._lights.spot;
      uniforms.rectAreaLights.value = this._lights.rectArea;
      uniforms.pointLights.value = this._lights.point;
      uniforms.hemisphereLights.value = this._lights.hemi;

      uniforms.directionalShadowMap.value = this._lights.directionalShadowMap;
      uniforms.directionalShadowMatrix.value = this._lights.directionalShadowMatrix;
      uniforms.spotShadowMap.value = this._lights.spotShadowMap;
      uniforms.spotShadowMatrix.value = this._lights.spotShadowMatrix;
      uniforms.pointShadowMap.value = this._lights.pointShadowMap;
      uniforms.pointShadowMatrix.value = this._lights.pointShadowMatrix;
      // TODO (abelnation): add area lights shadow info to uniforms
    }

    let progUniforms = materialProperties.program.getUniforms(),
      uniformsList =
        WebGLUniforms.seqWithValue(progUniforms.seq, uniforms);

    materialProperties.uniformsList = uniformsList;
  }

  private setMaterial(material) {
    material.side === DoubleSide
      ? this.state.disable(this._gl.CULL_FACE)
      : this.state.enable(this._gl.CULL_FACE);

    this.state.setFlipSided(material.side === BackSide);

    material.transparent === true
      ? this.state.setBlending(material.blending, material.blendEquation, material.blendSrc, material.blendDst, material.blendEquationAlpha, material.blendSrcAlpha, material.blendDstAlpha, material.premultipliedAlpha)
      : this.state.setBlending(NoBlending);

    this.state.setDepthFunc(material.depthFunc);
    this.state.setDepthTest(material.depthTest);
    this.state.setDepthWrite(material.depthWrite);
    this.state.setColorWrite(material.colorWrite);
    this.state.setPolygonOffset(material.polygonOffset, material.polygonOffsetFactor, material.polygonOffsetUnits);
  }

  private setProgram(camera, fog, material, object) {
    this._usedTextureUnits = 0;

    let materialProperties = this.properties.get(material);

    if (this._clippingEnabled) {
      if (this._localClippingEnabled || camera !== this._currentCamera) {

        let useCache =
          camera === this._currentCamera &&
          material.id === this._currentMaterialId;

        // we might want to call this function with some ClippingGroup
        // object instead of the material, once it becomes feasible
        // (#8465, #8379)
        this._clipping.setState(
          material.clippingPlanes, material.clipIntersection, material.clipShadows,
          camera, materialProperties, useCache);
      }
    }

    if (material.needsUpdate === false) {
      if (materialProperties.program === undefined) {
        material.needsUpdate = true;
      } else if (material.fog && materialProperties.fog !== fog) {
        material.needsUpdate = true;
      } else if (material.lights && materialProperties.lightsHash !== this._lights.hash) {
        material.needsUpdate = true;
      } else if (materialProperties.numClippingPlanes !== undefined &&
        (materialProperties.numClippingPlanes !== this._clipping.numPlanes ||
          materialProperties.numIntersection !== this._clipping.numIntersection)) {
        material.needsUpdate = true;
      }
    }

    if (material.needsUpdate) {
      this.initMaterial(material, fog, object);
      material.needsUpdate = false;
    }

    let refreshProgram = false;
    let refreshMaterial = false;
    let refreshLights = false;

    let program = materialProperties.program,
      p_uniforms = program.getUniforms(),
      m_uniforms = materialProperties.__webglShader.uniforms;

    if (program.id !== this._currentProgram) {
      this._gl.useProgram(program.program);
      this._currentProgram = program.id;

      refreshProgram = true;
      refreshMaterial = true;
      refreshLights = true;
    }

    if (material.id !== this._currentMaterialId) {
      this._currentMaterialId = material.id;
      refreshMaterial = true;
    }

    if (refreshProgram || camera !== this._currentCamera) {
      p_uniforms.set(this._gl, camera, 'projectionMatrix');

      if (this.capabilities.logarithmicDepthBuffer) {
        p_uniforms.setValue(this._gl, 'logDepthBufFC',
          2.0 / (Math.log(camera.far + 1.0) / Math.LN2));
      }


      if (camera !== this._currentCamera) {
        this._currentCamera = camera;

        // lighting uniforms depend on the camera so enforce an update
        // now, in case this material supports lights - or later, when
        // the next material that does gets activated:
        refreshMaterial = true;		// set to true on material change
        refreshLights = true;		// remains set until update done
      }

      // load material specific uniforms
      // (shader material also gets them for the sake of genericity)
      if (material.isShaderMaterial ||
        material.isMeshPhongMaterial ||
        material.isMeshStandardMaterial ||
        material.envMap) {
        let uCamPos = p_uniforms.map.cameraPosition;

        if (uCamPos !== undefined) {
          uCamPos.setValue(this._gl,
            this._vector3.setFromMatrixPosition(camera.matrixWorld));
        }
      }

      if (material.isMeshPhongMaterial ||
        material.isMeshLambertMaterial ||
        material.isMeshBasicMaterial ||
        material.isMeshStandardMaterial ||
        material.isShaderMaterial ||
        material.skinning) {
        p_uniforms.setValue(this._gl, 'viewMatrix', camera.matrixWorldInverse);
      }

      p_uniforms.set(this._gl, this, 'toneMappingExposure');
      p_uniforms.set(this._gl, this, 'toneMappingWhitePoint');
    }

    // skinning uniforms must be set even if material didn't change
    // auto-setting of texture unit for bone texture must go before other textures
    // not sure why, but otherwise weird things happen

    if (material.skinning) {
      p_uniforms.setOptional(this._gl, object, 'bindMatrix');
      p_uniforms.setOptional(this._gl, object, 'bindMatrixInverse');

      let skeleton = object.skeleton;

      if (skeleton) {
        if (this.capabilities.floatVertexTextures && skeleton.useVertexTexture) {
          p_uniforms.set(this._gl, skeleton, 'boneTexture');
          p_uniforms.set(this._gl, skeleton, 'boneTextureWidth');
          p_uniforms.set(this._gl, skeleton, 'boneTextureHeight');
        } else {
          p_uniforms.setOptional(this._gl, skeleton, 'boneMatrices');
        }
      }
    }

    if (refreshMaterial) {
      if (material.lights) {
        // the current material requires lighting info

        // note: all lighting uniforms are always set correctly
        // they simply reference the renderer's state for their
        // values
        //
        // use the current material's .needsUpdate flags to set
        // the GL state when required
        markUniformsLightsNeedsUpdate(m_uniforms, refreshLights);
      }

      // refresh uniforms common to several materials
      if (fog && material.fog) {
        refreshUniformsFog(m_uniforms, fog);
      }

      if (material.isMeshBasicMaterial ||
        material.isMeshLambertMaterial ||
        material.isMeshPhongMaterial ||
        material.isMeshStandardMaterial ||
        material.isMeshNormalMaterial ||
        material.isMeshDepthMaterial) {
        refreshUniformsCommon(m_uniforms, material);
      }

      // refresh single material specific uniforms
      if (material.isLineBasicMaterial) {
        refreshUniformsLine(m_uniforms, material);
      } else if (material.isLineDashedMaterial) {
        refreshUniformsLine(m_uniforms, material);
        refreshUniformsDash(m_uniforms, material);
      } else if (material.isPointsMaterial) {
        refreshUniformsPoints(m_uniforms, material, this._height, this._pixelRatio);
      } else if (material.isMeshLambertMaterial) {
        refreshUniformsLambert(m_uniforms, material);
      } else if (material.isMeshToonMaterial) {
        refreshUniformsToon(m_uniforms, material);
      } else if (material.isMeshPhongMaterial) {
        refreshUniformsPhong(m_uniforms, material);
      } else if (material.isMeshPhysicalMaterial) {
        refreshUniformsPhysical(m_uniforms, material);
      } else if (material.isMeshStandardMaterial) {
        refreshUniformsStandard(m_uniforms, material);
      } else if (material.isMeshDepthMaterial) {
        if (material.displacementMap) {
          m_uniforms.displacementMap.value = material.displacementMap;
          m_uniforms.displacementScale.value = material.displacementScale;
          m_uniforms.displacementBias.value = material.displacementBias;
        }
      } else if (material.isMeshNormalMaterial) {
        refreshUniformsNormal(m_uniforms, material);
      }

      // RectAreaLight Texture
      // TODO (mrdoob): Find a nicer implementation
      // if (m_uniforms.ltcMat !== undefined) m_uniforms.ltcMat.value = THREE.UniformsLib.LTC_MAT_TEXTURE;
      // if (m_uniforms.ltcMag !== undefined) m_uniforms.ltcMag.value = THREE.UniformsLib.LTC_MAG_TEXTURE;

      WebGLUniforms.upload(
        this._gl, materialProperties.uniformsList, m_uniforms, this);
    }

    // common matrices
    p_uniforms.set(this._gl, object, 'modelViewMatrix');
    p_uniforms.set(this._gl, object, 'normalMatrix');
    p_uniforms.setValue(this._gl, 'modelMatrix', object.matrixWorld);

    return program;
  }

  private setDefaultGLState() {
    this.state.init();

    this.state.scissor(this._currentScissor.copy(this._scissor).multiplyScalar(this._pixelRatio));
    this.state.viewport(this._currentViewport.copy(this._viewport).multiplyScalar(this._pixelRatio));

    this.state.buffers.color.setClear(this._clearColor.r, this._clearColor.g, this._clearColor.b, this._clearAlpha, this._premultipliedAlpha);
  }

  public setupVertexAttributes(material, program, geometry, startIndex = 0) {
    let extension;

    if (geometry && geometry.isInstancedBufferGeometry) {
      extension = this.extensions.get('ANGLE_instanced_arrays');

      if (extension === null) {
        console.error('WebGLRenderer.setupVertexAttributes: using InstancedBufferGeometry but hardware does not support extension ANGLE_instanced_arrays.');
        return;
      }
    }

    this.state.initAttributes();

    let geometryAttributes = geometry.attributes;

    let programAttributes = program.getAttributes();

    let materialDefaultAttributeValues = material.defaultAttributeValues;

    for (let name in programAttributes) {
      let programAttribute = programAttributes[name];

      if (programAttribute >= 0) {
        let geometryAttribute = geometryAttributes[name];

        if (geometryAttribute !== undefined) {
          let normalized = geometryAttribute.normalized;
          let size = geometryAttribute.itemSize;

          let attributeProperties = this.objects.getAttributeProperties(geometryAttribute);

          let buffer = attributeProperties.__webglBuffer;
          let type = attributeProperties.type;
          let bytesPerElement = attributeProperties.bytesPerElement;

          if (geometryAttribute.isInterleavedBufferAttribute) {
            let data = geometryAttribute.data;
            let stride = data.stride;
            let offset = geometryAttribute.offset;

            if (data && data.isInstancedInterleavedBuffer) {
              this.state.enableAttributeAndDivisor(programAttribute, data.meshPerAttribute, extension);

              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = data.meshPerAttribute * data.count;
              }
            } else {
              this.state.enableAttribute(programAttribute);
            }

            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
            this._gl.vertexAttribPointer(programAttribute, size, type, normalized, stride * bytesPerElement, (startIndex * stride + offset) * bytesPerElement);
          } else {
            if (geometryAttribute.isInstancedBufferAttribute) {
              this.state.enableAttributeAndDivisor(programAttribute, geometryAttribute.meshPerAttribute, extension);
              if (geometry.maxInstancedCount === undefined) {
                geometry.maxInstancedCount = geometryAttribute.meshPerAttribute * geometryAttribute.count;
              }
            } else {
              this.state.enableAttribute(programAttribute);
            }
            this._gl.bindBuffer(this._gl.ARRAY_BUFFER, buffer);
            this._gl.vertexAttribPointer(programAttribute, size, type, normalized, 0, startIndex * size * bytesPerElement);
          }
        } else if (materialDefaultAttributeValues !== undefined) {
          let value = materialDefaultAttributeValues[name];

          if (value !== undefined) {

            switch (value.length) {

              case 2:
                this._gl.vertexAttrib2fv(programAttribute, value);
                break;

              case 3:
                this._gl.vertexAttrib3fv(programAttribute, value);
                break;

              case 4:
                this._gl.vertexAttrib4fv(programAttribute, value);
                break;

              default:
                this._gl.vertexAttrib1fv(programAttribute, value);
            }

          }

        }

      }

    }

    this.state.disableUnusedAttributes();
  }

  public getTargetPixelRatio() {
    return this._currentRenderTarget === null ? this._pixelRatio : 1;
  }

  // Lighting
  private setupShadows(lights) {
    let lightShadowsLength = 0;

    for (let i = 0, l = lights.length; i < l; i++) {
      let light = lights[i];

      if (light.castShadow) {
        this._lights.shadows[lightShadowsLength++] = light;
      }
    }
    this._lights.shadows.length = lightShadowsLength;
  }

  private setupLights(lights, camera) {
    let l, ll, light,
      r = 0, g = 0, b = 0,
      color,
      intensity,
      distance,
      shadowMap,

      viewMatrix = camera.matrixWorldInverse,

      directionalLength = 0,
      pointLength = 0,
      spotLength = 0,
      rectAreaLength = 0,
      hemiLength = 0;

    for (l = 0, ll = lights.length; l < ll; ++l) {
      light = lights[l];

      color = light.color;
      intensity = light.intensity;
      distance = light.distance;

      shadowMap = (light.shadow && light.shadow.map) ? light.shadow.map.texture : null;

      if (light.isAmbientLight) {
        r += color.r * intensity;
        g += color.g * intensity;
        b += color.b * intensity;
      } else if (light.isDirectionalLight) {
        let uniforms = this.lightCache.get(light);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity);
        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this._vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(this._vector3);
        uniforms.direction.transformDirection(viewMatrix);

        uniforms.shadow = light.castShadow;

        if (light.castShadow) {

          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;

        }

        this._lights.directionalShadowMap[directionalLength] = shadowMap;
        this._lights.directionalShadowMatrix[directionalLength] = light.shadow.matrix;
        this._lights.directional[directionalLength++] = uniforms;
      } else if (light.isSpotLight) {
        let uniforms = this.lightCache.get(light);

        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        uniforms.color.copy(color).multiplyScalar(intensity);
        uniforms.distance = distance;

        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        this._vector3.setFromMatrixPosition(light.target.matrixWorld);
        uniforms.direction.sub(this._vector3);
        uniforms.direction.transformDirection(viewMatrix);

        uniforms.coneCos = Math.cos(light.angle);
        uniforms.penumbraCos = Math.cos(light.angle * (1 - light.penumbra));
        uniforms.decay = (light.distance === 0) ? 0.0 : light.decay;

        uniforms.shadow = light.castShadow;

        if (light.castShadow) {
          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;
        }

        this._lights.spotShadowMap[spotLength] = shadowMap;
        this._lights.spotShadowMatrix[spotLength] = light.shadow.matrix;
        this._lights.spot[spotLength++] = uniforms;
      } else if (light.isRectAreaLight) {
        let uniforms = this.lightCache.get(light);

        // (a) intensity controls irradiance of entire light
        uniforms.color
          .copy(color)
          .multiplyScalar(intensity / (light.width * light.height));

        // (b) intensity controls the radiance per light area
        // uniforms.color.copy( color ).multiplyScalar( intensity );
        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        // extract local rotation of light to derive width/height half vectors
        this._matrix42.identity();
        this._matrix4.copy(light.matrixWorld);
        this._matrix4.premultiply(viewMatrix);
        this._matrix42.extractRotation(this._matrix4);

        uniforms.halfWidth.set(light.width * 0.5, 0.0, 0.0);
        uniforms.halfHeight.set(0.0, light.height * 0.5, 0.0);

        uniforms.halfWidth.applyMatrix4(this._matrix42);
        uniforms.halfHeight.applyMatrix4(this._matrix42);

        // TODO (abelnation): RectAreaLight distance?
        // uniforms.distance = distance;
        this._lights.rectArea[rectAreaLength++] = uniforms;
      } else if (light.isPointLight) {
        let uniforms = this.lightCache.get(light);

        uniforms.position.setFromMatrixPosition(light.matrixWorld);
        uniforms.position.applyMatrix4(viewMatrix);

        uniforms.color.copy(light.color).multiplyScalar(light.intensity);
        uniforms.distance = light.distance;
        uniforms.decay = (light.distance === 0) ? 0.0 : light.decay;

        uniforms.shadow = light.castShadow;

        if (light.castShadow) {
          uniforms.shadowBias = light.shadow.bias;
          uniforms.shadowRadius = light.shadow.radius;
          uniforms.shadowMapSize = light.shadow.mapSize;
        }

        this._lights.pointShadowMap[pointLength] = shadowMap;

        if (this._lights.pointShadowMatrix[pointLength] === undefined) {
          this._lights.pointShadowMatrix[pointLength] = new Matrix4();
        }

        // for point lights we set the shadow matrix to be a translation-only matrix
        // equal to inverse of the light's position
        this._vector3.setFromMatrixPosition(light.matrixWorld).negate();
        this._lights.pointShadowMatrix[pointLength].identity().setPosition(this._vector3);

        this._lights.point[pointLength++] = uniforms;
      } else if (light.isHemisphereLight) {
        let uniforms = this.lightCache.get(light);

        uniforms.direction.setFromMatrixPosition(light.matrixWorld);
        uniforms.direction.transformDirection(viewMatrix);
        uniforms.direction.normalize();

        uniforms.skyColor.copy(light.color).multiplyScalar(intensity);
        uniforms.groundColor.copy(light.groundColor).multiplyScalar(intensity);

        this._lights.hemi[hemiLength++] = uniforms;
      }
    }

    this._lights.ambient[0] = r;
    this._lights.ambient[1] = g;
    this._lights.ambient[2] = b;

    this._lights.directional.length = directionalLength;
    this._lights.spot.length = spotLength;
    this._lights.rectArea.length = rectAreaLength;
    this._lights.point.length = pointLength;
    this._lights.hemi.length = hemiLength;

    this._lights.hash = directionalLength + ',' + pointLength + ',' + spotLength + ',' + rectAreaLength + ',' + hemiLength + ',' + this._lights.shadows.length;
  }

  // event
  private onContextLost(event) {
    event.preventDefault();
    this.resetGLState();
    this.setDefaultGLState();
    this.properties.clear();
  }

  private onMaterialDispose(event) {
    let material = event.target;

    material.removeEventListener('dispose', this.onMaterialDispose);

    this.deallocateMaterial(material);
  }

  private deallocateMaterial(material) {
    this.releaseMaterialProgramReference(material);

    this.properties.delete(material);
  }

  private releaseMaterialProgramReference(material) {
    let programInfo = this.properties.get(material).program;

    material.program = undefined;

    if (programInfo !== undefined) {
      this.programCache.releaseProgram(programInfo);
    }
  }

  // mapping
  private paramThreeToGL(p) {
    let extension;

    if (p === RepeatWrapping) return this._gl.REPEAT;
    if (p === ClampToEdgeWrapping) return this._gl.CLAMP_TO_EDGE;
    if (p === MirroredRepeatWrapping) return this._gl.MIRRORED_REPEAT;

    if (p === NearestFilter) return this._gl.NEAREST;
    if (p === NearestMipMapNearestFilter) return this._gl.NEAREST_MIPMAP_NEAREST;
    if (p === NearestMipMapLinearFilter) return this._gl.NEAREST_MIPMAP_LINEAR;

    if (p === LinearFilter) return this._gl.LINEAR;
    if (p === LinearMipMapNearestFilter) return this._gl.LINEAR_MIPMAP_NEAREST;
    if (p === LinearMipMapLinearFilter) return this._gl.LINEAR_MIPMAP_LINEAR;

    if (p === UnsignedByteType) return this._gl.UNSIGNED_BYTE;
    if (p === UnsignedShort4444Type) return this._gl.UNSIGNED_SHORT_4_4_4_4;
    if (p === UnsignedShort5551Type) return this._gl.UNSIGNED_SHORT_5_5_5_1;
    if (p === UnsignedShort565Type) return this._gl.UNSIGNED_SHORT_5_6_5;

    if (p === ByteType) return this._gl.BYTE;
    if (p === ShortType) return this._gl.SHORT;
    if (p === UnsignedShortType) return this._gl.UNSIGNED_SHORT;
    if (p === IntType) return this._gl.INT;
    if (p === UnsignedIntType) return this._gl.UNSIGNED_INT;
    if (p === FloatType) return this._gl.FLOAT;

    if (p === HalfFloatType) {
      extension = this.extensions.get('OES_texture_half_float');

      if (extension !== null) return extension.HALF_FLOAT_OES;
    }

    if (p === AlphaFormat) return this._gl.ALPHA;
    if (p === RGBFormat) return this._gl.RGB;
    if (p === RGBAFormat) return this._gl.RGBA;
    if (p === LuminanceFormat) return this._gl.LUMINANCE;
    if (p === LuminanceAlphaFormat) return this._gl.LUMINANCE_ALPHA;
    if (p === DepthFormat) return this._gl.DEPTH_COMPONENT;
    if (p === DepthStencilFormat) return this._gl.DEPTH_STENCIL;

    if (p === AddEquation) return this._gl.FUNC_ADD;
    if (p === SubtractEquation) return this._gl.FUNC_SUBTRACT;
    if (p === ReverseSubtractEquation) return this._gl.FUNC_REVERSE_SUBTRACT;

    if (p === ZeroFactor) return this._gl.ZERO;
    if (p === OneFactor) return this._gl.ONE;
    if (p === SrcColorFactor) return this._gl.SRC_COLOR;
    if (p === OneMinusSrcColorFactor) return this._gl.ONE_MINUS_SRC_COLOR;
    if (p === SrcAlphaFactor) return this._gl.SRC_ALPHA;
    if (p === OneMinusSrcAlphaFactor) return this._gl.ONE_MINUS_SRC_ALPHA;
    if (p === DstAlphaFactor) return this._gl.DST_ALPHA;
    if (p === OneMinusDstAlphaFactor) return this._gl.ONE_MINUS_DST_ALPHA;

    if (p === DstColorFactor) return this._gl.DST_COLOR;
    if (p === OneMinusDstColorFactor) return this._gl.ONE_MINUS_DST_COLOR;
    if (p === SrcAlphaSaturateFactor) return this._gl.SRC_ALPHA_SATURATE;

    if (p === RGB_S3TC_DXT1_Format || p === RGBA_S3TC_DXT1_Format ||
      p === RGBA_S3TC_DXT3_Format || p === RGBA_S3TC_DXT5_Format) {

      extension = this.extensions.get('WEBGL_compressed_texture_s3tc');

      if (extension !== null) {

        if (p === RGB_S3TC_DXT1_Format) return extension.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (p === RGBA_S3TC_DXT1_Format) return extension.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (p === RGBA_S3TC_DXT3_Format) return extension.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (p === RGBA_S3TC_DXT5_Format) return extension.COMPRESSED_RGBA_S3TC_DXT5_EXT;

      }

    }

    if (p === RGB_PVRTC_4BPPV1_Format || p === RGB_PVRTC_2BPPV1_Format ||
      p === RGBA_PVRTC_4BPPV1_Format || p === RGBA_PVRTC_2BPPV1_Format) {

      extension = this.extensions.get('WEBGL_compressed_texture_pvrtc');

      if (extension !== null) {

        if (p === RGB_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (p === RGB_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (p === RGBA_PVRTC_4BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (p === RGBA_PVRTC_2BPPV1_Format) return extension.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;

      }

    }

    if (p === RGB_ETC1_Format) {

      extension = this.extensions.get('WEBGL_compressed_texture_etc1');

      if (extension !== null) return extension.COMPRESSED_RGB_ETC1_WEBGL;

    }

    if (p === MinEquation || p === MaxEquation) {

      extension = this.extensions.get('EXT_blend_minmax');

      if (extension !== null) {

        if (p === MinEquation) return extension.MIN_EXT;
        if (p === MaxEquation) return extension.MAX_EXT;

      }

    }

    if (p === UnsignedInt248Type) {

      extension = this.extensions.get('WEBGL_depth_texture');

      if (extension !== null) return extension.UNSIGNED_INT_24_8_WEBGL;

    }

    return 0;

  }

}
