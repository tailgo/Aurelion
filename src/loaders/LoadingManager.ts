export class LoadingManager {

  public onStart: Function;
  public onLoad: Function;
  public onProgress: Function;
  public onError: Function;

  private isLoading: boolean;
  private itemsLoaded: number;
  private itemsTotal: number;

  constructor(
    onLoad?: Function,
    onProgress?: Function,
    onError?: Function
  ) {

    this.isLoading = false;
    this.itemsLoaded = 0;
    this.itemsTotal = 0;

    this.onStart = undefined;
    this.onLoad = onLoad;
    this.onProgress = onProgress;
    this.onError = onError;

  }

  public itemStart(url: string): void {
    this.itemsTotal++;
    if (this.isLoading === false) {
      if (this.onStart !== undefined) {
        this.onStart(url, this.itemsLoaded, this.itemsTotal);
      }
    }

    this.isLoading = true;
  }

  public itemEnd(url: string): void {
    this.itemsLoaded++;

    if (this.onProgress !== undefined) {
      this.onProgress(url, this.itemsLoaded, this.itemsTotal);
    }

    if (this.itemsLoaded === this.itemsTotal) {
      this.isLoading = false;
      if (this.onLoad !== undefined) {
        this.onLoad();
      }
    }
  }

  public itemError(url: string): void {
    if (this.onError !== undefined) {
      this.onError(url);
    }
  }
}

export const DefaultLoadingManager = new LoadingManager();
