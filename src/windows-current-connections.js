var execFile = require('child_process').execFile;
var env = require('./env');
var networkUtils = require('./utils/network-utils.js');
const exec = require('child_process').exec;


function parseShowInterfacesforWindows10(stdout) {
  var lines = stdout.split('\r\n');
  var connections = [];
  var i = 3;
  while (lines.length > i + 18) {
    var tmpConnection = {};
    var fields = [
      'name',
      'description',
      'guid',
      'mac',
      'state',
      'ssid',
      'bssid',
      'mode',
      'radio',
      'authentication',
      'encryption',
      'connection',
      'channel',
      'reception',
      'transmission',
      'signal',
      'profil'
    ];
    for (var j = 0; j < fields.length; j++) {
      var line = lines[i + j];
      tmpConnection[fields[j]] = line.match(/.*: (.*)/)[1];
    }
    connections.push({
      iface: tmpConnection['name'],
      ssid: tmpConnection['ssid'],
      bssid: tmpConnection['bssid'],
      mac: tmpConnection['bssid'],
      mode: tmpConnection['mode'],
      channel: parseInt(tmpConnection['channel']),
      linkspeed: parseInt(tmpConnection['transmission']),
      frequency: parseInt(
        networkUtils.frequencyFromChannel(parseInt(tmpConnection['channel']))
      ),
      signal_level: networkUtils.dBFromQuality(tmpConnection['signal']),
      quality: parseFloat(tmpConnection['signal']),
      security: tmpConnection['authentication'],
      security_flags: tmpConnection['encryption']
    });

    i = i + 18;
  }

  return connections;
}

function parseShowInterfacesforWindows11(stdout) {
  var lines = stdout.split('\r\n');
  var connections = [];
  var i = 3;
  while (lines.length > i + 19) {
    var tmpConnection = {};
    var fields = [
      'name',
      'description',
      'guid',
      'mac',
      'interfaceType',
      'state',
      'ssid',
      'bssid',
      'mode',
      'radio',
      'authentication',
      'encryption',
      'connection',
      'channel',
      'reception',
      'transmission',
      'signal',
      'profil'
    ];
    for (var j = 0; j < fields.length; j++) {
      var line = lines[i + j];
      tmpConnection[fields[j]] = line.match(/.*: (.*)/)[1];
    }
    connections.push({
      iface: tmpConnection['name'],
      ssid: tmpConnection['ssid'],
      bssid: tmpConnection['bssid'],
      mac: tmpConnection['bssid'],
      mode: tmpConnection['mode'],
      channel: parseInt(tmpConnection['channel']),
      linkspeed: parseInt(tmpConnection['transmission']),
      frequency: parseInt(
        networkUtils.frequencyFromChannel(parseInt(tmpConnection['channel']))
      ),
      signal_level: networkUtils.dBFromQuality(tmpConnection['signal']),
      quality: parseFloat(tmpConnection['signal']),
      security: tmpConnection['authentication'],
      security_flags: tmpConnection['encryption']
    });

    i = i + 18;
  }

  return connections;
}

function getCurrentConnection(config, callback) {
  var params = ['wlan', 'show', 'interfaces'];
  execFile('netsh', params, { env }, function(err, stdout) {
    if (err) {
      callback && callback(err);
    } else {
      try {
        exec('wmic os get Caption', (err, info) => {
          if (err) {
            console.error(err);
          }
          else{
            if (info.includes("Windows 10")){
              var connections = parseShowInterfacesforWindows10(stdout, config);
              callback && callback(null, connections);
            } else {
              var connections = parseShowInterfacesforWindows11(stdout, config);
              callback && callback(null, connections);
            }
          }
        });
      } catch (e) {
        callback && callback(e);
      }
    }
  });
}

module.exports = function(config) {
  return function(callback) {
    if (callback) {
      getCurrentConnection(config, callback);
    } else {
      return new Promise(function(resolve, reject) {
        getCurrentConnection(config, function(err, connections) {
          if (err) {
            console.log("error from lib")
            console.log(err)
            reject(err);
          } else {
            resolve(connections);
          }
        });
      });
    }
  };
};
