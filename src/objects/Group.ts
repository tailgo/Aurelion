import { Object3D } from '../core/Object3D';

export class Group extends Object3D {

  public materialLibraries;

  constructor() {
    super();
    this.type = 'Group';
  }

}
