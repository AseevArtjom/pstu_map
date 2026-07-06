package com.project.pstu_map.controller;

import com.project.pstu_map.models.UploadedIcon;
import com.project.pstu_map.service.FileService;
import com.project.pstu_map.service.IconService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/icons")
@RequiredArgsConstructor
public class IconController {
    private final IconService iconService;

    @GetMapping
    public ResponseEntity<List<UploadedIcon>> getAllIcons() {
        return ResponseEntity.ok(iconService.getAllIcons());
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadedIcon> uploadIcon(@RequestParam("file") MultipartFile file) throws IOException {
        return ResponseEntity.ok(iconService.saveIcon(file));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIcon(@PathVariable int id) {
        iconService.deleteIcon(id);
        return ResponseEntity.noContent().build();
    }
}