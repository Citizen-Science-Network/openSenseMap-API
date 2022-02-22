'use strict';

const { usersController,
    statisticsController,
    boxesController,
    sensorsController,
    measurementsController,
    campaignsController,
    threadsController,
    managementController } = require('./controllers'),
  config = require('config'),
  { getVersion } = require('./helpers/apiUtils'),
  { verifyJwt } = require('./helpers/jwtHelpers'),
  { initUserParams, checkPrivilege } = require('./helpers/userParamHelpers');

const spaces = function spaces (num) {
  let str = ' ';
  for (let i = 1; i < num; i++) {
    str = `${str} `;
  }

  return str;
};

/**
 * @api {get} / print all routes
 * @apiName printRoutes
 * @apiDescription Returns all routes of this API in human readable format
 * @apiGroup Misc
 */
const printRoutes = function printRoutes (req, res) {
  res.header('Content-Type', 'text/plain; charset=utf-8');

  const lines = [
    `This is the openSenseMap API running on ${config.get('api_url')}`,
    `Version: ${getVersion}`,
    'You can find a detailed reference at https://docs.opensensemap.org',
    '',
    'Routes requiring no authentication:'
  ];

  const longestRoute = 37;

  for (const route of routes.noauth) {
    let method = route.method.toLocaleUpperCase();
    if (method === 'DEL') {
      method = 'DELETE';
    } else {
      method = `${method}${spaces(6 - method.length)}`;
    }

    lines.push(`${method} ${route.path}${spaces(longestRoute - route.path.length)} Reference: https://docs.opensensemap.org/#${route.reference}`);
  }

  lines.push('');
  lines.push('Routes requiring valid authentication through JWT:');

  for (const route of routes.auth) {
    let method = route.method.toLocaleUpperCase();
    if (method === 'DEL') {
      method = 'DELETE';
    } else {
      method = `${method}${spaces(6 - method.length)}`;
    }

    lines.push(`${method} ${route.path}${spaces(longestRoute - route.path.length)} Reference: https://docs.opensensemap.org/#${route.reference}`);
  }

  res.end(lines.join('\n'));
};

