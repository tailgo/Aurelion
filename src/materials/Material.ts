import { EventDispatcher } from '../core/EventDispatcher';
import { NoColors, FrontSide, SmoothShading, NormalBlending, LessEqualDepth, AddEquation, OneMinusSrcAlphaFactor, SrcAlphaFactor } from '../constants';
import { MathTool } from '../math/MathTool';

let materialId = 0;

export class Material extends EventDispatcher {

  public readonly id: number;
  public isMateril: boolean;
  public name: string;
  public type: string;
  public uuid: string;

  public alphaTest: number;

  public blendDst: number;
  public blendDstAlpha: number;
  public blendEquation: number;
  public blendEquationAlpha: number;

  public blending;

  public blendSrc: number;
  public blendSrcAlpha: number;

  public clipIntersection: boolean;
  public clippingPlanes;
  public clipShadows: boolean;

  public colorWrite: boolean;

  public depthFunc: number;
  public depthTest: boolean;
  public depthWrite: boolean;

  public fog: boolean;

  public lights: boolean;

  public opacity: number;

  public overdraw: number;

  public polygonOffset: boolean;
  public polygonOffsetFactor: number;
  public polygonOffsetUnits: number;

  public precision: string;

  public premultipliedAlpha: boolean;
  public shading: number;

  public side: number;

  public transparent: boolean;

  public vertexColors: number;

  public visible: boolean;

  private _needsUpdate: boolean;

  constructor() {
    super();

    this.id = materialId++;
    this.uuid = MathTool.generateUUID();
    this.name = '';
    this.type = 'Material';

    this.fog = true;
    this.lights = true;

    this.blending = NormalBlending;
    this.side = FrontSide;

    // FlatShading, SmoothShading
    this.shading = SmoothShading;

    // NoColors, VertexColors, FaceColors
    this.vertexColors = NoColors;

    this.opacity = 1;
    this.transparent = false;

    this.blendSrc = SrcAlphaFactor;
    this.blendDst = OneMinusSrcAlphaFactor;
    this.blendEquation = AddEquation;
    this.blendSrcAlpha = null;
    this.blendDstAlpha = null;
    this.blendEquationAlpha = null;

    this.depthFunc = LessEqualDepth;
    this.depthTest = true;
    this.depthWrite = true;

    this.clippingPlanes = null;
    this.clipIntersection = false;
    this.clipShadows = false;

    this.colorWrite = true;

    this.precision = null;

    this.polygonOffset = false;
    this.polygonOffsetFactor = 0;
    this.polygonOffsetUnits = 0;

    this.alphaTest = 0;
    this.premultipliedAlpha = false;

    this.overdraw = 0;

    this.visible = true;
    this._needsUpdate = true;
  }

  get needsUpdate() {
    return this._needsUpdate;
  }

  set needsUpdate(v: boolean) {
    if (v === true) {
      this.update();
    }

    this._needsUpdate = v;
  }

  public clone() {
    return new Material().copy(this);
  }

  public copy(source) {
    this.name = source.name;

    this.fog = source.fog;
    this.lights = source.lights;

    this.blending = source.blending;
    this.side = source.side;
    this.shading = source.shading;
    this.vertexColors = source.vertexColors;

    this.opacity = source.opacity;
    this.transparent = source.transparent;

    this.blendSrc = source.blendSrc;
    this.blendDst = source.blendDst;
    this.blendEquation = source.blendEquation;
    this.blendSrcAlpha = source.blendSrcAlpha;
    this.blendDstAlpha = source.blendDstAlpha;
    this.blendEquationAlpha = source.blendEquationAlpha;

    this.depthFunc = source.depthFunc;
    this.depthTest = source.depthTest;
    this.depthWrite = source.depthWrite;

    this.colorWrite = source.colorWrite;

    this.precision = source.precision;

    this.polygonOffset = source.polygonOffset;
    this.polygonOffsetFactor = source.polygonOffsetFactor;
    this.polygonOffsetUnits = source.polygonOffsetUnits;

    this.alphaTest = source.alphaTest;

    this.premultipliedAlpha = source.premultipliedAlpha;

    this.overdraw = source.overdraw;

    this.visible = source.visible;
    this.clipShadows = source.clipShadows;
    this.clipIntersection = source.clipIntersection;

    let srcPlanes = source.clippingPlanes,
      dstPlanes = null;

    if (srcPlanes !== null) {

      let n = srcPlanes.length;
      dstPlanes = new Array(n);

      for (let i = 0; i !== n; ++i)
        dstPlanes[i] = srcPlanes[i].clone();

    }

    this.clippingPlanes = dstPlanes;

    return this;
  }

  public dispose() {
    this.dispatchEvent({type: 'dispose'});
  }

  public setValues(values) {

    for (let key in values) {
      let newValue = values[key];

      if (newValue === undefined) {
        console.warn('AL.Material: "' + key + '" parameter is undefined.');
        continue;
      }

      let currentValue = this[key];

      if (currentValue === undefined) {
        console.warn('AL.' + this.type + ': \'' + key + '\' is not a property of this material.');
        continue;
      }

      if (currentValue && currentValue.isColor) {
        currentValue.set(newValue);
      } else if ((currentValue && currentValue.isVector3) && (newValue && newValue.isVector3)) {
        currentValue.copy(newValue);
      } else if (key === 'overdraw') {
        // ensure overdraw is backwards-compatible with legacy boolean type
        this[key] = Number(newValue);
      } else {
        this[key] = newValue;
      }
    }
  }

  public update() {
    this.dispatchEvent({type: 'update'});
  }

}
