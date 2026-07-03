package com.project.pstu_map.dto.building;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.project.pstu_map.dto.floor.FloorPlanDto;
import lombok.Data;

import java.util.List;

@Data
public class BuildingDto {
    private Integer id;
    private String name;
    private Double lengthM;
    private Double depthM;
    private String mapPolygon;
    @JsonProperty("hex_color")
    private String hexColor;
    private String icon_path;
    private List<FloorPlanDto> floors;
}