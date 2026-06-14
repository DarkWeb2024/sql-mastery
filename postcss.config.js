import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Point Tailwind at this project's config by absolute path. Without this, the
// plugin resolves the config relative to the working directory, which is not
// guaranteed to be the project root when the dev server is launched indirectly.
const root = dirname(fileURLToPath(import.meta.url));

export default {
  plugins: {
    tailwindcss: { config: join(root, 'tailwind.config.js') },
    autoprefixer: {},
  },
};
