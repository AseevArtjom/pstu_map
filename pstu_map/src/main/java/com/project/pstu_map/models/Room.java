package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

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
    @JoinColumn(name = "node_id",nullable = false)
    private Node node;

    @Column(name = "qr_code",unique = true)
    private String qrCode;
}
