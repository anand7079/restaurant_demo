package com.restaurant.demo.menu.mapper;

import com.restaurant.demo.menu.dto.CurrentMenuItemResponse;
import com.restaurant.demo.menu.entity.MenuItem;
import com.restaurant.demo.menu.entity.WorkingMenuItem;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class CurrentMenuItemMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public CurrentMenuItemResponse toResponseFromMaster(MenuItem item) {
        CurrentMenuItemResponse response = new CurrentMenuItemResponse();
        response.setId(item.getId());
        response.setCategory(item.getCategory());
        response.setSubcategory(item.getSubcategory());
        response.setName(item.getName());
        response.setPriceFull(item.getPriceFull());
        response.setPriceHalf(item.getPriceHalf());
        response.setOfferPriceFull(null);
        response.setOfferPriceHalf(null);
        response.setOfferLabel(null);
        response.setIsOverride(false);
        response.setActive(item.getActive());
        response.setSource("MASTER");
        return response;
    }

    public CurrentMenuItemResponse toResponseFromWorking(WorkingMenuItem item) {
        CurrentMenuItemResponse response = new CurrentMenuItemResponse();
        response.setId(item.getId());
        response.setCategory(item.getCategory());
        response.setSubcategory(item.getSubcategory());
        response.setName(item.getName());
        response.setPriceFull(item.getPriceFull());
        response.setPriceHalf(item.getPriceHalf());
        response.setOfferPriceFull(item.getOfferPriceFull());
        response.setOfferPriceHalf(item.getOfferPriceHalf());
        response.setOfferLabel(item.getOfferLabel());
        response.setIsOverride(item.getIsOverride());
        response.setActive(item.getActive());
        response.setSource("WORKING");
        return response;
    }
}