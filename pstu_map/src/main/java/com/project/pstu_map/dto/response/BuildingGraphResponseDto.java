package com.project.pstu_map.dto.response;

import com.project.pstu_map.dto.edge.EdgeDto;
import com.project.pstu_map.dto.node.NodeDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BuildingGraphResponseDto {
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
}