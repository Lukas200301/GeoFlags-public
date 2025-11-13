// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',

  devtools: { enabled: true },

  ssr: true,

  modules: [
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
    
    '@nuxt/icon',
    '@nuxt/eslint'
  ],

  css: ['~/assets/css/main.css'],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
    exposeConfig: false,
    viewer: true,
  },

  app: {
    head: {
      title: 'GeoFlags - Test Your Geography Knowledge',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content: 'GeoFlags is an interactive geography quiz game. Test your knowledge of world flags, capitals, and countries!'
        },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon.png' }
      ]
    },
    pageTransition: {
      name: 'page',
      mode: 'out-in'
    },
  },

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001',
      wsUrl: process.env.NUXT_PUBLIC_WS_URL || 'http://localhost:3001',
    }
  },

  devServer: {
    port: 3000,
    host: '0.0.0.0',
  },

  typescript: {
    strict: true,
    typeCheck: true,
    shim: false,
  },

  nitro: {
    routeRules: {
      '/admin/**': { 
        ssr: false,
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        }
      },
      
      '/api/**': {
        cors: true,
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'DENY',
        }
      },
      
      '/auth/**': { 
        ssr: false,
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
        }
      },
      
      '/profile/**': { 
        ssr: false,
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
        }
      },
      
      '/play/**': { 
        ssr: false,
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
        }
      },
      
      '/_nuxt/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=31536000, immutable' 
        } 
      },
      
      '/images/**': { 
        headers: { 
          'Cache-Control': 'public, max-age=31536000' 
        } 
      },
      
      '/**': {
        headers: {
          'X-Content-Type-Options': 'nosniff',
          'X-Frame-Options': 'SAMEORIGIN',
          'X-XSS-Protection': '1; mode=block',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        }
      }
    }
  },

  experimental: {
    viewTransition: true,
  },
})