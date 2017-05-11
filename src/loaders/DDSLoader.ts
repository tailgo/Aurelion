import {
  RGB_S3TC_DXT1_Format, RGBA_S3TC_DXT3_Format, RGBA_S3TC_DXT5_Format,
  RGB_ETC1_Format, RGBAFormat
} from '../Constants';
import { CompressedTextureLoader } from './CompressedTextureLoader';

export class DDSLoader extends CompressedTextureLoader {

  public _parser;

  constructor() {
    super();
    this._parser = DDSLoader.parse;
  }

  public static parse(buffer, loadMipmaps) {
    let dds = {
      mipmaps: [],
      width: 0,
      height: 0,
      format: null,
      mipmapCount: 1,
      isCubemap: false
    };

    // Adapted from @toji's DDS utils
    // https://github.com/toji/webgl-texture-utils/blob/master/texture-util/dds.js

    // All values and structures referenced from:
    // http://msdn.microsoft.com/en-us/library/bb943991.aspx/
    let DDS_MAGIC = 0x20534444;

    let DDSD_CAPS = 0x1,
      DDSD_HEIGHT = 0x2,
      DDSD_WIDTH = 0x4,
      DDSD_PITCH = 0x8,
      DDSD_PIXELFORMAT = 0x1000,
      DDSD_MIPMAPCOUNT = 0x20000,
      DDSD_LINEARSIZE = 0x80000,
      DDSD_DEPTH = 0x800000;

    let DDSCAPS_COMPLEX = 0x8,
      DDSCAPS_MIPMAP = 0x400000,
      DDSCAPS_TEXTURE = 0x1000;

    let DDSCAPS2_CUBEMAP = 0x200,
      DDSCAPS2_CUBEMAP_POSITIVEX = 0x400,
      DDSCAPS2_CUBEMAP_NEGATIVEX = 0x800,
      DDSCAPS2_CUBEMAP_POSITIVEY = 0x1000,
      DDSCAPS2_CUBEMAP_NEGATIVEY = 0x2000,
      DDSCAPS2_CUBEMAP_POSITIVEZ = 0x4000,
      DDSCAPS2_CUBEMAP_NEGATIVEZ = 0x8000,
      DDSCAPS2_VOLUME = 0x200000;

    let DDPF_ALPHAPIXELS = 0x1,
      DDPF_ALPHA = 0x2,
      DDPF_FOURCC = 0x4,
      DDPF_RGB = 0x40,
      DDPF_YUV = 0x200,
      DDPF_LUMINANCE = 0x20000;

    function fourCCToInt32(value) {
      return value.charCodeAt(0) +
        (value.charCodeAt(1) << 8) +
        (value.charCodeAt(2) << 16) +
        (value.charCodeAt(3) << 24);
    }

    function int32ToFourCC(value) {
      return String.fromCharCode(
        value & 0xff,
        (value >> 8) & 0xff,
        (value >> 16) & 0xff,
        (value >> 24) & 0xff
      );
    }

    function loadARGBMip(buffer, dataOffset, width, height) {
      let dataLength = width * height * 4;
      let srcBuffer = new Uint8Array(buffer, dataOffset, dataLength);
      let byteArray = new Uint8Array(dataLength);
      let dst = 0;
      let src = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let b = srcBuffer[src]; src++;
          let g = srcBuffer[src]; src++;
          let r = srcBuffer[src]; src++;
          let a = srcBuffer[src]; src++;
          byteArray[dst] = r; dst++; // r
          byteArray[dst] = g; dst++; // g
          byteArray[dst] = b; dst++; // b
          byteArray[dst] = a; dst++; // a
        }
      }
      return byteArray;
    }

    let FOURCC_DXT1 = fourCCToInt32('DXT1');
    let FOURCC_DXT3 = fourCCToInt32('DXT3');
    let FOURCC_DXT5 = fourCCToInt32('DXT5');
    let FOURCC_ETC1 = fourCCToInt32('ETC1');

    // The header length in 32 bit ints
    let headerLengthInt = 31;

    // Offsets into the header array
    let off_magic = 0;

    let off_size = 1;
    let off_flags = 2;
    let off_height = 3;
    let off_width = 4;

    let off_mipmapCount = 7;

    let off_pfFlags = 20;
    let off_pfFourCC = 21;
    let off_RGBBitCount = 22;
    let off_RBitMask = 23;
    let off_GBitMask = 24;
    let off_BBitMask = 25;
    let off_ABitMask = 26;

    let off_caps = 27;
    let off_caps2 = 28;
    let off_caps3 = 29;
    let off_caps4 = 30;

    // Parse header
    let header = new Int32Array(buffer, 0, headerLengthInt);

    if (header[off_magic] !== DDS_MAGIC) {
      console.error('THREE.DDSLoader.parse: Invalid magic number in DDS header.');
      return dds;
    }

    // if (!header[off_pfFlags] & DDPF_FOURCC) {
    //   console.error('THREE.DDSLoader.parse: Unsupported format, must contain a FourCC code.');
    //   return dds;
    // }

    let blockBytes;

    let fourCC = header[off_pfFourCC];

    let isRGBAUncompressed = false;

    switch (fourCC) {
      case FOURCC_DXT1:
        blockBytes = 8;
        dds.format = RGB_S3TC_DXT1_Format;
        break;

      case FOURCC_DXT3:
        blockBytes = 16;
        dds.format = RGBA_S3TC_DXT3_Format;
        break;

      case FOURCC_DXT5:
        blockBytes = 16;
        dds.format = RGBA_S3TC_DXT5_Format;
        break;

      case FOURCC_ETC1:
        blockBytes = 8;
        dds.format = RGB_ETC1_Format;
        break;

      default:
        if (header[off_RGBBitCount] === 32
          && header[off_RBitMask] & 0xff0000
          && header[off_GBitMask] & 0xff00
          && header[off_BBitMask] & 0xff
          && header[off_ABitMask] & 0xff000000) {

          isRGBAUncompressed = true;
          blockBytes = 64;
          dds.format = RGBAFormat;
        } else {
          console.error('DDSLoader.parse: Unsupported FourCC code ', int32ToFourCC(fourCC));
          return dds;
        }
    }

    dds.mipmapCount = 1;

    if (header[off_flags] & DDSD_MIPMAPCOUNT && loadMipmaps !== false) {
      dds.mipmapCount = Math.max(1, header[off_mipmapCount]);
    }

    let caps2 = header[off_caps2];
    dds.isCubemap = caps2 & DDSCAPS2_CUBEMAP ? true : false;
    if (dds.isCubemap && (
      !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEX) ||
      !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEX) ||
      !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEY) ||
      !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEY) ||
      !(caps2 & DDSCAPS2_CUBEMAP_POSITIVEZ) ||
      !(caps2 & DDSCAPS2_CUBEMAP_NEGATIVEZ)
    )) {
      console.error('DDSLoader.parse: Incomplete cubemap faces');
      return dds;
    }

    dds.width = header[off_width];
    dds.height = header[off_height];

    let dataOffset = header[off_size] + 4;

    // Extract mipmaps buffers
    let faces = dds.isCubemap ? 6 : 1;

    for (let face = 0; face < faces; face++) {
      let width = dds.width;
      let height = dds.height;

      for (let i = 0; i < dds.mipmapCount; i++) {
        let byteArray, dataLength;

        if (isRGBAUncompressed) {
          byteArray = loadARGBMip(buffer, dataOffset, width, height);
          dataLength = byteArray.length;
        } else {
          dataLength = Math.max(4, width) / 4 * Math.max(4, height) / 4 * blockBytes;
          byteArray = new Uint8Array(buffer, dataOffset, dataLength);
        }

        let mipmap = { 'data': byteArray, 'width': width, 'height': height };
        dds.mipmaps.push(mipmap);

        dataOffset += dataLength;

        width = Math.max(width >> 1, 1);
        height = Math.max(height >> 1, 1);
      }
    }

    return dds;
  }
}
