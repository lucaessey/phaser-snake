import { BRAINROT_IMAGES } from './skins';

// Discover optional artwork at build time: absent images use numbered tiles,
// without failed network requests on every new game (including offline games).
const optionalImages = Object.keys(import.meta.glob('/public/assets/brainrot_*.png'));

export function preloadSnakeAssets(scene) {
    const load = (key, file) => {
        if (!scene.textures.exists(key)) scene.load.image(key, file);
    };
    for (const part of ['head_up', 'head_down', 'head_left', 'head_right',
        'body_vertical', 'body_horizontal', 'body_topleft', 'body_topright',
        'body_bottomleft', 'body_bottomright', 'tail_up', 'tail_down', 'tail_left', 'tail_right']) {
        load(part, `assets/${part}.png`);
    }
    for (const [key, file] of Object.entries({ apple: 'apple', banana: 'Banana', eggplant: 'Eggplant', jerry: 'Jerry', sushi: 'Sushi' })) {
        load(key, `assets/${file}.png`);
    }
    for (const key of BRAINROT_IMAGES) {
        if (optionalImages.includes(`/public/assets/${key}.png`)) load(key, `assets/${key}.png`);
    }
}
