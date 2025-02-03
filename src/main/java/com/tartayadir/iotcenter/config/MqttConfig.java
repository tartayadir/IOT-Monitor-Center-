package com.tartayadir.iotcenter.config;

import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttClient;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MqttConfig {

    @Value("${mqtt.server.host}")
    private String MQTT_SERVER_URI;

    @Value("${mqtt.client.uuid}")
    private String MQTT_CLIENT_ID;

    @Bean
    public IMqttClient mqttClient() {
        IMqttClient mqttClient;
        try {
            mqttClient = new MqttClient(MQTT_SERVER_URI, MQTT_CLIENT_ID);
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            mqttClient.connect(options);
        } catch (MqttException e) {
            throw new RuntimeException(e);
        }

        return mqttClient;
    }
}

