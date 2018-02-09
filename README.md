# Introduction

Please read [this](http://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html) before using package.

MQTT-Promise: help you using all the function by promise

# Example

``` js
const CREDS = {
    hostname: '192.168.100.105',
    // host: '9858b7f7.ngrok.io',
    port: 9001,
    clientId: `browser:${bootstrap.apikey}:${DeviceInfo.getUniqueID()}`,
  }
  const params = {
    useSSL: false,
    keepAliveInterval: 20
  }
  const TIFLMQTT = new MQTTPromise(CREDS, params)
  TIFLMQTT.connect()
    .then(context => {
    console.log('>Connected')
    TIFLMQTT.subscribe('test-mobile')
      .then(data => {
        console.log('DATA GET FROM SUBCRIBE')
        console.log(data)
      })
    TIFLMQTT.publish('test-mobile', "HELLO WORLD")
  }).catch(err => {
    console.log(err)
  })
```

That's all!
