package com.restaurant.demo.menu.controller;

import com.restaurant.demo.menu.dto.CurrentMenuItemResponse;
import com.restaurant.demo.menu.dto.OfferRequest;
import com.restaurant.demo.menu.dto.WorkingMenuItemRequest;
import com.restaurant.demo.menu.dto.WorkingMenuItemResponse;
import com.restaurant.demo.menu.service.WorkingMenuService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/menu/current")
@RequiredArgsConstructor
public class MenuController {

    private final WorkingMenuService workingMenuService;

    @GetMapping
    public List<CurrentMenuItemResponse> getCurrentMenu() {
        return workingMenuService.getCurrentMenu();
    }

    @PostMapping("/working")
    public ResponseEntity<WorkingMenuItemResponse> addToWorkingMenu(@Valid @RequestBody WorkingMenuItemRequest request) {
        WorkingMenuItemResponse response = workingMenuService.addCustomToWorkingMenu(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/working/{id}")
    public ResponseEntity<Void> removeFromWorkingMenu(@PathVariable Long id) {
        workingMenuService.removeFromWorkingMenu(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/offers")
    public WorkingMenuItemResponse applyOffer(@Valid @RequestBody OfferRequest request) {
        return workingMenuService.applyOffer(request);
    }

    @PostMapping("/offers/master/{masterItemId}")
    public WorkingMenuItemResponse applyOfferToMaster(@PathVariable Long masterItemId, @Valid @RequestBody OfferRequest request) {
        return workingMenuService.applyOfferToMaster(masterItemId, request);
    }

    @DeleteMapping("/offers")
    public ResponseEntity<Void> resetOffers() {
        workingMenuService.resetOffers();
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/reset")
    public ResponseEntity<Void> resetWorkingMenu() {
        workingMenuService.resetWorkingMenu();
        return ResponseEntity.noContent().build();
    }
}