const { boxes: boxesPath, campaign: campaignsPath, users: usersPath, statistics: statisticsPath, management: managementPath } = config.get('routes');
// the ones matching first are used
// case is ignored
const routes = {
  'noauth': [
    { path: '/', method: 'get', handler: printRoutes, reference: 'api-Misc-printRoutes' },
    { path: '/stats', method: 'get', handler: statisticsController.getStatistics, reference: 'api-Misc-getStatistics' },
    { path: `${statisticsPath}/idw`, method: 'get', handler: statisticsController.getIdw, reference: 'api-Interpolation-calculateIdw' },
    { path: `${statisticsPath}/descriptive`, method: 'get', handler: statisticsController.descriptiveStatisticsHandler, reference: 'api-Statistics-descriptive' },
    { path: `${boxesPath}`, method: 'get', handler: boxesController.getBoxes, reference: 'api-Boxes-getBoxes' },
    { path: `${boxesPath}/data`, method: 'get', handler: measurementsController.getDataMulti, reference: 'api-Measurements-getDataMulti' },
    { path: `${boxesPath}/:boxId`, method: 'get', handler: boxesController.getBox, reference: 'api-Boxes-getBox' },
    { path: `${boxesPath}/:boxId/sensors`, method: 'get', handler: measurementsController.getLatestMeasurements, reference: 'api-Measurements-getLatestMeasurements' },
    { path: `${boxesPath}/:boxId/sensors/:sensorId`, method: 'get', handler: measurementsController.getLatestMeasurements, reference: 'api-Measurements-getLatestMeasurementOfSensor' },
    { path: `${boxesPath}/:boxId/data/:sensorId`, method: 'get', handler: measurementsController.getData, reference: 'api-Measurements-getData' },
    { path: `${boxesPath}/:boxId/locations`, method: 'get', handler: boxesController.getBoxLocations, reference: 'api-Measurements-getLocations' },
    { path: `${boxesPath}/data`, method: 'post', handler: measurementsController.getDataMulti, reference: 'api-Measurements-getDataMulti' },
    { path: `${boxesPath}/:boxId/data`, method: 'post', handler: measurementsController.postNewMeasurements, reference: 'api-Measurements-postNewMeasurements' },
    { path: `${boxesPath}/:boxId/:sensorId`, method: 'post', handler: measurementsController.postNewMeasurement, reference: 'api-Measurements-postNewMeasurement' },
    { path: `${usersPath}/register`, method: 'post', handler: usersController.registerUser, reference: 'api-Users-register' },
    { path: `${usersPath}/request-password-reset`, method: 'post', handler: usersController.requestResetPassword, reference: 'api-Users-request-password-reset' },
    { path: `${usersPath}/password-reset`, method: 'post', handler: usersController.resetPassword, reference: 'api-Users-password-reset' },
    { path: `${usersPath}/confirm-email`, method: 'post', handler: usersController.confirmEmailAddress, reference: 'api-Users-confirm-email' },
    { path: `${usersPath}/sign-in`, method: 'post', handler: usersController.signIn, reference: 'api-Users-sign-in' },
    { path: `${usersPath}/refresh-auth`, method: 'post', handler: usersController.refreshJWT, reference: 'api-Users-refresh-auth' },
    { path: `${usersPath}/campaign`, method: 'post', handler: campaignsController.postNewCampaign, reference: 'api-Campaign-postNewCampaign' },
    { path: `${usersPath}/campaigns`, method: 'get', handler: campaignsController.getCampaigns, reference: 'api-Campaigns-getCampaigns' },
    { path: `${usersPath}/campaign/:campaignId`, method: 'get', handler: campaignsController.getCampaign, reference: 'api-Campaigns-getCampaign' },
    { path: `${usersPath}/campaign/:campaignId`, method: 'put', handler: campaignsController.updateCampaign, reference: 'api-Campaigns-updateCampaign' },
    { path: `${usersPath}/campaign/:campaignId`, method: 'del', handler: campaignsController.deleteCampaign, reference: 'api-Campaigns-deleteCampaign' },
    //{ path: `${usersPath}/campaign`, method: 'put', handler: campaignsController.updateCampaign, reference: 'api-Campaigns-updateCampaign' }
    { path: `${usersPath}/thread`, method: 'post', handler: threadsController.postNewThread, reference: 'api-Thread-postNewThread' },
    { path: `${usersPath}/threads`, method: 'get', handler: threadsController.getThreads, reference: 'api-Threads-getThreads' },
    { path: `${usersPath}/thread/:threadId`, method: 'get', handler: threadsController.getThread, reference: 'api-Threads-getThread' },
    { path: `${usersPath}/thread/:threadId`, method: 'put', handler: threadsController.updateThread, reference: 'api-Threads-updateThread' },
    { path: `${usersPath}/thread/:threadId`, method: 'del', handler: threadsController.deleteThread, reference: 'api-Threads-deleteThread' }
  ],
  'auth': [
    { path: `${usersPath}/me`, method: 'get', handler: usersController.getUser, reference: 'api-Users-getUser' },
    { path: `${usersPath}/me`, method: 'put', handler: usersController.updateUser, reference: 'api-Users-updateUser' },
    { path: `${usersPath}/me/boxes`, method: 'get', handler: usersController.getUserBoxes, reference: 'api-Users-getUserBoxes' },
    { path: `${boxesPath}/:boxId/script`, method: 'get', handler: boxesController.getSketch, reference: 'api-Boxes-getSketch' },
    { path: `${boxesPath}`, method: 'post', handler: boxesController.postNewBox, reference: 'api-Boxes-postNewBox' },
    { path: `${boxesPath}/:boxId`, method: 'put', handler: boxesController.updateBox, reference: 'api-Boxes-updateBox' },
    { path: `${boxesPath}/:boxId`, method: 'del', handler: boxesController.deleteBox, reference: 'api-Boxes-deleteBox' },
    { path: `${boxesPath}/:boxId/:sensorId/measurements`, method: 'del', handler: sensorsController.deleteSensorData, reference: 'api-Measurements-deleteMeasurements' },
    { path: `${usersPath}/sign-out`, method: 'post', handler: usersController.signOut, reference: 'api-Users-sign-out' },
    { path: `${usersPath}/me`, method: 'del', handler: usersController.deleteUser, reference: 'api-Users-deleteUser' },
    { path: `${usersPath}/me/resend-email-confirmation`, method: 'post', handler: usersController.requestEmailConfirmation, reference: 'api-Users-request-email-confirmation' }
    //{ path: `${usersPath}/campaign`, method: 'post', handler: campaignsController.postNewCampaign, reference: 'api-Campaign-postNewCampaign' }
    //{ path: `${usersPath}/campaign`, method: 'get', handler: campaignsController.getCampaigns, reference: 'api-Campaign-getCampaigns' }
  ],
  'management': [
    { path: `${managementPath}/boxes`, method: 'get', handler: managementController.listBoxes, reference: 'api-Admin-listBoxes' },
    { path: `${managementPath}/boxes/:boxId`, method: 'get', handler: managementController.getBox, reference: 'api-Admin-getBox' },
    { path: `${managementPath}/boxes/:boxId`, method: 'put', handler: managementController.updateBox, reference: 'api-Admin-updateBox' },
    { path: `${managementPath}/boxes/delete`, method: 'post', handler: managementController.deleteBoxes, reference: 'api-Admin-deleteBoxes' },

    { path: `${managementPath}/users`, method: 'get', handler: managementController.listUsers, reference: 'api-Admin-listUsers' },
    { path: `${managementPath}/users/:userId`, method: 'get', handler: managementController.getUser, reference: 'api-Admin-getUser' },
    { path: `${managementPath}/users/:userId`, method: 'put', handler: managementController.updateUser, reference: 'api-Admin-updateUser' },
    { path: `${managementPath}/users/delete`, method: 'post', handler: managementController.deleteUsers, reference: 'api-Admin-deleteUsers' },
    { path: `${managementPath}/users/:userId/exec`, method: 'post', handler: managementController.execUserAction, reference: 'api-Admin-execUserAction' },

  ]
};

const initRoutes = function initRoutes (server) {
  // attach a function for user parameters
  server.use(initUserParams);

  // attach the routes
  for (const route of routes.noauth) {
    server[route.method]({ path: route.path }, route.handler);
  }

  // Attach secured routes (needs authorization through jwt)
  server.use(verifyJwt);

  for (const route of routes.auth) {
    server[route.method]({ path: route.path }, route.handler);
  }

  server.use(checkPrivilege);

  for (const route of routes.management) {
    server[route.method]({ path: route.path }, route.handler);
  }
};

module.exports = initRoutes;
