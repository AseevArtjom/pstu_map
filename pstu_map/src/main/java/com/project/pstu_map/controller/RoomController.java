package com.project.pstu_map.controller;

import com.project.pstu_map.dto.room.RoomCreateDto;
import com.project.pstu_map.dto.room.RoomResponseDto;
import com.project.pstu_map.dto.room.RoomUpdateDto;
import com.project.pstu_map.models.Room;
import com.project.pstu_map.service.RoomService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping
    public List<RoomResponseDto> getRoomsByBuildingId(@RequestParam("buildingId") Integer buildingId) {
        return roomService.getRoomsByBuildingId(buildingId).stream()
                .map(roomService::convertToResponseDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomResponseDto> getRoomById(@PathVariable String id) {
        return roomService.getRoomById(id)
                .map(roomService::convertToResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/navigable")
    public List<RoomResponseDto> getNavigableRooms() {
        return roomService.getNavigableRooms().stream()
                .map(roomService::convertToResponseDto)
                .toList();
    }

    @PostMapping
    public ResponseEntity<RoomResponseDto> createRoom(@RequestBody RoomCreateDto dto) {
        Room room = roomService.createRoom(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomService.convertToResponseDto(room));
    }

    @PutMapping("/{id}")
    public RoomResponseDto updateRoom(@PathVariable String id, @RequestBody RoomUpdateDto dto) {
        Room room = roomService.updateRoom(id, dto);
        return roomService.convertToResponseDto(room);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoom(@PathVariable String id) {
        roomService.deleteRoom(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}