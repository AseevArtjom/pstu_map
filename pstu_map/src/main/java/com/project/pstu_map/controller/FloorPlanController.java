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
            String prefix = "b" + buildingId + "_f" + floorNumber;
            String imagePath = fileService.saveFile(file, FileService.FileType.FLOOR_PLAN, prefix);
            FloorPlanDto updatedDto = floorPlanService.saveOrUpdateFloorPlan(buildingId, floorNumber, imagePath);
            return ResponseEntity.ok(updatedDto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getLocalizedMessage());
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Ошибка при сохранении файла: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<FloorPlanDto>> getFloorsByBuilding(@PathVariable Integer buildingId) {
        return ResponseEntity.ok(floorPlanService.findByBuildingId(buildingId));
    }

    @DeleteMapping("/{floorId}")
    public ResponseEntity<Void> deleteFloorPlan(
            @PathVariable Integer buildingId,
            @PathVariable Integer floorId
    ) {
        floorPlanService.deleteFloorPlan(buildingId, floorId);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}