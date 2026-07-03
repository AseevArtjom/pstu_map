package com.project.pstu_map.service;

import com.project.pstu_map.models.UploadedIcon;
import com.project.pstu_map.repository.UploadedIconRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
public class IconService {
    @Autowired
    private UploadedIconRepository uploadedIconRepository;
    private final String UPLOAD_DIR = "uploads/icons/";

    public List<UploadedIcon> getAllIcons() {
        return uploadedIconRepository.findAll();
    }

    public UploadedIcon saveIcon(MultipartFile file) {
        try {
            String fileName = UUID.randomUUID().toString() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.createDirectories(path.getParent());
            Files.copy(file.getInputStream(), path);

            UploadedIcon icon = new UploadedIcon();
            icon.setFilePath("/icons/" + fileName);
            return uploadedIconRepository.save(icon);
        } catch (IOException e) {
            throw new RuntimeException("Ошибка при сохранении иконки", e);
        }
    }

    public void deleteIcon(int id) {
        UploadedIcon icon = uploadedIconRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Иконка не найдена"));
        try {
            Files.deleteIfExists(Paths.get("uploads" + icon.getFilePath()));
        } catch (IOException e) {
            e.printStackTrace();
        }
        uploadedIconRepository.delete(icon);
    }
}