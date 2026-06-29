package com.project.pstu_map.dto.building;

import lombok.Data;

@Data
public class BuildingDto {
    private String id;
    private String name;
    private Double lengthM;
    private Double depthM;
    private String mapPolygon;
    private String icon_path;
}