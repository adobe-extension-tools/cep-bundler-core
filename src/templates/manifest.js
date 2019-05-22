var sizeTemplate = (name, width, height) =>
  width !== undefined && height !== undefined ? `
            <${name}>
              <Width>${width}</Width>
              <Height>${height}</Height>
            </${name}>` : '';

export default ({
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
      )
      var icons = [
        { icon: extension.iconNormal, type: 'Normal' },
        { icon: extension.iconRollover, type: 'RollOver' },
        { icon: extension.iconDarkNormal, type: 'DarkNormal' },
        { icon: extension.iconDarkRollover, type: 'DarkRollOver' },
      ]
        .filter(({ icon }) => !!icon)
        .map(({ icon, type }) => `<Icon Type="${type}">${icon}</Icon>`)
        .join('\n            ')
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
}