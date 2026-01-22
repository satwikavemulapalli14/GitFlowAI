/**
 * Route Loader
 * Auto-discovers route modules in this directory (excluding this file)
 * and registers them with the Express app.
 *
 * Each route module must export:
 *   { path: '/api/example', router: Express.Router() }
 */

const fs = require('fs');
const path = require('path');

const registerRoutes = (app) => {
  const routeFiles = fs.readdirSync(__dirname).filter(
    (file) => file !== 'index.js' && file.endsWith('.js')
  );

  routeFiles.forEach((file) => {
    const routeModule = require(path.join(__dirname, file));

    if (routeModule.path && routeModule.router) {
      app.use(routeModule.path, routeModule.router);
      console.log(`  ✓ Route registered: ${routeModule.path}`);
    }
  });
};

module.exports = registerRoutes;
