package com.project.pstu_map.dto.roomType;

import lombok.Data;

@Data
public class RoomTypeCreateDto {
    private String slug;
    private String name;
    private String defaultColor;
    private Integer defaultIconId;
}