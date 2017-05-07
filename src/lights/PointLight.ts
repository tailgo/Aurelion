import { Light } from './Light';
import { LightShadow } from './LightShadow';
import { PerspectiveCamera } from '../cameras/PerspectiveCamera';

export class PointLight extends Light {

  public distance: number;
  public decay: number;

  public shadow: LightShadow;

  public isPointLight: boolean = true;

  constructor(color, intensity, distance: number = 0, decay: number = 1) {
    super(color, intensity);

    this.type = 'PointLight';

    this.distance = distance;
    this.decay = decay;

    this.shadow = new LightShadow(new PerspectiveCamera(90, 1, 0.5, 500));
  }

  get power() {
    return this.intensity * 4 * Math.PI;
  }

  set power(p: number) {
    this.intensity = p / (4 * Math.PI);
  }

  public copy(source) {
    super.copy(source);

    this.distance = source.distance;
    this.decay = source.decay;

    this.shadow = source.shadow.clone();

    return this;
  }

  public clone() {
    return new PointLight(this.color, this.intensity).copy(this);
  }

}
