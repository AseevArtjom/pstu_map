package com.project.pstu_map.service;

import com.project.pstu_map.dto.node.NodeCreateDto;
import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.node.NodeUpdateDto;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.NodeRepository;
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
public class NodeService {

    private final NodeRepository nodeRepository;
    private final BuildingRepository buildingRepository;

    public List<Node> getNodesByBuildingId(Integer buildingId) {
        return nodeRepository.findByBuildingId(buildingId);
    }

    public Optional<Node> getNodeById(String id) {
        return nodeRepository.findById(id);
    }

    @Transactional
    public Node createNode(NodeCreateDto dto) {
        Node node = new Node();
        node.setId(dto.getId() != null && !dto.getId().isBlank()
                ? dto.getId()
                : UUID.randomUUID().toString());
        node.setFloor(dto.getFloor());
        node.setX(dto.getX());
        node.setY(dto.getY());

        if (dto.getBuildingId() != null) {
            Building building = buildingRepository.findById(dto.getBuildingId())
                    .orElseThrow(() -> new EntityNotFoundException("Здание не найдено: " + dto.getBuildingId()));
            node.setBuilding(building);
        }

        return nodeRepository.save(node);
    }

    @Transactional
    public Node updateNode(String id, NodeUpdateDto dto) {
        Node node = nodeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Узел не найден: " + id));

        if (dto.getFloor() != null) node.setFloor(dto.getFloor());
        if (dto.getX() != null) node.setX(dto.getX());
        if (dto.getY() != null) node.setY(dto.getY());

        if (dto.getBuildingId() != null) {
            Building building = buildingRepository.findById(dto.getBuildingId())
                    .orElseThrow(() -> new EntityNotFoundException("Здание не найдено: " + dto.getBuildingId()));
            node.setBuilding(building);
        }

        return nodeRepository.save(node);
    }

    @Transactional
    public void deleteNode(String id) {
        if (!nodeRepository.existsById(id)) {
            throw new EntityNotFoundException("Узел не найден: " + id);
        }
        nodeRepository.deleteById(id);
    }

    public NodeDto convertToDto(Node node) {
        NodeDto dto = new NodeDto();
        dto.setId(node.getId());
        dto.setFloor(node.getFloor());
        dto.setX(node.getX());
        dto.setY(node.getY());
        if (node.getBuilding() != null) {
            dto.setBuildingId(node.getBuilding().getId());
        }
        return dto;
    }
}