package com.restaurant.demo.order.dto;

import com.restaurant.demo.menu.entity.MenuCategory;
import com.restaurant.demo.order.entity.Portion;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OrderItemResponse {

    private Long id;
    private Long menuItemId;
    private String name;
    private MenuCategory category;
    private Portion portion;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal totalPrice;
    private Boolean offerApplied;
    private String offerLabel;
}