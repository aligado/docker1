/**
 * Copyright (c) 2016 Topcoder Inc, All rights reserved.
 */
'use strict';

/**
 * Implementation of account handler for 'remit' account type
 *
 * @author      TCSCODER
 * @version     1.0
 */

const request = require('request-promise');

const config = require('config');
const joi = require('joi');
const errors = require('common-errors');
const humps = require('humps');
const cheerio = require('cheerio');
const moment = require('moment');
const helper = require('../common/helper');
const _ = require('lodash');

const client = request.defaults({ jar: true });

module.exports = {
  handleRequest,
};

// the handle request joi validation schema
handleRequest.schema = {
  query: joi.object().keys({
    fromTransDate: joi.date().format('MM/DD/YYYY').required(),
    toTransDate: joi.date().format('MM/DD/YYYY').required(),
  }).required(),
  body: joi.object(),
};

/**
 * Helper util method to sanitize the text, currently it removes '\n'
 * character and join individual string on '\n'
 *
 * @param  {String}    text         the text to sanitize
 * @return {String}                 the sanitized string
 */
function sanitizeText(text) {
  const sanitized = [];
  _.each(text.split('\n'), (single) => {
    sanitized.push(single.trim());
  });
  return sanitized.join(' ').trim();
}

/**
 * Scrape the SBI remit website and get the account details
 *
 * @param {Object}    query         the parsed request query string
 * @param {Object}    body          the parsed request body
 */
function* handleRequest(query, body) {                      // eslint-disable-line no-unused-vars
  const from = moment(query.fromTransDate);
  const to = moment(query.toTransDate);

  if (to.diff(from) < 0) {
    throw new errors.ValidationError('fromTransDate should be less than toTransDate', 400);
  }

  // first login into the remit portal
  const loginOpts = config.ACCOUNTS.remit.login;
  loginOpts.method = 'POST';

  yield client(loginOpts);

  // next get the account details
  const opts = {
    uri: config.ACCOUNTS.remit.details.url,
    auth: config.ACCOUNTS.remit.login.auth,
    method: 'POST',
    form: {
      'member_main_AccountBalance_History:accountBalanceHistorytForm':
        'member_main_AccountBalance_History:accountBalanceHistorytForm',
      'member_main_AccountBalance_History:accountBalanceHistorytForm:header:language': 'en',
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id25pc6': true,
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id99pc6:month': from.month(),
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id99pc6:day': from.date(),
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id99pc6:year': from.year(),
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id115pc6:month': to.month(),
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id115pc6:day': to.date(),
      'member_main_AccountBalance_History:accountBalanceHistorytForm:main:j_id_id115pc6:year': to.year(),
      memberFlg: 1,
    },
  };
  const html = yield client(opts);
  const $ = cheerio.load(html);

  const parsingErrors = [];
  // before parsing validate the page layout, the page ids are configured and the html should have
  // atleast those many elements, if something is not present than report error to error service
  _.each(config.ACCOUNTS.remit.layout.ids, (id) => {
    const element = $(`#${id}`);
    if (element.length === 0) {
      parsingErrors.push({
        title: 'ParsingError',
        details: `${id} element not exist in html, probably the site layout has changed`,
      });
    }
  });

  // post parsing errors
  if (parsingErrors.length !== 0) {
    helper.postErrors(parsingErrors);
  }

  const headings = [];
  const rows = [];

  // parse the tabular data
  $('.form_frame_solid').last().find('table:not(#radioSel, .pager_table)').find('thead > tr > th')
    .each((index, cell) => {
      const text = $(cell).find('span').last().text().trim();
      headings.push(text);
    }
  );

  // remove the 0th element, as the first column is a radio selector
  headings.splice(0, 1);

  $('.form_frame_solid').last().find('table:not(#radioSel, .pager_table)').find('tbody > tr')
    .each((ri, rcell) => {
      const row = { };
      $(rcell).find('td div').each((ci, ccell) => {
        if (headings[ci]) {
          const text = $(ccell).contents().filter(function () { return this.type === 'text'; }).text();
          row[headings[ci]] = sanitizeText(text);
        }
      });
      rows.push(humps.camelizeKeys(row));
    }
  );

  return rows;
}
