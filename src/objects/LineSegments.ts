import { Line } from './Line';

export class LineSegments extends Line {

  public isLineSegments: boolean = true;

  constructor(geometry, material) {
    super(geometry, material);

    this.type = 'LineSegments';
  }

}
