import { Object3D } from '../core/Object3D';

export class Scene extends Object3D {

  public autoUpdate: boolean;
  public background;
  public fog;
  public overrideMaterial;

  constructor() {
    super();
    this.type = 'Scene';

    this.background = null;
    this.fog = null;
    this.overrideMaterial = null;

    this.autoUpdate = true;
  }

  public copy(s: Scene, recursive: boolean): Scene {
    super.copy(<Object3D>s, recursive);

    if (s.background !== null) {
      this.background = s.background.clone();
    }

    if (s.fog !== null) {
      this.fog = s.fog.clone();
    }

    if (s.overrideMaterial !== null) {
      this.overrideMaterial = s.overrideMaterial.clone();
    }

    this.autoUpdate = s.autoUpdate;
    this.matrixAutoUpdate = s.matrixAutoUpdate;

    return this;
  }

}
