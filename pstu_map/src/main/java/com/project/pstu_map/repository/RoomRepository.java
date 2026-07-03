package com.project.pstu_map.repository;

import com.project.pstu_map.models.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoomRepository extends JpaRepository<Room,String>
{
    List<Room> findByBuildingId(Integer buildingId);
}
