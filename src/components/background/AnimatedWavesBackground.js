import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import "./AnimatedWavesBackground.css";

const COLORS = [
  [0x1e3c72, 0x2a5298], // синий градиент
  [0x8e2de2, 0x4a00e0], // фиолетовый градиент
  [0xff512f, 0xdd2476], // красно-розовый градиент
  [0x11998e, 0x38ef7d], // зелёный градиент
];

function lerpColor(a, b, t) {
  return a + (b - a) * t;
}

export default function AnimatedWavesBackground({ colorSet = 0 }) {
  const mountRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();

    // Градиентный фон
    const [colorA, colorB] = COLORS[colorSet % COLORS.length];
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

    // Волны
    const geometry = new THREE.PlaneGeometry(60, 30, 100, 50);
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.18,
      shininess: 80,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2.3;
    mesh.position.y = -8;
    scene.add(mesh);

    // Свет
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(0, 20, 20);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0xffffff, 0.8));

    // Камера
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(0, 6, 30);

    // Рендерер
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    mountRef.current.appendChild(renderer.domElement);

    // Анимация волн
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const time = performance.now() * 0.001;
      for (let i = 0; i < geometry.attributes.position.count; i++) {
        const ix = i % 101;
        const iy = Math.floor(i / 101);
        const vertex = geometry.attributes.position;
        const wave =
          Math.sin(ix * 0.15 + time * 1.2) * 0.6 +
          Math.cos(iy * 0.18 + time * 0.7) * 0.4;
        vertex.setZ(i, wave);
      }
      geometry.attributes.position.needsUpdate = true;

      // Меняем цвет материала по времени
      const t = (Math.sin(time * 0.2) + 1) / 2;
      const c = lerpColor(colorA, colorB, t);
      material.color.setHex(c);

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
  }, [colorSet]);

  return <div ref={mountRef} className="waves-bg" />;
}