import { MathTool } from './MathTool';

export class Color {

  public r: number = 1;
  public g: number = 1;
  public b: number = 1;

  constructor(r?: number | Color, g?: number, b?: number) {

    if (r instanceof Color) {
      return this.set(r);
    } else {
      return this.setRGB(r, g, b);
    }

  }

  public set(value: Color): Color {

    this.copy(value);

    return this;
  }

  public setRGB(r: number, g: number, b: number): Color {
    this.r = r;
    this.g = g;
    this.b = b;

    return this;
  }

  public clone() {
    return new Color(this.r, this.g, this.b);
  }

  public copy(c: Color): Color {
    this.r = c.r;
    this.g = c.g;
    this.b = c.b;

    return this;
  }

  public add(c: Color): Color {
    this.r += c.r;
    this.g += c.g;
    this.b += c.b;

    return this;
  }

  public sub(c: Color): Color {
    this.r = Math.max(0, this.r - c.r);
    this.g = Math.max(0, this.g - c.g);
    this.b = Math.max(0, this.b - c.b);

    return this;
  }

  public lerp(c: Color, alpha: number): Color {
    this.r += (c.r - this.r) * alpha;
    this.g += (c.g - this.g) * alpha;
    this.b += (c.b - this.b) * alpha;

    return this;
  }

  public equals(c: Color): boolean {
    return (c.r === this.r) && (c.g === this.g) && (c.b === this.b);
  }
}
