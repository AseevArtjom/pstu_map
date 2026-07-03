package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

import java.util.List;

@Entity
@Table(name = "buildings")
@Data
public class Building
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

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

    @Column(name = "hex_color")
    private String hexColor;

    @OneToMany(mappedBy = "building",cascade = CascadeType.ALL,orphanRemoval = true,fetch = FetchType.LAZY)
    private List<FloorPlan> floors;
}
