package com.project.pstu_map.controller;

import com.project.pstu_map.models.Room;
import com.project.pstu_map.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rooms")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RoomController
{
    private final RoomService roomService;

    @GetMapping
    public List<Room> getRooms(@RequestParam(required = false) String buildingId)
    {
        if(buildingId != null && !buildingId.isBlank())
        {
            return roomService.getRoomsByBuildingId(buildingId);
        }
        return roomService.getAllRooms();
    }
}
