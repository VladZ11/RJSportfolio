import React, { useRef, useEffect, useContext } from "react";
import * as THREE from "three";
import { ThemeContext } from "../theme/ThemeProvider";
import noiseShader from "./noiseShader"; // We'll create this shader file next

// Define color palettes for themes
const LIGHT_PALETTE = {
  color1: new THREE.Color(0x87ceeb), // Sky Blue
  color2: new THREE.Color(0xe0ffff), // Light Cyan
  color3: new THREE.Color(0xffefd5), // Papaya Whip
};
const DARK_PALETTE = {
  color1: new THREE.Color(0x1a2a6c), // Dark Blue
  color2: new THREE.Color(0xb21f1f), // Reddish
  color3: new THREE.Color(0xfdbb2d), // Yellowish Gold
};

export default function FlowingNoiseBackground() {
  const mountRef = useRef();
  const { theme } = useContext(ThemeContext);
  const mouse = useRef(new THREE.Vector2(0.5, 0.5)); // Normalized mouse coords

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.z = 4;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearAlpha(0); // Make background transparent
    mountRef.current.appendChild(renderer.domElement);

    // Geometry (Plane with high segmentation)
    const geometry = new THREE.PlaneGeometry(15, 10, 100, 100);

    // Shader Material
    const palette = theme === "light" ? LIGHT_PALETTE : DARK_PALETTE;
    const uniforms = {
      u_time: { value: 0.0 },
      u_mouse: { value: new THREE.Vector2(0.5, 0.5) },
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_color1: { value: palette.color1 },
      u_color2: { value: palette.color2 },
      u_color3: { value: palette.color3 },
      u_brightness: { value: theme === 'light' ? 0.9 : 0.6 }, // Adjust brightness per theme
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms,
      vertexShader: noiseShader.vertex,
      fragmentShader: noiseShader.fragment,
      side: THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Mouse move listener
    const onMouseMove = (event) => {
      mouse.current.x = event.clientX / width;
      mouse.current.y = 1.0 - event.clientY / height; // Invert Y for shader coords
    };
    window.addEventListener("mousemove", onMouseMove);

    // Animation loop
    const clock = new THREE.Clock();
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Update uniforms
      uniforms.u_time.value = elapsedTime;
      // Smoothly update mouse uniform towards the actual mouse position
      uniforms.u_mouse.value.lerp(mouse.current, 0.05);

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      uniforms.u_resolution.value.set(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onMouseMove);
      if (mountRef.current && renderer.domElement) {
         mountRef.current.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      // Dispose textures if any were used
    };
  }, [theme]); // Re-run effect if theme changes

  return <div style={{
    position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
    zIndex: -1, pointerEvents: "none", overflow: "hidden",
    // Add a subtle CSS background as fallback or base
    background: theme === 'light' ? 'linear-gradient(to bottom, #e0f2f7, #fafafa)' : 'linear-gradient(to bottom, #1a1a2e, #161625)',
  }} ref={mountRef} />;
}