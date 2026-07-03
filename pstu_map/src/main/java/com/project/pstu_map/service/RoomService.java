package com.project.pstu_map.service;

import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.room.RoomResponseDto;
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
public class RoomService {
    private final RoomRepository roomRepository;

    public Optional<Room> getRoomById(String roomId) {
        return roomRepository.findById(roomId);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByBuildingId(Integer buildingId) {
        return roomRepository.findByBuildingId(buildingId);
    }

    public RoomResponseDto convertToResponseDto(Room room) {
        RoomResponseDto dto = new RoomResponseDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setFloor(room.getFloor());
        dto.setType(room.getType());
        dto.setDescription(room.getDescription());
        dto.setQrCode(room.getQrCode());
        dto.setRoomPolygon(room.getRoomPolygon());

        if (room.getBuilding() != null) {
            dto.setBuildingId(room.getBuilding().getId());
        }

        if (room.getNode() != null) {
            NodeDto nodeDto = new NodeDto();
            nodeDto.setId(room.getNode().getId());
            nodeDto.setX(room.getNode().getX());
            nodeDto.setY(room.getNode().getY());
            nodeDto.setFloor(room.getNode().getFloor());
            dto.setNode(nodeDto);
        }

        return dto;
    }
}