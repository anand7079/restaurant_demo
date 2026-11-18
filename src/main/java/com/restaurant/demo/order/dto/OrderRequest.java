package com.restaurant.demo.order.dto;

import com.restaurant.demo.order.entity.Portion;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
public class OrderRequest {

    private String customerName;

    private String customerPhone;

    @NotNull
    @Size(min = 1)
    private List<OrderItemRequest> items;

    @Getter
    @Setter
    public static class OrderItemRequest {

        @NotNull
        private Long menuItemId;

        @NotNull
        private Portion portion;

        @NotNull
        private Integer quantity;

        private Boolean useOffer = false;
    }
}