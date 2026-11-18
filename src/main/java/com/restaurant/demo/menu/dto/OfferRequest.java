package com.restaurant.demo.menu.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class OfferRequest {

    @NotNull
    private Long itemId;

    private BigDecimal offerPriceFull;

    private BigDecimal offerPriceHalf;

    private String offerLabel;
}