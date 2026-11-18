package com.restaurant.demo.menu.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "working_menu_items")
@Getter
@Setter
@NoArgsConstructor
public class WorkingMenuItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 20)
    private MenuCategory category;

    @Column(name = "subcategory", length = 100)
    private String subcategory;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "price_full", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceFull;

    @Column(name = "price_half", precision = 10, scale = 2)
    private BigDecimal priceHalf;

    @Column(name = "offer_price_full", precision = 10, scale = 2)
    private BigDecimal offerPriceFull;

    @Column(name = "offer_price_half", precision = 10, scale = 2)
    private BigDecimal offerPriceHalf;

    @Column(name = "offer_label", length = 100)
    private String offerLabel;

    @Column(name = "is_override", nullable = false)
    private Boolean isOverride = false;

    @Column(name = "active", nullable = false)
    private Boolean active = true;

    @Column(
            name = "created_at",
            nullable = false,
            insertable = false,
            updatable = false
    )
    private LocalDateTime createdAt;
}