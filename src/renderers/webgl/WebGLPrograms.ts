import { WebGLProgram } from './WebGLProgram';
import {
  BackSide, DoubleSide, FlatShading, CubeUVRefractionMapping, CubeUVReflectionMapping, GammaEncoding, LinearEncoding
} from '../../Constants';

const shaderIDs = {
  MeshDepthMaterial: 'depth',
  MeshNormalMaterial: 'normal',
  MeshBasicMaterial: 'basic',
  MeshLambertMaterial: 'lambert',
  MeshPhongMaterial: 'phong',
  MeshToonMaterial: 'phong',
  MeshStandardMaterial: 'physical',
  MeshPhysicalMaterial: 'physical',
  LineBasicMaterial: 'basic',
  LineDashedMaterial: 'dashed',
  PointsMaterial: 'points'
};

const parameterNames = [
  'precision', 'supportsVertexTextures', 'map', 'mapEncoding', 'envMap', 'envMapMode', 'envMapEncoding',
  'lightMap', 'aoMap', 'emissiveMap', 'emissiveMapEncoding', 'bumpMap', 'normalMap', 'displacementMap', 'specularMap',
  'roughnessMap', 'metalnessMap', 'gradientMap',
  'alphaMap', 'combine', 'vertexColors', 'fog', 'useFog', 'fogExp',
  'flatShading', 'sizeAttenuation', 'logarithmicDepthBuffer', 'skinning',
  'maxBones', 'useVertexTexture', 'morphTargets', 'morphNormals',
  'maxMorphTargets', 'maxMorphNormals', 'premultipliedAlpha',
  'numDirLights', 'numPointLights', 'numSpotLights', 'numHemiLights', 'numRectAreaLights',
  'shadowMapEnabled', 'shadowMapType', 'toneMapping', 'physicallyCorrectLights',
  'alphaTest', 'doubleSided', 'flipSided', 'numClippingPlanes', 'numClipIntersection', 'depthPacking'
];

export class WebGLPrograms {

  public programs;

  private renderer;
  private capabilities;

  constructor(renderer, capabilities) {
    this.renderer = renderer;
    this.capabilities = capabilities;

    this.programs = [];
  }

  public getParameters(material, lights, fog, nClipPlanes, nClipIntersection, object) {
    let shaderID = shaderIDs[material.type];

    // heuristics to create shader parameters according to lights in the scene
    // (not to blow over maxLights budget)
    let maxBones = this.allocateBones(object);
    let precision = this.renderer.getPrecision();

    if (material.precision !== null) {
      precision = this.capabilities.getMaxPrecision(material.precision);
      if (precision !== material.precision) {
        console.warn('WebGLProgram.getParameters:', material.precision, 'not supported, using', precision, 'instead.');
      }
    }

    let currentRenderTarget = this.renderer.getCurrentRenderTarget();

    let parameters = {
      shaderID: shaderID,

      precision: precision,
      supportsVertexTextures: this.capabilities.vertexTextures,
      outputEncoding: this.getTextureEncodingFromMap((!currentRenderTarget) ? null : currentRenderTarget.texture, this.renderer.gammaOutput),
      map: !!material.map,
      mapEncoding: this.getTextureEncodingFromMap(material.map, this.renderer.gammaInput),
      envMap: !!material.envMap,
      envMapMode: material.envMap && material.envMap.mapping,
      envMapEncoding: this.getTextureEncodingFromMap(material.envMap, this.renderer.gammaInput),
      envMapCubeUV: (!!material.envMap) && ((material.envMap.mapping === CubeUVReflectionMapping) || (material.envMap.mapping === CubeUVRefractionMapping)),
      lightMap: !!material.lightMap,
      aoMap: !!material.aoMap,
      emissiveMap: !!material.emissiveMap,
      emissiveMapEncoding: this.getTextureEncodingFromMap(material.emissiveMap, this.renderer.gammaInput),
      bumpMap: !!material.bumpMap,
      normalMap: !!material.normalMap,
      displacementMap: !!material.displacementMap,
      roughnessMap: !!material.roughnessMap,
      metalnessMap: !!material.metalnessMap,
      specularMap: !!material.specularMap,
      alphaMap: !!material.alphaMap,

      gradientMap: !!material.gradientMap,

      combine: material.combine,

      vertexColors: material.vertexColors,

      fog: !!fog,
      useFog: material.fog,
      fogExp: (fog && fog.isFogExp2),

      flatShading: material.shading === FlatShading,

      sizeAttenuation: material.sizeAttenuation,
      logarithmicDepthBuffer: this.capabilities.logarithmicDepthBuffer,

      skinning: material.skinning,
      maxBones: maxBones,
      useVertexTexture: this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture,

      morphTargets: material.morphTargets,
      morphNormals: material.morphNormals,
      maxMorphTargets: this.renderer.maxMorphTargets,
      maxMorphNormals: this.renderer.maxMorphNormals,

      numDirLights: lights.directional.length,
      numPointLights: lights.point.length,
      numSpotLights: lights.spot.length,
      numRectAreaLights: lights.rectArea.length,
      numHemiLights: lights.hemi.length,

      numClippingPlanes: nClipPlanes,
      numClipIntersection: nClipIntersection,

      shadowMapEnabled: this.renderer.shadowMap.enabled && object.receiveShadow && lights.shadows.length > 0,
      shadowMapType: this.renderer.shadowMap.type,

      toneMapping: this.renderer.toneMapping,
      physicallyCorrectLights: this.renderer.physicallyCorrectLights,

      premultipliedAlpha: material.premultipliedAlpha,

      alphaTest: material.alphaTest,
      doubleSided: material.side === DoubleSide,
      flipSided: material.side === BackSide,

      depthPacking: (material.depthPacking !== undefined) ? material.depthPacking : false

    };

    return parameters;
  }

