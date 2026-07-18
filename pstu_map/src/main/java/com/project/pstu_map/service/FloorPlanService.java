package com.project.pstu_map.service;

import com.project.pstu_map.dto.floor.FloorPlanDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.models.FloorPlan;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.EdgeRepository;
import com.project.pstu_map.repository.FloorPlanRepository;
import com.project.pstu_map.repository.NodeRepository;
import com.project.pstu_map.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FloorPlanService {
    private final FloorPlanRepository floorPlanRepository;
    private final FileService fileService;
    private final BuildingRepository buildingRepository;
    private final RoomRepository roomRepository;
    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;

    @Transactional(readOnly = true)
    public java.util.List<FloorPlanDto> findAllFloorPlans() {
        return floorPlanRepository.findAll().stream()
                .map(this::convertToDTO)
                .toList();
    }

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

        return convertToDTO(floorPlanRepository.save(floorPlan));
    }

    @Transactional
    public FloorPlanDto updateFloorPlan(Integer buildingId, Integer floorNumber, MultipartFile newFile) throws IOException {
        FloorPlan plan = floorPlanRepository.findByBuildingIdAndFloorNumber(buildingId, floorNumber)
                .orElseThrow(() -> new IllegalArgumentException("Этаж не найден"));

        if (newFile != null && !newFile.isEmpty()) {
            if (plan.getImagePath() != null) fileService.deleteFile(plan.getImagePath());

            String newPath = fileService.saveFile(newFile, FileService.FileType.FLOOR_PLAN, "b" + buildingId + "_f" + floorNumber);
            plan.setImagePath(newPath);
        }

        plan.setFloorNumber(floorNumber);
        return convertToDTO(floorPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    public java.util.List<FloorPlanDto> findByBuildingId(Integer buildingId) {
        return floorPlanRepository.findByBuildingId(buildingId).stream()
                .map(this::convertToDTO)
                .toList();
    }

    @Transactional
    public void deleteFloorPlan(Integer buildingId, Integer floorPlanId) {
        FloorPlan floorPlan = floorPlanRepository.findById(floorPlanId)
                .orElseThrow(() -> new IllegalArgumentException("Этаж не найден: " + floorPlanId));

        if (!floorPlan.getBuilding().getId().equals(buildingId)) {
            throw new IllegalArgumentException("Этаж не принадлежит указанному зданию");
        }

        int floorNumber = floorPlan.getFloorNumber();
        roomRepository.deleteByBuildingIdAndFloor(buildingId, floorNumber);

        List<Node> floorNodes = nodeRepository.findByBuildingIdAndFloor(buildingId, floorNumber);
        if (!floorNodes.isEmpty()) {
            edgeRepository.deleteByNodeIn(floorNodes);
            nodeRepository.deleteAll(floorNodes);
        }
        if (floorPlan.getImagePath() != null) {
            fileService.deleteFile(floorPlan.getImagePath());
        }
        floorPlanRepository.delete(floorPlan);
    }

    public FloorPlanDto convertToDTO(FloorPlan floorPlan) {
        FloorPlanDto dto = new FloorPlanDto();
        dto.setId(floorPlan.getId());
        dto.setFloorNumber(floorPlan.getFloorNumber());
        dto.setImagePath(floorPlan.getImagePath());
        return dto;
    }
}