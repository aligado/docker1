/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Common abstraction module on top of various account type handlers
 * This module loads the appropriate module based on the account type
 * and delegate the request handling to appropriate module
 *
 * @author      TCSCODER
 * @version     1.0
 */

const joi = require('joi');
const path = require('path');
const _ = require('lodash');
const config = require('config');

// Exports
module.exports = {
  getDetails,
};

// the joi schema for register
getDetails.schema = {
  query: joi.object().required(),
  body: joi.object().required(),
};

/**
 * Load the account type handler for the specified type
 *
 * @param  {String}   type        the account type
 */
function loadAccountTypeHandler(type) {
  const handlerPath = path.join(__dirname, '..', 'accounts', config.ACCOUNTS[type].handler);
  return require(handlerPath);
}

/**
 * Helper utility wrapper for parallel yields of multiple account types
 *
 * @param {String}    type          the account type
 * @param {Object}    query         the parsed request query string
 * @param {Object}    body          the parsed request body
 */
function* doHandle(type, query, body) {
  const handler = loadAccountTypeHandler(type);
  const result = yield handler.handleRequest(query, body);
  return {
    [type]: result,
  };
}

/**
 * Convert the result into output format
 * @param  {Object}    result         the result array to convert from
 * @return {Object}                   the desired response format
 */
function convert(result) {
  const converted = { };
  _.each(result, (single) => {
    _.each(single, (value, key) => {
      converted[key] = value;
    });
  });
  return converted;
}

/**
 * Loads each account handlers and delegate the
 * processing to that handler.
 * All the handlers are invoked in parallel
 *
 * @param {Object}    query         the parsed request query string
 * @param {Object}    body          the parsed request body
 */
function* getDetails(query, body) {
  const yieldables = [];
  _.each(_.keys(config.ACCOUNTS), (type) => {
    yieldables.push(doHandle(type, query, body));
  });
  const result = yield yieldables;
  return convert(result);
}
