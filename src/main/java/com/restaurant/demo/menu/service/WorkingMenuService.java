package com.restaurant.demo.menu.service;

import com.restaurant.demo.menu.dto.CurrentMenuItemResponse;
import com.restaurant.demo.menu.dto.OfferRequest;
import com.restaurant.demo.menu.dto.WorkingMenuItemRequest;
import com.restaurant.demo.menu.dto.WorkingMenuItemResponse;
import com.restaurant.demo.menu.entity.MenuItem;
import com.restaurant.demo.menu.entity.WorkingMenuItem;
import com.restaurant.demo.menu.mapper.CurrentMenuItemMapper;
import com.restaurant.demo.menu.mapper.WorkingMenuItemMapper;
import com.restaurant.demo.menu.repository.MenuItemRepository;
import com.restaurant.demo.menu.repository.WorkingMenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WorkingMenuService {

    private final WorkingMenuItemRepository workingMenuItemRepository;
    private final MenuItemRepository menuItemRepository;
    private final WorkingMenuItemMapper workingMenuItemMapper;
    private final CurrentMenuItemMapper currentMenuItemMapper;

    @Transactional(readOnly = true)
    public List<CurrentMenuItemResponse> getCurrentMenu() {
        List<CurrentMenuItemResponse> result = new ArrayList<>();

        if (workingMenuItemRepository.existsByActiveTrue()) {
            List<WorkingMenuItem> workingItems = workingMenuItemRepository.findByActiveTrueOrderByCategoryAscNameAsc();
            result.addAll(workingItems.stream()
                    .map(currentMenuItemMapper::toResponseFromWorking)
                    .toList());
        } else {
            List<MenuItem> masterItems = menuItemRepository.findByActiveTrueOrderByCategoryAscNameAsc();
            result.addAll(masterItems.stream()
                    .map(currentMenuItemMapper::toResponseFromMaster)
                    .toList());
        }

        return result;
    }

    @Transactional
    public WorkingMenuItemResponse addToWorkingMenu(WorkingMenuItemRequest request) {
        MenuItem master = menuItemRepository.findById(getMasterIdByNameAndCategory(request.getName(), request.getCategory()))
                .orElseThrow(() -> new IllegalArgumentException("Master menu item not found: " + request.getName()));

        WorkingMenuItem working = workingMenuItemMapper.toEntityFromMaster(master);
        working.setIsOverride(true);
        WorkingMenuItem saved = workingMenuItemRepository.save(working);
        return workingMenuItemMapper.toResponse(saved);
    }

    @Transactional
    public WorkingMenuItemResponse addCustomToWorkingMenu(WorkingMenuItemRequest request) {
        WorkingMenuItem working = workingMenuItemMapper.toEntityFromRequest(request);
        working.setIsOverride(true);
        WorkingMenuItem saved = workingMenuItemRepository.save(working);
        return workingMenuItemMapper.toResponse(saved);
    }

    @Transactional
    public void removeFromWorkingMenu(Long id) {
        if (!workingMenuItemRepository.existsById(id)) {
            throw new IllegalArgumentException("Working menu item not found: " + id);
        }
        workingMenuItemRepository.deleteById(id);
    }

    @Transactional
    public WorkingMenuItemResponse applyOffer(OfferRequest request) {
        WorkingMenuItem item = workingMenuItemRepository.findById(request.getItemId())
                .orElseThrow(() -> new IllegalArgumentException("Working menu item not found: " + request.getItemId()));
        workingMenuItemMapper.applyOffer(item, request.getOfferPriceFull(), request.getOfferPriceHalf(), request.getOfferLabel());
        WorkingMenuItem saved = workingMenuItemRepository.save(item);
        return workingMenuItemMapper.toResponse(saved);
    }

    @Transactional
    public void resetOffers() {
        List<WorkingMenuItem> items = workingMenuItemRepository.findAll();
        for (WorkingMenuItem item : items) {
            workingMenuItemMapper.clearOffer(item);
        }
        workingMenuItemRepository.saveAll(items);
    }

    @Transactional
    public void resetWorkingMenu() {
        workingMenuItemRepository.deleteAll();
    }

    private Long getMasterIdByNameAndCategory(String name, com.restaurant.demo.menu.entity.MenuCategory category) {
        return menuItemRepository.findAll().stream()
                .filter(m -> m.getName().equals(name) && m.getCategory() == category)
                .map(MenuItem::getId)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Master menu item not found: " + name));
    }
}