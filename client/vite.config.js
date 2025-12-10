import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})


// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import prerender from 'vite-plugin-prerender'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     prerender({
//       // List all the routes you want static HTML for
//       routes: [
//         '/', 
//         '/about', 
//         '/services', 
//         '/mutual-fund', 
//         '/financial-tools',
//       ],
//     }),
//   ],
// })
