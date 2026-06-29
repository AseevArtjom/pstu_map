package com.project.pstu_map.service;

import com.project.pstu_map.dto.building.BuildingDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class BuildingService
{
    private final BuildingRepository buildingRepository;

    public List<Building> getAllBuildings()
    {
        return buildingRepository.findAll();
    }

    public Optional<Building> getBuildingById(String id)
    {
        return buildingRepository.findById(id);
    }

    public BuildingDto convertToDTO(Building building) {
        BuildingDto dto = new BuildingDto();
        dto.setId(building.getId());
        dto.setName(building.getName());
        dto.setLengthM(building.getLengthM());
        dto.setDepthM(building.getDepthM());
        dto.setMapPolygon(building.getMapPolygon());

        if (building.getIcon() != null) {
            dto.setIcon_path(building.getIcon().getFilePath());
        } else {
            dto.setIcon_path(null);
        }

        return dto;
    }
}
