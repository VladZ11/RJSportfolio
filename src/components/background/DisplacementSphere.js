import React, { useEffect, useRef, useContext } from "react";
import classNames from "classnames";
import {
    Vector2,
    sRGBEncoding,
    WebGLRenderer,
    PerspectiveCamera,
    Scene,
    DirectionalLight,
    AmbientLight,
    UniformsUtils,
    UniformsLib,
    MeshPhongMaterial,
    SphereBufferGeometry, // Возвращаем Сферу
    // IcosahedronGeometry, // Убираем икосаэдр
    Mesh,
    Color,
} from "three";
import { spring, value } from "popmotion";
import innerHeight from "ios-inner-height";
import vertShader from "./sphereVertShader"; // Будем менять этот шейдер
import fragShader from "./sphereFragShader"; // Оригинальный фрагментный шейдер
import { Transition } from "react-transition-group";
import { usePrefersReducedMotion } from "../../hooks/usePrefersReducedMotion";
import { useInViewport } from "../../hooks/useInViewport";
import { reflow } from "../../utils/transition";
import { media, rgbToThreeColor } from "../../utils/style";
import { cleanScene, removeLights, cleanRenderer } from "../../utils/three";
import "./DisplacementSphere.css";
import { ThemeContext } from "../theme/ThemeProvider";

// --- Цветовые палитры (оставляем из предыдущего шага) ---
const LIGHT_THEME_COLORS = {
    background: "220 230 255", // Светло-голубой фон
    directional: "255 255 255", // Белый направленный свет
    ambient: "180 200 255", // Голубоватый окружающий свет
    ambientIntensity: 0.7,
    directionalIntensity: 0.8,
};

const DARK_THEME_COLORS = {
    background: "10 5 30", // Темно-фиолетовый фон
    directional: "180 150 255", // Лавандовый направленный свет
    ambient: "80 50 150", // Темно-фиолетовый окружающий свет
    ambientIntensity: 0.4,
    directionalIntensity: 0.6,
};
// --- Конец палитр ---

