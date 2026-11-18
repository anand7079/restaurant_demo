package com.restaurant.demo.menu.dto;

import com.restaurant.demo.menu.entity.MenuCategory;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class WorkingMenuItemRequest {

    @NotNull
    private MenuCategory category;

    private String subcategory;

    @NotNull
    private String name;

    @NotNull
    private BigDecimal priceFull;

    private BigDecimal priceHalf;
}