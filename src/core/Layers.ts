/**
 *
 */

export class Layers {

  public mask: number;

  constructor() {
    this.mask = 1;
  }

  public set(channel: number) {
    this.mask = 1 << channel;
  }

  public enable(channel: number) {
    this.mask |= 1 << channel;
  }

  public toggle(channel: number) {
    this.mask ^= 1 << channel;
  }

  public disable(channel) {
    this.mask &= ~(1 << channel);
  }

  public test(layers: Layers): boolean {
    return (this.mask & layers.mask) !== 0;
  }

}
