package com.restaurant.demo.order.mapper;

import com.restaurant.demo.order.dto.OrderItemResponse;
import com.restaurant.demo.order.dto.OrderResponse;
import com.restaurant.demo.order.entity.Order;
import com.restaurant.demo.order.entity.OrderItem;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
public class OrderMapper {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private final OrderItemMapper orderItemMapper;

    public OrderMapper(OrderItemMapper orderItemMapper) {
        this.orderItemMapper = orderItemMapper;
    }

    public OrderResponse toResponse(Order order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setCustomerName(order.getCustomerName());
        response.setCustomerPhone(order.getCustomerPhone());
        response.setStatus(order.getStatus());
        response.setTotalAmount(order.getTotalAmount());
        response.setCreatedAt(order.getCreatedAt() != null ? order.getCreatedAt().format(FORMATTER) : null);
        response.setUpdatedAt(order.getUpdatedAt() != null ? order.getUpdatedAt().format(FORMATTER) : null);
        if (order.getItems() != null) {
            response.setItems(order.getItems().stream().map(orderItemMapper::toResponse).toList());
        }
        return response;
    }
}