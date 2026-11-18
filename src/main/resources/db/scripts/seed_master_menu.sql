-- Sample master menu data: 30 vegetarian dishes and 15 non-vegetarian dishes.
-- Run this script manually against the restaurant database when seed data is needed.

INSERT INTO menu_items (category, subcategory, name, price_full, price_half, active) VALUES
('VEG', 'Starters', 'Paneer Tikka', 240.00, 140.00, TRUE),
('VEG', 'Starters', 'Hara Bhara Kebab', 180.00, 110.00, TRUE),
('VEG', 'Starters', 'Crispy Chilli Potato', 190.00, 120.00, TRUE),
('VEG', 'Starters', 'Tandoori Mushroom', 220.00, 130.00, TRUE),
('VEG', 'Starters', 'Veg Seekh Kebab', 200.00, 120.00, TRUE),

('VEG', 'MainCourse', 'Paneer Butter Masala', 280.00, 170.00, TRUE),
('VEG', 'MainCourse', 'Dal Makhani', 240.00, 150.00, TRUE),
('VEG', 'MainCourse', 'Palak Paneer', 260.00, 160.00, TRUE),
('VEG', 'MainCourse', 'Chana Masala', 210.00, 130.00, TRUE),
('VEG', 'MainCourse', 'Malai Kofta', 270.00, 165.00, TRUE),

('VEG', 'Rice', 'Jeera Rice', 160.00, 100.00, TRUE),
('VEG', 'Rice', 'Peas Pulao', 190.00, 120.00, TRUE),
('VEG', 'Rice', 'Vegetable Fried Rice', 210.00, 130.00, TRUE),
('VEG', 'Rice', 'Curd Rice', 170.00, 105.00, TRUE),
('VEG', 'Rice', 'Lemon Rice', 180.00, 110.00, TRUE),

('VEG', 'Biryani', 'Hyderabadi Veg Biryani', 250.00, 155.00, TRUE),
('VEG', 'Biryani', 'Paneer Biryani', 270.00, 165.00, TRUE),
('VEG', 'Biryani', 'Mushroom Biryani', 260.00, 160.00, TRUE),
('VEG', 'Biryani', 'Dum Aloo Biryani', 240.00, 150.00, TRUE),
('VEG', 'Biryani', 'Soya Chaap Biryani', 265.00, 160.00, TRUE),

('VEG', 'Breads', 'Butter Naan', 60.00, NULL, TRUE),
('VEG', 'Breads', 'Tandoori Roti', 25.00, NULL, TRUE),
('VEG', 'Breads', 'Lachha Paratha', 55.00, NULL, TRUE),
('VEG', 'Breads', 'Missi Roti', 45.00, NULL, TRUE),
('VEG', 'Breads', 'Garlic Naan', 75.00, NULL, TRUE),

('VEG', 'Cold Beverages', 'Sweet Lassi', 90.00, NULL, TRUE),
('VEG', 'Cold Beverages', 'Mango Lassi', 110.00, NULL, TRUE),
('VEG', 'Cold Beverages', 'Masala Chaas', 60.00, NULL, TRUE),
('VEG', 'Cold Beverages', 'Fresh Lime Soda', 70.00, NULL, TRUE),
('VEG', 'Cold Beverages', 'Cold Coffee', 120.00, NULL, TRUE),

('NON_VEG', 'Starters', 'Chicken Tikka', 280.00, 170.00, TRUE),
('NON_VEG', 'Starters', 'Tandoori Chicken', 420.00, 250.00, TRUE),
('NON_VEG', 'Starters', 'Chicken Seekh Kebab', 260.00, 160.00, TRUE),
('NON_VEG', 'Starters', 'Fish Amritsari', 320.00, 195.00, TRUE),
('NON_VEG', 'Starters', 'Mutton Shami Kebab', 340.00, 210.00, TRUE),

('NON_VEG', 'MainCourse', 'Butter Chicken', 340.00, 210.00, TRUE),
('NON_VEG', 'MainCourse', 'Chicken Chettinad', 320.00, 195.00, TRUE),
('NON_VEG', 'MainCourse', 'Mutton Rogan Josh', 390.00, 240.00, TRUE),
('NON_VEG', 'MainCourse', 'Fish Curry', 350.00, 215.00, TRUE),
('NON_VEG', 'MainCourse', 'Egg Curry', 220.00, 135.00, TRUE),

('NON_VEG', 'Biryani', 'Hyderabadi Chicken Biryani', 320.00, 195.00, TRUE),
('NON_VEG', 'Biryani', 'Mutton Dum Biryani', 390.00, 240.00, TRUE),
('NON_VEG', 'Biryani', 'Chicken 65 Biryani', 340.00, 210.00, TRUE),
('NON_VEG', 'Biryani', 'Egg Biryani', 250.00, 155.00, TRUE),
('NON_VEG', 'Biryani', 'Fish Biryani', 360.00, 220.00, TRUE);
