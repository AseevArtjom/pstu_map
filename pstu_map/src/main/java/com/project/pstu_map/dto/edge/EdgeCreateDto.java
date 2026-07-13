package com.project.pstu_map.dto.edge;

import lombok.Data;

@Data
public class EdgeCreateDto {
    private String fromNodeId;
    private String toNodeId;
    private double weight;
    private String type;
}