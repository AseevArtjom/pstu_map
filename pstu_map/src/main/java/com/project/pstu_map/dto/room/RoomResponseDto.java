package com.project.pstu_map.dto.room;

import com.project.pstu_map.dto.node.NodeDto;
import lombok.Data;

@Data
public class RoomResponseDto {
    private String id;
    private String name;
    private int floor;
    private String type;
    private String description;
    private String qrCode;
    private String roomPolygon;
    private String buildingId;
    private NodeDto node;
}