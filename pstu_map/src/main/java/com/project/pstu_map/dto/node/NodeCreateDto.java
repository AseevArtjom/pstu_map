package com.project.pstu_map.dto.node;

import lombok.Data;

@Data
public class NodeCreateDto
{
    private String id;
    private int floor;
    private double x;
    private double y;
    private Integer buildingId;
}
