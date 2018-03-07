#!/usr/bin/env node

const prompt = require('prompt');
const path = require('path');
const cf = require('@mapbox/cfn-config');
const AWS = require('aws-sdk');

try {
    AWS.config.loadFromPath(path.resolve(process.env.HOME, '.oarc.json'));
} catch (err) {
    console.error('creds not set: run oa init');
    process.exit(1);
}

const creds = require(path.resolve(process.env.HOME, '.oarc.json'));
cf.preauth(creds);

prompt.message = '$';
prompt.start();

prompt.get([{
    name: 'data',
    message: 'http location of OA CSV',
    type: 'string',
    required: true
},{ 
    name: 'type',
    message: 'Type of data to vectorize',
    default: 'address',
    type: 'string',
    required: true
},{ 
    name: 'dest',
    message: 'bucket postfix to upload tiles to',
    default: 'runs/0',
    required: true,
    type: 'string'
},{ 
    name: 'stack',
    message: 'Stack to Q against',
    default: 'production',
    required: true,
    type: 'string'
}], (err, argv) => {
    if (err) throw err;

    cf.lookup.info(`machine-tiler-${argv.stack}`, creds.region, true, false, (err, info) => {
        if (err) throw err;

        if (!info || !info.Outputs || !info.Outputs.SnsTopic) throw new Error('Could not find SNS Topic');
        const snsTopic = info.Outputs.SnsTopic;

        const sns = new AWS.SNS();

        sns.publish({
            TopicArn: snsTopic,
            Message: JSON.stringify({
                type: argv.type,
                data: argv.data,
                dest: argv.dest
            }),
        }, (err, res) => {
            if (err) throw err;
            console.error('ok - queued');
        });
    });
});
