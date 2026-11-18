package com.restaurant.demo.menu.mapper;

import com.restaurant.demo.menu.dto.WorkingMenuItemRequest;
import com.restaurant.demo.menu.dto.WorkingMenuItemResponse;
import com.restaurant.demo.menu.entity.MenuItem;
import com.restaurant.demo.menu.entity.WorkingMenuItem;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class WorkingMenuItemMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    public WorkingMenuItemResponse toResponse(WorkingMenuItem item) {
        WorkingMenuItemResponse response = new WorkingMenuItemResponse();
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
        response.setCreatedAt(item.getCreatedAt() != null ? item.getCreatedAt().format(FORMATTER) : null);
        return response;
    }

    public WorkingMenuItem toEntityFromMaster(MenuItem master) {
        WorkingMenuItem item = new WorkingMenuItem();
        item.setCategory(master.getCategory());
        item.setSubcategory(master.getSubcategory());
        item.setName(master.getName());
        item.setPriceFull(master.getPriceFull());
        item.setPriceHalf(master.getPriceHalf());
        item.setIsOverride(false);
        return item;
    }

    public WorkingMenuItem toEntityFromRequest(WorkingMenuItemRequest request) {
        WorkingMenuItem item = new WorkingMenuItem();
        item.setCategory(request.getCategory());
        item.setSubcategory(request.getSubcategory());
        item.setName(request.getName());
        item.setPriceFull(request.getPriceFull());
        item.setPriceHalf(request.getPriceHalf());
        item.setIsOverride(true);
        return item;
    }

    public void applyOffer(WorkingMenuItem item, java.math.BigDecimal offerPriceFull, java.math.BigDecimal offerPriceHalf, String offerLabel) {
        item.setOfferPriceFull(offerPriceFull);
        item.setOfferPriceHalf(offerPriceHalf);
        item.setOfferLabel(offerLabel);
    }

    public void clearOffer(WorkingMenuItem item) {
        item.setOfferPriceFull(null);
        item.setOfferPriceHalf(null);
        item.setOfferLabel(null);
    }
}