package com.project.pstu_map.models;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "uploaded_icons")
@Data
public class UploadedIcon
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column(name = "file_path",nullable = false,unique = true)
    private String filePath;
}
