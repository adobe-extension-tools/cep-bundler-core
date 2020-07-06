const fs = require('fs')
const tape = require('tape')
const convert = require('xml-js')
const CepBundlerCore = require('..')

tape('config', (t) => {
    CepBundlerCore.compile({
        out: './test',
        root: __dirname,
        pkg: {
            cep: {
                name: "test name",
                id: "test.id",
                version: "1"
            }
        }
    })
    .then(() => {
        const manifestJson = convert.xml2js(fs.readFileSync('./test/CSXS/manifest.xml'), {
            compact: true
        });
        // console.log(JSON.stringify(manifestJson, undefined, 2))
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleId, 'test.id', 'ExtensionBundleId should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleName, 'test name', 'ExtensionBundleName should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleVersion, '1', 'ExtensionBundleVersion should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.Version, '8.0', 'Version should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Id, 'test.id', 'ExtensionList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Version, '1', 'ExtensionList Extension Version should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension._attributes.Id, 'test.id', 'DispatchInfoList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.MainPath._text, './index.html', 'MainPath should be correct')
        t.deepEqual(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.CEFCommandLine.Parameter, ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'].map(c => ({
            _text: c
        })), 'CefParams should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Menu._text, 'test name', 'Menu should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Width._text, '500', 'Geometry Size Width should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Height._text, '500', 'Geometry Size Height should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MinSize, undefined, 'Min Size should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MaxSize, undefined, 'Max Size should be correct')
        t.end()
    })
})

tape('environments', (t) => {
    CepBundlerCore.compile({
        out: './test',
        root: __dirname,
        env: 'development',
        pkg: {
            cep: {
                development: {
                    name: "test name",
                    id: "test.id",
                    version: "1"
                }
            }
        }
    })
    .then(() => {
        const manifestJson = convert.xml2js(fs.readFileSync('./test/CSXS/manifest.xml'), {
            compact: true
        });
        // console.log(JSON.stringify(manifestJson, undefined, 2))
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleId, 'test.id', 'ExtensionBundleId should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleName, 'test name', 'ExtensionBundleName should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleVersion, '1', 'ExtensionBundleVersion should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.Version, '8.0', 'Version should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Id, 'test.id', 'ExtensionList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Version, '1', 'ExtensionList Extension Version should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension._attributes.Id, 'test.id', 'DispatchInfoList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.MainPath._text, './index.html', 'MainPath should be correct')
        t.deepEqual(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.CEFCommandLine.Parameter, ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'].map(c => ({
            _text: c
        })), 'CefParams should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Menu._text, 'test name', 'Menu should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Width._text, '500', 'Geometry Size Width should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Height._text, '500', 'Geometry Size Height should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MinSize, undefined, 'Min Size should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MaxSize, undefined, 'Max Size should be correct')
        t.end()
    })
})

tape('environment variables', (t) => {
    process.env.CEP_NAME = 'test name'
    process.env.CEP_ID = 'test.id'
    process.env.CEP_VERSION = '1'
    process.env.CEP_CEP_VERSION = '8.0'
    CepBundlerCore.compile({
        out: './test',
        root: __dirname,
        env: 'development'
    })
    .then(() => {
        const manifestJson = convert.xml2js(fs.readFileSync('./test/CSXS/manifest.xml'), {
            compact: true
        });
        // console.log(JSON.stringify(manifestJson, undefined, 2))
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleId, 'test.id', 'ExtensionBundleId should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleName, 'test name', 'ExtensionBundleName should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleVersion, '1', 'ExtensionBundleVersion should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.Version, '8.0', 'Version should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Id, 'test.id', 'ExtensionList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Version, '1', 'ExtensionList Extension Version should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension._attributes.Id, 'test.id', 'DispatchInfoList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.MainPath._text, './index.html', 'MainPath should be correct')
        t.deepEqual(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.CEFCommandLine.Parameter, ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'].map(c => ({
            _text: c
        })), 'CefParams should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Menu._text, 'test name', 'Menu should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Width._text, '500', 'Geometry Size Width should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Height._text, '500', 'Geometry Size Height should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MinSize, undefined, 'Min Size should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MaxSize, undefined, 'Max Size should be correct')
        delete process.env.CEP_NAME
        delete process.env.CEP_ID
        delete process.env.CEP_VERSION
        delete process.env.CEP_CEP_VERSION
        t.end()
    })
})

tape('development', (t) => {
    CepBundlerCore.compile({
        out: './test',
        root: __dirname,
        isDev: true,
        pkg: {
            cep: {
                name: "test name",
                id: "test.id",
                version: "1"
            }
        }
    })
    .then(() => {
        const manifestJson = convert.xml2js(fs.readFileSync('./test/CSXS/manifest.xml'), {
            compact: true
        });
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleId, 'test.id', 'ExtensionBundleId should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleName, 'test name', 'ExtensionBundleName should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.ExtensionBundleVersion, '1', 'ExtensionBundleVersion should be correct')
        t.equal(manifestJson.ExtensionManifest._attributes.Version, '8.0', 'Version should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Id, 'test.id', 'ExtensionList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.ExtensionList.Extension._attributes.Version, '1', 'ExtensionList Extension Version should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension._attributes.Id, 'test.id', 'DispatchInfoList Extension Id should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.MainPath._text, './dev.test.id.html', 'MainPath should be correct')
        t.deepEqual(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.Resources.CEFCommandLine.Parameter, ['--allow-file-access-from-files', '--allow-file-access', '--enable-nodejs', '--mixed-context'].map(c => ({
            _text: c
        })), 'CefParams should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Menu._text, 'test name', 'Menu should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Width._text, '500', 'Geometry Size Width should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.Size.Height._text, '500', 'Geometry Size Height should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MinSize, undefined, 'Min Size should be correct')
        t.equal(manifestJson.ExtensionManifest.DispatchInfoList.Extension.DispatchInfo.UI.Geometry.MaxSize, undefined, 'Max Size should be correct')
        t.end()
    })
})