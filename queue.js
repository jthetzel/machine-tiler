#!/usr/bin/env node

const prompt = require('prompt');
const AWS = require('aws-sdk');

try {
    AWS.config.loadFromPath(path.resolve(process.env.HOME, '.oarc.json'));
} catch (err) {
    console.error('creds not set: run oa init');
    process.exit(1);
}

const creds = require(path.resolve(process.env.HOME, '.oarc.json'));

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
    default: 'runs/0'
    required: true,
    type: 'string'
},{ 
    name: 'stack',
    message: 'Stack to Q against',
    default: 'production',
    required: true,
    type: 'string'
}], (err, argv) => {
    const sqs = new AWS.SQS();


});
