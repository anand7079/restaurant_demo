package com.restaurant.demo.menu.dto;

import com.restaurant.demo.menu.entity.MenuCategory;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MenuItemResponse {

    private Long id;
    private MenuCategory category;
    private String subcategory;
    private String name;
    private BigDecimal priceFull;
    private BigDecimal priceHalf;
    private Boolean active;
    private String createdAt;
}