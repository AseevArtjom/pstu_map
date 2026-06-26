package com.project.pstu_map.controller;

import com.project.pstu_map.dto.PathResponseDto;
import com.project.pstu_map.service.MapService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MapController
{
    private final MapService mapService;

    @GetMapping("/path")
    public PathResponseDto findPath (@RequestParam String fromId,@RequestParam String toId)
    {
        return mapService.calculatePath(fromId,toId);
    }
}
