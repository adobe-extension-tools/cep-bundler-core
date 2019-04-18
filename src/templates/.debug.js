export default (bundleId = 'com.test.extension', debugPorts) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<ExtensionList>
  <Extension Id="${bundleId}">
  <HostList>
    ${Object.keys(debugPorts)
      .map(
        (host) =>
          `<Host Name="${host.trim()}" Port="${debugPorts[host]}" />`
      )
      .join('\n    ')}
  </HostList>
  </Extension>
</ExtensionList>`
}
