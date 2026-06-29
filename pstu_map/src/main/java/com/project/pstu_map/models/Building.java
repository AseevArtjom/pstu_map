package com.project.pstu_map.models;

import jakarta.persistence.*;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "icon_id")
    private UploadedIcon icon;
}
