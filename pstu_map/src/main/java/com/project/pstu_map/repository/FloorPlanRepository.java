package com.project.pstu_map.repository;

import com.project.pstu_map.models.FloorPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorPlanRepository extends JpaRepository<FloorPlan,Integer>
{
    List<FloorPlan> findByBuildingId(Integer buildingId);
    Optional<FloorPlan> findByBuildingIdAndFloorNumber(Integer buildingId, Integer floorNumber);
}
