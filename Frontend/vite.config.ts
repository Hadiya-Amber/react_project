import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      // React 19 optimizations
      babel: {
        plugins: [
          // Enable React Compiler (experimental)
          // ['babel-plugin-react-compiler', {}]
        ],
      },
      // Enable Fast Refresh for React 19
      fastRefresh: true,
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@mui/styled-engine': '@mui/styled-engine'
    },
  },
  define: {
    'process.env': {},
    // React 19 feature flags
    __REACT_19_FEATURES__: true,
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          utils: ['axios', 'dayjs'],
        },
      },
      external: [
        // Exclude unnecessary external resources
        /^https?:\/\//,
        /\.css$/,
        /fonts\.(css|woff|woff2|ttf|eot)$/,
        /content-all\.(css|js)$/,
        /en\.json$/
      ]
    },
    chunkSizeWarningLimit: 1000,
  },
  server: {
    port: 3000,
    host: true,
    // React 19 HMR optimizations
    hmr: {
      overlay: true,
    },
    proxy: {
      '/api': {
        target: 'https://localhost:7245',
        changeOrigin: true,
        secure: false
      }
    }
  },
  // React 19 performance optimizations
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@mui/material',
      '@mui/icons-material',
    ],
    exclude: ['@vite/client', '@vite/env'],
  },
  css: {
    devSourcemap: false,
    preprocessorOptions: {
      // Prevent loading external CSS
      scss: {
        additionalData: `$injectedColor: orange;`
      }
    }
  },
  // Prevent loading external resources
  assetsInclude: [],
})