package com.project.pstu_map.dto.room;

import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.roomType.RoomTypeResponseDto;
import lombok.Data;

@Data
public class RoomResponseDto {
    private String id;
    private String name;
    private int floor;
    private RoomTypeResponseDto roomType;
    private String description;
    private String qrCode;
    private String roomPolygon;
    private Integer buildingId;
    private NodeDto node;
    private String customColor;
    private String customIconPath;
}