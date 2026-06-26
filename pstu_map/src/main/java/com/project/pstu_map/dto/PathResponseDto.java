package com.project.pstu_map.dto;

import com.project.pstu_map.models.Node;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class PathResponseDto
{
    private List<Node> path;
    private double totalDistance;
}
