package com.project.pstu_map.dto.node;

import lombok.Data;

@Data
public class NodeUpdateDto {
    private Integer floor;
    private Double x;
    private Double y;
    private Integer buildingId;
}