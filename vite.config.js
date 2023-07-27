import { defineConfig } from 'vite'

export default{
    build: {
        rollupOptions: {
          input: {
            app: './1-space_invaders_3D.html',
          },
        },
      },
      server: {
        open: '/1-space_invaders_3D.html',
      },
  }
