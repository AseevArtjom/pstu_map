package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "room_types")
@Data
public class RoomType
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false,unique = true,length = 50)
    private String slug;

    @Column(nullable = false,length = 100)
    private String name;

    @Column(name = "default_color",length = 7)
    private String defaultColor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "default_icon_id")
    private UploadedIcon defaultIcon;
}
