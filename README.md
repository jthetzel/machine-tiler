<h1 align='center'>machine-tiler</h1>

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

This repo is deployed on [openaddresses/machine-ecs](https://github.com/openaddresses/machine-ecs)

Please see the instruciton there for installing the deploy tools and creating/updating a machine-tiler stack.
