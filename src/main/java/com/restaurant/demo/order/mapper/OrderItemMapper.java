package com.restaurant.demo.order.mapper;

import com.restaurant.demo.order.dto.OrderItemResponse;
import com.restaurant.demo.order.entity.OrderItem;
import org.springframework.stereotype.Component;

@Component
public class OrderItemMapper {

    public OrderItemResponse toResponse(OrderItem item) {
        OrderItemResponse response = new OrderItemResponse();
        response.setId(item.getId());
        response.setMenuItemId(item.getMenuItemId());
        response.setName(item.getName());
        response.setCategory(item.getCategory());
        response.setPortion(item.getPortion());
        response.setQuantity(item.getQuantity());
        response.setUnitPrice(item.getUnitPrice());
        response.setTotalPrice(item.getTotalPrice());
        response.setOfferApplied(item.getOfferApplied());
        response.setOfferLabel(item.getOfferLabel());
        return response;
    }
}