package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "edges")
@Data
public class Edge
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "from_node",nullable = false)
    private Node fromNode;

    @ManyToOne
    @JoinColumn(name = "to_node",nullable = false)
    private Node toNode;

    private double weight;
    private String type;
}
