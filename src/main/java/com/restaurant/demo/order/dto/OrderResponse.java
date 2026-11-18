package com.restaurant.demo.order.dto;

import com.restaurant.demo.menu.entity.MenuCategory;
import com.restaurant.demo.order.entity.OrderStatus;
import com.restaurant.demo.order.entity.Portion;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrderResponse {

    private Long id;
    private String customerName;
    private String customerPhone;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String createdAt;
    private String updatedAt;
    private List<OrderItemResponse> items;
}