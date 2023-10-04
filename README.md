# probel-swp-08

[![NPM Publish](https://github.com/ryanmccartney/probel-swp-08/actions/workflows/publish.yml/badge.svg)](https://github.com/ryanmccartney/probel-swp-08/actions/workflows/publish.yml)

Probel routing protocol 8 implemented in Javascript

A simple Javascript [NPM Package](https://www.npmjs.com/package/probel-swp-08) for controlling video routers supporting SW-P-08.

Follows protocol as documented here [ProBel SW-P-08](https://wwwapps.grassvalley.com/docs/Manuals/sam/Protocols%20and%20MIBs/Router%20Control%20Protocols%20SW-P-88%20Issue%204b.pdf) implementing the IP transport section.

Additionl notes on specific commands implemented in Ross Ultrix matrix can be seen here - [Ross Ultrix User Guide](<https://documentation.rossvideo.com/files/Manuals/Connectivity/Ultrix/Ultricore%20User%20Guide%20(2201DR-104).pdf>) implementing the IP transport section.

# Install

`npm i probel-swp-08`

# Features Implemented

-   Interogate matrix for crosspoint information
-   Get destination labels (Up to 8 characters)
-   Get source labels (Up to 8 characters)
-   Make crosspoints
-   'Married' routing - routes all levels from one source to destination (1 video + 16 audio from source to destination)
-   Asynchronous commands to router

# Work in progress

-   UMD label commands
-   Confirm a route has been made (Only getting ACKs currently)

# Usage

## Importing

```js
const Probel = require("probel-swp-08");
```

## Making a route

```js
const Probel = require("probel-swp-08");

const host = "IP_ADDRESS_OF_ROUTER";

//Example config object
const config = {
    port: 8910,
    destinations: destinationTotal,
    sources: sourceTotal,
    extended: true,
    levels: levelTotal,
};

const probel = new Probel(host, config);

//Turn on debug mode so we can see what's being sent and received in bytes
probel.debug = true;

//Make a single crosspoint Probel.route(DESTINATION_LEVEL_NUMBER,SOURCE_NUMBER, DESTINATION_NUMBER)
probel.route(5, 16, 16);

//'Married Route' route all levels of one source to a destination Probel.routeAllLevels(SOURCE_NUMBER, DESTINATION_NUMBER)
probel.routeAllLevels(10, 10);
```

## Asynchronous Calls

```js
const main = async () => {
    //Get source labels (8 chars long) and return them in an object
    const sourceNames = await probel.getSourceNames();
    console.log(sourceNames);

    //Get destination labels (8 chars long) and return them in an object
    const destinationNames = await probel.getDestinationNames();
    console.log(destinationNames);
};

main();
```

## Client Usage

`node ./examples/example-cli --source=1 --destination=3`

Response

```js
Routed all levels of a source #1 to destination #3
```