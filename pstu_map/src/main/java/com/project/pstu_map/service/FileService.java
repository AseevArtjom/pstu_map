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
    @Value("${app.upload.root:uploads/}")
    private String rootUploadDir;

    public enum FileType {
        ICON("icons/"),
        FLOOR_PLAN("floors/");

        private final String folder;
        FileType(String folder) { this.folder = folder; }
        public String getFolder() { return folder; }
    }

    public String saveFile(MultipartFile file, FileType type, String prefix) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("Файл пустой");

        String uploadPath = rootUploadDir + type.getFolder();
        Files.createDirectories(Paths.get(uploadPath));

        String originalName = file.getOriginalFilename();
        String extension = originalName != null && originalName.contains(".")
                ? originalName.substring(originalName.lastIndexOf(".")) : "";

        String fileName = prefix + "_" + UUID.randomUUID() + extension;
        Files.copy(file.getInputStream(), Paths.get(uploadPath + fileName));

        return "/" + type.getFolder() + fileName;
    }

    public void deleteFile(String relativePath) {
        try {
            String cleanPath = relativePath.startsWith("/") ? relativePath.substring(1) : relativePath;
            Files.deleteIfExists(Paths.get(rootUploadDir).resolve(cleanPath));
        } catch (IOException e) {
            System.err.println("Ошибка при удалении файла: " + e.getMessage());
        }
    }
}
