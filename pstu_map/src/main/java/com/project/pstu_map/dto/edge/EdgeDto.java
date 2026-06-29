package com.project.pstu_map.dto.edge;

import lombok.Data;

@Data
public class EdgeDto
{
    private String from;
    private String to;
    private double weight;
    private String type;
}
