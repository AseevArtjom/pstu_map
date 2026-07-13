package com.project.pstu_map.service;

import com.project.pstu_map.dto.roomType.RoomTypeCreateDto;
import com.project.pstu_map.dto.roomType.RoomTypeResponseDto;
import com.project.pstu_map.dto.roomType.RoomTypeUpdateDto;
import com.project.pstu_map.models.RoomType;
import com.project.pstu_map.models.UploadedIcon;
import com.project.pstu_map.repository.RoomTypeRepository;
import com.project.pstu_map.repository.UploadedIconRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class RoomTypeService {

    private final RoomTypeRepository roomTypeRepository;
    private final UploadedIconRepository uploadedIconRepository;

    public List<RoomType> getAllRoomTypes() {
        return roomTypeRepository.findAll();
    }

    public Optional<RoomType> getRoomTypeById(Integer id) {
        return roomTypeRepository.findById(id);
    }

    @Transactional
    public RoomType createRoomType(RoomTypeCreateDto dto) {
        if (roomTypeRepository.findBySlug(dto.getSlug()).isPresent()) {
            throw new DataIntegrityViolationException("Тип комнаты с таким slug уже существует: " + dto.getSlug());
        }

        RoomType roomType = new RoomType();
        roomType.setSlug(dto.getSlug());
        roomType.setName(dto.getName());
        roomType.setDefaultColor(dto.getDefaultColor());

        if (dto.getDefaultIconId() != null) {
            UploadedIcon icon = uploadedIconRepository.findById(dto.getDefaultIconId())
                    .orElseThrow(() -> new EntityNotFoundException("Иконка не найдена: " + dto.getDefaultIconId()));
            roomType.setDefaultIcon(icon);
        }

        return roomTypeRepository.save(roomType);
    }

    @Transactional
    public RoomType updateRoomType(Integer id, RoomTypeUpdateDto dto) {
        RoomType roomType = roomTypeRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Тип комнаты не найден: " + id));

        if (dto.getSlug() != null && !dto.getSlug().equals(roomType.getSlug())
                && roomTypeRepository.findBySlug(dto.getSlug()).isPresent()) {
            throw new DataIntegrityViolationException("Тип комнаты с таким slug уже существует: " + dto.getSlug());
        }

        roomType.setSlug(dto.getSlug());
        roomType.setName(dto.getName());
        roomType.setDefaultColor(dto.getDefaultColor());

        if (dto.getDefaultIconId() != null) {
            UploadedIcon icon = uploadedIconRepository.findById(dto.getDefaultIconId())
                    .orElseThrow(() -> new EntityNotFoundException("Иконка не найдена: " + dto.getDefaultIconId()));
            roomType.setDefaultIcon(icon);
        } else {
            roomType.setDefaultIcon(null);
        }

        return roomTypeRepository.save(roomType);
    }

    @Transactional
    public void deleteRoomType(Integer id) {
        if (!roomTypeRepository.existsById(id)) {
            throw new EntityNotFoundException("Тип комнаты не найден: " + id);
        }
        roomTypeRepository.deleteById(id);
    }

    public RoomTypeResponseDto convertToResponseDto(RoomType roomType) {
        RoomTypeResponseDto dto = new RoomTypeResponseDto();
        dto.setId(roomType.getId());
        dto.setSlug(roomType.getSlug());
        dto.setName(roomType.getName());
        dto.setDefaultColor(roomType.getDefaultColor());

        if (roomType.getDefaultIcon() != null) {
            dto.setDefaultIconPath(roomType.getDefaultIcon().getFilePath());
        }

        return dto;
    }
}