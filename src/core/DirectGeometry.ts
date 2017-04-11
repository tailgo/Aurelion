import { Vector2 } from '../math/Vector2';
import { Box3 } from '../math/Box3';
import { Sphere } from '../math/Sphere';
import { Geometry } from './Geometry';

export class DirectGeometry {

  public id: number;
  public name: string;
  public type: string;

  public indices;

  public vertices;
  public normals;
  public colors;
  public uvs;
  public uvs2;

  public groups;
  public morphTargets;

  public skinWeights;
  public skinIndices;

  public boundingBox: Box3;
  public boundingSphere: Sphere;

  public verticesNeedUpdate: boolean;
  public normalsNeedUpdate: boolean;
  public colorsNeedUpdate: boolean;
  public uvsNeedUpdate: boolean;
  public groupsNeedUpdate: boolean;

  constructor() {
    this.indices = [];
    this.vertices = [];
    this.normals = [];
    this.colors = [];
    this.uvs = [];
    this.uvs2 = [];

    this.groups = [];

    this.morphTargets = {};

    this.skinWeights = [];
    this.skinIndices = [];

    // this.lineDistances = [];

    this.boundingBox = null;
    this.boundingSphere = null;

    // update flags

    this.verticesNeedUpdate = false;
    this.normalsNeedUpdate = false;
    this.colorsNeedUpdate = false;
    this.uvsNeedUpdate = false;
    this.groupsNeedUpdate = false;
  }

  public computeGroups(geometry: Geometry): void {
    let group;
    let groups = [];
    let materialIndex = undefined;

    let faces = geometry.faces;
    let i;

    for (i = 0; i < faces.length; i++) {

      let face = faces[i];

      // materials

      if (face.materialIndex !== materialIndex) {

        materialIndex = face.materialIndex;

        if (group !== undefined) {

          group.count = (i * 3) - group.start;
          groups.push(group);

        }

        group = {
          start: i * 3,
          materialIndex: materialIndex
        };

      }

    }

    if (group !== undefined) {

      group.count = (i * 3) - group.start;
      groups.push(group);

    }

    this.groups = groups;
  }

  public fromGeometry(geometry: Geometry): DirectGeometry {
    let faces = geometry.faces;
    let vertices = geometry.vertices;
    let faceVertexUvs = geometry.faceVertexUvs;

    let hasFaceVertexUv = faceVertexUvs[0] && faceVertexUvs[0].length > 0;
    let hasFaceVertexUv2 = faceVertexUvs[1] && faceVertexUvs[1].length > 0;

    // morphs
    let morphTargets = geometry.morphTargets;
    let morphTargetsLength = morphTargets.length;

    let morphTargetsPosition;

    if (morphTargetsLength > 0) {
      morphTargetsPosition = [];
      for (let i = 0; i < morphTargetsLength; i++) {
        morphTargetsPosition[i] = [];
      }
      this.morphTargets.position = morphTargetsPosition;
    }

    let morphNormals = geometry.morphNormals;
    let morphNormalsLength = morphNormals.length;

    let morphTargetsNormal;

    if (morphNormalsLength > 0) {
      morphTargetsNormal = [];
      for (let i = 0; i < morphNormalsLength; i++) {
        morphTargetsNormal[i] = [];
      }
      this.morphTargets.normal = morphTargetsNormal;
    }

    // skins
    let skinIndices = geometry.skinIndices;
    let skinWeights = geometry.skinWeights;

    let hasSkinIndices = skinIndices.length === vertices.length;
    let hasSkinWeights = skinWeights.length === vertices.length;

    for (let i = 0; i < faces.length; i++) {
      let face = faces[i];
      this.vertices.push(vertices[face.a], vertices[face.b], vertices[face.c]);
      let vertexNormals = face.vertexNormals;
      if (vertexNormals.length === 3) {
        this.normals.push(vertexNormals[0], vertexNormals[1], vertexNormals[2]);
      } else {
        let normal = face.normal;
        this.normals.push(normal, normal, normal);
      }

      let vertexColors = face.vertexColors;
      if (vertexColors.length === 3) {
        this.colors.push(vertexColors[0], vertexColors[1], vertexColors[2]);
      } else {
        let color = face.color;
        this.colors.push(color, color, color);
      }

      if (hasFaceVertexUv === true) {
        let vertexUvs = faceVertexUvs[0][i];
        if (vertexUvs !== undefined) {
          this.uvs.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
        } else {
          console.warn('DirectGeometry.fromGeometry():Undefined vertexUv ', i);
          this.uvs.push(new Vector2(), new Vector2(), new Vector2());
        }
      }

      if (hasFaceVertexUv2 === true) {
        let vertexUvs = faceVertexUvs[1][i];
        if (vertexUvs !== undefined) {
          this.uvs2.push(vertexUvs[0], vertexUvs[1], vertexUvs[2]);
        } else {
          console.warn('DirectGeometry.fromGeometry():Undefined vertexUv2 ', i);
          this.uvs2.push(new Vector2(), new Vector2(), new Vector2());
        }
      }

      // morphs
      for (let j = 0; j < morphTargetsLength; j++) {
        let morphTarget = morphTargets[j].vertices;
        morphTargetsPosition[j].push(morphTarget[face.a], morphTarget[face.b], morphTarget[face.c]);
      }

      for (let j = 0; j < morphNormalsLength; j++) {
        let morphNormal = morphNormals[j].vertexNormals[i];
        morphTargetsNormal[j].push(morphNormal.a, morphNormal.b, morphNormal.c);
      }

      // skins
      if (hasSkinIndices) {
        this.skinIndices.push(skinIndices[face.a], skinIndices[face.b], skinIndices[face.c]);
      }

      if (hasSkinWeights) {
        this.skinWeights.push(skinWeights[face.a], skinWeights[face.b], skinWeights[face.c]);
      }
    }

    this.computeGroups(geometry);

    this.verticesNeedUpdate = geometry.verticesNeedUpdate;
    this.normalsNeedUpdate = geometry.normalsNeedUpdate;
    this.colorsNeedUpdate = geometry.colorsNeedUpdate;
    this.uvsNeedUpdate = geometry.uvsNeedUpdate;
    this.groupsNeedUpdate = geometry.groupsNeedUpdate;

    return this;
  }

}
