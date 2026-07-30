package com.project.pstu_map.controller;

import com.project.pstu_map.dto.response.BuildingGraphResponseDto;
import com.project.pstu_map.dto.response.PathResponseDto;
import com.project.pstu_map.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapController {
    private final MapService mapService;

    @GetMapping("/{buildingId}")
    public BuildingGraphResponseDto getBuildingGraph(@PathVariable Integer buildingId) {
        return mapService.getBuildingGraph(buildingId);
    }

    @GetMapping("/path")
    public PathResponseDto findPath(
            @RequestParam(value = "fromRoomId", required = false) String fromRoomId,
            @RequestParam(value = "fromId", required = false) String fromId,
            @RequestParam(value = "fromType", defaultValue = "room") String fromType,
            @RequestParam(value = "toRoomId", required = false) String toRoomId,
            @RequestParam(value = "toId", required = false) String toId,
            @RequestParam(value = "toType", defaultValue = "room") String toType) {

        String actualFromId = fromId != null ? fromId : fromRoomId;
        String actualToId = toId != null ? toId : toRoomId;

        return mapService.calculatePath(actualFromId, fromType, actualToId, toType);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(ex.getMessage());
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<String> handleConflict(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(ex.getMessage());
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<String> handleNoRoute(RuntimeException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}