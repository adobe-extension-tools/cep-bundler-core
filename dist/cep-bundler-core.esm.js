import os from 'os';
import path from 'path';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import { range, defaults } from 'lodash';

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArrayLimit(arr, i) {
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance");
}

var sizeTemplate = function sizeTemplate(name, width, height) {
  return width !== undefined && height !== undefined ? "\n            <".concat(name, ">\n              <Width>").concat(width, "</Width>\n              <Height>").concat(height, "</Height>\n            </").concat(name, ">") : '';
};

var manifestTemplate = (function (_ref) {
  var isDev = _ref.isDev,
      bundleName = _ref.bundleName,
      bundleId = _ref.bundleId,
      hosts = _ref.hosts,
      bundleVersion = _ref.bundleVersion,
      cepVersion = _ref.cepVersion,
      extensions = _ref.extensions;
  return "<?xml version=\"1.0\" encoding=\"UTF-8\" standalone=\"no\"?>\n<ExtensionManifest xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" ExtensionBundleId=\"".concat(bundleId, "\" ExtensionBundleName=\"").concat(bundleName, "\" ExtensionBundleVersion=\"").concat(bundleVersion, "\" Version=\"").concat(cepVersion, "\">\n  <ExtensionList>\n    ").concat(extensions.map(function (extension) {
    return "<Extension Id=\"".concat(extension.id, "\" Version=\"").concat(bundleVersion, "\" />");
  }).join('\n    '), "\n  </ExtensionList>\n  <ExecutionEnvironment>\n    <HostList>\n      ").concat(hosts.map(function (host) {
    return "<Host Name=\"".concat(host.name, "\" Version=\"").concat(host.version, "\" />");
  }).join('\n      '), "\n    </HostList>\n    <LocaleList>\n      <Locale Code=\"All\"/>\n    </LocaleList>\n    <RequiredRuntimeList>\n      <RequiredRuntime Name=\"CSXS\" Version=\"").concat(cepVersion, "\" />\n    </RequiredRuntimeList>\n  </ExecutionEnvironment>\n  <DispatchInfoList>\n    ").concat(extensions.map(function (extension) {
    var commandLineParams = extension.cefParams.map(function (cefParam) {
      return "<Parameter>".concat(cefParam, "</Parameter>");
    });
    var icons = [{
      icon: extension.iconNormal,
      type: 'Normal'
    }, {
      icon: extension.iconRollover,
      type: 'RollOver'
    }, {
      icon: extension.iconDarkNormal,
      type: 'DarkNormal'
    }, {
      icon: extension.iconDarkRollover,
      type: 'DarkRollOver'
    }].filter(function (_ref2) {
      var icon = _ref2.icon;
      return !!icon;
    }).map(function (_ref3) {
      var icon = _ref3.icon,
          type = _ref3.type;
      return "<Icon Type=\"".concat(type, "\">").concat(icon, "</Icon>");
    }).join('\n            ');
    var size = sizeTemplate('Size', extension.panelWidth, extension.panelHeight);
    var minSize = sizeTemplate('MinSize', extension.panelMinWidth, extension.panelMinHeight);
    var maxSize = sizeTemplate('MaxSize', extension.panelMaxWidth, extension.panelMaxHeight);
    var startOn = !extension.lifecycle.startOnEvents || extension.lifecycle.startOnEvents.length === 0 ? '' : "\n          <StartOn>\n            ".concat(extension.lifecycle.startOnEvents.map(function (e) {
      return "<Event>".concat(e, "</Event>");
    }).join('\n            '), "\n          </StartOn>");
    return "<Extension Id=\"".concat(extension.id, "\">\n      <DispatchInfo>\n        <Resources>\n          <MainPath>").concat(isDev ? "./dev.".concat(extension.id, ".html") : extension.htmlFilename, "</MainPath>\n          <CEFCommandLine>\n            ").concat(commandLineParams.join('\n            '), "\n          </CEFCommandLine>\n        </Resources>\n        <Lifecycle>\n          <AutoVisible>").concat(extension.lifecycle.autoVisible, "</AutoVisible>").concat(startOn, "\n        </Lifecycle>\n        <UI>\n          <Type>").concat(extension.type || 'Panel', "</Type>\n          ").concat(extension.menu === false ? '' : "<Menu>".concat(extension.name, "</Menu>"), "\n          <Geometry>").concat(size).concat(minSize).concat(maxSize, "\n          </Geometry>").concat(icons ? "\n          <Icons>".concat(icons, "</Icons>") : '', "\n        </UI>\n      </DispatchInfo>\n    </Extension>");
  }).join('\n    '), "\n  </DispatchInfoList>\n</ExtensionManifest>");
});

