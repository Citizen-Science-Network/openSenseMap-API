'use strict';

const config = require('../config'),
  moment = require('moment'),
  request = require('request');

let Honeybadger = {
  notify () {},
  resetContext () {}
};

/* eslint-disable global-require */
if (config.honeybadger_apikey) {
  Honeybadger = require('honeybadger').configure({
    apiKey: config.honeybadger_apikey
  });
}
/* eslint-enable global-require */

/**
 * define for Datetype parameters
 * @apiDefine RFC3339Date A RFC 3339 like formatted date-time timestamp with optional milliseconds and uppercase T. Requires both date and time parts. Will be parsed by MomentJS with enabled strict mode. Misinterpretation of the + (plus) character in the specification of the timezone can be avoided by using UTC (Z) or escaping it with %2B. Valid examples are 2017-10-03T22:59:23Z, 2012-12-24T03:24:05.912Z and 1999-04-01T13:13:35Z
 */

// time parsing function used throughout the api
const parseTimestamp = function parseTimestamp (timestamp) {
  if (timestamp instanceof Date || timestamp instanceof moment) {
    return moment.utc(timestamp);
  }

  // is not moment or date, should be safe to call .toString here
  const [ dateParts, timeParts ] = timestamp
    .toString()
    .toUpperCase()
    .split('T');

  if (!timeParts) {
    const invalidTimestamp = moment.invalid();
    invalidTimestamp.__inputString = timestamp;

    return invalidTimestamp;
  }

  const [ year, month, day ] = dateParts.split('-');
  if (!month || !day) {
    const invalidTimestamp = moment.invalid();
    invalidTimestamp.__inputString = timestamp;

    return invalidTimestamp;
  }

  /* eslint-disable prefer-const */
  let [ hour, minute, lastTimePart ] = timeParts.split(':');
  /* eslint-enable prefer-const */
  if (!minute || !lastTimePart || !lastTimePart.endsWith('Z')) {
    const invalidTimestamp = moment.invalid();
    invalidTimestamp.__inputString = timestamp;

    return invalidTimestamp;
  }
  lastTimePart = lastTimePart.slice(0, -1);

  /* eslint-disable prefer-const */
  let [ second, millisecond = '0' ] = lastTimePart.split('.');
  /* eslint-enable prefer-const */

  // values after the dot are interpreted as nanoseconds
  // if there are more than 3 digits
  if (millisecond.length > 3) {
    millisecond = parseInt(millisecond, 10) / 1000000;
  }

  return moment.utc([year, month - 1, day, hour, minute, second, millisecond]);
};

const parseAndValidateTimestamp = function parseAndValidateTimestamp (timestamp) {
  if (!moment.isMoment(timestamp)) {
    timestamp = parseTimestamp(timestamp);
  }

  if (!timestamp.isValid()) {
    const inputString = (timestamp.__inputString ? ` '${timestamp.__inputString}'` : '');
    throw new Error(`Invalid RFC 3339 timestamp${inputString}.`);
  }

  return timestamp;
};

// returns now as UTC moment
const utcNow = function utcNow () {
  return moment.utc();
};

const postToSlack = function postToSlack (text) {
  if (config.slack_url) {
    request.post({ url: config.slack_url, json: { text: text } });
  }
};

const softwareRevision = (function () {
  try {
    /* eslint-disable global-require */
    const parts = require('fs')
      .readFileSync(`${__dirname}/../revision`)
      .toString()
      .split(' ');
    /* eslint-enable global-require */
    parts[1] = new Date(parseInt(parts[1], 10) * 1000).toISOString();

    return `${parts[0]} ${parts[1]} ${parts[2]}`;
  } catch (err) {
    return 'unknown revision';
  }
})();

const isJSONParseable = function isJSONParseable (value) {
  if (value !== '') {
    try {
      JSON.parse(value);

      return true;
    } catch (err) {
      return false;
    }
  }

  return true;
};

const isNonEmptyString = function isNonEmptyString (val) {
  return !(typeof val === 'undefined' || val === '');
};

// https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric
const isNumeric = function isNumeric (n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

const redactEmail = function redactEmail (email) {
  /* eslint-disable prefer-const */
  let [ name = '', domain = '' ] = email.split('@');
  /* eslint-enable prefer-const */

  let [ hostname = '', tld = '' ] = domain.split('.');

  tld = `${tld.slice(0, 1)}**`;
  hostname = `${hostname.slice(0, 3)}****`;
  name = `${name.slice(0, 3)}****`;

  return `${name}@${hostname}.${tld}`;
};

module.exports = {
  config,
  Honeybadger,
  parseTimestamp,
  isJSONParseable,
  isNonEmptyString,
  isNumeric,
  parseAndValidateTimestamp,
  utcNow,
  postToSlack,
  softwareRevision,
  redactEmail
};
