package com.project.pstu_map.controller;

import com.project.pstu_map.dto.building.BuildingDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.service.BuildingService;
import com.project.pstu_map.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BuildingController
{
    private final BuildingService buildingService;

    @GetMapping
    public List<BuildingDto> getAllBuildings()
    {
        return buildingService.getAllBuildings().stream()
                .map(buildingService::convertToDTO)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BuildingDto> getBuildingsById(@PathVariable String id)
    {
        return buildingService.getBuildingById(id)
                .map(buildingService::convertToDTO)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
