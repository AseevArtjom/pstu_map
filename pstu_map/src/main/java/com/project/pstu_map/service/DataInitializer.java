package com.project.pstu_map.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.project.pstu_map.dto.*;
import com.project.pstu_map.models.Building;
import com.project.pstu_map.models.Edge;
import com.project.pstu_map.models.Node;
import com.project.pstu_map.models.Room;
import com.project.pstu_map.repository.BuildingRepository;
import com.project.pstu_map.repository.EdgeRepository;
import com.project.pstu_map.repository.NodeRepository;
import com.project.pstu_map.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final BuildingRepository buildingRepository;
    private final NodeRepository nodeRepository;
    private final EdgeRepository edgeRepository;
    private final RoomRepository roomRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional
    public void run(String... args) throws Exception{
        if (nodeRepository.count() > 0)
        {
            System.out.println("База данных уже содержит данные. Пропуск инициализации");
            return;
        }

        System.out.println("Начало загрузки данных из nav_data.json в базу данных...");

        PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        Resource[] resources = resolver.getResources("classpath:navigation/*.json");

        if(resources.length == 0)
        {
            System.out.println("Файлы разметки .json в папке resources/navigation/ не найдены!");
            return;
        }

        for (Resource resource : resources)
        {
            String filename = resource.getFilename();
            if(filename == null) continue;

            String nameWithoutExtension = filename.substring(0,filename.lastIndexOf('.'));

            String buildingId;
            if (nameWithoutExtension.contains("_"))
            {
                buildingId = nameWithoutExtension.substring(nameWithoutExtension.indexOf('_') + 1).toLowerCase();
            }
            else {
                buildingId = nameWithoutExtension.toLowerCase();
            }

            System.out.println("Найдена разметка здания. Парсинг файла : " + filename + " -> ID корпуса : " + buildingId);

            try (InputStream inputStream = resource.getInputStream()){
                NavDataDto dataDto = objectMapper.readValue(inputStream, NavDataDto.class);

                MetaDto buildingMeta = dataDto.getMeta();
                Building building = new Building();
                building.setId(buildingId);
                building.setName(buildingMeta.getBuilding());
                building.setLengthM(buildingMeta.getBuilding_length_m());
                building.setDepthM(buildingMeta.getBuilding_depth_m());
                buildingRepository.save(building);

                for(NodeDto nodeDto : dataDto.getNodes())
                {
                    Node node = new Node();
                    node.setId(nodeDto.getId());
                    node.setBuilding(building);
                    node.setX(nodeDto.getX());
                    node.setY(nodeDto.getY());
                    node.setFloor(nodeDto.getFloor());
                    nodeRepository.save(node);
                }

                for (RoomDto roomDto : dataDto.getRooms())
                {
                    Room room = new Room();
                    room.setId(roomDto.getId());
                    room.setName(roomDto.getName());
                    room.setFloor(roomDto.getFloor());
                    room.setType(roomDto.getType());
                    room.setQrCode(roomDto.getQr());

                    Node node = nodeRepository.findById(roomDto.getNode())
                            .orElseThrow(() -> new RuntimeException("Узел не найден: " + roomDto.getNode() + " в файле" + filename));
                    room.setNode(node);

                    roomRepository.save(room);
                }

                for (EdgeDto edgeDto : dataDto.getEdges())
                {
                    Edge edge = new Edge();
                    edge.setWeight(edgeDto.getWeight());
                    edge.setType(edgeDto.getType());

                    Node fromNode = nodeRepository.findById(edgeDto.getFrom())
                            .orElseThrow(() -> new RuntimeException("Узел 'from' не найден: " + edgeDto.getFrom() + " в файле " + filename));
                    Node toNode = nodeRepository.findById(edgeDto.getTo())
                            .orElseThrow(() -> new RuntimeException("Узел 'to' не найден: " + edgeDto.getTo() + " в файле " + filename));

                    edge.setFromNode(fromNode);
                    edge.setToNode(toNode);

                    edgeRepository.save(edge);

                    System.out.println("Здание '" + building.getName() + "' (ID: " + buildingId + ") успешно загружено!");
                }
            } catch (Exception e)
            {
                System.err.println("Ошибка при обработке файла " + filename + ": " + e.getMessage());
                throw e;
            }

        }

        System.out.println("Инициализация всех зданий успешно завершена!");
        System.out.println("Всего корпусов в БД: " + buildingRepository.count());
        System.out.println("Всего узлов графа в БД: " + nodeRepository.count());
        System.out.println("Всего комнат в БД: " + roomRepository.count());
        System.out.println("Всего связей графа в БД: " + edgeRepository.count());
    }
}
