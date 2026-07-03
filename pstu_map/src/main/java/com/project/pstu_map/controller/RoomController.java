package com.project.pstu_map.controller;

import com.project.pstu_map.dto.room.RoomResponseDto;
import com.project.pstu_map.models.Room;
import com.project.pstu_map.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

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
}