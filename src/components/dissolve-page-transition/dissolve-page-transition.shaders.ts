export const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const fragmentShader = `
  precision highp float;

  uniform float uProgress;
  uniform sampler2D uTexture1;
  uniform sampler2D uTexture2;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution1;
  uniform vec2 uImageResolution2;
  uniform float uNoiseScale;
  uniform float uThreshold;
  uniform float uSmoothness;
  uniform float uDisplacementStrength;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uAccentColor;
  uniform float uMaskPull;

  varying vec2 vUv;

  float hash(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);

    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));

    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);

    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p);
      p = rot * p * 2.02 + 17.13;
      amplitude *= 0.5;
    }

    return value;
  }

  vec2 coverUv(vec2 uv, vec2 canvasResolution, vec2 imageResolution) {
    vec2 safeCanvas = max(canvasResolution, vec2(1.0));
    vec2 safeImage = max(imageResolution, vec2(1.0));
    float canvasAspect = safeCanvas.x / safeCanvas.y;
    float imageAspect = safeImage.x / safeImage.y;
    vec2 scaledUv = uv;

    if (canvasAspect < imageAspect) {
      float scale = canvasAspect / imageAspect;
      scaledUv.x = uv.x * scale + (1.0 - scale) * 0.5;
    } else {
      float scale = imageAspect / canvasAspect;
      scaledUv.y = uv.y * scale + (1.0 - scale) * 0.5;
    }

    return clamp(scaledUv, vec2(0.001), vec2(0.999));
  }

  void main() {
    float aspect = max(uResolution.x / max(uResolution.y, 1.0), 0.001);
    vec2 centeredUv = (vUv - 0.5) * vec2(aspect, 1.0);
    float progress = clamp(uProgress, 0.0, 1.0);

    float noiseValue = fbm(centeredUv * uNoiseScale);

    float dissolveEdge = vUv.y - progress * uMaskPull;
    float d = dissolveEdge + noiseValue * uThreshold;
    float pixelSize = max(1.0 / max(uResolution.y, 1.0), uSmoothness);
    float mask = 1.0 - smoothstep(-pixelSize, pixelSize, d);
    mask *= smoothstep(0.0, 0.035, progress);
    mask = mix(mask, 1.0, smoothstep(0.965, 1.0, progress));
    mask = clamp(mask, 0.0, 1.0);

    float edge = 1.0 - smoothstep(pixelSize, pixelSize * 20.0, abs(d));
    edge *= mask;

    vec2 uv1 = coverUv(vUv, uResolution, uImageResolution1);
    vec2 uv2 = coverUv(
      vUv + vec2(0.0, -edge * uDisplacementStrength),
      uResolution,
      uImageResolution2
    );
    vec4 texture1 = texture2D(uTexture1, uv1);
    vec4 texture2 = texture2D(uTexture2, uv2);

    vec3 base = mix(texture1.rgb, texture2.rgb, mask);
    base = mix(base, uColor2, edge * 0.16);
    base = mix(base, uAccentColor, edge * 0.035);

    gl_FragColor = vec4(base, 1.0);
  }
`;
