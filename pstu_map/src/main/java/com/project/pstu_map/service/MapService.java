package com.project.pstu_map.service;

import com.project.pstu_map.dto.PathResponseDto;
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
public class MapService
{
    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final RoomRepository roomRepository;

    public PathResponseDto calculatePath(String fromRoomId,String toRoomId)
    {
        Room startRoom = roomRepository.findById(fromRoomId)
                .orElseThrow(() -> new IllegalArgumentException("Комната старта не найдена: " +  fromRoomId));
        Room endRoom = roomRepository.findById(toRoomId)
                .orElseThrow(() -> new IllegalArgumentException("Комната финиша не найдена: " + toRoomId));

        Node startNode = startRoom.getNode();
        Node endNode = endRoom.getNode();

        if(startNode.getId().equals(endNode.getId()))
        {
            return new PathResponseDto(List.of(startNode),0.0);
        }

        String buildingId = startNode.getBuilding().getId();
        List<Node> allNodes = nodeRepository.findAll().stream()
                .filter(n -> n.getBuilding().getId().equalsIgnoreCase(buildingId)).toList();
        List<Edge> allEdges = edgeRepository.findAll().stream()
                .filter(e -> e.getFromNode().getBuilding().getId().equalsIgnoreCase(buildingId)).toList();

        Map<String,List<Edge>> adjacencyList = new HashMap<>();
        for (Node node : allNodes)
        {
            adjacencyList.put(node.getId(),new ArrayList<>());
        }
        for (Edge edge : allEdges)
        {
            adjacencyList.get(edge.getFromNode().getId()).add(edge);

            Edge reverseEdge = new Edge();
            reverseEdge.setFromNode(edge.getToNode());
            reverseEdge.setToNode(edge.getFromNode());
            reverseEdge.setWeight(edge.getWeight());
            adjacencyList.get(edge.getToNode().getId()).add(reverseEdge);
        }

        Map<String,Double> distances = new HashMap<>();
        Map<String,String> predecessors = new HashMap<>();
        PriorityQueue<NodeDistance> queue = new PriorityQueue<>(Comparator.comparingDouble(nd -> nd.distance));

        for (Node node : allNodes)
        {
            distances.put(node.getId(),Double.MAX_VALUE);
        }
        distances.put(startNode.getId(),0.0);
        queue.add(new NodeDistance(startNode.getId(),0.0));

        while (!queue.isEmpty()){
            NodeDistance current = queue.poll();

            if (current.distance > distances.get(current.nodeId)) continue;
            if (current.nodeId.equals(endNode.getId())) break;

            for (Edge edge : adjacencyList.get(current.nodeId))
            {
                String neighborId = edge.getToNode().getId();
                double newDist = distances.get(current.nodeId) + edge.getWeight();

                if(newDist < distances.get(neighborId))
                {
                    distances.put(neighborId,newDist);
                    predecessors.put(neighborId, current.nodeId);
                    queue.add(new NodeDistance(neighborId,newDist));
                }
            }
        }

        if (distances.get(endNode.getId()) == Double.MAX_VALUE)
        {
            throw new RuntimeException("Маршрут между указанными аудиториями невозможен");
        }

        LinkedList<Node> path = new LinkedList<>();
        String step = endNode.getId();

        Map<String,Node> nodeMap = new HashMap<>();
        allNodes.forEach(n -> nodeMap.put(n.getId(),n));

        while (step != null)
        {
            path.addFirst(nodeMap.get(step));
            step = predecessors.get(step);
        }

        return new PathResponseDto(path,distances.get(endNode.getId()));
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
