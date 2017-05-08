import { Light } from './Light';
import { DirectionalLightShadow } from './DirectionalLightShadow';
import { Object3D } from '../core/Object3D';

export class DirectionalLight extends Light {

  public target: Object3D;
  public shadow: DirectionalLightShadow;

  public isDirectionalLight: boolean = true;

  constructor(color, intensity: number) {
    super(color, intensity);
    this.type = 'DirectionalLight';

    this.position.copy(Object3D.DefaultUp);
    this.updateMatrix();

    this.target = new Object3D();

    this.shadow = new DirectionalLightShadow();
  }

  public copy(source) {
    super.copy(source);

    this.target = source.target.clone();
    this.shadow = source.shadow.clone();

    return this;
  }

}
