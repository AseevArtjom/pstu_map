package com.project.pstu_map.service;

import com.project.pstu_map.dto.floor.FloorPlanDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.models.FloorPlan;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.FloorPlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FloorPlanService
{
    private final FloorPlanRepository floorPlanRepository;
    private final BuildingRepository buildingRepository;
    private final FileService fileService;

    @Transactional
    public FloorPlanDto saveOrUpdateFloorPlan(Integer buildingId, Integer floorNumber, String imagePath) {
        Building building = buildingRepository.findById(buildingId)
                .orElseThrow(() -> new IllegalArgumentException("Корпус с ID " + buildingId + " не найден"));

        FloorPlan floorPlan = floorPlanRepository.findByBuildingIdAndFloorNumber(buildingId, floorNumber)
                .orElse(new FloorPlan());

        if (floorPlan.getImagePath() != null && !floorPlan.getImagePath().equals(imagePath)) {
            fileService.deleteFile(floorPlan.getImagePath());
        }

        floorPlan.setBuilding(building);
        floorPlan.setFloorNumber(floorNumber);
        floorPlan.setImagePath(imagePath);

        FloorPlan savedPlan = floorPlanRepository.save(floorPlan);
        return convertToDTO(savedPlan);
    }

    @Transactional(readOnly = true)
    public java.util.List<FloorPlanDto> findByBuildingId(Integer buildingId) {
        return floorPlanRepository.findByBuildingId(buildingId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    public FloorPlanDto convertToDTO(FloorPlan floorPlan) {
        FloorPlanDto dto = new FloorPlanDto();
        dto.setId(floorPlan.getId());
        dto.setFloorNumber(floorPlan.getFloorNumber());
        dto.setImagePath(floorPlan.getImagePath());
        return dto;
    }
}