const DisplacementSphere = (props) => {
    const { theme } = useContext(ThemeContext);
    // Выбираем палитру в зависимости от темы
    const currentColors = theme === "light" ? LIGHT_THEME_COLORS : DARK_THEME_COLORS;
    const rgbBackground = currentColors.background; // Используем фон из палитры

    const width = useRef(window.innerWidth);
    const height = useRef(window.innerHeight);
    const start = useRef(Date.now());
    const canvasRef = useRef();
    const mouse = useRef();
    const renderer = useRef();
    const camera = useRef();
    const scene = useRef();
    const lights = useRef([]); // Инициализируем пустым массивом
    const uniforms = useRef();
    const material = useRef();
    const geometry = useRef();
    const sphere = useRef();
    const tweenRef = useRef();
    const sphereSpring = useRef();
    const prefersReducedMotion = Boolean(usePrefersReducedMotion() && false);
    const isInViewport = useInViewport(canvasRef);

    useEffect(() => {
        // --- Setup ---
        mouse.current = new Vector2(0.8, 0.5);
        renderer.current = new WebGLRenderer({
            canvas: canvasRef.current,
            powerPreference: "high-performance",
        });
        renderer.current.setSize(width.current, height.current);
        renderer.current.setPixelRatio(1); // Можно вернуть window.devicePixelRatio, если нужно четче
        renderer.current.outputEncoding = sRGBEncoding;

        camera.current = new PerspectiveCamera(
            55,
            width.current / height.current,
            0.1,
            200
        );
        camera.current.position.z = 52;

        scene.current = new Scene();

        material.current = new MeshPhongMaterial();
        material.current.onBeforeCompile = (shader) => {
            uniforms.current = UniformsUtils.merge([
                UniformsLib["ambient"],
                UniformsLib["lights"],
                shader.uniforms,
                { time: { type: "f", value: 0 } },
            ]);
            shader.uniforms = uniforms.current;
            shader.vertexShader = vertShader; // Применяем модифицированный вертексный шейдер
            shader.fragmentShader = fragShader;
            shader.lights = true;
        };

        // --- Используем SphereBufferGeometry с высокой детализацией ---
        geometry.current = new SphereBufferGeometry(32, 256, 256); // Увеличиваем сегменты для большей детализации

        sphere.current = new Mesh(geometry.current, material.current);
        sphere.current.position.z = 0;
        sphere.current.modifier = Math.random();
        scene.current.add(sphere.current);

        // --- Начальная установка света и фона ---
        // Вынесем логику установки света в отдельную функцию для переиспользования
        const updateSceneAppearance = (currentThemeColors) => {
            if (!scene.current) return; // Добавим проверку

            const rgbBackground = currentThemeColors.background;
            scene.current.background = rgbToThreeColor(rgbBackground);

            // Удаляем старый свет
            removeLights(lights.current); // Используем обновленную removeLights

            // Создаем и добавляем новый свет
            const dirLight = new DirectionalLight(
                rgbToThreeColor(currentThemeColors.directional),
                currentThemeColors.directionalIntensity
            );
            const ambientLight = new AmbientLight(
                rgbToThreeColor(currentThemeColors.ambient),
                currentThemeColors.ambientIntensity
            );
            dirLight.position.set(100, 100, 200);

            lights.current = [dirLight, ambientLight]; // Обновляем ref новым массивом
            lights.current.forEach((light) => scene.current.add(light));
        };

        // Вызываем функцию для начальной установки
        const initialColors = theme === "light" ? LIGHT_THEME_COLORS : DARK_THEME_COLORS;
        updateSceneAppearance(initialColors);


        return () => {
            // Очистка при размонтировании компонента
            removeLights(lights.current); // Удаляем свет
            lights.current = []; // Очищаем массив в ref
            cleanScene(scene.current);
            cleanRenderer(renderer.current);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Зависимости setup должны быть минимальны

    useEffect(() => {
        // --- Обновление ТОЛЬКО света и фона при смене темы ---
        // Не создаем новые объекты сцены/камеры/рендерера здесь

        const currentThemeColors = theme === "light" ? LIGHT_THEME_COLORS : DARK_THEME_COLORS;
        if (!scene.current) return; // Проверка на случай, если сцена еще не создана

        const rgbBackground = currentThemeColors.background;
        scene.current.background = rgbToThreeColor(rgbBackground);

        // Удаляем старый свет
        removeLights(lights.current); // Используем обновленную removeLights

        // Создаем и добавляем новый свет
        const dirLight = new DirectionalLight(
            rgbToThreeColor(currentThemeColors.directional),
            currentThemeColors.directionalIntensity
        );
        const ambientLight = new AmbientLight(
            rgbToThreeColor(currentThemeColors.ambient),
            currentThemeColors.ambientIntensity
        );
        dirLight.position.set(100, 100, 200); // Убедимся, что позиция установлена

        lights.current = [dirLight, ambientLight]; // Обновляем ref новым массивом
        lights.current.forEach((light) => scene.current.add(light));

        // Не возвращаем функцию очистки здесь, т.к. очистка происходит при размонтировании

    }, [theme]); // Зависимость только от темы

    // useEffect для resize остается без изменений
    useEffect(() => {
        const handleResize = () => {
            const canvasHeight = innerHeight();
            const windowWidth = window.innerWidth;
            const fullHeight = canvasHeight + canvasHeight * 0.3;
            if (canvasRef.current) { // Добавим проверку на существование canvasRef.current
                canvasRef.current.style.height = `${fullHeight}px`; // Убедимся, что добавляем 'px'
            }
            renderer.current.setSize(windowWidth, fullHeight);
            camera.current.aspect = windowWidth / fullHeight;
            camera.current.updateProjectionMatrix();

            if (prefersReducedMotion) {
                renderer.current.render(scene.current, camera.current);
            }

            if (windowWidth <= media.mobile) {
                sphere.current.position.x = 14;
                sphere.current.position.y = 10;
            } else if (windowWidth <= media.tablet) {
                sphere.current.position.x = 18;
                sphere.current.position.y = 14;
            } else {
                sphere.current.position.x = 22;
                sphere.current.position.y = 16;
            }
        };

        window.addEventListener("resize", handleResize);
        handleResize();

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, [prefersReducedMotion]);


    // useEffect для mousemove остается без изменений
    useEffect(() => {
        const onMouseMove = (event) => {
            const { rotation } = sphere.current;

            const position = {
                x: event.clientX / window.innerWidth,
                y: event.clientY / window.innerHeight,
            };

            if (!sphereSpring.current) {
                sphereSpring.current = value(rotation.toArray(), (values) =>
                    rotation.set(
                        values[0],
                        values[1],
                        sphere.current.rotation.z
                    )
                );
            }

            tweenRef.current = spring({
                from: sphereSpring.current.get(),
                to: [position.y / 2, position.x / 2],
                stiffness: 30,
                damping: 20,
                velocity: sphereSpring.current.getVelocity(),
                mass: 2,
                restSpeed: 0.0001,
            }).start(sphereSpring.current);
        };

        if (!prefersReducedMotion && isInViewport) {
            window.addEventListener("mousemove", onMouseMove);
        }

        return () => {
            window.removeEventListener("mousemove", onMouseMove);

            if (tweenRef.current) {
                tweenRef.current.stop();
            }
        };
    }, [isInViewport, prefersReducedMotion]);


    // useEffect для анимации остается без изменений
    useEffect(() => {
        let animation;

        const animate = () => {
            animation = requestAnimationFrame(animate);

            if (uniforms.current !== undefined) {
                uniforms.current.time.value =
                    0.00005 * (Date.now() - start.current);
            }

            sphere.current.rotation.z += 0.001;
            renderer.current.render(scene.current, camera.current);
        };

        if (!prefersReducedMotion && isInViewport) {
            animate();
        } else {
            renderer.current.render(scene.current, camera.current);
        }

        return () => {
            cancelAnimationFrame(animation);
        };
    }, [isInViewport, prefersReducedMotion]);


    // return JSX остается без изменений
    return (
        <Transition appear in onEnter={reflow} timeout={3000}>
            {(status) => (
                <canvas
                    aria-hidden
                    className={classNames(
                        "displacement-sphere",
                        `displacement-sphere--${status}`
                    )}
                    ref={canvasRef}
                    {...props}
                />
            )}
        </Transition>
    );
};

export default DisplacementSphere;
