package com.project.pstu_map.repository;

import com.project.pstu_map.models.UploadedIcon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UploadedIconRepository extends JpaRepository<UploadedIcon,Integer>
{
    Optional<UploadedIcon> findByFilePath(String filePath);
}
