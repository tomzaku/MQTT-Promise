export default class MQTTPromise {
  constructor(server, props) {
    this.params = props;
    this.server = server;
    const { hostname, port, clientId } = server;

    this.client = new Paho.MQTT.Client(hostname, Number(port), clientId);
    this.client.onConnectionLost = this.onConnectionLost;
    this.client.onMessageArrived = this.onMessageArrived;
    // subscription_map : store all promise of every subcribe (include reslove, reject)
    this.subscription_map = {}
  }
  _connectPromise(params) {
    console.log('_connectPromise')
    return new Promise((reslove, reject) => {
      this.client.connect({
         ...params,
         onSuccess: (context) => reslove(context),
         onFailure: (context) => reject(context),
      })
    })
  }
  onConnectionLost = (err) => {
    console.warn(`MQTT: Connection Failed/Lost: ${err && err.errorMessage}`, err);
  }
  onMessageArrived = (message) => {
    let topic = message.destinationName;
    let payload = JSON.parse(message.payloadString);
    console.debug(`MQTT: Received message on [${topic}]`);
    if (!Array.isArray(this.subscription_map[topic])) {
      return console.info(`MQTT: No callback registered for topic '${topic}'.`);
    }
    for (let promise of this.subscription_map[topic]) {
      promise.reslove({ payload, message })
    }
  }
  connect() {
    console.log('BEGIN connect')
    return new Promise((reslove, reject) => {
      this.client.connect({
         ...this.params,
         onSuccess: (context) => reslove(context),
         onFailure: (context) => reject(context),
      })
    })
  }
  _subscribe(topic) {
    console.info(`MQTT: Subscribing to: '${topic}' - QoS: 1`);
    return this.client.subscribe(topic, {qos: 1});
  };

  subscribe(topic) {
    return new Promise ((reslove, reject) => {
      topic = topic.replace(/:/g, '/');
      if (this.subscription_map[topic] == null) {
        this.subscription_map[topic] = [];
        this._subscribe(topic);
      }
      if (!Array.from(this.subscription_map[topic]).includes({reslove, reject})) {
        this.subscription_map[topic].push({reslove, reject});
      }
    });
  }
  disconnect() {
    client.disconnect();
    console.log('disconnect')
  }
  publish(topic, message, qos) {
    topic = topic.replace(/:/g, '/');
    let mqttmsg = new Paho.MQTT.Message(JSON.stringify({
      // user: MQTT.username,
      content: message,
      title: topic,
      // target: ''
    }));
    mqttmsg.destinationName = topic;
    mqttmsg.qos = Number(qos || 0);
    try {
      this.client.send(mqttmsg);
    } catch (err) {
      console.log('ERR', err)
      throw err
    }
    return topic;
  }
  unsubscribe(topic, unsubscribeOptions) {
    return new Promise( (reslove, reject) => {
      topic = topic.replace(/:/g, '/');
      if (!this.subscription_map[topic] || (this.subscription_map[topic].length === 0)) {
        let opts = {
          ...unsubscribeOptions,
          onSuccess: (context) => reslove(context),
          onFailure: (context) => reject(context),
        };
        console.log('mqtt:unsubscribe', topic, opts)
        client.unsubscribe(topic, opts);
        this.subscription_map[topic] = undefined;
      }
    })
  }
}