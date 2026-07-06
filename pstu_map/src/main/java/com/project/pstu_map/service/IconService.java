package com.project.pstu_map.service;

import com.project.pstu_map.models.UploadedIcon;
import com.project.pstu_map.repository.UploadedIconRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class IconService {
    private final UploadedIconRepository repository;
    private final FileService fileService;

    public java.util.List<UploadedIcon> getAllIcons() {
        return repository.findAll();
    }

    public UploadedIcon saveIcon(MultipartFile file) throws IOException {
        String path = fileService.saveFile(file, FileService.FileType.ICON, "icon");
        UploadedIcon icon = new UploadedIcon();
        icon.setFilePath(path);
        return repository.save(icon);
    }

    public void deleteIcon(int id) {
        UploadedIcon icon = repository.findById(id).orElseThrow();
        fileService.deleteFile(icon.getFilePath());
        repository.delete(icon);
    }
}