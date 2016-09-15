/*
 * Copyright (C) 2016 TopCoder Inc., All Rights Reserved.
 */
'use strict';
/**
 * Init app
 *
 * @author      TCSCODER
 * @version     1.0
 */

global.Promise = require('bluebird');
const logger = require('./common/logger');

logger.buildService(require('./services/AccountService'));

// build all the account handlers
logger.buildService(require('./accounts/RemitAccountHandler'));
