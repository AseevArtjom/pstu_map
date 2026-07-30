package com.project.pstu_map.service;

import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.room.RoomCreateDto;
import com.project.pstu_map.dto.room.RoomResponseDto;
import com.project.pstu_map.dto.room.RoomUpdateDto;
import com.project.pstu_map.dto.roomType.RoomTypeResponseDto;
import com.project.pstu_map.models.*;
import com.project.pstu_map.repository.*;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomService {
    private final RoomRepository roomRepository;
    private final BuildingRepository buildingRepository;
    private final NodeRepository nodeRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final UploadedIconRepository uploadedIconRepository;

    public Optional<Room> getRoomById(String roomId) {
        return roomRepository.findById(roomId);
    }

    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    public List<Room> getRoomsByBuildingId(Integer buildingId) {
        return roomRepository.findByBuildingId(buildingId);
    }

    public List<Room> getNavigableRooms() {
        return roomRepository.findByNodeIsNotNull();
    }

    @Transactional
    public Room createRoom(RoomCreateDto dto) {
        Building building = buildingRepository.findById(dto.getBuildingId())
                .orElseThrow(() -> new EntityNotFoundException("Здание не найдено: " + dto.getBuildingId()));

        RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                .orElseThrow(() -> new EntityNotFoundException("Тип комнаты не найден: " + dto.getRoomTypeId()));

        Node node = null;
        if (dto.getNodeId() != null && !dto.getNodeId().isBlank()) {
            node = nodeRepository.findById(dto.getNodeId())
                    .orElseThrow(() -> new EntityNotFoundException("Узел не найден: " + dto.getNodeId()));
        }

        Room room = new Room();
        room.setId(dto.getId() != null && !dto.getId().isBlank()
                ? dto.getId()
                : UUID.randomUUID().toString());
        room.setName(dto.getName());
        room.setFloor(dto.getFloor());
        room.setRoomType(roomType);
        room.setDescription(dto.getDescription());
        room.setBuilding(building);
        room.setNode(node);
        room.setQrCode(dto.getQrCode() != null && !dto.getQrCode().isBlank()
                ? dto.getQrCode()
                : null);
        room.setRoomPolygon(dto.getRoomPolygon());
        room.setCustomColor(dto.getCustomColor());

        if (dto.getCustomIconId() != null) {
            UploadedIcon customIcon = uploadedIconRepository.findById(dto.getCustomIconId())
                    .orElseThrow(() -> new EntityNotFoundException("Иконка не найдена: " + dto.getCustomIconId()));
            room.setCustomIcon(customIcon);
        }

        return roomRepository.save(room);
    }

    @Transactional
    public Room updateRoom(String roomId, RoomUpdateDto dto) {
        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new EntityNotFoundException("Комната не найдена: " + roomId));

        room.setName(dto.getName());
        room.setFloor(dto.getFloor());
        room.setDescription(dto.getDescription());
        room.setQrCode(dto.getQrCode() != null && !dto.getQrCode().isBlank()
                ? dto.getQrCode()
                : null);
        room.setCustomColor(dto.getCustomColor());

        if (dto.getRoomTypeId() != null) {
            RoomType roomType = roomTypeRepository.findById(dto.getRoomTypeId())
                    .orElseThrow(() -> new EntityNotFoundException("Тип комнаты не найден: " + dto.getRoomTypeId()));
            room.setRoomType(roomType);
        }

        if (dto.getRoomPolygon() != null) {
            room.setRoomPolygon(dto.getRoomPolygon());
        }

        if (dto.getBuildingId() != null) {
            Building building = buildingRepository.findById(dto.getBuildingId())
                    .orElseThrow(() -> new EntityNotFoundException("Здание не найдено: " + dto.getBuildingId()));
            room.setBuilding(building);
        }

        if (dto.getNodeId() != null) {
            if (dto.getNodeId().isBlank()) {
                room.setNode(null);
            } else {
                Node node = nodeRepository.findById(dto.getNodeId())
                        .orElseThrow(() -> new EntityNotFoundException("Узел не найден: " + dto.getNodeId()));
                room.setNode(node);
            }
        }

        if (dto.getCustomIconId() != null) {
            UploadedIcon customIcon = uploadedIconRepository.findById(dto.getCustomIconId())
                    .orElseThrow(() -> new EntityNotFoundException("Иконка не найдена: " + dto.getCustomIconId()));
            room.setCustomIcon(customIcon);
        } else if (dto.getCustomIconId() == null) {
            room.setCustomIcon(null);
        }

        return roomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(String roomId) {
        if (!roomRepository.existsById(roomId)) {
            throw new EntityNotFoundException("Комната не найдена: " + roomId);
        }
        roomRepository.deleteById(roomId);
    }

    public RoomResponseDto convertToResponseDto(Room room) {
        RoomResponseDto dto = new RoomResponseDto();
        dto.setId(room.getId());
        dto.setName(room.getName());
        dto.setFloor(room.getFloor());
        dto.setDescription(room.getDescription());
        room.setQrCode(dto.getQrCode() != null && !dto.getQrCode().isBlank()
                ? dto.getQrCode()
                : null);
        dto.setRoomPolygon(room.getRoomPolygon());
        dto.setCustomColor(room.getCustomColor());

        if (room.getRoomType() != null) {
            RoomTypeResponseDto typeDto = new RoomTypeResponseDto();
            typeDto.setId(room.getRoomType().getId());
            typeDto.setSlug(room.getRoomType().getSlug());
            typeDto.setName(room.getRoomType().getName());
            typeDto.setDefaultColor(room.getRoomType().getDefaultColor());
            dto.setRoomType(typeDto);
        }

        if (room.getCustomIcon() != null) {
            dto.setCustomIconPath(room.getCustomIcon().getFilePath());
        }

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
        } else {
            dto.setNode(null);
        }

        return dto;
    }
}