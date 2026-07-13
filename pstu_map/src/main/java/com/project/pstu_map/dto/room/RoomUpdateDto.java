package com.project.pstu_map.dto.room;

import lombok.Data;

@Data
public class RoomUpdateDto {
    private String name;
    private int floor;
    private Integer roomTypeId;
    private String description;
    private Integer buildingId;
    private String nodeId;
    private String qrCode;
    private String roomPolygon;
    private String customColor;
    private Integer customIconId;
}