export const REVISION = '84dev';
export const MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };
export const CullFaceNone = 0;
export const CullFaceBack = 1;
export const CullFaceFront = 2;
export const CullFaceFrontBack = 3;

export const FrontFaceDirectionCW = 0;
export const FrontFaceDirectionCCW = 1;

export const BasicShadowMap = 0;
export const PCFShadowMap = 1;
export const PCFSoftShadowMap = 2;

export const FrontSide = 0;
export const BackSide = 1;
export const DoubleSide = 2;

export const FlatShading = 1;
export const SmoothShading = 2;

export const NoColors = 0;
export const FaceColors = 1;
export const VertexColors = 2;

export const NoBlending = 0;
export const NormalBlending = 1;
export const AdditiveBlending = 2;
export const SubtractiveBlending = 3;
export const MultiplyBlending = 4;
export const CustomBlending = 5;

export const AddEquation = 100;
export const SubtractEquation = 101;
export const ReverseSubtractEquation = 102;
export const MinEquation = 103;
export const MaxEquation = 104;

export const ZeroFactor = 200;
export const OneFactor = 201;
export const SrcColorFactor = 202;
export const OneMinusSrcColorFactor = 203;
export const SrcAlphaFactor = 204;
export const OneMinusSrcAlphaFactor = 205;
export const DstAlphaFactor = 206;
export const OneMinusDstAlphaFactor = 207;
export const DstColorFactor = 208;
export const OneMinusDstColorFactor = 209;
export const SrcAlphaSaturateFactor = 210;

export const NeverDepth = 0;
export const AlwaysDepth = 1;
export const LessDepth = 2;
export const LessEqualDepth = 3;
export const EqualDepth = 4;
export const GreaterEqualDepth = 5;
export const GreaterDepth = 6;
export const NotEqualDepth = 7;

export const MultiplyOperation = 0;
export const MixOperation = 1;
export const AddOperation = 2;

export const NoToneMapping = 0;
export const LinearToneMapping = 1;
export const ReinhardToneMapping = 2;
export const Uncharted2ToneMapping = 3;
export const CineonToneMapping = 4;

export const UVMapping = 300;
export const CubeReflectionMapping = 301;
export const CubeRefractionMapping = 302;
export const EquirectangularReflectionMapping = 303;
export const EquirectangularRefractionMapping = 304;
export const SphericalReflectionMapping = 305;
export const CubeUVReflectionMapping = 306;
export const CubeUVRefractionMapping = 307;

export const RepeatWrapping = 1000;
export const ClampToEdgeWrapping = 1001;
export const MirroredRepeatWrapping = 1002;
export const NearestFilter = 1003;
export const NearestMipMapNearestFilter = 1004;
export const NearestMipMapLinearFilter = 1005;
export const LinearFilter = 1006;
export const LinearMipMapNearestFilter = 1007;
export const LinearMipMapLinearFilter = 1008;
export const UnsignedByteType = 1009;
export const ByteType = 1010;
export const ShortType = 1011;
export const UnsignedShortType = 1012;
export const IntType = 1013;
export const UnsignedIntType = 1014;
export const FloatType = 1015;
export const HalfFloatType = 1016;
export const UnsignedShort4444Type = 1017;
export const UnsignedShort5551Type = 1018;
export const UnsignedShort565Type = 1019;
export const UnsignedInt248Type = 1020;
export const AlphaFormat = 1021;
export const RGBFormat = 1022;
export const RGBAFormat = 1023;
export const LuminanceFormat = 1024;
export const LuminanceAlphaFormat = 1025;
export const RGBEFormat = RGBAFormat;
export const DepthFormat = 1026;
export const DepthStencilFormat = 1027;

export const RGB_S3TC_DXT1_Format = 2001;
export const RGBA_S3TC_DXT1_Format = 2002;
export const RGBA_S3TC_DXT3_Format = 2003;
export const RGBA_S3TC_DXT5_Format = 2004;
export const RGB_PVRTC_4BPPV1_Format = 2100;
export const RGB_PVRTC_2BPPV1_Format = 2101;
export const RGBA_PVRTC_4BPPV1_Format = 2102;
export const RGBA_PVRTC_2BPPV1_Format = 2103;
export const RGB_ETC1_Format = 2151;

export const LoopOnce = 2200;
export const LoopRepeat = 2201;
export const LoopPingPong = 2202;

export const InterpolateDiscrete = 2300;
export const InterpolateLinear = 2301;
export const InterpolateSmooth = 2302;

export const ZeroCurvatureEnding = 2400;
export const ZeroSlopeEnding = 2401;
export const WrapAroundEnding = 2402;

export const TrianglesDrawMode = 0;
export const TriangleStripDrawMode = 1;
export const TriangleFanDrawMode = 2;

export const LinearEncoding = 3000;
export const sRGBEncoding = 3001;
export const GammaEncoding = 3007;
export const RGBEEncoding = 3002;
export const LogLuvEncoding = 3003;
export const RGBM7Encoding = 3004;
export const RGBM16Encoding = 3005;
export const RGBDEncoding = 3006;

export const BasicDepthPacking = 3200;
export const RGBADepthPacking = 3201;
