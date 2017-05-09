import { Cache } from './Cache';
import { DefaultLoadingManager, LoadingManager } from './LoadingManager';

export class FileLoader {

  public manager: LoadingManager;

  public path: string;
  public responseType: string;
  public withCredentials;
  public mimeType: string;

  constructor(manager: LoadingManager = DefaultLoadingManager) {
    this.manager = manager;
  }

  public load(
    url?: string, onLoad?: Function, onProgress?: Function, onError?: Function
  ) {

    if (url === undefined) {
      url = '';
    }

    if (this.path !== undefined) {
      url = this.path + url;
    }

    let cached = Cache.get(url);

    if (cached !== undefined) {
      this.manager.itemStart(url);
      setTimeout(() => {
        if (onLoad) {
          onLoad(cached);
        }
        this.manager.itemEnd(url);
      }, 0);

      return cached;
    }

    let dataUriRegex = /^data:(.*?)(;base64)?,(.*)$/;
    let dataUriRegexResult = url.match(dataUriRegex);

    let request = new XMLHttpRequest();

    if (dataUriRegexResult) {
      let mimeType = dataUriRegexResult[1];
      let isBase64 = !!dataUriRegexResult[2];
      let data = dataUriRegexResult[3];

      data = decodeURIComponent(data);


      if (isBase64) {
        data = window.atob(data);
      }

      try {
        let response;
        let responseType = (this.responseType || '').toLowerCase();

        switch (responseType) {
          case 'arraybuffer':
          case 'blob':
            response = new ArrayBuffer(data.length);

            let view = new Uint8Array(response);

            for (let i = 0; i < data.length; i++) {
              view[i] = data.charCodeAt(i);
            }

            if (responseType === 'blob') {
              response = new Blob([response], { type: mimeType });
            }
            break;

          case 'document':
            let parser = new DOMParser();
            response = parser.parseFromString(data, mimeType);
            break;

          case 'json':
            response = JSON.parse(data);
            break;

          default: // 'text' or other
            response = data;
            break;
        }

        // Wait for next browser tick
        setTimeout(() => {

          if (onLoad) {
            onLoad(response);
          }

          this.manager.itemEnd(url);
        }, 0);
      } catch (error) {
        // Wait for next browser tick
        window.setTimeout(() => {
          if (onError) {
            onError(error);
          }
          this.manager.itemError(url);
        }, 0);
      }
    } else {
      request.open('GET', url, true);

      let scope = this;

      request.addEventListener('load', function (event) {

        let response = event.target.response;

        Cache.add(url, response);

        if (this.status === 200) {
          if (onLoad) {
            onLoad(response);
          }

          scope.manager.itemEnd(url);
        } else if (this.status === 0) {
          // Some browsers return HTTP Status 0 when using non-http protocol
          // e.g. 'file://' or 'data://'. Handle as success.
          console.warn('FileLoader: HTTP Status 0 received.');

          if (onLoad) {
            onLoad(response);
          }

          scope.manager.itemEnd(url);
        } else {
          if (onError) {
            onError(event);
          }
          scope.manager.itemError(url);
        }
      }, false);

      if (onProgress !== undefined) {
        request.addEventListener('progress', function (event) {
          onProgress(event);
        }, false);
      }

      request.addEventListener('error', function (event) {
        if (onError) {
          onError(event);
        }
        scope.manager.itemError(url);
      }, false);

      if (this.responseType !== undefined) {
        request.responseType = <XMLHttpRequestResponseType>this.responseType;
      }
      if (this.withCredentials !== undefined) {
        request.withCredentials = this.withCredentials;
      }

      if (request.overrideMimeType) {
        request.overrideMimeType(this.mimeType !== undefined ? this.mimeType : 'text/plain');
      }

      request.send(null);
    }

    this.manager.itemStart( url );

    return request;
  }

  public setPath(value: string): FileLoader {
    this.path = value;
    return this;
  }

  public setResponseType(value: string): FileLoader {
    this.responseType = value;
    return this;
  }

  public setWithCredentials(value): FileLoader {
    this.withCredentials = value;
    return this;
  }

  public setMimeType(value: string): FileLoader {
    this.mimeType = value;
    return this;
  }

}
