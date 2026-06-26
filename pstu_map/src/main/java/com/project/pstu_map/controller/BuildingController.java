package com.project.pstu_map.controller;

import com.project.pstu_map.models.Building;
import com.project.pstu_map.service.BuildingService;
import com.project.pstu_map.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/buildings")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class BuildingController
{
    private final BuildingService buildingService;

    @GetMapping
    public List<Building> getAllBuildings()
    {
        return buildingService.getAllBuildings();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Building> getBuildingsById(@PathVariable String id)
    {
        return buildingService.getBuildingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
