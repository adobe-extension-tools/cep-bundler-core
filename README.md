# cep-bundler-core

Core functionality for making bundler extensions to compile CEP.
All the functionality is exposed through one simple function:

```js
const core = require('cep-bundler-core')

core.compile({
  out: '/path/to/dist',          // REQUIRED type: string
  devPort: 8080,                 // REQUIRED type: number
  env: 'production',             // OPTIONAL type: string, default: process.env.NODE_ENV
  root: '/path/to/project/root', // OPTIONAL type: string, default: process.cwd()
  htmlFilename: 'index.html',    // OPTIONAL type: string, default: 'index.html'
  pkg: require('./package.json') // OPTIONAL type: object, default: require(opts.root + '/package.json')
})
```

## CEP Configuration

You can configure CEP a either through environment variables or the `package.json` of your project.

### package.json

```json
"cep": {
    "name": "My Extension",
    "id": "com.mycompany.myextension",
    "hosts": "*"
}
```

### Environment Variables

Either `set` thorugh your terminal or add to the `.env` file.

```bash
CEP_NAME="My Extension"
CEP_ID="com.mycompany.myextension"
CEP_HOSTS="*"
```

### Options

#### Id

This is the unique id of the extension.

```json
"id": "com.mycompany.myextension"
```
Environment variable: `CEP_ID`

#### Version

This sets the version of the bundle.

```json
"version": "1.2.0"
```
Environment variable: `CEP_VERSION`

#### Name

This sets the name of extension as it will show in the application.

```json
"name: "My Extension"
```
Environment variable: `CEP_NAME`

#### Hosts

By default, the extension will target all known Adobe hosts. To target specific hosts, modify the list of the hosts you want to target.
For example, to target just Illustrator and After Effects:

```json
"hosts": "ILST, AEFT"
```

And to target specific versions:

```json
"hosts": "ILST, IDSN@*, PHXS@6.0, AEFT@[5.0,10.0]"
```

This will target all versions of Illustrator and In Design, Photoshop 6.0, and After Effects 5.0 - 10.0.

Environment variable: `CEP_HOSTS`

#### Icon

To add a custom panel icon, add all [icon files](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_8.x/Documentation/CEP%208.0%20HTML%20Extension%20Cookbook.md#high-dpi-panel-icons) and set their paths in your config:

```bash
"iconNormal": "./assets/icon-normal.png",
"iconRollover": "./assets/icon-rollover.png",
"iconDarkNormal": "./assets/icon-dark.png",
"iconDarkRollover": "./assets/icon-dark-rollover.png"
```

Environment variables:
```bash
ICON_NORMAL="./assets/icon-normal.png",
ICON_ROLLOVER="./assets/icon-rollover.png",
ICON_DARK_NORMAL="./assets/icon-dark.png",
ICON_DARK_ROLLOVER="./assets/icon-dark-rollover.png"
```

#### Panel Size

```json
"panelWidth": 500,
"panelHeight": 500,
```

Environment variables:
```bash
PANEL_WIDTH=500
PANEL_HEIGHT=500
```

#### Debug ports

```json
"debugPorts": {
    "PHXS": 3001,
    "IDSN": 3002,
    "AICY": 3003,
    "ILST": 3004,
    "PPRO": 3005,
    "PRLD": 3006,
    "AEFT": 3007,
    "FLPR": 3008,
    "AUDT": 3009,
    "DRWV": 3010,
    "MUST": 3011,
    "KBRG": 3012,
},
```

Environment variables:
```bash
CEP_DEBUG_PORT_PHXS="3001"
CEP_DEBUG_PORT_IDSN="3002"
CEP_DEBUG_PORT_AICY="3003"
CEP_DEBUG_PORT_ILST="3004"
CEP_DEBUG_PORT_PPRO="3005"
CEP_DEBUG_PORT_PRLD="3006"
CEP_DEBUG_PORT_AEFT="3007"
CEP_DEBUG_PORT_FLPR="3008"
CEP_DEBUG_PORT_AUDT="3009"
CEP_DEBUG_PORT_DRWV="3010"
CEP_DEBUG_PORT_MUST="3011"
CEP_DEBUG_PORT_KBRG="3012"
```

#### Debug in production

Enabling this will create the .debug file, even when building for production.

```json
"debugInProduction": true
```

Environment variable:
```bash
CEP_DEBUG_IN_PRODUCTION="1"
```

#### CEF Params

```json
"cefParams": [
    "--allow-file-access-from-files",
    "--allow-file-access",
    "--enable-nodejs"
]
```
Environment variable:
```bash
CEP_CEF_PARAMS="--allow-file-access-from-files,--allow-file-access,--enable-nodejs"
```