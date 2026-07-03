package com.project.pstu_map.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService
{
    @Value("${app.upload.dir:uploads/plans/}")
    private String uploadDir;

    public String saveFloorPlan(MultipartFile file,Integer buildingId,Integer floorNumber) throws IOException{
        if(file.isEmpty())
        {
            throw new IllegalArgumentException("Файл пустой");
        }
        File directory = new File(uploadDir);
        if(!directory.exists())
        {
            directory.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if(originalFilename != null && originalFilename.contains("."))
        {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }

        String fileName = "b_" + buildingId + "_f_" + floorNumber + "_" + UUID.randomUUID() + extension;
        Path path = Paths.get(uploadDir + fileName);

        Files.write(path,file.getBytes());

        return "/uploads/plans/" + fileName;
    }

    public void deleteFile(String relativePath) {
        try {
            String fileName = relativePath.replace("/uploads/plans/", "");
            Path path = Paths.get(uploadDir + fileName);
            Files.deleteIfExists(path);
        } catch (IOException e) {
            System.err.println("Не удалось удалить старый файл схемы этажа: " + e.getMessage());
        }
    }
}
