package com.project.pstu_map.service;

import com.project.pstu_map.dto.PathStepDto;
import com.project.pstu_map.dto.edge.EdgeDto;
import com.project.pstu_map.dto.node.NodeDto;
import com.project.pstu_map.dto.response.BuildingGraphResponseDto;
import com.project.pstu_map.dto.response.PathResponseDto;
import com.project.pstu_map.models.Edge;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.models.Room;
import com.project.pstu_map.repository.EdgeRepository;
import com.project.pstu_map.repository.NodeRepository;
import com.project.pstu_map.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MapService {
    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final RoomRepository roomRepository;

    public BuildingGraphResponseDto getBuildingGraph(Integer buildingId) {
        List<Node> nodes = nodeRepository.findByBuildingId(buildingId);
        List<Edge> edges = edgeRepository.findAllByBuildingIdEitherSide(buildingId);

        List<NodeDto> nodeDtos = nodes.stream().map(this::toNodeDto).toList();
        List<EdgeDto> edgeDtos = edges.stream().map(this::toEdgeDto).toList();

        return new BuildingGraphResponseDto(nodeDtos, edgeDtos);
    }

    private Node resolveTarget(String id, String type) {
        return switch (type.toUpperCase()) {
            case "ROOM" -> roomRepository.findById(id)
                    .map(room -> {
                        if (room.getNode() == null) {
                            throw new IllegalStateException("У комнаты \"" + room.getName() + "\" не привязан узел навигации");
                        }
                        return room.getNode();
                    })
                    .orElseThrow(() -> new IllegalArgumentException("Не найдена комната: " + id));

            case "NODE" -> nodeRepository.findById(id)
                    .orElseThrow(() -> new IllegalArgumentException("Не найден узел навигации: " + id));

            case "BUILDING" -> {
                int buildingId;
                try {
                    buildingId = Integer.parseInt(id);
                } catch (NumberFormatException e) {
                    throw new IllegalArgumentException("ID корпуса должен быть числом, получено: " + id);
                }
                yield nodeRepository.findEntranceNodesByBuilding(buildingId)
                        .stream().findFirst()
                        .orElseThrow(() -> new IllegalArgumentException("У корпуса " + buildingId + " не задан вход (entrance)"));
            }

            default -> throw new IllegalArgumentException("Неизвестный тип точки навигации: " + type + ". Доступны: ROOM, NODE, BUILDING");
        };
    }

    public PathResponseDto calculatePath(String fromId, String fromType, String toId, String toType) {
        Node startNode = resolveTarget(fromId, fromType);
        Node endNode = resolveTarget(toId, toType);

        if (startNode.getId().equals(endNode.getId())) {
            NodeDto onlyNode = toNodeDto(startNode);
            return new PathResponseDto(List.of(onlyNode), List.of(), 0.0);
        }

        List<Node> allNodes = nodeRepository.findAll();
        List<Edge> allEdges = edgeRepository.findAll();

        Map<String, List<Edge>> adjacencyList = new HashMap<>();
        for (Node node : allNodes) {
            adjacencyList.put(node.getId(), new ArrayList<>());
        }
        for (Edge edge : allEdges) {
            adjacencyList.get(edge.getFromNode().getId()).add(edge);

            Edge reverseEdge = new Edge();
            reverseEdge.setFromNode(edge.getToNode());
            reverseEdge.setToNode(edge.getFromNode());
            reverseEdge.setWeight(edge.getWeight());
            reverseEdge.setType(edge.getType());
            adjacencyList.get(edge.getToNode().getId()).add(reverseEdge);
        }

        Map<String, Double> distances = new HashMap<>();
        Map<String, Edge> predecessorEdges = new HashMap<>();
        PriorityQueue<NodeDistance> queue = new PriorityQueue<>(Comparator.comparingDouble(nd -> nd.distance));

        for (Node node : allNodes) {
            distances.put(node.getId(), Double.MAX_VALUE);
        }
        distances.put(startNode.getId(), 0.0);
        queue.add(new NodeDistance(startNode.getId(), 0.0));

        while (!queue.isEmpty()) {
            NodeDistance current = queue.poll();

            if (current.distance > distances.get(current.nodeId)) continue;
            if (current.nodeId.equals(endNode.getId())) break;

            List<Edge> edges = adjacencyList.get(current.nodeId);
            if (edges == null) continue;

            for (Edge edge : edges) {
                String neighborId = edge.getToNode().getId();
                double newDist = distances.get(current.nodeId) + edge.getWeight();

                if (newDist < distances.get(neighborId)) {
                    distances.put(neighborId, newDist);
                    predecessorEdges.put(neighborId, edge);
                    queue.add(new NodeDistance(neighborId, newDist));
                }
            }
        }

        if (distances.get(endNode.getId()) == Double.MAX_VALUE) {
            throw new RuntimeException("Маршрут между указанными аудиториями невозможен");
        }

        LinkedList<Node> pathNodes = new LinkedList<>();
        LinkedList<PathStepDto> steps = new LinkedList<>();

        String step = endNode.getId();
        Map<String, Node> nodeMap = new HashMap<>();
        allNodes.forEach(n -> nodeMap.put(n.getId(), n));

        pathNodes.addFirst(nodeMap.get(step));

        while (predecessorEdges.containsKey(step)) {
            Edge edge = predecessorEdges.get(step);
            Node fromNode = edge.getFromNode();

            steps.addFirst(new PathStepDto(
                    fromNode.getId(),
                    edge.getToNode().getId(),
                    fromNode.getFloor(),
                    edge.getToNode().getFloor(),
                    edge.getType(),
                    edge.getWeight()
            ));

            pathNodes.addFirst(nodeMap.get(fromNode.getId()));
            step = fromNode.getId();
        }

        List<NodeDto> nodeDtos = pathNodes.stream().map(this::toNodeDto).toList();

        return new PathResponseDto(nodeDtos, steps, distances.get(endNode.getId()));
    }

    private NodeDto toNodeDto(Node node) {
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

    private EdgeDto toEdgeDto(Edge edge) {
        EdgeDto dto = new EdgeDto();
        dto.setId(edge.getId());
        dto.setFrom(edge.getFromNode().getId());
        dto.setTo(edge.getToNode().getId());
        dto.setWeight(edge.getWeight());
        dto.setType(edge.getType());
        return dto;
    }

    private static class NodeDistance {
        String nodeId;
        double distance;

        NodeDistance(String nodeId, double distance) {
            this.nodeId = nodeId;
            this.distance = distance;
        }
    }
}