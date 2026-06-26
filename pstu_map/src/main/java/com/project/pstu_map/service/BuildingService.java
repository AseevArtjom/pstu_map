package com.project.pstu_map.service;

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
@Transactional(readOnly = true)
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

}
