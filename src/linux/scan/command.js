const command = config => {
  const args = [
    '--terse',
    '--fields',
    'active,ssid,bssid,mode,chan,freq,rate,signal,security,wpa-flags,rsn-flags',
    'device',
    'wifi',
    'list'
  ];

  if (config.iface) {
    args.push('ifname');
    args.push(config.iface);
  }

  return {
    cmd: 'nmcli',
    args
  };
};

module.exports = command;
