'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var os = _interopDefault(require('os'));
var path = _interopDefault(require('path'));
var child_process = require('child_process');
var fs = _interopDefault(require('fs-extra'));

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

var sizeTemplate = (name, width, height) =>
  width !== undefined && height !== undefined ? `
            <${name}>
              <Width>${width}</Width>
              <Height>${height}</Height>
            </${name}>` : '';

var manifestTemplate = ({
  isDev,
  bundleName,
  bundleId,
  hosts,
  bundleVersion,
  cepVersion,
  extensions
}) => {
  return `<?xml version="1.0" encoding="UTF-8" standalone="no"?>
<ExtensionManifest xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" ExtensionBundleId="${bundleId}" ExtensionBundleName="${bundleName}" ExtensionBundleVersion="${bundleVersion}" Version="${cepVersion}">
  <ExtensionList>
    ${extensions.map(extension => `<Extension Id="${extension.id}" Version="${bundleVersion}" />`).join('\n    ')}
  </ExtensionList>
  <ExecutionEnvironment>
    <HostList>
      ${hosts
        .map(host => `<Host Name="${host.name}" Version="${host.version}" />`)
        .join('\n      ')}
    </HostList>
    <LocaleList>
      <Locale Code="All"/>
    </LocaleList>
    <RequiredRuntimeList>
      <RequiredRuntime Name="CSXS" Version="${cepVersion}" />
    </RequiredRuntimeList>
  </ExecutionEnvironment>
  <DispatchInfoList>
    ${extensions.map(extension => {
      var commandLineParams = extension.cefParams.map(
        cefParam => `<Parameter>${cefParam}</Parameter>`
      );
      var icons = [
        { icon: extension.iconNormal, type: 'Normal' },
        { icon: extension.iconRollover, type: 'RollOver' },
        { icon: extension.iconDarkNormal, type: 'DarkNormal' },
        { icon: extension.iconDarkRollover, type: 'DarkRollOver' },
      ]
        .filter(({ icon }) => !!icon)
        .map(({ icon, type }) => `<Icon Type="${type}">${icon}</Icon>`)
        .join('\n            ');
      var size = sizeTemplate('Size', extension.panelWidth, extension.panelHeight);
      var minSize = sizeTemplate('MinSize', extension.panelMinWidth, extension.panelMinHeight);
      var maxSize = sizeTemplate('MaxSize', extension.panelMaxWidth, extension.panelMaxHeight);
      var startOn = (!extension.lifecycle.startOnEvents || extension.lifecycle.startOnEvents.length === 0) ? '' : `
          <StartOn>
            ${extension.lifecycle.startOnEvents.map(e => `<Event>${e}</Event>`).join('\n            ')}
          </StartOn>`;
      return `<Extension Id="${extension.id}">
      <DispatchInfo>
        <Resources>
          <MainPath>${isDev ? `./dev.${extension.id}.html` : extension.htmlFilename}</MainPath>
          <CEFCommandLine>
            ${commandLineParams.join('\n            ')}
          </CEFCommandLine>
        </Resources>
        <Lifecycle>
          <AutoVisible>${extension.lifecycle.autoVisible}</AutoVisible>${startOn}
        </Lifecycle>
        <UI>
          <Type>${extension.type || 'Panel'}</Type>
          ${extension.menu === false ? '' : `<Menu>${extension.name}</Menu>`}
          <Geometry>${size}${minSize}${maxSize}
          </Geometry>${icons ? `
          <Icons>${icons}</Icons>` : ''}
        </UI>
      </DispatchInfo>
    </Extension>`}).join('\n    ')}
  </DispatchInfoList>
</ExtensionManifest>`
};

var panelTemplate = ({ title = 'CEP Panel', href }) => {
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${title}</title>
  </head>
  <body>
    <script>
      window.location.href = "${href}";
    </script>
  </body>
</html>`
};

var debugTemplate = ({ extensions }) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  ${extensions.map(extension => `<Extension Id="${extension.id}">
    <HostList>
      ${Object.keys(extension.debugPorts)
        .map(
          (host) =>
            `<Host Name="${host.trim()}" Port="${extension.debugPorts[host]}" />`
        )
        .join('\n      ')}
    </HostList>
  </Extension>`).join('\n  ')}
</ExtensionList>`
};

