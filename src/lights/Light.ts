import { Object3D } from '../core/Object3D';
import { Color } from '../math/Color';

export class Light extends Object3D {

  public color: Color;

  public isLight: boolean = true;
  public intensity: number;

  constructor(color: Color, intensity: number = 1) {
    super();

    this.type = 'Light';
    this.color = new Color(color);
    this.intensity = intensity;

    this.receiveShadow = undefined;
  }

  public copy(s: Light): Light {
    super.copy(<Object3D>s);

    this.color.copy(s.color);
    this.intensity = s.intensity;

    return this;
  }

}
