package com.project.pstu_map.controller;

import com.project.pstu_map.dto.roomType.RoomTypeCreateDto;
import com.project.pstu_map.dto.roomType.RoomTypeResponseDto;
import com.project.pstu_map.dto.roomType.RoomTypeUpdateDto;
import com.project.pstu_map.models.RoomType;
import com.project.pstu_map.service.RoomTypeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/room-types")
@RequiredArgsConstructor
public class RoomTypeController {

    private final RoomTypeService roomTypeService;

    @GetMapping
    public List<RoomTypeResponseDto> getAllRoomTypes() {
        return roomTypeService.getAllRoomTypes().stream()
                .map(roomTypeService::convertToResponseDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<RoomTypeResponseDto> getRoomTypeById(@PathVariable Integer id) {
        return roomTypeService.getRoomTypeById(id)
                .map(roomTypeService::convertToResponseDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RoomTypeResponseDto> createRoomType(@RequestBody RoomTypeCreateDto dto) {
        RoomType roomType = roomTypeService.createRoomType(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(roomTypeService.convertToResponseDto(roomType));
    }

    @PutMapping("/{id}")
    public RoomTypeResponseDto updateRoomType(@PathVariable Integer id, @RequestBody RoomTypeUpdateDto dto) {
        RoomType roomType = roomTypeService.updateRoomType(id, dto);
        return roomTypeService.convertToResponseDto(roomType);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRoomType(@PathVariable Integer id) {
        roomTypeService.deleteRoomType(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<String> handleConflict(DataIntegrityViolationException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }
}