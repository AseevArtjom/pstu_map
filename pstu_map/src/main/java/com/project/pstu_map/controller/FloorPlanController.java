package com.project.pstu_map.controller;

import com.project.pstu_map.dto.floor.FloorPlanDto;
import com.project.pstu_map.service.FileService;
import com.project.pstu_map.service.FloorPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/buildings/{buildingId}/floors")
@RequiredArgsConstructor
public class FloorPlanController {

    private final FloorPlanService floorPlanService;
    private final FileService fileService;

    @PostMapping(value = "/{floorNumber}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadFloorPlan(
            @PathVariable Integer buildingId,
            @PathVariable Integer floorNumber,
            @RequestParam("file") MultipartFile file) {
        try {
            String imagePath = fileService.saveFloorPlan(file, buildingId, floorNumber);
            FloorPlanDto updatedDto = floorPlanService.saveOrUpdateFloorPlan(buildingId, floorNumber, imagePath);

            return ResponseEntity.ok(updatedDto);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getLocalizedMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при сохранении файла на сервере: " + e.getLocalizedMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FloorPlanDto>> getFloorsByBuilding(@PathVariable Integer buildingId) {
        List<FloorPlanDto> floors = floorPlanService.findByBuildingId(buildingId);
        return ResponseEntity.ok(floors);
    }
}