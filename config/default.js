/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * The configuration file.
 * @author      TCSCODER
 * @version     1.0
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || 3000,
  ERROR_API: process.env.ERROR_API_ENDPOINT || 'http://sb-error-service.ap-northeast-1.elasticbeanstalk.com/errors',
  ACCOUNTS: {
    remit: {
      layout: {
        ids: require('./remitPageIds.json').ids,
      },
      handler: 'RemitAccountHandler',
      login: {
        url: process.env.REMIT_LOGIN_URL || 'http://remit-proxyservice.ap-northeast-1.elasticbeanstalk.com/proxy_login',
        auth: {
          username: process.env.REMIT_USERNAME,
          password: process.env.REMIT_PASSWORD,
        },
      },
      details: {
        url: process.env.REMIT_DETAILS_URL || 'http://remit-proxyservice.ap-northeast-1.elasticbeanstalk.com/MainAccountBalanceHistory.jsf',
      },
    },
  },
};
