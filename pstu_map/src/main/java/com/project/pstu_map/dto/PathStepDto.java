package com.project.pstu_map.dto;


import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PathStepDto
{
    private String fromNodeId;
    private String toNodeId;
    private int fromFloor;
    private int toFloor;
    private String type;
    private double weight;
}
