import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import sirv from 'sirv';
import { resolve } from 'path';

function resourcesPlugin() {
  return {
    name: 'serve-resources',
    configureServer(server) {
      const resourcesPath = resolve(__dirname, 'Resources');
      const serve = sirv(resourcesPath, {
        dev: true,
        extensions: [],
      });
      server.middlewares.use('/photos', serve);
    },
  };
}

export default defineConfig({
  plugins: [react(), resourcesPlugin()],
});
