package com.project.pstu_map.repository;

import com.project.pstu_map.models.Building;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BuildingRepository extends JpaRepository<Building, Integer> {

    @EntityGraph(attributePaths = {"icon", "floors"})
    List<Building> findAll();
    @EntityGraph(attributePaths = {"icon", "floors"})
    Optional<Building> findWithFloorsById(Integer id);
}