/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Contains generic helper methods
 *
 * @author      TSCCODER
 * @version     1.0
 */

const _ = require('lodash');
const co = require('co');
const request = require('request-promise');
const logger = require('./logger');
const config = require('config');

module.exports = {
  wrapExpress,
  autoWrapExpress,
  postErrors,
  postError,
};

/**
 * Wrap generator function to standard express function
 * @param {Function} fn the generator function
 * @returns {Function} the wrapped function
 */
function wrapExpress(fn) {
  return function (req, res, next) {
    co(fn(req, res, next)).catch(next);
  };
}

/**
 * Wrap all generators from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress(obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress);
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'GeneratorFunction') {
      return wrapExpress(obj);
    }
    return obj;
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value);
  });
  return obj;
}

/**
 * Post the error to the configurable error monitoring ENDPOINT
 *
 * @param  {Error}  err       the error to post
 */
function postError(err) {
  const errors = [];
  errors.push({
    title: err.name || 'Server Error',
    details: err.message || 'Unexpected error',
  });
  postErrors(errors);
}

/**
 * Post the errors to the configurable error monitoring ENDPOINT
 *
 * @param  {Array}  errors       the array of errors to post
 */
function postErrors(errors) {
  const opts = {
    uri: config.ERROR_API,
    method: 'POST',
    body: errors,
    json: true,
  };

  request(opts).then(() => {
    logger.debug('Successfully posted error to error service');
  }).catch((reason) => {
    logger.error('Failed to post error to error service, reason', reason);
  });
}
