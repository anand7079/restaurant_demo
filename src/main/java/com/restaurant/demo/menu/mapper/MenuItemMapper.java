package com.restaurant.demo.menu.mapper;

import com.restaurant.demo.menu.dto.MenuItemRequest;
import com.restaurant.demo.menu.dto.MenuItemResponse;
import com.restaurant.demo.menu.entity.MenuItem;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class MenuItemMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public MenuItemResponse toResponse(MenuItem item) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(item.getId());
        response.setCategory(item.getCategory());
        response.setSubcategory(item.getSubcategory());
        response.setName(item.getName());
        response.setPriceFull(item.getPriceFull());
        response.setPriceHalf(item.getPriceHalf());
        response.setActive(item.getActive());
        response.setCreatedAt(item.getCreatedAt() != null ? item.getCreatedAt().format(FORMATTER) : null);
        return response;
    }

    public MenuItem toEntity(MenuItemRequest request) {
        MenuItem item = new MenuItem();
        item.setCategory(request.getCategory());
        item.setSubcategory(request.getSubcategory());
        item.setName(request.getName());
        item.setPriceFull(request.getPriceFull());
        item.setPriceHalf(request.getPriceHalf());
        item.setActive(request.getActive());
        return item;
    }

    public void updateEntity(MenuItem item, MenuItemRequest request) {
        item.setCategory(request.getCategory());
        item.setSubcategory(request.getSubcategory());
        item.setName(request.getName());
        item.setPriceFull(request.getPriceFull());
        item.setPriceHalf(request.getPriceHalf());
        item.setActive(request.getActive());
    }
}