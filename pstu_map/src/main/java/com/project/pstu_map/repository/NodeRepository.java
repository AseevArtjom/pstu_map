package com.project.pstu_map.repository;

import com.project.pstu_map.models.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node,String>
{
    List<Node> findByBuildingId(Integer buildingId);
    List<Node> findByBuildingIdAndFloor(Integer buildingId, int floor);
    List<Node> findByBuildingIsNull();
}
