import { Material } from './Material';
import { Color } from '../math/Color';

export class LineBasicMaterial extends Material {

  public color: Color;

  public linewidth: number;
  public linecap: string;
  public linejoin: string;

  public isLineBasicMaterial: boolean = true;

  constructor(parameters) {
    super();

    this.type = 'LineBasicMaterial';

    this.color = new Color(0xffffff);

    this.linewidth = 1;
    this.linecap = 'round';
    this.linejoin = 'round';

    this.lights = false;

    this.setValues(parameters);
  }

  public copy(source) {
    super.copy(source);

    this.color.copy(source.color);

    this.linewidth = source.linewidth;
    this.linecap = source.linecap;
    this.linejoin = source.linejoin;

    return this;
  }

}
