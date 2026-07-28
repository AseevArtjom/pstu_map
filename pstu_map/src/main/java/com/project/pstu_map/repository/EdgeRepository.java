package com.project.pstu_map.repository;

import com.project.pstu_map.models.Edge;
import com.project.pstu_map.models.Node;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EdgeRepository extends JpaRepository<Edge, Long> {

    @EntityGraph(attributePaths = {"fromNode", "toNode"})
    List<Edge> findByFromNodeBuildingId(Integer buildingId);

    @EntityGraph(attributePaths = {"fromNode", "toNode"})
    @Query("SELECT e FROM Edge e WHERE e.fromNode.building.id = :buildingId OR e.toNode.building.id = :buildingId")
    List<Edge> findAllByBuildingIdEitherSide(@Param("buildingId") Integer buildingId);

    Optional<Edge> findByFromNodeIdAndToNodeId(String fromNodeId, String toNodeId);

    @Modifying
    @Query("DELETE FROM Edge e WHERE e.fromNode IN :nodes OR e.toNode IN :nodes")
    void deleteByNodeIn(@Param("nodes") List<Node> nodes);

    @EntityGraph(attributePaths = {"fromNode", "toNode"})
    @Query("SELECT e FROM Edge e WHERE e.fromNode.building IS NULL OR e.toNode.building IS NULL")
    List<Edge> findAllOutdoorOrBoundary();
}