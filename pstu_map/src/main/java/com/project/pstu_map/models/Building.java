package com.project.pstu_map.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "buildings")
@Data
public class Building
{
    @Id
    private String id;

    private String name;

    @Column(name = "length_m")
    private Double lengthM;

    @Column(name = "depth_m")
    private Double depthM;

    @Column(name = "map_polygon")
    private String mapPolygon;
}
