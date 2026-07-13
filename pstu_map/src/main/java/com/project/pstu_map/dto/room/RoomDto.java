package com.project.pstu_map.dto.room;

import lombok.Data;

@Data
public class RoomDto {
    private String id;
    private String name;
    private int floor;
    private String typeSlug;
    private String node;
    private String roomPolygon;
    private String calculatedColor;
}