var panelTemplate = (function (_ref) {
  var _ref$title = _ref.title,
      title = _ref$title === void 0 ? 'CEP Panel' : _ref$title,
      href = _ref.href;
  return "<!DOCTYPE html>\n<html>\n  <head>\n    <title>".concat(title, "</title>\n  </head>\n  <body>\n    <script>\n      window.location.href = \"").concat(href, "\";\n    </script>\n  </body>\n</html>");
});

var debugTemplate = (function (_ref) {
  var extensions = _ref.extensions;
  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n<ExtensionList>\n  ".concat(extensions.map(function (extension) {
    return "<Extension Id=\"".concat(extension.id, "\">\n    <HostList>\n      ").concat(Object.keys(extension.debugPorts).map(function (host) {
      return "<Host Name=\"".concat(host.trim(), "\" Port=\"").concat(extension.debugPorts[host], "\" />");
    }).join('\n      '), "\n    </HostList>\n  </Extension>");
  }).join('\n  '), "\n</ExtensionList>");
});

function templateDebug(formatter) {
  return range(4, 16).map(formatter).join(os.EOL);
}

function enablePlayerDebugMode() {
  // enable unsigned extensions for the foreseable future
  if (process.platform === 'darwin') {
    execSync(templateDebug(function (i) {
      return "defaults write com.adobe.CSXS.".concat(i, " PlayerDebugMode 1");
    }));
  } else if (process.platform === 'win32') {
    execSync(templateDebug(function (i) {
      return "REG ADD HKCU\\Software\\Adobe\\CSXS.".concat(i, " /f /v PlayerDebugMode /t REG_SZ /d 1");
    }));
  }
}
function disablePlayerDebugMode() {
  // disable unsigned extensions for the foreseable future
  if (process.platform === 'darwin') {
    execSync(templateDebug(function (i) {
      return "defaults write com.adobe.CSXS.".concat(i, " PlayerDebugMode 0");
    }));
  } else if (process.platform === 'win32') {
    execSync(templateDebug(function (i) {
      return "REG DELETE HKCU\\Software\\Adobe\\CSXS.".concat(i, " /f /v PlayerDebugMode");
    }));
  }
}

function camelToSnake(str) {
  return str.replace(/([A-Z])/g, function (part) {
    return "_".concat(part.toLowerCase());
  });
}

function isTruthy(str) {
  return typeof str === 'string' && (str === '1' || str.toLowerCase() === 'true');
}

function getEnvConfig() {
  var debugPortEnvs = Object.keys(process.env).filter(function (key) {
    return key.indexOf('CEP_DEBUG_PORT_') === 0;
  });
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
    debugPorts: debugPortEnvs.length > 0 ? debugPortEnvs.reduce(function (obj, key) {
      obj[key.replace('CEP_DEBUG_PORT_', '')] = parseInt(process.env[key], 10);
      return obj;
    }, {}) : undefined,
    debugInProduction: isTruthy(process.env.CEP_DEBUG_IN_PRODUCTION) || undefined,
    cefParams: !process.env.CEP_CEF_PARAMS ? undefined : process.env.CEP_CEF_PARAMS.split(',')
  };
}

