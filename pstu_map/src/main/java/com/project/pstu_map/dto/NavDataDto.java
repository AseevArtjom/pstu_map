package com.project.pstu_map.dto;

import lombok.Data;

import java.util.List;

@Data
public class NavDataDto
{
    private MetaDto meta;
    private List<NodeDto> nodes;
    private List<EdgeDto> edges;
    private List<RoomDto> rooms;
}
