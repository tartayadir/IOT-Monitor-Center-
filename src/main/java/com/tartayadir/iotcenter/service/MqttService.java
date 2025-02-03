package com.tartayadir.iotcenter.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tartayadir.iotcenter.model.Data;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.eclipse.paho.client.mqttv3.IMqttClient;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class MqttService {
    private final IMqttClient client;

    @Value("${mqtt.iot.data-topic}")
    private String DATA_TOPIC;

    @Value("${mqtt.iot.command-topic}")
    private String COMMAND_TOPIC;

    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());

    private String lastMessage;
    private long lastMessageTimestamp = System.currentTimeMillis(); // Timestamp of the last received message
    private final ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    @PostConstruct
    void init() throws MqttException, JsonProcessingException {
        client.subscribe(DATA_TOPIC, (topic, message) -> {
            String payload = new String(message.getPayload());
            broadcastUpdate(payload);
        });

        //init empty message
        lastMessage = new ObjectMapper()
                .writeValueAsString(new Data());

        // Schedule a task to resend the last message if no new message is received for 5 seconds
        scheduler.scheduleAtFixedRate(this::resendLastMessageIfNoUpdate, 5, 5, TimeUnit.SECONDS);
    }

    private void broadcastUpdate(String message) {
        synchronized (sessions) {
            try {
                // Parse the JSON string to ensure it's valid
                ObjectMapper objectMapper = new ObjectMapper();
                Data data = objectMapper.readValue(message, Data.class);

                // Convert it back to a JSON string with proper formatting
                lastMessage = objectMapper.writeValueAsString(data);

                // Update the timestamp of the last received message
                lastMessageTimestamp = System.currentTimeMillis();

                // Broadcast the updated message to all WebSocket sessions
                sessions.forEach(session -> processSessionWithUpdatedData(session, lastMessage));
            } catch (Exception e) {
                log.error("Invalid JSON message received: {}", message, e);
            }
        }
    }

    private void processSessionWithUpdatedData(WebSocketSession session, String data) {
        try {
            session.sendMessage(new TextMessage(data));
        } catch (Exception e) {
            log.error("Error during sending date to session with ID {}", session.getId(), e);
        }
    }

    private void resendLastMessageIfNoUpdate() {
        long currentTime = System.currentTimeMillis();
        long timeSinceLastMessage = currentTime - lastMessageTimestamp;

        // If no new message has been received for 5 seconds, resend the last message
        if (timeSinceLastMessage > 5000 && !lastMessage.isEmpty()) {
            log.info("No new message received for 5 seconds. Resending last message...");
            synchronized (sessions) {
                sessions.forEach(session -> processSessionWithUpdatedData(session, lastMessage));
            }
        }
    }

    public void sendCommand(String commandJson) throws MqttException {
        MqttMessage message = new MqttMessage(commandJson.getBytes());
        client.publish(COMMAND_TOPIC, message);
    }

    public void registerSession(WebSocketSession session) {
        sessions.add(session);
    }

    public void unregisterSession(WebSocketSession session) {
        sessions.remove(session);
    }
}
