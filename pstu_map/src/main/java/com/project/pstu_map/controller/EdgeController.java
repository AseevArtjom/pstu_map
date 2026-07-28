package com.project.pstu_map.controller;

import com.project.pstu_map.dto.edge.EdgeCreateDto;
import com.project.pstu_map.dto.edge.EdgeDto;
import com.project.pstu_map.dto.edge.EdgeUpdateDto;
import com.project.pstu_map.models.Edge;
import com.project.pstu_map.service.EdgeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edges")
@RequiredArgsConstructor
public class EdgeController {

    private final EdgeService edgeService;

    @GetMapping
    public List<EdgeDto> getEdgesByBuildingId(@RequestParam("buildingId") Integer buildingId) {
        return edgeService.getEdgesByBuildingId(buildingId).stream()
                .map(edgeService::convertToDto)
                .toList();
    }

    @GetMapping("/outdoor")
    public List<EdgeDto> getOutdoorEdges() {
        return edgeService.getOutdoorEdges().stream()
                .map(edgeService::convertToDto)
                .toList();
    }

    @PostMapping
    public ResponseEntity<EdgeDto> createEdge(@RequestBody EdgeCreateDto dto) {
        Edge edge = edgeService.createEdge(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(edgeService.convertToDto(edge));
    }

    @PutMapping("/{id}")
    public EdgeDto updateEdge(@PathVariable Long id, @RequestBody EdgeUpdateDto dto) {
        Edge edge = edgeService.updateEdge(id, dto);
        return edgeService.convertToDto(edge);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEdge(@PathVariable Long id) {
        edgeService.deleteEdge(id);
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