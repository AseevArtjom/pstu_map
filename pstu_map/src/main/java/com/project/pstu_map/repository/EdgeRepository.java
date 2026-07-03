package com.project.pstu_map.repository;

import com.project.pstu_map.models.Edge;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EdgeRepository extends JpaRepository<Edge,Long>
{
    @EntityGraph(attributePaths = {"fromNode", "toNode"})
    List<Edge> findByFromNodeBuildingId(Integer buildingId);
}
