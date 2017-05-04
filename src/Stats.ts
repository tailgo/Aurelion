
const DEFAULT_CSS_TEXT =
  'position:fixed;top:0;left:0;cursor:pointer;opacity:0.9;z-index:10000';

class IPanel {

  public dom: HTMLCanvasElement;

  private context: CanvasRenderingContext2D;

  private PR: number;
  private WIDTH: number;
  private HEIGHT: number;
  private TEXT_X: number;
  private TEXT_Y: number;
  private GRAPH_X: number;
  private GRAPH_Y: number;
  private GRAPH_WIDTH: number;
  private GRAPH_HEIGHT: number;

  private name;
  private fg;
  private bg;

  constructor(name, fg, bg) {
    this.name = name;
    this.fg = fg;
    this.bg = bg;

    let PR = this.PR = Math.round(window.devicePixelRatio || 1);
    this.WIDTH = 80 * PR;
    this.HEIGHT = 48 * PR;
    this.TEXT_X = 3 * PR;
    this.TEXT_Y = 2 * PR;
    this.GRAPH_X = 3 * PR;
    this.GRAPH_Y = 15 * PR;
    this.GRAPH_WIDTH = 74 * PR;
    this.GRAPH_HEIGHT = 30 * PR;

    this.dom = document.createElement('canvas');
    this.dom.width = this.WIDTH;
    this.dom.height = this.HEIGHT;
    this.dom.style.cssText = 'width: 80px; height: 48px;';

    this.context = this.dom.getContext('2d');
    this.context.font = `bold ${9 * PR}px Helvetica,Arial,sans-serif`;
    this.context.textBaseline = 'top';

    this.context.fillStyle = bg;
    this.context.fillRect(0, 0, this.WIDTH, this.HEIGHT);

    this.context.fillStyle = fg;
    this.context.fillText(name, this.TEXT_X, this.TEXT_Y);
    this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);

    this.context.fillStyle = bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH, this.GRAPH_HEIGHT);
  }

  public update(value, maxValue) {
    let min = Infinity, max = 0;

    min = Math.min(min, value);
    max = Math.max(max, value);

    let name = `${Math.round(value)} ${this.name} (${Math.round(min)}-${Math.round(max)})`;

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 1;
    this.context.fillRect(0, 0, this.WIDTH, this.GRAPH_Y);
    this.context.fillStyle = this.fg;
    this.context.fillText(name, this.TEXT_X, this.TEXT_Y);

    this.context.drawImage(this.dom, this.GRAPH_X + this.PR, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT, this.GRAPH_X, this.GRAPH_Y, this.GRAPH_WIDTH - this.PR, this.GRAPH_HEIGHT);

    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, this.GRAPH_HEIGHT);

    this.context.fillStyle = this.bg;
    this.context.globalAlpha = 0.9;
    this.context.fillRect(this.GRAPH_X + this.GRAPH_WIDTH - this.PR, this.GRAPH_Y, this.PR, Math.round( ( 1 - ( value / maxValue ) ) * this.GRAPH_HEIGHT));
  }
}

export class Stats {

  public static Panel = IPanel;

  public dom;
  public domElement;

  private mode: number;
  private container: HTMLDivElement;

  private beginTime;
  private prevTime;
  private frames;

  private fpsPanel: IPanel;
  private msPanel: IPanel;

  constructor(cssText?: string) {

    this.mode = 0;

    this.container = document.createElement('div');
    this.container.style.cssText = cssText ? cssText : DEFAULT_CSS_TEXT;
    this.container.addEventListener('click', (event) => {
      event.preventDefault();
      this.showPanel(++this.mode % this.container.children.length);
    }, false);

    this.beginTime = (performance || Date).now();
    this.prevTime = this.beginTime;
    this.frames = 0;

    this.fpsPanel = this.addPanel(new Stats.Panel('FPS', '#0ff', '#002'));
    this.msPanel = this.addPanel(new Stats.Panel('MS', '#0f0', '#020'));

    this.showPanel(0);
    this.domElement = this.container;
  }

  public addPanel(panel) {
    this.container.appendChild(panel.dom);
    return panel;
  }

  public showPanel(id: number) {
    for (let i = 0; i < this.container.children.length; ++i) {
      let children = <HTMLElement>this.container.children[i];
      children.style.display = i === id ? 'block' : 'none';
    }
    this.mode = id;
  }

  public begin() {
    this.beginTime = (performance || Date).now();
  }

  public end() {
    this.frames++;
    let time = (performance || Date).now();
    this.msPanel.update(time - this.beginTime, 200);
    if (time > this.prevTime + 1000) {
      this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

      this.prevTime = time;
      this.frames = 0;
    }

    return time;
  }

  public update() {
    this.beginTime = this.end();
  }

  public setMode(id: number) {
    this.showPanel(id);
  }

}
