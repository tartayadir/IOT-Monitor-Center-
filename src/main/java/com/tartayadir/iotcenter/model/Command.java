package com.tartayadir.iotcenter.model;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class Command {
    private String targetComponent;
    private String command;
}