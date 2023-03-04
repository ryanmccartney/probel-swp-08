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

# Work in progres

-   Santising label information
-   UMD label commands
