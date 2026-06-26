package com.project.pstu_map.service;

import com.project.pstu_map.models.Room;
import com.project.pstu_map.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService
{
    private final RoomRepository roomRepository;

    public Optional<Room> getRoomById(String roomId)
    {
        return roomRepository.findById(roomId);
    }

    public List<Room> getAllRooms()
    {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByBuildingId(String buildingId)
    {
        return roomRepository.findAll().stream()
                .filter(room -> room.getNode().getBuilding().getId().equalsIgnoreCase(buildingId))
                .toList();
    }
}
