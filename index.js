const rp = require('request-promise');
const _ = require('lodash');
const moment = require('moment');
const argv = require('yargs')
    .boolean('current-level')
    .describe('current-level', 'Only show current level items')
    .describe('k', 'Wanikani API Key')
    .alias('k', 'key')
    .demandOption(['key'])
    .describe('f', 'Outfile filename')
    .alias('f', 'file')
    .default('f', 'output.pdf')
    .argv;

const generate = require('./generate');

const timeLimit = moment().add(1, 'days').unix();

var options = {
    uri: `https://www.wanikani.com/api/user/${argv.k}/kanji`,
    json: true
};

var onlyCurrentLevel = true;

rp(options)
    .then(function(resp) {
        const levelFilter = function(inf) {
            if (onlyCurrentLevel) {
                return resp.user_information.level === inf.level;
            } else {
                return true;
            }
        };

        let a = _(resp.requested_information)
            .filter(inf => !_.isEmpty(inf.user_specific))
            .filter(inf => inf.user_specific.srs_numeric == 4)
            .filter(inf => inf.user_specific.available_date <= timeLimit)
            .filter(levelFilter)
            .value();

        generate(a, argv.file);
    });
