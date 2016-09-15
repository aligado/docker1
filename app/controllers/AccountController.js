/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Exposes the API's to get account details
 *
 * @author      TCSCODER
 * @version     1.0
 */

const AccountService = require('../services/AccountService');

// Exports
module.exports = {
  getDetails,
};

/**
 * Handle a request for a particular account type
 *
 * @param req the request
 * @param res the response
 */
function* getDetails(req, res) {
  res.json(yield AccountService.getDetails(req.query, req.body));
}
