# cep-bundler-core

Core functionality for making bundler extensions to compile CEP.
All the functionality is exposed through one simple function:

```js
const core = require('cep-bundler-core')

core.compile({
  out: '/path/to/dist',          // REQUIRED type: string
  isDev: false,                  // OPTIONAL type: boolean, default: false
  devPort: 8080,                 // OPTIONAL type: number, default: 8080
  devHost: 'localhost',          // OPTIONAL type: string, default: localhost
  env: 'production',             // OPTIONAL type: string, default: process.env.NODE_ENV
  root: '/path/to/project/root', // OPTIONAL type: string, default: process.cwd()
  htmlFilename: './index.html',  // OPTIONAL type: string, default: 'index.html'
  pkg: require('./package.json') // OPTIONAL type: object, default: require(opts.root + '/package.json')
})
```

### out

The `out` option specifies where the `manifest.xml`, `dev.html`, `node_modules` folder and (optionally) `.debug` file are saved to, this is usually the folder where your compiled javascript ends up.

### isDev

When `isDev` is true, the bundler will create a `dev.html` file that contains a redirect to `http://${devHost}:${devPort}`, when `isDev` is false, it will not create a dev.html file but will set the `MainPath` in the `manifest.xml` to the value set through the `htmlFilename` option.

### devPort & devHost

See the `isDev` option above, these options are used to specify where your bundler dev server is running, when compiling with `isDev` set to true, a html file will be created that will redirect to your dev server.

### env

The `env` option is used when you want different configurations for other environments, you might for example have `development`, `staging`, `ci` and `production` environments that you want to configure differently.
This option is only used when configure the bundler through your `package.json`, here is an example of using different extension names for different environments.

```json
"cep": {
    "development": {
        "name": "My Extension DEVELOPMENT",
        "id": "com.mycompany.myextension.development",
    },
    "beta": {
        "name": "My Extension BETA",
        "id": "com.mycompany.myextension.beta",
    },
    "production": {
        "name": "My Extension",
        "id": "com.mycompany.myextension",
    }
}
```

### root

The `root` option determines where the bundler should look for the `package.json` and `node_modules` folder, when you leave this off the current working directory will be used.

### htmlFilename

The htmlFilename is the name of your html file, this option is only used when `isDev` is false.
This path is relative from the `out` folder.

### pkg

Optionally pass in the package.json object yourself, it will load the json from the `package.json` in the `root` folder by default.

## CEP Configuration

You can configure CEP a either through environment variables or by a config object under the `cep` key in the `package.json` of your project.

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
"name": "My Extension"
```
Environment variable: `CEP_NAME`

#### Type

Optional. This is the panel type for the extension. One of:

- `"Panel"`: Default, standard extension panel
- `"ModalDialog"`: A blocking extension window, forcing the user to only interact with this panel until closed.
- `"Modeless"`: A non-blocking extension window that doesn't force interaction.
- `"Custom"`: See [Invisible HTML Extensions](https://github.com/Adobe-CEP/CEP-Resources/blob/master/CEP_9.x/Documentation/CEP%209.0%20HTML%20Extension%20Cookbook.md#invisible-html-extensions)

```json
"type": "Panel"
```
Environment variable: `CEP_PANEL_TYPE`

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
CEP_ICON_NORMAL="./assets/icon-normal.png",
CEP_ICON_ROLLOVER="./assets/icon-rollover.png",
CEP_ICON_DARK_NORMAL="./assets/icon-dark.png",
CEP_ICON_DARK_ROLLOVER="./assets/icon-dark-rollover.png"
```

#### Panel Size

```json
"panelWidth": 500,
"panelHeight": 500,
```

Environment variables:
```bash
CEP_PANEL_WIDTH=500
CEP_PANEL_HEIGHT=500
```

#### Panel Minimum Size

```json
"panelMinWidth": 500,
"panelMinHeight": 500,
```

Environment variables:
```bash
CEP_PANEL_MIN_WIDTH=500
CEP_PANEL_MIN_HEIGHT=500
```

#### Panel Maximum Size

```json
"panelMaxWidth": 500,
"panelMaxHeight": 500,
```

Environment variables:
```bash
CEP_PANEL_MAX_WIDTH=500
CEP_PANEL_MAX_HEIGHT=500
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

#### Extensions Menu Visibility

Optional. This setting determines whether to show an extension in the 'Extensions' menu in the host app.

- `"menu"` - Defaults to `true`.

```json
"menu": true
```

Environment variable:
```bash
CEP_MENU="1"
```

#### Lifecycle Settings

Optional. This settings object controls startup and shutdown behavior.

- `"autoVisible"` - Defaults to `true`. Whether the panel UI should be shown automatically on creation.
- `"startOnEvents"` - Array of event id strings to listen for that will start this extension.

For a panel that starts hidden:
```json
"lifecycle": {
  "autovisible": false,
  "startOnEvents": [
    // Photoshop dispatches this event on startup
    "applicationActivate",

    // Premiere Pro dispatches this event on startup
    "com.adobe.csxs.events.ApplicationActivate",

    // Your custom events
    "another_event"
  ]
}
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
CEP_CEF_PARAMS="--allow-file-access-from-files,--allow-file-access,--enable-nodejs,--mixed-context"
```

## Credits

This code is mostly taken from (an old version of) [parcel-plugin-cep](https://github.com/fusepilot/parcel-plugin-cep) by [@fusepilot](https://github.com/fusepilot).
