package com.project.pstu_map.repository;

import com.project.pstu_map.models.Node;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NodeRepository extends JpaRepository<Node,String>
{
    List<Node> findByBuildingId(Integer buildingId);
    List<Node> findByBuildingIdAndFloor(Integer buildingId, int floor);
    List<Node> findByBuildingIsNull();
    @Query("SELECT DISTINCT n FROM Node n WHERE n.building.id = :buildingId AND EXISTS " +
            "(SELECT 1 FROM Edge e WHERE (e.fromNode = n AND e.toNode.building IS NULL) " +
            "OR (e.toNode = n AND e.fromNode.building IS NULL))")
    List<Node> findEntranceNodesByBuilding(@Param("buildingId") Integer buildingId);
}
