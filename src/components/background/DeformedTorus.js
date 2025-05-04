import React, { useRef, useEffect, useContext } from "react";
import * as THREE from "three";
import { ThemeContext } from "../theme/ThemeProvider";

const LIGHT_COLORS = [0x00c3ff, 0xffff1c];
const DARK_COLORS = [0x232526, 0x414345];

export default function DeformedTorus() {
  const mountRef = useRef();
  const { theme } = useContext(ThemeContext);

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();

    // Градиентный фон
    const [colorA, colorB] = theme === "light" ? LIGHT_COLORS : DARK_COLORS;
    const canvas = document.createElement("canvas");
    canvas.width = 32;
    canvas.height = 256;
    const ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0, "#" + colorA.toString(16).padStart(6, "0"));
    grad.addColorStop(1, "#" + colorB.toString(16).padStart(6, "0"));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 32, 256);
    const bgTexture = new THREE.CanvasTexture(canvas);
    scene.background = bgTexture;

    // Тор
    const geometry = new THREE.TorusGeometry(8, 2.2, 128, 256);
    const material = new THREE.MeshPhysicalMaterial({
      color: theme === "light" ? 0x00c3ff : 0xffffff,
      roughness: 0.25,
      metalness: 0.7,
      clearcoat: 0.7,
      transparent: true,
      opacity: 0.82,
      transmission: 0.5,
      reflectivity: 0.8,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Свет
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight.position.set(10, 10, 10);
    scene.add(dirLight);

    // Камера
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 0, 32);

    // Рендерер
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    mountRef.current.appendChild(renderer.domElement);

    // Анимация
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;

      // Деформация тора: волны по окружности
      const pos = geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        const z = pos.getZ(i);
        const r = Math.sqrt(x * x + y * y);
        const theta = Math.atan2(y, x);
        // волна по окружности + пульсация
        const deform =
          Math.sin(theta * 6 + time * 2) * 0.35 +
          Math.cos(r * 2 + time * 1.5) * 0.18 +
          Math.sin(time * 1.2) * 0.12;
        pos.setXYZ(
          i,
          (x / r) * (r + deform),
          (y / r) * (r + deform),
          z + Math.sin(theta * 8 + time * 2) * 0.09
        );
      }
      pos.needsUpdate = true;

      // Пульсация масштаба
      const scale = 1 + Math.sin(time * 1.1) * 0.04;
      mesh.scale.set(scale, scale, scale);

      // Вращение
      mesh.rotation.x += 0.003;
      mesh.rotation.y += 0.004;

      renderer.render(scene, camera);
    };
    animate();

    // Resize
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      material.dispose();
      bgTexture.dispose();
    };
    // eslint-disable-next-line
  }, [theme]);

  return <div style={{
    position: "fixed",
    top: 0, left: 0, width: "100vw", height: "100vh",
    zIndex: -1, pointerEvents: "none", overflow: "hidden"
  }} ref={mountRef} />;
}