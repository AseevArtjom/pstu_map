package com.project.pstu_map.models;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "rooms")
@Data
public class Room {

    @Id
    private String id;

    @Column(nullable = false)
    private String name;

    private int floor;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "building_id")
    private Building building;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id")
    private Node node;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "room_type_id", nullable = false)
    private RoomType roomType;

    @Column(name = "qr_code", unique = true, length = 100)
    private String qrCode;

    @Column(name = "room_polygon", columnDefinition = "TEXT")
    private String roomPolygon;

    @Column(name = "custom_color", length = 7)
    private String customColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custom_icon_id")
    private UploadedIcon customIcon;
}