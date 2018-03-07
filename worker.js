#!/usr/bin/env node

const AWS = require('aws-sdk');
const fs = require('fs');
const cp = require('child_process');
const csv = require('fast-csv');
const path = require('path');
const request = require('request');
const unzip = require('unzip');
const tilelive = require('@mapbox/tilelive');
const MBTiles = require('@mapbox/mbtiles');
const tilelive_s3 = require('@mapbox/tilelive-s3');

tilelive_s3.registerProtocols(tilelive);
MBTiles.registerProtocols(tilelive);

if (require.main === module) {
    let msg = '';

    if (!process.env.Message) throw new Error('No "Message" Variable Found');
    try {
        msg = JSON.parse(process.env.Message);
    } catch(err) {
        throw new Error('Invalid JSON Message');
    }

    validate(msg);

    for (let file of fs.readdirSync('/tmp')) {
        const ext = path.parse(file).ext;
        if (ext === '.mbtiles') fs.unlinkSync(path.resolve('/tmp/', file))
    }

    request(msg.data).on('error', (err) => {
        return done(new Error(`Could not download url: ${err.message}`));
    }).pipe(unzip.Parse()).on('entry', (entry) => {
        const entry_path = path.parse(entry.path);

        if (entry.type !== 'File' || entry_path.ext !== '.csv') return entry.autodrain();

        const t = tippecanoe(msg.type, (err) => {
            if (err) throw err;

            explode(msg.dest, (err) => {
                if (err) throw err;

                meta(msg.dest, (err) => {
                    if (err) throw err;

                    console.error('ok - done!');
                });
            });
        });

        const csvStream = csv({
            headers: true
        }).on('data', (line) => {
            t.stdin.write(JSON.stringify({
                type: 'Feature',
                properties: {
                    NUMBER: line.NUMBER,
                    STREET: line.STREET,
                    UNIT: line.UNIT,
                    CITY: line.CITY,
                    DISTRICT: line.DISTRICT,
                    REGION: line.REGION,
                    POSTCODE: line.POSTCODE,
                    ID: line.ID,
                    HASH: line.HASH
                },
                geometry: {
                    type: 'Point',
                    coordinates: [ Number(line.LON), Number(line.LAT) ]
                }
            }) + '\n');
        }).on('end', () => {
            t.stdin.end();
        });

        entry.pipe(csvStream);
    });
}

/**
 * Take the /tmp/output.mbtiles and explode the tiles accross s3
 *
 * @param {string} dest bucket postfix to use as a unique identifier
 * @param {function} cb (err, res) style callback
 * @returns {function}
 */
function explode(dest, cb) {
    tilelive.load('mbtiles:///tmp/output.mbtiles', (err, src) => {
        if (err) return cb(err);

        tilelive.load(`s3://dotmaps.openaddresses.io/${dest}/tiles/{z}/{x}/{y}.mvt`, (err, dst) => {
            if (err) cb(err);

            tilelive.copy(src, dst, {
                listScheme: src.createZXYStream()
            }, (err) => {
                return cb(err);
            });
        });
    });
}

/**
 * Take /tmp/output.mbtiles and upload metadata to s3
 *
 * @param {string} dest bucket postfix to use as a unique identifier
 * @param {function} cb (err, res) style callback
 * @returns {function}
 */
function meta(dest, cb) {
    new MBTiles('/tmp/output.mbtiles', (err, mbtiles) => {
        if (err) return cb(err);

        mbtiles.getInfo((err, info) => {
            if (err) return cb(err);

            const s3 = new AWS.S3({ region: 'us-east-1' });

            s3.upload({
                Bucket: 'dotmaps.openaddresses.io',
                Key: `${dest}/meta.json`,
                Body: JSON.stringify(info)
            }, (err) => {
                 return cb(err);
            });
        });
    });
}

/**
 * Validate the input message
 * @param {Object} msg JSONified input message to worker
 * @returns {boolean} true if the msg validates - otherwise throws
 *
 * @example {
 *   //Type of data to vectorize - currently only address
 *   "type": "address"
 *
 *   //HTTP URL to download data from
 *   "data": "runs/369045/ca/nb/city_of_fredericton.zip"
 *
 *   //dotmaps.openaddresses.io postfix to post data to
 *   "dest": "12345/"
 * }
 */
function validate(msg) {
    let allowed = ['data', 'dest', 'type'];

    Object.keys(msg).forEach(key => {
        if (allowed.indexOf(key) === -1) throw new Error(`msg.${key} is not an allowed property`);
    });

    if (['address'].indexOf(msg.type) === -1) throw new Error(`msg.${msg.type} is not valid`);
    if (!msg.data || typeof msg.data !== 'string' || !msg.data.length) throw new Error(`msg.data must be non-zero length string`);
    if (!msg.dest || typeof msg.dest !== 'string' || !msg.dest.length) throw new Error(`msg.dest must be non-zero length string`);

    return true;
}

/**
 * Vectorize a stream of GeoJSON features
 *
 * @param {string} type type of stream to vectorize. ie: addresses
 * @param {Stream} stream Readable line-delimited stream of features to vectorize
 * @param {function} cb (err, res) style callback
 * @returns {function} cb
 */
function tippecanoe(type, cb) {
    let output = '';

    const t = cp.spawn('tippecanoe', [
        '-o', `/tmp/output.mbtiles`,
        '--minimum-zoom', '14',
        '--maximum-zoom', '14',
        '--no-feature-limit',
        '--no-tile-size-limit'
    ], {
        detached: true,
        stdio: ['pipe', 'pipe', 'pipe' ]
    }).on('close', (code) => {
        if (code > 0) return cb(new Error(`tippecanoe failed: ${output}`));

        return cb();
    });

    t.stderr.on('data', (chunk) => {
        output += chunk.toString();
    });

    t.stderr.pipe(process.stderr);
    t.stdout.pipe(process.stdout);

    return t;
}
