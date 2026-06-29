package com.project.pstu_map.models;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.Data;
import org.springframework.context.annotation.Lazy;

@Entity
@Table(name = "rooms")
@Data
public class Room
{
    @Id
    private String id;
    private String name;
    private int floor;
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne
    @JoinColumn(name = "building_id",nullable = false)
    private Building building;

    @OneToOne
    @JoinColumn(name = "node_id",nullable = false)
    private Node node;

    @Column(name = "qr_code",unique = true)
    private String qrCode;

    @Column(name = "room_polygon",columnDefinition = "TEXT")
    private String roomPolygon;
}
