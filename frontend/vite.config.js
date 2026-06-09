import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({

  base: '/avis-mtl/',                                                          // Chemin de base pour GitHub Pages

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
        start_url:        '/avis-mtl/',                                        // Chemin de base GitHub Pages
        scope:            '/avis-mtl/',                                        // Chemin de base GitHub Pages
        display:          'standalone',                                        // s'ouvre sans barre de navigation
        orientation:      'portrait',
        background_color: '#ffffff',
        theme_color:      '#1a1a2e',
        lang:             'fr-CA',

        icons: [
          {
            src:     '/avis-mtl/icons/icon-192.png',                           // Chemin corrigé pour GitHub Pages
            sizes:   '192x192',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/avis-mtl/icons/icon-512.png',                           // Chemin corrigé pour GitHub Pages
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'any',
          },
          {
            src:     '/avis-mtl/icons/icon-maskable-512.png',                  // Chemin corrigé pour GitHub Pages
            sizes:   '512x512',
            type:    'image/png',
            purpose: 'maskable',
          },
        ],

        screenshots: [
          {
            src:         '/avis-mtl/screenshots/mobile.png',                   // Chemin corrigé pour GitHub Pages
            sizes:       '1170x2531',
            type:        'image/png',
            form_factor: 'narrow',
            label:       "Page d'accueil sur mobile",
          },
          {
            src:         '/avis-mtl/screenshots/desktop.png',                  // Chemin corrigé pour GitHub Pages
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