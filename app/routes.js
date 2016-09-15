/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Defines the API routes
 *
 * @author      TCSCODER
 * @version     1.0
 */

module.exports = {
  '/api/accounts/': {
    get: {
      controller: 'AccountController',
      method: 'getDetails',
    },
  },
};
