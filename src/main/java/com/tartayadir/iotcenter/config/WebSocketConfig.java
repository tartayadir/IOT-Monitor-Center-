package com.tartayadir.iotcenter.config;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {

    @Value("${websocket.iot.data-topic}")
    private String DATA_TOPIC;

    @Value("${websocket.iot.command-topic}")
    private String COMMAND_TOPIC;

    private final WebSocketHandler webSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler, DATA_TOPIC).setAllowedOrigins("*");
        registry.addHandler(webSocketHandler, COMMAND_TOPIC).setAllowedOrigins("*");
    }
}