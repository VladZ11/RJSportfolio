/**
 * Clean up a scene's materials and geometry
 */
export const cleanScene = scene => {
  scene.traverse(object => {
    if (!object.isMesh) return;

    object.geometry.dispose();

    if (object.material.isMaterial) {
      cleanMaterial(object.material);
    } else {
      for (const material of object.material) {
        cleanMaterial(material);
      }
    }
  });

  scene.dispose();
};

/**
 * Clean up and dispose of a material
 */
export const cleanMaterial = material => {
  material.dispose();

  for (const key of Object.keys(material)) {
    const value = material[key];
    if (value && typeof value === 'object' && 'minFilter' in value) {
      value.dispose();
    }
  }
};

/**
 * Clean up and dispose of a renderer
 */
export const cleanRenderer = renderer => {
  renderer.dispose();
  renderer.forceContextLoss();
  renderer = null;
};

/**
 * Clean up lights by removing them from their parent
 */
export function removeLights(lights) {
  if (!lights) return;
  lights.forEach(light => {
    // Добавляем проверку на light.parent
    if (light && light.parent) {
      light.parent.remove(light);
    }
  });
}

/**
 * A reasonable default pixel ratio
 */
export const renderPixelRatio = 2;
