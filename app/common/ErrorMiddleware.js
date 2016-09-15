/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';

/**
 * Common error handling middleware
 *
 * @author      TSCCODER
 * @version     1.0
 */

const logger = require('./logger');
const helper = require('./helper');

/**
 * The error middleware function
 *
 * @param  {Object}     err       the error that is thrown in the application
 * @param  {Object}     req       the express request instance
 * @param  {Object}     res       the express response instance
 * @param  {Function}   next      the next middleware in the chain
 */
function middleware(err, req, res, next) {                        // eslint-disable-line no-unused-vars
  logger.logFullError(err, req.method, req.url);
  // report all errors to error service
  helper.postError(err);
  if (err.isJoi) {
    res.status(400).json({
      title: 'Validation failed',
      details: err.details,
    });
  } else {
    res.status(err.code || 500).json({
      title: err.name || 'Server Error',
      details: `Server failed to process request, internal error [${err.message}]`,
    });
  }
}

module.exports = function () {
  return middleware;
};
