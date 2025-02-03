import { v4 as uuidv4 } from 'uuid';

class WebSocketClient {
    constructor(dataUrl, commandUrl) {
        this.dataUrl = dataUrl;
        this.commandUrl = commandUrl;
        this.dataWebSocket = null;
        this.commandWebSocket = null;
        this.listeners = {};
        this.isReady = false;
        this.reconnectAttempts = 0; // Track reconnection attempts
        this.maxReconnectAttempts = 5; // Maximum reconnection attempts
        this.reconnectInterval = 3000; // Reconnection interval in milliseconds
        this.retryQueue = []; // Queue for retrying commands
        this.initializeConnections();
    }

    initializeConnections() {
        this.connectDataWebSocket();
        this.connectCommandWebSocket();
    }

    connectDataWebSocket() {
        this.dataWebSocket = new WebSocket(this.dataUrl);
        this.dataWebSocket.onopen = () => {
            console.log('Data WebSocket connection opened');
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            this.checkIfReady();
        };
        this.dataWebSocket.onmessage = (event) => {
            console.log(event.data)
            const data = JSON.parse(event.data);
            this.notifyListeners('data', data);
        };
        this.dataWebSocket.onerror = (error) => {
            console.error('Data WebSocket error:', error);
        };
        this.dataWebSocket.onclose = () => {
            console.log('Data WebSocket connection closed');
            this.isReady = false;
            this.reconnect('data'); // Attempt to reconnect
        };
    }

    connectCommandWebSocket() {
        this.commandWebSocket = new WebSocket(this.commandUrl);
        this.commandWebSocket.onopen = () => {
            console.log('Command WebSocket connection opened');
            this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            this.checkIfReady();
            // Process any commands in the retry queue
            while (this.retryQueue.length > 0) {
                const command = this.retryQueue.shift();
                this.sendCommand(command, false); // Retry without queuing again
            }
        };
        this.commandWebSocket.onerror = (error) => {
            console.error('Command WebSocket error:', error);
        };
        this.commandWebSocket.onclose = () => {
            console.log('Command WebSocket connection closed');
            this.isReady = false;
            this.reconnect('command'); // Attempt to reconnect
        };
    }

    reconnect(type) {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect ${type} WebSocket... (Attempt ${this.reconnectAttempts})`);
            setTimeout(() => {
                if (type === 'data') {
                    this.connectDataWebSocket();
                } else if (type === 'command') {
                    this.connectCommandWebSocket();
                }
            }, this.reconnectInterval);
        } else {
            console.error(`${type.charAt(0).toUpperCase() + type.slice(1)} WebSocket failed to reconnect after ${this.maxReconnectAttempts} attempts.`);
        }
    }

    checkIfReady() {
        if (this.dataWebSocket.readyState === WebSocket.OPEN && this.commandWebSocket.readyState === WebSocket.OPEN) {
            this.isReady = true;
            this.notifyListeners('ready', true);
        }
    }

    sendCommand(command, shouldQueue = true) {
        if (!this.isReady || this.commandWebSocket.readyState !== WebSocket.OPEN) {
            if (shouldQueue) {
                console.warn('WebSocket is not ready to send commands. Queuing command...');
                this.retryQueue.push(command); // Add command to retry queue
            } else {
                console.error('WebSocket is not ready to send commands.');
            }
            return;
        }
        try {
            this.commandWebSocket.send(JSON.stringify(command));
            console.log('Command sent:', command);
        } catch (error) {
            console.error('Failed to send command:', error);
            if (shouldQueue) {
                this.retryQueue.push(command); // Add command to retry queue on failure
            }
        }
    }

    onDataReceived(listener) {
        this.addListener('data', listener);
    }

    onReady(listener) {
        this.addListener('ready', listener);
    }

    addListener(eventType, listener) {
        if (!this.listeners[eventType]) {
            this.listeners[eventType] = [];
        }
        this.listeners[eventType].push(listener);
    }

    notifyListeners(eventType, data) {
        if (this.listeners[eventType]) {
            this.listeners[eventType].forEach((listener) => listener(data));
        }
    }

    closeConnections() {
        if (this.dataWebSocket) {
            this.dataWebSocket.close();
        }
        if (this.commandWebSocket) {
            this.commandWebSocket.close();
        }
    }
}

const dataUrl = 'ws://localhost:8080/iot/data';
const commandUrl = 'ws://localhost:8080/iot/command';
const webSocketClient = new WebSocketClient(dataUrl, commandUrl);

export default webSocketClient;