<h1 align='center'>Machine-Tiler</h1>

<p align='center'>Create Slippymaps given an SQS message pointing towards the OA data</p>

## Brief

- Receive an HTTP location of an OpenAddresses CSV
- Download CSV, Convert to GeoJSON & Vectorize w/ tippecanoe
- Upload exploded mbtiles to dotmaps.openaddresses.io

See an example of the web interface and a run of vectorized data here: http://dotmaps.openaddresses.io.s3-website-us-east-1.amazonaws.com/#runs/376265

## Install

```
yarn install
```

### Manual Queueing

To manually queue a task, run

```
./queue.js
```

and follow the interactive prompts

## Deploying

This repo can be deployed to OpenAddresses AWS infrastructure using [openaddresses/machine-ecs](https://github.com/openaddresses/machine-ecs)

[ECS-Conex](https://github.com/mapbox/ecs-conex) running on the OA AWS account watches this repo for commits and will create docker images for all branches and GitShas, uploading them to our ECR repository.

For more information on deploying see the above machine-ecs repo.

## Updating ECS-Watchbot

ecs-watchbot is locked to a specific version, if you bump the version, ensure a ecs-watchbot image is built
for the version you are bumping to.

See the ecs-watchbot ECR for currently built versions
