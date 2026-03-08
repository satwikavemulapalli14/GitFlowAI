const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const swaggerPath = path.join(__dirname, '../../swagger.json');
const swaggerDocument = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));

const options = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'GitFlowAI API Docs',
};

router.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDocument, options));

router.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

router.get('/swagger.yaml', (req, res) => {
  res.type('yaml').send(yaml.dump(swaggerDocument));
});

module.exports = { path: '/api/docs', router };
