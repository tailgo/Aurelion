import { Vector2 } from '../math/Vector2';
import { FileLoader } from './FileLoader';
import { LoadingManager, DefaultLoadingManager } from './LoadingManager';
import * as Materials from '../materials/Materials';

export class MaterialLoader {

  public manager: LoadingManager;

  public textures;

  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
    this.textures = [];
  }

  public load(
    url: string, onLoad?: Function, onProgress?: Function, onError?: Function
  ) {
    let loader = new FileLoader(this.manager);
    loader.load(url, (text) => {
      onLoad(this.parse(JSON.parse(text)));
    }, onProgress, onError);
  }

  public setTextures(value) {
    this.textures = value;
  }

  public parse(json) {
    let textures = this.textures;

    function getTexture(name) {
      if (textures[name] === undefined) {
        console.warn('MaterialLoader: Undefined texture', name);
      }
      return textures[name];
    }

    let material = new Materials[json.type]();

    if (json.uuid !== undefined) material.uuid = json.uuid;
    if (json.name !== undefined) material.name = json.name;
    if (json.color !== undefined) material.color.setHex(json.color);
    if (json.roughness !== undefined) material.roughness = json.roughness;
    if (json.metalness !== undefined) material.metalness = json.metalness;
    if (json.emissive !== undefined) material.emissive.setHex(json.emissive);
    if (json.specular !== undefined) material.specular.setHex(json.specular);
    if (json.shininess !== undefined) material.shininess = json.shininess;
    if (json.clearCoat !== undefined) material.clearCoat = json.clearCoat;
    if (json.clearCoatRoughness !== undefined) material.clearCoatRoughness = json.clearCoatRoughness;
    if (json.uniforms !== undefined) material.uniforms = json.uniforms;
    if (json.vertexShader !== undefined) material.vertexShader = json.vertexShader;
    if (json.fragmentShader !== undefined) material.fragmentShader = json.fragmentShader;
    if (json.vertexColors !== undefined) material.vertexColors = json.vertexColors;
    if (json.fog !== undefined) material.fog = json.fog;
    if (json.shading !== undefined) material.shading = json.shading;
    if (json.blending !== undefined) material.blending = json.blending;
    if (json.side !== undefined) material.side = json.side;
    if (json.opacity !== undefined) material.opacity = json.opacity;
    if (json.transparent !== undefined) material.transparent = json.transparent;
    if (json.alphaTest !== undefined) material.alphaTest = json.alphaTest;
    if (json.depthTest !== undefined) material.depthTest = json.depthTest;
    if (json.depthWrite !== undefined) material.depthWrite = json.depthWrite;
    if (json.colorWrite !== undefined) material.colorWrite = json.colorWrite;
    if (json.wireframe !== undefined) material.wireframe = json.wireframe;
    if (json.wireframeLinewidth !== undefined) material.wireframeLinewidth = json.wireframeLinewidth;
    if (json.wireframeLinecap !== undefined) material.wireframeLinecap = json.wireframeLinecap;
    if (json.wireframeLinejoin !== undefined) material.wireframeLinejoin = json.wireframeLinejoin;
    if (json.skinning !== undefined) material.skinning = json.skinning;
    if (json.morphTargets !== undefined) material.morphTargets = json.morphTargets;

    // for PointsMaterial
    if (json.size !== undefined) material.size = json.size;
    if (json.sizeAttenuation !== undefined) material.sizeAttenuation = json.sizeAttenuation;

    // maps
    if (json.map !== undefined) material.map = getTexture(json.map);

    if (json.alphaMap !== undefined) {
      material.alphaMap = getTexture(json.alphaMap);
      material.transparent = true;
    }

    if (json.bumpMap !== undefined) material.bumpMap = getTexture(json.bumpMap);
    if (json.bumpScale !== undefined) material.bumpScale = json.bumpScale;

    if (json.normalMap !== undefined) material.normalMap = getTexture(json.normalMap);
    if (json.normalScale !== undefined) {
      let normalScale = json.normalScale;

      if (Array.isArray(normalScale) === false) {
        // Blender exporter used to export a scalar. See #7459
        normalScale = [normalScale, normalScale];
      }

      material.normalScale = new Vector2().fromArray(normalScale);
    }

    if (json.displacementMap !== undefined) material.displacementMap = getTexture(json.displacementMap);
    if (json.displacementScale !== undefined) material.displacementScale = json.displacementScale;
    if (json.displacementBias !== undefined) material.displacementBias = json.displacementBias;

    if (json.roughnessMap !== undefined) material.roughnessMap = getTexture(json.roughnessMap);
    if (json.metalnessMap !== undefined) material.metalnessMap = getTexture(json.metalnessMap);

    if (json.emissiveMap !== undefined) material.emissiveMap = getTexture(json.emissiveMap);
    if (json.emissiveIntensity !== undefined) material.emissiveIntensity = json.emissiveIntensity;

    if (json.specularMap !== undefined) material.specularMap = getTexture(json.specularMap);

    if (json.envMap !== undefined) material.envMap = getTexture(json.envMap);

    if (json.reflectivity !== undefined) material.reflectivity = json.reflectivity;

    if (json.lightMap !== undefined) material.lightMap = getTexture(json.lightMap);
    if (json.lightMapIntensity !== undefined) material.lightMapIntensity = json.lightMapIntensity;

    if (json.aoMap !== undefined) material.aoMap = getTexture(json.aoMap);
    if (json.aoMapIntensity !== undefined) material.aoMapIntensity = json.aoMapIntensity;

    if (json.gradientMap !== undefined) material.gradientMap = getTexture(json.gradientMap);

    // MultiMaterial
    if (json.materials !== undefined) {
      for (let i = 0, l = json.materials.length; i < l; i++) {
        material.materials.push(this.parse(json.materials[i]));
      }
    }

    return material;
  }

}