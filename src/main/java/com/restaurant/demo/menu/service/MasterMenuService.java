package com.restaurant.demo.menu.service;

import com.restaurant.demo.menu.dto.MenuItemRequest;
import com.restaurant.demo.menu.dto.MenuItemResponse;
import com.restaurant.demo.menu.entity.MenuItem;
import com.restaurant.demo.menu.mapper.MenuItemMapper;
import com.restaurant.demo.menu.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MasterMenuService {

    private final MenuItemRepository menuItemRepository;
    private final MenuItemMapper menuItemMapper;

    @Transactional(readOnly = true)
    public Page<MenuItemResponse> list(Pageable pageable) {
        return menuItemRepository.findAll(pageable).map(menuItemMapper::toResponse);
    }

    @Transactional(readOnly = true)
    public List<MenuItemResponse> listAllActive() {
        return menuItemRepository.findByActiveTrueOrderByCategoryAscNameAsc()
                .stream()
                .map(menuItemMapper::toResponse)
                .toList();
    }

    @Transactional
    public MenuItemResponse create(MenuItemRequest request) {
        MenuItem item = menuItemMapper.toEntity(request);
        MenuItem saved = menuItemRepository.save(item);
        return menuItemMapper.toResponse(saved);
    }

    @Transactional
    public MenuItemResponse update(Long id, MenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Menu item not found: " + id));
        menuItemMapper.updateEntity(item, request);
        MenuItem saved = menuItemRepository.save(item);
        return menuItemMapper.toResponse(saved);
    }

    @Transactional
    public void delete(Long id) {
        if (!menuItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Menu item not found: " + id);
        }
        menuItemRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<MenuItem> findById(Long id) {
        return menuItemRepository.findById(id);
    }
}