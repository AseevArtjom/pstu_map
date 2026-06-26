package com.project.pstu_map.repository;

import com.project.pstu_map.models.Building;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BuildingRepository extends JpaRepository<Building,String>
{

}