  public getProgramCode(material, parameters) {
    let array = [];

    if (parameters.shaderID) {
      array.push(parameters.shaderID);
    } else {
      array.push(material.fragmentShader);
      array.push(material.vertexShader);
    }

    if (material.defines !== undefined) {
      for (let name in material.defines) {
        array.push(name);
        array.push(material.defines[name]);
      }
    }

    for (let i = 0; i < parameterNames.length; i++) {
      array.push(parameters[parameterNames[i]]);
    }

    return array.join();
  }

  public acquireProgram(material, parameters, code) {
    let program;

    // Check if code has been already compiled
    for (let p = 0, pl = this.programs.length; p < pl; p++) {
      let programInfo = this.programs[p];
      if (programInfo.code === code) {
        program = programInfo;
        ++program.usedTimes;
        break;
      }
    }

    if (program === undefined) {
      program = new WebGLProgram(this.renderer, code, material, parameters);
      this.programs.push(program);
    }

    return program;
  }

  public releaseProgram(program) {
    if (--program.usedTimes === 0) {

      // Remove from unordered set
      let i = this.programs.indexOf(program);
      this.programs[i] = this.programs[this.programs.length - 1];
      this.programs.pop();

      // Free WebGL resources
      program.destroy();
    }
  }

  private allocateBones(object) {
    if (this.capabilities.floatVertexTextures && object && object.skeleton && object.skeleton.useVertexTexture) {
      return 1024;
    } else {
      // default for when object is not specified
      // ( for example when prebuilding shader to be used with multiple objects )
      //
      //  - leave some extra space for other uniforms
      //  - limit here is ANGLE's 254 max uniform vectors
      //    (up to 54 should be safe)
      let nVertexUniforms = this.capabilities.maxVertexUniforms;
      let nVertexMatrices = Math.floor((nVertexUniforms - 20) / 4);

      let maxBones = nVertexMatrices;

      if (object !== undefined && (object && object.isSkinnedMesh)) {
        maxBones = Math.min(object.skeleton.bones.length, maxBones);
        if (maxBones < object.skeleton.bones.length) {
          console.warn('WebGLRenderer: too many bones - ' + object.skeleton.bones.length + ', this GPU supports just ' + maxBones + ' (try OpenGL instead of ANGLE)');
        }
      }
      return maxBones;
    }
  }

  private getTextureEncodingFromMap(map, gammaOverrideLinear) {
    let encoding;

    if (!map) {
      encoding = LinearEncoding;
    } else if (map.isTexture) {
      encoding = map.encoding;
    } else if (map.isWebGLRenderTarget) {
      console.warn('WebGLPrograms.getTextureEncodingFromMap: don\'t use render targets as textures. Use their .texture property instead.');
      encoding = map.texture.encoding;
    }

    // add backwards compatibility for WebGLRenderer.gammaInput/gammaOutput parameter, should probably be removed at some point.
    if (encoding === LinearEncoding && gammaOverrideLinear) {
      encoding = GammaEncoding;
    }
    return encoding;
  }

}
