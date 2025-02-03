#include <WiFi.h>
#include "PubSubClient.h"
#include "DHTesp.h"

// WiFi and MQTT server credentials
const char* ssid = "Wokwi-GUEST";
const char* password = "";
const char* mqttServer = "host.wokwi.internal";
const char* mqttDataTopic = "iot/data";
const char* mqttCommandTopic = "iot/command";
int port = 1883;

String stMac;
char mac[50];
char clientId[50];

WiFiClient espClient;
PubSubClient client(espClient);
DHTesp dhtSensor;

// Sensor and actuator pins
const int ledPin = 2;
const int buzzerPin = 4;
const int lightSensorPin = 34; 
const int DHT_PIN = 15;
const int noiseSensorPin = 12; 
const int airQualitySensorPin = 33; 

void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));

  // Connect to WiFi
  Serial.print("Connecting to ");
  Serial.println(ssid);
  wifiConnect();

  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println(WiFi.macAddress());
  stMac = WiFi.macAddress();
  stMac.replace(":", "_");
  Serial.println(stMac);
  
  // Initialize MQTT
  client.setServer(mqttServer, port);
  client.setCallback(callback);
  
  // Initialize DHT
  dhtSensor.setup(DHT_PIN, DHTesp::DHT22);

  // Initialize pins
  pinMode(ledPin, OUTPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(lightSensorPin, INPUT);
  pinMode(humiditySensorPin, INPUT);
  pinMode(noiseSensorPin, INPUT);
  pinMode(airQualitySensorPin, INPUT);
  pinMode(temperatureSensorPin, INPUT);
}

void wifiConnect() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void mqttReconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    long r = random(1000);
    sprintf(clientId, "clientId-%ld", r);
    if (client.connect(clientId)) {
      Serial.print(clientId);
      Serial.println(" connected");
      client.subscribe(mqttCommandTopic);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void callback(char* topic, byte* message, unsigned int length) {
  Serial.print("Message arrived on topic: ");
  Serial.print(topic);
  Serial.print(". Message: ");
  String stMessage;
  
  for (int i = 0; i < length; i++) {
    Serial.print((char)message[i]);
    stMessage += (char)message[i];
  }
  Serial.println();

  if (String(topic) == mqttCommandTopic) {
    Serial.print("Received command: ");
    Serial.println(stMessage);
    handleCommand(stMessage);
  }
}

void handleCommand(String commandMessage) {
  DynamicJsonDocument doc(200);
  deserializeJson(doc, commandMessage);
  String targetComponent = doc["targetComponent"];
  String command = doc["command"];

  if(targetComponent == "light") {
    if(command == "ON") {
      digitalWrite(ledPin, HIGH);
    } else if(command == "OFF") {
      digitalWrite(ledPin, LOW);
    }
  } else if(targetComponent == "buzzer") {
    if(command == "ON") {
      digitalWrite(buzzerPin, HIGH);
    } else if(command == "OFF") {
      digitalWrite(buzzerPin, LOW);
    }
  }
}

void publishSensorData() {
  TempAndHumidity  data = dhtSensor.getTempAndHumidity();
  float humidityLevel = data.humidity;
  float temperature = data.temperature; 

  float lightLevel = analogRead(lightSensorPin) / 4095.0 * 100.0; 
  float noiseLevel = analogRead(noiseSensorPin) / 4095.0 * 100.0; 
  float airQuality = analogRead(airQualitySensorPin) / 4095.0 * 100.0; 


  String payload = "{\"lightLevel\": " + String(lightLevel) + 
                   ", \"humidityLevel\": " + String(humidityLevel) + 
                   ", \"noiseLevel\": " + String(noiseLevel) + 
                   ", \"airQuality\": " + String(airQuality) + 
                   ", \"temperature\": " + String(temperature) + "}";
  
  client.publish(mqttDataTopic, payload.c_str());
}

void loop() {
  delay(10000); // Collect and publish data every 10 seconds
  if (!client.connected()) {
    mqttReconnect();
  }
  client.loop();
  publishSensorData();
}