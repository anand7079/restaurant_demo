package com.restaurant.demo.menu.dto;

import com.restaurant.demo.menu.entity.MenuCategory;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WorkingMenuItemResponse {

    private Long id;
    private MenuCategory category;
    private String subcategory;
    private String name;
    private BigDecimal priceFull;
    private BigDecimal priceHalf;
    private BigDecimal offerPriceFull;
    private BigDecimal offerPriceHalf;
    private String offerLabel;
    private Boolean isOverride;
    private Boolean active;
    private String createdAt;
}