package com.restaurant.demo.menu.repository;

import com.restaurant.demo.menu.entity.MenuCategory;
import com.restaurant.demo.menu.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {

    List<MenuItem> findByActiveTrueOrderByCategoryAscNameAsc();

    List<MenuItem> findByCategoryAndActiveTrueOrderByNameAsc(MenuCategory category);
}