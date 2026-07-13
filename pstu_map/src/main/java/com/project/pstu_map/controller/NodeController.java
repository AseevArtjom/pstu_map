package com.project.pstu_map.controller;

import com.project.pstu_map.dto.node.NodeCreateDto;
import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.node.NodeUpdateDto;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.service.NodeService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nodes")
@RequiredArgsConstructor
public class NodeController {

    private final NodeService nodeService;

    @GetMapping
    public List<NodeDto> getNodesByBuildingId(@RequestParam("buildingId") Integer buildingId) {
        return nodeService.getNodesByBuildingId(buildingId).stream()
                .map(nodeService::convertToDto)
                .toList();
    }

    @GetMapping("/{id}")
    public ResponseEntity<NodeDto> getNodeById(@PathVariable String id) {
        return nodeService.getNodeById(id)
                .map(nodeService::convertToDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<NodeDto> createNode(@RequestBody NodeCreateDto dto) {
        Node node = nodeService.createNode(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(nodeService.convertToDto(node));
    }

    @PutMapping("/{id}")
    public NodeDto updateNode(@PathVariable String id, @RequestBody NodeUpdateDto dto) {
        Node node = nodeService.updateNode(id, dto);
        return nodeService.convertToDto(node);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNode(@PathVariable String id) {
        nodeService.deleteNode(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }
}