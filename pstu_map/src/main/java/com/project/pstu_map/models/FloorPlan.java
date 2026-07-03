package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.ToString;

@Entity
@Table(name = "floor_plans",uniqueConstraints = {
    @UniqueConstraint(columnNames = {"building_id","floor_number"})
})
@Data
public class FloorPlan
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id",nullable = false)
    @ToString.Exclude
    private Building building;

    @Column(name = "floor_number",nullable = false)
    private Integer floorNumber;

    @Column(name = "image_path",nullable = false)
    private String imagePath;
}
