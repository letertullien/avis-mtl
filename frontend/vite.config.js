import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [

    react(),

    VitePWA({
      strategies:   'injectManifest',                                          // Utilise notre sw.js au lieu de générer automatiquement
      srcDir:       'public',                                                  // Dossier source du SW
      filename:     'sw.js',                                                   // Nom du fichier SW
      registerType: 'autoUpdate',                                              // le SW se met à jour automatiquement en arrière-plan

      workbox: {
        globPatterns: ['**/*.{js,css,html,png,svg,ico,webmanifest}'],          // Fichiers à précacher au premier chargement
      },

      manifest: {                                                              // Données à l'installation
        name:             'Avis et alertes Montréal',
        short_name:       'Avis MTL',
        description:      'Consultez les avis et alertes de la Ville de Montréal',
        start_url:        '/',
        scope:            '/',
        display:          'standalone',                                        // s'ouvre sans barre de navigation
        orientation:      'portrait',
        background_color: '#ffffff',
        theme_color:      '#1a1a2e',
        lang:             'fr-CA',

        icons: [
          {
            src:     '/icons/icon-192.png',
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/icon-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/icons/icon-maskable-512.png',
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',
          },
        ],

        screenshots: [
          {
            src:         '/screenshots/mobile.png',
            sizes:       '1170x2531',
            type:        'image/png',
            form_factor: 'narrow',
            label:       "Page d'accueil sur mobile",
          },
          {
            src:         '/screenshots/desktop.png',
            sizes:       '2560x1600',
            type:        'image/png',
            form_factor: 'wide',
            label:       "Page d'accueil sur ordinateur",
          },
        ],
      },
    }),
  ],
})