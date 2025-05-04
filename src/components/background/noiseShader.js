// GLSL Noise functions (from Book of Shaders or similar sources)
const glslNoise = `
// 2D Random
float random (vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation
    vec2 u = f * f * (3.0 - 2.0 * f);
    // u = smoothstep(0.,1.,f); // Alternative interpolation

    // Mix 4 corners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}

// Simplex Noise function (if needed, more complex but often better looking)
// ... (Could paste a 3D Simplex noise function here if desired) ...
`;

const vertexShader = `
uniform float u_time;
uniform vec2 u_mouse; // Normalized mouse coords (0-1)

varying vec2 vUv;
varying float vNoise;

// Import noise function
${glslNoise}

void main() {
  vUv = uv;
  vec3 pos = position;

  // Noise parameters
  float noiseFreq = 2.5;
  float noiseAmp = 0.25;
  float timeFactor = 0.3;

  // Calculate noise based on position and time
  // Adding mouse influence to offset the noise calculation
  vec2 mouseInfluence = (u_mouse - 0.5) * 0.5; // Scale mouse effect
  float n = noise(pos.xy * noiseFreq + timeFactor * u_time + mouseInfluence);

  // Apply noise to z position
  pos.z += n * noiseAmp;

  // Store noise value for fragment shader
  vNoise = n;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform float u_time;
uniform vec2 u_resolution;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform float u_brightness;

varying vec2 vUv;
varying float vNoise; // Noise value from vertex shader

// Import noise function (can be used for color variation too)
${glslNoise}

void main() {
  // Mix colors based on noise value and UV coordinates
  vec3 color = mix(u_color1, u_color2, smoothstep(0.3, 0.7, vNoise)); // Base mix on noise amplitude
  color = mix(color, u_color3, vUv.y * 0.6 + vNoise * 0.2); // Add variation based on vertical position and noise

  // Add subtle grain/pattern using another noise layer if desired
  // float grain = noise(vUv * 50.0 + u_time * 0.1) * 0.05;
  // color += grain;

  // Adjust brightness
  color *= u_brightness;

  // Add a subtle vignette effect
  float dist = distance(vUv, vec2(0.5));
  color *= smoothstep(0.8, 0.2, dist);

  gl_FragColor = vec4(color, 1.0);
}
`;

const noiseShader = {
  vertex: vertexShader,
  fragment: fragmentShader,
};

export default noiseShader;