package com.restaurant.demo.order.dto;

import com.restaurant.demo.order.entity.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StatusUpdateRequest {

    @NotNull
    private OrderStatus status;
}