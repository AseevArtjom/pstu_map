package com.project.pstu_map.service;

import com.project.pstu_map.dto.building.BuildingDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.models.UploadedIcon;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.UploadedIconRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BuildingService {

    private final BuildingRepository buildingRepository;
    private final FloorPlanService floorPlanService;
    private final UploadedIconRepository uploadedIconRepository;

    @Transactional(readOnly = true)
    public List<Building> getAllBuildings() {
        return buildingRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Optional<Building> getBuildingById(Integer id) {
        return buildingRepository.findWithFloorsById(id);
    }

    @Transactional
    public Building saveBuilding(BuildingDto dto) {
        Building building = new Building();

        building.setName(dto.getName());
        building.setMapPolygon(dto.getMapPolygon());
        building.setHexColor(dto.getHexColor());

        building.setLengthM(dto.getLengthM() != null ? dto.getLengthM() : 0.0);
        building.setDepthM(dto.getDepthM() != null ? dto.getDepthM() : 0.0);

        return buildingRepository.save(building);
    }

    @Transactional
    public void deleteBuilding(Integer id)
    {
        if(buildingRepository.existsById(id))
        {
            buildingRepository.deleteById(id);
        }
        else {
            throw new RuntimeException("Здание с ID " + id + " не найдено");
        }
    }

    @Transactional
    public Building updateBuilding(Integer id, BuildingDto dto) {
        Building building = buildingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Здание с ID " + id + " не найдено"));

        building.setName(dto.getName());
        building.setMapPolygon(dto.getMapPolygon());
        building.setHexColor(dto.getHexColor());
        building.setLengthM(dto.getLengthM() != null ? dto.getLengthM() : building.getLengthM());
        building.setDepthM(dto.getDepthM() != null ? dto.getDepthM() : building.getDepthM());

        if (dto.getIcon_path() != null) {
            UploadedIcon icon = uploadedIconRepository.findByFilePath(dto.getIcon_path())
                    .orElseThrow(() -> new RuntimeException("Иконка не найдена по пути: " + dto.getIcon_path()));
            building.setIcon(icon);
        } else {
            building.setIcon(null);
        }

        return buildingRepository.save(building);
    }

    public BuildingDto convertToDTO(Building building) {
        BuildingDto dto = new BuildingDto();
        dto.setId(building.getId());
        dto.setName(building.getName());
        dto.setLengthM(building.getLengthM());
        dto.setDepthM(building.getDepthM());
        dto.setMapPolygon(building.getMapPolygon());
        dto.setHexColor(building.getHexColor());

        if (building.getIcon() != null) {
            dto.setIcon_path(building.getIcon().getFilePath());
        } else {
            dto.setIcon_path(null);
        }

        if (building.getFloors() != null) {
            List<com.project.pstu_map.dto.floor.FloorPlanDto> floorDtos = building.getFloors().stream()
                    .map(floorPlanService::convertToDTO)
                    .toList();
            dto.setFloors(floorDtos);
        } else {
            dto.setFloors(List.of());
        }

        return dto;
    }
}