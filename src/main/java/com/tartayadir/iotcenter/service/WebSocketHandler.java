package com.tartayadir.iotcenter.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Objects;
@Slf4j
@Service
@RequiredArgsConstructor
public class WebSocketHandler extends TextWebSocketHandler {

    @Value("${websocket.iot.data-topic}")
    private String DATA_TOPIC;

    @Value("${websocket.iot.command-topic}")
    private String COMMAND_TOPIC;

    private final MqttService mqttService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        if (Objects.requireNonNull(session.getUri()).getPath().equals(DATA_TOPIC)) {
            mqttService.registerSession(session);
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        if (Objects.requireNonNull(session.getUri()).getPath().equals(COMMAND_TOPIC)) {
            String commandJson = message.getPayload();
            mqttService.sendCommand(commandJson);

            log.debug("Received command: {}", commandJson);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        mqttService.unregisterSession(session);
    }
}