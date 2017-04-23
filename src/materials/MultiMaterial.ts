import { MathTool } from '../math/MathTool';
import { Material } from './Material';

export class MultiMaterial {

  public isMultiMaterial: boolean = true;

  public materials: Array<Material>;

  public uuid: string;
  public type: string;

  public visible;

  constructor(materials: Array<Material> = []) {
    this.uuid = MathTool.generateUUID();
    this.type = 'MultiMaterial';
    this.materials = materials;
    this.visible = true;
  }

  public clone(): MultiMaterial {
    let material = new MultiMaterial();
    for (let i = 0; i < this.materials.length; i++) {
      material.materials.push(this.materials[i].clone());
    }
    material.visible = this.visible;
    return material;
  }

}
