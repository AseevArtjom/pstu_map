package com.project.pstu_map.dto.roomType;

import lombok.Data;

@Data
public class RoomTypeResponseDto {
    private Integer id;
    private String slug;
    private String name;
    private String defaultColor;
    private String defaultIconPath;
}