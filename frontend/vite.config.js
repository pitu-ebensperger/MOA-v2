/* eslint-env node */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, globalThis.process?.cwd?.() ?? "", "");
  const apiProxyTarget = (env.VITE_API_URL ?? "http://localhost:4000").trim();
  const apiProxyPaths = [
    "/auth",
    "/login",
    "/cart",
    "/wishlist",
    "/direcciones",
    "/home",
    "/categorias",
    "/productos",
    "/producto",
    "/admin",
    "/pedidos",
    "/orders",
    "/usuario",
    "/user",
    "/config",
    "/api",
  ];

  const proxy = Object.fromEntries(
    apiProxyPaths.map((pathname) => [
      pathname,
      {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        bypass(req) {
          if (req.headers.accept?.includes("text/html")) {
            return "/index.html";
          }
          return undefined;
        },
      },
    ]),
  );

  return {
    plugins: [
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@context': path.resolve(__dirname, './src/context'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@config': path.resolve(__dirname, './src/config'),
        '@icons': path.resolve(__dirname, './src/utils/icons'),
        '@shared': path.resolve(__dirname, '../shared'),
        // Alias para mantener compatibilidad con imports anteriores
        '@config/react-query': path.resolve(__dirname, './src/config/query.client.config.js'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor principal - React y routing
            'react-core': ['react', 'react-dom', 'react-router-dom'],
            // UI Components - Radix UI
            'ui-components': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-label',
              '@radix-ui/react-popover',
              '@radix-ui/react-select',
              '@radix-ui/react-slot',
              '@radix-ui/react-tabs',
              '@radix-ui/react-tooltip',
            ],
            // Data management - tablas
            'data-libs': [
              '@tanstack/react-table',
            ],
            // Forms y validación
            'forms': [
              'react-hook-form',
              '@hookform/resolvers',
              'zod',
            ],
            // Charts y visualización
            'charts': ['recharts'],
            // Iconos
            'icons': ['@heroicons/react', 'lucide-react'],
            // Utilidades
            'utils': ['clsx', 'tailwind-merge', 'class-variance-authority'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
      // Optimización de sourcemaps para producción
      sourcemap: mode === 'production' ? false : true,
    },
    server: {
      proxy,
      hmr: {
        overlay: true,
      },
      fs: {
        // Permitir importar archivos desde la carpeta shared y desde el propio root del proyecto
        // Nota: cuando se define 'server.fs.allow', debemos incluir explícitamente el directorio raiz
        // para evitar el error "outside of Vite serving allow list" al servir index.html
        allow: [
          __dirname,
          path.resolve(__dirname, '../shared'),
        ],
      },
      watch: {
        usePolling: false,
        interval: 100,
      },
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
      ],
    },
  };
})
