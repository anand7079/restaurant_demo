ALTER TABLE orders DROP CONSTRAINT orders_status_check;

ALTER TABLE orders
    ADD CONSTRAINT orders_status_check
    CHECK (status IN (
        'IN_QUEUE',
        'ACCEPTED',
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'PREPARED',
        'READY',
        'SERVED',
        'DELIVERED',
        'CANCELLED'
    ));
