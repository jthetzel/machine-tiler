<h1 align='center'>Machine-Tiler</h1>

<p align='center'>Create Slippymaps given an SQS message pointing towards the OA data</p>

## Brief

- Receive an HTTP location of an OpenAddresses CSV
- Download CSV, Convert to GeoJSON & Vectorize w/ tippecanoe
- Upload exploded mbtiles to dotmaps.openaddresses.io

## Install

```
yarn install
```

## Deploying

This repo can be deployed to OpenAddresses AWS infrastructure using [openaddresses/machine-ecs](https://github.com/openaddresses/machine-ecs)

CircleCI will create docker images on all branches and GitShas, uploading them to our ECR repository.

For more information on deploying see the above machine-ecs repo.

## Updating ECS-Watchbot

ecs-watchbot is locked to a specific version, if you bump the version, ensure a ecs-watchbot image is built
for the version you are bumping to.

See the ecs-watchbot ECR for currently built versions