function getPkgConfig(pkg, env) {
  var pkgConfig = pkg.hasOwnProperty('cep') ? pkg.cep.hasOwnProperty(env) ? pkg.cep[env] : pkg.cep : {};
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
    extensions: pkgConfig.extensions
  };
}

function getConfigDefaults() {
  return _objectSpread({}, getExtensionDefaults(), {
    bundleName: 'CEP Extension',
    bundleId: 'com.mycompany.myextension',
    hosts: '*',
    debugInProduction: false,
    cepVersion: '6.0'
  });
}

function getConfig(pkg, env) {
  var config = defaults(getEnvConfig(), getPkgConfig(pkg, env), getConfigDefaults(), {
    bundleVersion: pkg.version
  });
  config.hosts = parseHosts(config.hosts);
  var extensions = [];

  if (Array.isArray(config.extensions)) {
    extensions = config.extensions.map(function (extension) {
      return _objectSpread({}, getExtensionDefaults(), extension);
    });
  } else {
    extensions.push(_objectSpread({
      id: config.bundleId,
      name: config.bundleName
    }, config));
  }

  config.extensions = extensions;
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
  var out = opts.out,
      debugInProduction = opts.debugInProduction,
      isDev = opts.isDev,
      extensions = opts.extensions;
  var manifestDir = path.join(out, 'CSXS');
  var manifestFile = path.join(manifestDir, 'manifest.xml');
  return Promise.resolve().then(function () {
    return fs.ensureDir(manifestDir);
  }).then(function () {
    return fs.writeFile(manifestFile, manifestContents);
  }).then(function () {
    var chain = Promise.resolve();

    if (debugInProduction || isDev) {
      var debugContents = debugTemplate(opts);
      chain = chain.then(function () {
        return fs.writeFile(path.join(out, '.debug'), debugContents);
      });
    }

    if (isDev) {
      extensions.forEach(function (extension) {
        var href = "http://".concat(extension.devHost, ":").concat(extension.devPort);
        var panelContents = panelTemplate({
          title: extension.name,
          href: href
        });
        chain = chain.then(function () {
          return fs.writeFile(path.join(out, "dev.".concat(extension.id, ".html")), panelContents);
        });
      });
    }

    return chain;
  });
}
function parseHosts(hostsString) {
  if (hostsString == '*') hostsString = "PHXS, IDSN, AICY, ILST, PPRO, PRLD, AEFT, FLPR, AUDT, DRWV, MUST, KBRG";
  var hosts = hostsString.split(/(?![^)(]*\([^)(]*?\)\)),(?![^\[]*\])/).map(function (host) {
    return host.trim();
  }).map(function (host) {
    var _host$split = host.split('@'),
        _host$split2 = _slicedToArray(_host$split, 2),
        name = _host$split2[0],
        version = _host$split2[1];

    if (version == '*' || !version) {
      version = '[0.0,99.9]';
    } else if (version) {
      version = version;
    }

    return {
      name: name,
      version: version
    };
  });
  return hosts;
}
function getExtenstionPath() {
  if (process.platform == 'darwin') {
    return path.join(os.homedir(), '/Library/Application Support/Adobe/CEP/extensions');
  } else if (process.platform == 'win32') {
    return path.join(process.env.APPDATA, 'Adobe/CEP/extensions');
  }
}

function getSymlinkExtensionPath(_ref) {
  var bundleId = _ref.bundleId;
  var extensionPath = getExtenstionPath();
  return path.join(extensionPath, bundleId);
}

