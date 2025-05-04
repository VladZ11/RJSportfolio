import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import "./ConstellationBackground.css";

const POINTS = 120;
const DIST = 5.5; // чуть больше связей
const SCENE_SHIFT_X = 4; // смещение вправо

function randomVec3(radius = 20) {
  return new THREE.Vector3(
    (Math.random() - 0.5) * radius,
    (Math.random() - 0.5) * radius * 0.5,
    (Math.random() - 0.5) * radius
  );
}

export default function ConstellationBackground() {
  const mountRef = useRef();

  useEffect(() => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x101014);

    // Точки
    const points = [];
    const velocities = [];
    for (let i = 0; i < POINTS; i++) {
      points.push(randomVec3());
      velocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04,
          (Math.random() - 0.5) * 0.04
        )
      );
    }

    // Геометрия точек
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    // Glow-эффект для точек
    const sprite = new THREE.TextureLoader().load(
      "https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/sprites/glow.png"
    );
    const material = new THREE.PointsMaterial({
      color: 0x00fff7,
      size: 0.32,
      transparent: true,
      opacity: 0.95,
      map: sprite,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const pointCloud = new THREE.Points(geometry, material);
    scene.add(pointCloud);

    // Линии
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x00fff7,
      transparent: true,
      opacity: 0.32,
      linewidth: 2,
    });
    let lineGeometry = new THREE.BufferGeometry();
    let lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

    // Камера
    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(SCENE_SHIFT_X, 0, 32);

    // Свет
    scene.add(new THREE.AmbientLight(0xffffff, 0.3));

    // Рендерер
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setClearAlpha(0);
    mountRef.current.appendChild(renderer.domElement);

    // Mouse interaction
    let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
    const onMouseMove = (e) => {
      mouseX = (e.clientX / width) * 2 - 1;
      mouseY = (e.clientY / height) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Анимация
    let frameId;
    const animate = () => {
      frameId = requestAnimationFrame(animate);

      // Движение точек
      for (let i = 0; i < POINTS; i++) {
        points[i].add(velocities[i]);
        ["x", "y", "z"].forEach((axis) => {
          if (Math.abs(points[i][axis]) > 10) velocities[i][axis] *= -1;
        });
      }
      geometry.setFromPoints(points);

      // Линии между близкими точками
      const linePositions = [];
      for (let i = 0; i < POINTS; i++) {
        for (let j = i + 1; j < POINTS; j++) {
          const dist = points[i].distanceTo(points[j]);
          if (dist < DIST) {
            linePositions.push(points[i].x, points[i].y, points[i].z);
            linePositions.push(points[j].x, points[j].y, points[j].z);
          }
        }
      }
      lineGeometry.dispose();
      lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute(
        "position",
        new THREE.Float32BufferAttribute(linePositions, 3)
      );
      lineMesh.geometry = lineGeometry;

      // Реакция на мышь: плавное вращение и смещение
      targetX += (mouseX * 0.7 - targetX) * 0.07;
      targetY += (mouseY * 0.5 - targetY) * 0.07;
      scene.rotation.y = 0.15 + targetX * 0.25;
      scene.rotation.x = Math.sin(performance.now() * 0.00007) * 0.08 + targetY * 0.18;

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
      window.removeEventListener("mousemove", onMouseMove);
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
      geometry.dispose();
      lineGeometry.dispose();
      material.dispose();
      lineMaterial.dispose();
    };
  }, []);

  return <div ref={mountRef} className="constellation-bg" />;
}