function templateDebug(formatter) {
    return [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map(formatter).join(os.EOL);
}
function enablePlayerDebugMode() {
    // enable unsigned extensions
    if (process.platform === 'darwin') {
        child_process.execSync(templateDebug(function (i) { return "defaults write com.adobe.CSXS." + i + " PlayerDebugMode 1"; }));
    }
    else {
        child_process.execSync(templateDebug(function (i) { return "REG ADD HKCU\\Software\\Adobe\\CSXS." + i + " /f /v PlayerDebugMode /t REG_SZ /d 1"; }));
    }
}
function disablePlayerDebugMode() {
    // disable unsigned extensions
    if (process.platform === 'darwin') {
        child_process.execSync(templateDebug(function (i) { return "defaults write com.adobe.CSXS." + i + " PlayerDebugMode 0"; }));
    }
    else {
        child_process.execSync(templateDebug(function (i) { return "REG DELETE HKCU\\Software\\Adobe\\CSXS." + i + " /f /v PlayerDebugMode"; }));
    }
}
function camelToSnake(str) {
    return str.replace(/([A-Z])/g, function (part) { return "_" + part.toLowerCase(); });
}
function isTruthy(str) {
    return typeof str === 'string' && (str === '1' || str.toLowerCase() === 'true');
}
function getEnvConfig() {
    var debugPortEnvs = Object.keys(process.env).filter(function (key) { return key.indexOf('CEP_DEBUG_PORT_') === 0; });
    return {
        bundleName: process.env.CEP_NAME,
        bundleId: process.env.CEP_ID,
        bundleVersion: process.env.CEP_VERSION,
        cepVersion: process.env.CEP_CEP_VERSION,
        hosts: process.env.CEP_HOSTS,
        iconNormal: process.env.CEP_ICON_NORMAL,
        iconRollover: process.env.CEP_ICON_ROLLOVER,
        iconDarkNormal: process.env.CEP_ICON_DARK_NORMAL,
        iconDarkRollover: process.env.CEP_ICON_DARK_ROLLOVER,
        panelWidth: process.env.CEP_PANEL_WIDTH,
        panelHeight: process.env.CEP_PANEL_HEIGHT,
        panelMinWidth: process.env.CEP_PANEL_MIN_WIDTH,
        panelMinHeight: process.env.CEP_PANEL_MIN_HEIGHT,
        panelMaxWidth: process.env.CEP_PANEL_MAX_WIDTH,
        panelMaxHeight: process.env.CEP_PANEL_MAX_HEIGHT,
        devHost: process.env.CEP_DEV_HOST,
        devPort: !process.env.CEP_DEV_PORT ? undefined : Number(process.env.CEP_DEV_PORT),
        debugPorts: debugPortEnvs.length > 0
            ? debugPortEnvs.reduce(function (obj, key) {
                obj[key.replace('CEP_DEBUG_PORT_', '')] = parseInt(process.env[key] || '', 10);
                return obj;
            }, {})
            : undefined,
        debugInProduction: isTruthy(process.env.CEP_DEBUG_IN_PRODUCTION) || undefined,
        cefParams: !process.env.CEP_CEF_PARAMS ? undefined : process.env.CEP_CEF_PARAMS.split(','),
    };
}
function getPkgConfig(pkg, env) {
    var pkgConfig = pkg.hasOwnProperty('cep') ? (env && pkg.cep.hasOwnProperty(env) ? pkg.cep[env] : pkg.cep) : {};
    return {
        bundleName: pkgConfig.name,
        bundleId: pkgConfig.id,
        bundleVersion: pkgConfig.version,
        cepVersion: pkgConfig.cepVersion,
        hosts: pkgConfig.hosts,
        iconNormal: pkgConfig.iconNormal,
        iconRollover: pkgConfig.iconRollover,
        iconDarkNormal: pkgConfig.iconDarkNormal,
        iconDarkRollover: pkgConfig.iconDarkRollover,
        panelWidth: pkgConfig.panelWidth,
        panelHeight: pkgConfig.panelHeight,
        panelMinWidth: pkgConfig.panelMinWidth,
        panelMinHeight: pkgConfig.panelMinHeight,
        panelMaxWidth: pkgConfig.panelMaxWidth,
        panelMaxHeight: pkgConfig.panelMaxHeight,
        debugPorts: pkgConfig.debugPorts,
        debugInProduction: pkgConfig.debugInProduction,
        lifecycle: pkgConfig.lifecycle,
        cefParams: pkgConfig.cefParams,
        htmlFilename: pkgConfig.htmlFilename,
        extensions: pkgConfig.extensions,
        devHost: pkgConfig.devHost,
        devPort: pkgConfig.devPort,
    };
}
function getConfigDefaults() {
    return {
        bundleName: 'CEP Extension',
        bundleId: 'com.mycompany.myextension',
        hosts: '*',
        debugInProduction: false,
        cepVersion: '8.0',
        panelWidth: 500,
        panelHeight: 500,
        htmlFilename: './index.html',
        devHost: 'localhost',
        devPort: 8080,
        lifecycle: {
            autoVisible: true,
            startOnEvents: [],
        },
        cefParams: ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'],
        debugPorts: {
            PHXS: 3001,
            IDSN: 3002,
            AICY: 3003,
            ILST: 3004,
            PPRO: 3005,
            PRLD: 3006,
            AEFT: 3007,
            FLPR: 3008,
            AUDT: 3009,
            DRWV: 3010,
            MUST: 3011,
            KBRG: 3012,
        },
    };
}
function assignDefined(target) {
    var sources = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        sources[_i - 1] = arguments[_i];
    }
    for (var _a = 0, sources_1 = sources; _a < sources_1.length; _a++) {
        var source = sources_1[_a];
        for (var _b = 0, _c = Object.keys(source); _b < _c.length; _b++) {
            var key = _c[_b];
            var val = source[key];
            if (val !== undefined) {
                target[key] = val;
            }
        }
    }
    return target;
}
function getConfig(pkg, env) {
    var config = assignDefined({}, getConfigDefaults(), getPkgConfig(pkg, env), getEnvConfig());
    // console.log('DEFAULTS', config)
    config.hosts = parseHosts(config.hosts);
    var extensions = [];
    if (Array.isArray(config.extensions)) {
        extensions = config.extensions.map(function (extension) {
            return assignDefined({}, config, extension);
        });
    }
    else {
        extensions.push(__assign({ id: config.bundleId, name: config.bundleName }, config));
    }
    config.extensions = extensions;
    // console.log('FINAL', config)
    return config;
}
function objectToProcessEnv(obj) {
    // assign object to process.env so they can be used in the code
    Object.keys(obj).forEach(function (key) {
        var envKey = camelToSnake(key).toUpperCase();
        var value = typeof obj[key] === 'string' ? obj[key] : JSON.stringify(obj[key]);
        process.env[envKey] = value;
    });
}
function writeExtensionTemplates(opts) {
    var manifestContents = manifestTemplate(opts);
    var out = opts.out, debugInProduction = opts.debugInProduction, isDev = opts.isDev, extensions = opts.extensions;
    var manifestDir = path.join(out, 'CSXS');
    var manifestFile = path.join(manifestDir, 'manifest.xml');
    return Promise.resolve()
        .then(function () { return fs.ensureDir(manifestDir); })
        .then(function () { return fs.writeFile(manifestFile, manifestContents); })
        .then(function () {
        var chain = Promise.resolve();
        if (debugInProduction || isDev) {
            var debugContents_1 = debugTemplate(opts);
            chain = chain.then(function () { return fs.writeFile(path.join(out, '.debug'), debugContents_1); });
        }
        if (isDev) {
            extensions.forEach(function (extension) {
                var href = "http://" + extension.devHost + ":" + extension.devPort;
                var panelContents = panelTemplate({
                    title: extension.name,
                    href: href,
                });
                chain = chain.then(function () { return fs.writeFile(path.join(out, "dev." + extension.id + ".html"), panelContents); });
            });
        }
        return chain;
    });
}
function parseHosts(hostsString) {
    if (hostsString == '*')
        hostsString = "PHXS, IDSN, AICY, ILST, PPRO, PRLD, AEFT, FLPR, AUDT, DRWV, MUST, KBRG";
    var hosts = hostsString
        .split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/)
        .map(function (host) { return host.trim(); })
        .map(function (host) {
        // @ts-ignore
        var _a = host.split('@'), name = _a[0], version = _a[1];
        if (version == '*' || !version) {
            version = '[0.0,99.9]';
        }
        else if (version) {
            version = version;
        }
        return {
            name: name,
            version: version,
        };
    });
    return hosts;
}
function getExtensionPath() {
    if (process.platform == 'darwin') {
        return path.join(os.homedir(), '/Library/Application Support/Adobe/CEP/extensions');
    }
    else {
        return path.join(process.env.APPDATA || '', 'Adobe/CEP/extensions');
    }
}
function getSymlinkExtensionPath(_a) {
    var bundleId = _a.bundleId;
    var extensionPath = getExtensionPath();
    return path.join(extensionPath, bundleId);
}
function symlinkExtension(_a) {
    var bundleId = _a.bundleId, out = _a.out;
    var target = getSymlinkExtensionPath({ bundleId: bundleId });
    return Promise.resolve()
        .then(function () { return fs.ensureDir(getExtensionPath()); })
        .then(function () { return fs.remove(target); })
        .then(function () {
        if (process.platform === 'win32') {
            return fs.symlink(path.join(out, '/'), target, 'junction');
        }
        else {
            return fs.symlink(path.join(out, '/'), target);
        }
    });
}
function copyDependencies(_a) {
    var root = _a.root, out = _a.out, pkg = _a.pkg;
    var deps = pkg.dependencies || {};
    return Object.keys(deps).reduce(function (chain, dep) {
        if (dep.indexOf('/') !== -1) {
            dep = dep.split('/')[0];
        }
        var src = path.join(root, 'node_modules', dep);
        var dest = path.join(out, 'node_modules', dep);
        var exists = false;
        try {
            exists = fs.statSync(dest).isFile();
        }
        catch (err) { }
        if (!exists) {
            chain = chain
                .then(function () { return fs.copy(src, dest); })["catch"](function () {
                console.error("Could not copy " + src + " to " + dest + ". Ensure the path is correct.");
            })
                .then(function () {
                try {
                    var packageJson = fs.readJsonSync(path.join(root, 'node_modules', dep, 'package.json'));
                    return copyDependencies({
                        root: root,
                        out: out,
                        pkg: packageJson,
                    });
                }
                catch (err) {
                    return;
                }
            });
            return chain;
        }
        return chain;
    }, Promise.resolve());
}
function copyIcons(_a) {
    var root = _a.root, out = _a.out, iconNormal = _a.iconNormal, iconRollover = _a.iconRollover, iconDarkNormal = _a.iconDarkNormal, iconDarkRollover = _a.iconDarkRollover;
    var iconPaths = [iconNormal, iconRollover, iconDarkNormal, iconDarkRollover]
        .filter(function (icon) { return icon !== undefined; })
        .map(function (icon) { return ({
        source: path.resolve(root, icon),
        output: path.join(out, path.relative(root, icon)),
    }); });
    return Promise.all(iconPaths.map(function (icon) {
        return fs.copy(icon.source, icon.output)["catch"](function () {
            console.error("Could not copy " + icon.source + ". Ensure the path is correct.");
        });
    }));
}
function compile(opts) {
    opts.env = opts.env ? opts.env : process.env.NODE_ENV;
    opts.root = opts.root ? opts.root : process.cwd();
    opts.htmlFilename = opts.htmlFilename ? opts.htmlFilename : './index.html';
    opts.pkg = opts.pkg ? opts.pkg : require(path.join(opts.root, '/package.json'));
    opts.isDev = opts.hasOwnProperty('isDev') ? opts.isDev : false;
    var config = getConfig(opts.pkg, opts.env);
    var allOpts = __assign(__assign({}, opts), config);
    var chain = Promise.resolve();
    if (opts.isDev) {
        enablePlayerDebugMode();
        if (!config.noSymlink) {
            chain = chain.then(function () { return symlinkExtension(allOpts); });
        }
    }
    chain = chain
        .then(function () { return copyDependencies(allOpts); })
        .then(function () { return writeExtensionTemplates(allOpts); })
        .then(function () { return copyIcons(allOpts); })
        .then(function () {
        // noop
    });
    return chain;
}

exports.compile = compile;
exports.copyDependencies = copyDependencies;
exports.copyIcons = copyIcons;
exports.disablePlayerDebugMode = disablePlayerDebugMode;
exports.enablePlayerDebugMode = enablePlayerDebugMode;
exports.getConfig = getConfig;
exports.getExtensionPath = getExtensionPath;
exports.objectToProcessEnv = objectToProcessEnv;
exports.parseHosts = parseHosts;
exports.symlinkExtension = symlinkExtension;
exports.writeExtensionTemplates = writeExtensionTemplates;
//# sourceMappingURL=cep-bundler-core.cjs.js.map
