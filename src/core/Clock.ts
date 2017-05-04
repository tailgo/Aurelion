export class Clock {

  public autoStart: boolean;

  public startTime: number;
  public oldTime: number;
  public elapsedTime: number;

  public running: boolean;

  constructor(autoStart: boolean = true) {
    this.autoStart = autoStart;

    this.startTime = 0;
    this.oldTime = 0;
    this.elapsedTime = 0;

    this.running = false;
  }

  public start() {
    this.startTime = (performance || Date).now();

    this.oldTime = this.startTime;
    this.elapsedTime = 0;
    this.running = true;
  }

  public stop() {
    this.getElapsedTime();
    this.running = false;
  }

  public getElapsedTime(): number {
    this.getDelta();
    return this.elapsedTime;
  }

  public getDelta(): number {
    let diff = 0;

    if (this.autoStart && !this.running) {
      this.start();
    }

    if (this.running) {
      let newTime = (performance || Date).now();

      diff = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;

      this.elapsedTime += diff;
    }

    return diff;
  }

}