function symlinkExtension(_ref2) {
  var bundleId = _ref2.bundleId,
      out = _ref2.out;
  var target = getSymlinkExtensionPath({
    bundleId: bundleId
  });
  return Promise.resolve().then(function () {
    return fs.ensureDir(getExtenstionPath());
  }).then(function () {
    return fs.remove(target);
  }).then(function () {
    if (process.platform === 'win32') {
      return fs.symlink(path.join(out, '/'), target, 'junction');
    } else {
      return fs.symlink(path.join(out, '/'), target);
    }
  });
}
function copyDependencies(_ref3) {
  var root = _ref3.root,
      out = _ref3.out,
      pkg = _ref3.pkg;
  var deps = pkg.dependencies || {};
  return Object.keys(deps).reduce(function (chain, dep) {
    var src = path.join(root, 'node_modules', dep);
    var dest = path.join(out, 'node_modules', dep);
    var exists = false;

    try {
      exists = fs.statSync(dest).isFile();
    } catch (err) {}

    if (!exists) {
      chain = chain.then(function () {
        return fs.copy(src, dest);
      })["catch"](function () {
        console.error("Could not copy ".concat(src, " to ").concat(dest, ". Ensure the path is correct."));
      }).then(function () {
        return copyDependencies({
          root: root,
          out: out,
          pkg: fs.readJsonSync(path.join(root, 'node_modules', dep, 'package.json'))
        });
      });
      return chain;
    }

    return chain;
  }, Promise.resolve());
}
function copyIcons(_ref4) {
  var root = _ref4.root,
      out = _ref4.out,
      iconNormal = _ref4.iconNormal,
      iconRollover = _ref4.iconRollover,
      iconDarkNormal = _ref4.iconDarkNormal,
      iconDarkRollover = _ref4.iconDarkRollover;
  var iconPaths = [iconNormal, iconRollover, iconDarkNormal, iconDarkRollover].filter(function (icon) {
    return icon !== undefined;
  }).map(function (icon) {
    return {
      source: path.resolve(root, icon),
      output: path.join(out, path.relative(root, icon))
    };
  });
  return Promise.all(iconPaths.map(function (icon) {
    return fs.copy(icon.source, icon.output)["catch"](function () {
      console.error("Could not copy ".concat(icon.source, ". Ensure the path is correct."));
    });
  }));
}

function getExtensionDefaults() {
  return {
    panelWidth: 500,
    panelHeight: 500,
    htmlFilename: './index.html',
    devPort: 8080,
    devHost: 'localhost',
    lifecycle: {
      autoVisible: true,
      startOnEvents: []
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
      KBRG: 3012
    }
  };
}

function compile(opts) {
  opts.env = opts.env ? opts.env : process.env.NODE_ENV;
  opts.root = opts.root ? opts.root : process.cwd();
  opts.htmlFilename = opts.htmlFilename ? opts.htmlFilename : './index.html';
  opts.pkg = opts.pkg ? opts.pkg : require(path.join(opts.root, '/package.json'));
  opts.devHost = opts.devHost ? opts.devHost : 'localhost';
  opts.devPort = opts.devPort ? opts.devPort : 8080;
  opts.isDev = opts.hasOwnProperty('isDev') ? opts.isDev : false;
  var config = getConfig(opts.pkg, opts.env);

  var allOpts = _objectSpread({}, opts, config);

  console.log('config', config);
  console.log('opts', opts);
  console.log('allOpts', allOpts);
  var chain = Promise.resolve();

  if (opts.isDev) {
    enablePlayerDebugMode();

    if (!config.noSymlink) {
      chain = chain.then(function () {
        return symlinkExtension(allOpts);
      });
    }
  }

  chain = chain.then(function () {
    return copyDependencies(allOpts);
  }).then(function () {
    return writeExtensionTemplates(allOpts);
  }).then(function () {
    return copyIcons(allOpts);
  });
  return chain;
}

export { compile, copyDependencies, copyIcons, disablePlayerDebugMode, enablePlayerDebugMode, getConfig, getExtenstionPath, objectToProcessEnv, parseHosts, symlinkExtension, writeExtensionTemplates };
//# sourceMappingURL=cep-bundler-core.esm.js.map
