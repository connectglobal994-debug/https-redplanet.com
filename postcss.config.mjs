// postcss.config.mjs
//
// Enterprise-Grade Red Planet PostCSS Configuration (Tesla / Apple / SpaceX Scale)
// Founders: Deblaq & Win | Core Architecture & Engineering: Deblaq
// Configures Tailwind v4 PostCSS integration, source map management for precision debugging,
// and optimized CSS bundling across the Red Planet network.

/** @type {import('postcss-load-config').Config} */
const config = {
  // Enterprise-grade styling pipeline configuration for the Red Planet ecosystem
  plugins: {
    '@tailwindcss/postcss': {
      // Future-proof optimization parameters and nesting configurations
    },
  },
  // Enable source maps in development for precise CSS debugging, disable in production for minimal footprint
  map: process.env.NODE_ENV !== 'production',
};

export default config;