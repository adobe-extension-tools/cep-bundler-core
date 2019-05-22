export default ({ extensions }) => {
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
}
