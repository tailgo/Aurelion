/**
 *
 */

const MathTool = {

  DEG2RAD: Math.PI / 180,
  RAD2DEG: 180 / Math.PI,

  generateUUID(): string {
    // http://www.broofa.com/Tools/Math.uuid.htm

    let chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    let uuid = new Array(36);
    let rnd = 0, r;

    for (let i = 0; i < 36; i++) {

      if (i === 8 || i === 13 || i === 18 || i === 23) {

        uuid[i] = '-';

      } else if (i === 14) {

        uuid[i] = '4';

      } else {

        if (rnd <= 0x02) rnd = 0x2000000 + (Math.random() * 0x1000000) | 0;
        r = rnd & 0xf;
        rnd = rnd >> 4;
        uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];

      }

    }

    return uuid.join('');
  },

  // 比较大小
  clamp(v: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, v));
  },

  // 辗转相除法
  euclideanModulo(n: number, m: number): number {
    return ((n % m) + m) % m;
  },

  // 线性插值
  // 公式参考：https://en.wikipedia.org/wiki/Linear_interpolation
  lerp(v0: number, v1: number, t: number): number {
    return (1 - t) * v0 + t * v1;
  },

  // 线性映射
  linearMapping(
    x: number,
    a1: number, a2: number,
    b1: number, b2: number
  ): number {
    return b1 + (x - a1) * (b2 - b1) / (a2 - a1);
  },

  // 平滑插值
  // 公式参考：http://en.wikipedia.org/wiki/Smoothstep
  smoothstep(x: number, min: number, max: number): number {
    if (x <= min) {
      return 0;
    }

    if (x >= max) {
      return 1;
    }

    x = (x - min) / (max - min);

    return x * x * (3 - 2 * x);
  },

  // 更加平滑的平滑插值，参考 mrdoob
  smootherstep(x: number, min: number, max: number): number {
    if (x <= min) {
      return 0;
    }

    if (x >= max) {
      return 1;
    }

    return x * x * x * (x * (x * 6 - 15) + 10);

  },

  // 随机整数
  randInt(low: number, high: number): number {
    return low + Math.floor(Math.random() * (high - low + 1));
  },

  // 随机浮点数
  randFloat(low: number, high: number): number {
    return low + Math.random() * (high - low);
  },

  // 弧度-角度互换
  deg2rad(d: number): number {
    return d * this.DEG2RAD;
  },

  rad2deg(r: number): number {
    return r * this.RAD2DEG;
  }
};

export { MathTool };
