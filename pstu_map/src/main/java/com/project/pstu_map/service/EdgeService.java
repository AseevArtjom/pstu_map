package com.project.pstu_map.service;

import com.project.pstu_map.dto.edge.EdgeCreateDto;
import com.project.pstu_map.dto.edge.EdgeDto;
import com.project.pstu_map.dto.edge.EdgeUpdateDto;
import com.project.pstu_map.models.Edge;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.repository.EdgeRepository;
import com.project.pstu_map.repository.NodeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class EdgeService {

    private final EdgeRepository edgeRepository;
    private final NodeRepository nodeRepository;

    public List<Edge> getEdgesByBuildingId(Integer buildingId) {
        return edgeRepository.findByFromNodeBuildingId(buildingId);
    }

    @Transactional
    public Edge createEdge(EdgeCreateDto dto) {
        Node fromNode = nodeRepository.findById(dto.getFromNodeId())
                .orElseThrow(() -> new EntityNotFoundException("Узел не найден: " + dto.getFromNodeId()));
        Node toNode = nodeRepository.findById(dto.getToNodeId())
                .orElseThrow(() -> new EntityNotFoundException("Узел не найден: " + dto.getToNodeId()));

        boolean reverseExists = edgeRepository
                .findByFromNodeIdAndToNodeId(dto.getToNodeId(), dto.getFromNodeId())
                .isPresent();

        if (reverseExists) {
            throw new DataIntegrityViolationException(
                    "Связь между этими узлами уже существует (в обратном направлении)");
        }

        Edge edge = new Edge();
        edge.setFromNode(fromNode);
        edge.setToNode(toNode);
        edge.setWeight(dto.getWeight());
        edge.setType(dto.getType());

        return edgeRepository.save(edge);
    }

    @Transactional
    public Edge updateEdge(Long id, EdgeUpdateDto dto) {
        Edge edge = edgeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Ребро не найдено: " + id));

        if (dto.getWeight() != null) edge.setWeight(dto.getWeight());
        if (dto.getType() != null) edge.setType(dto.getType());

        return edgeRepository.save(edge);
    }

    @Transactional
    public void deleteEdge(Long id) {
        if (!edgeRepository.existsById(id)) {
            throw new EntityNotFoundException("Ребро не найдено: " + id);
        }
        edgeRepository.deleteById(id);
    }

    public EdgeDto convertToDto(Edge edge) {
        EdgeDto dto = new EdgeDto();
        dto.setId(edge.getId());
        dto.setFrom(edge.getFromNode().getId());
        dto.setTo(edge.getToNode().getId());
        dto.setWeight(edge.getWeight());
        dto.setType(edge.getType());
        return dto;
    }
}