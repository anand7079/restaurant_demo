package com.restaurant.demo.menu.controller;

import com.restaurant.demo.menu.dto.MenuItemRequest;
import com.restaurant.demo.menu.dto.MenuItemResponse;
import com.restaurant.demo.menu.service.MasterMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu/master")
@RequiredArgsConstructor
public class MasterMenuController {

    private final MasterMenuService masterMenuService;

    @GetMapping
    public Page<MenuItemResponse> list(Pageable pageable) {
        return masterMenuService.list(pageable);
    }

    @GetMapping("/all")
    public List<MenuItemResponse> listAll() {
        return masterMenuService.listAllActive();
    }

    @PostMapping
    public ResponseEntity<MenuItemResponse> create(@Valid @RequestBody MenuItemRequest request) {
        MenuItemResponse response = masterMenuService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public MenuItemResponse update(@PathVariable Long id, @Valid @RequestBody MenuItemRequest request) {
        return masterMenuService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        masterMenuService.delete(id);
        return ResponseEntity.noContent().build();
    }
}