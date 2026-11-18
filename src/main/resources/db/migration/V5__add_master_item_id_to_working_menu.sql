ALTER TABLE working_menu_items ADD COLUMN master_item_id BIGINT;

CREATE INDEX idx_working_menu_items_master_item_id ON working_menu_items(master_item_id);