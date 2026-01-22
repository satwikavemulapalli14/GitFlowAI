/**
 * Server Entry Point
 * Imports the Express app and starts the HTTP server.
 * Separated from app.js so the app can be tested without listening.
 */

const app = require('./app');
const config = require('./config');

app.listen(config.port, () => {
  console.log(`\n🚀 GitFlowAI Backend running`);
  console.log(`   Environment : ${config.env}`);
  console.log(`   Port        : ${config.port}`);
  console.log(`   Health      : http://localhost:${config.port}${config.api.prefix}/health\n`);
});
