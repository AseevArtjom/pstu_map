package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "nodes")
@Data
public class Node {
    @Id
    private String id;
    private int floor;
    private double x;
    private double y;

    @ManyToOne
    @JoinColumn(name = "building_id")
    private Building building;
}
