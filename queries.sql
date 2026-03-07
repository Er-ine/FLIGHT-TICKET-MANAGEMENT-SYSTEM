-- =====================================
-- FLIGHT TICKET MANAGEMENT SYSTEM - QUERIES.SQL
-- =====================================
-- 1. List all flights with seat info
SELECT f.flight_number, f.departure_city, f.arrival_city, f.departure_time, f.arrival_time, f.status,
       s.class_name, s.seats_available, s.price
FROM flights f
JOIN seat_classes s ON f.flight_id = s.flight_id;

-- 2. Search flights by departure and arrival city
SELECT f.flight_number, f.departure_city, f.arrival_city, f.departure_time, f.arrival_time, f.status
FROM flights f
WHERE f.departure_city = 'Kochi' AND f.arrival_city = 'Mumbai';

-- 3. Bookings requiring elder assistance
SELECT b.booking_id, u.name AS passenger_name, f.flight_number, s.class_name, b.status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN flights f ON b.flight_id = f.flight_id
JOIN seat_classes s ON b.seat_class_id = s.seat_class_id
WHERE b.elder_assistance = TRUE;

-- 4. All bookings of a user
SELECT b.booking_id, f.flight_number, f.departure_city, f.arrival_city, s.class_name, b.status, b.elder_assistance
FROM bookings b
JOIN flights f ON b.flight_id = f.flight_id
JOIN seat_classes s ON b.seat_class_id = s.seat_class_id
WHERE b.user_id = 1
ORDER BY b.booking_time DESC;

-- 5. All bookings for a specific flight
SELECT b.booking_id, u.name AS passenger_name, s.class_name, b.status, b.elder_assistance
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN seat_classes s ON b.seat_class_id = s.seat_class_id
WHERE b.flight_id = 1;

-- 6. Seats booked per class for a flight
SELECT s.class_name, COUNT(b.booking_id) AS seats_booked
FROM bookings b
JOIN seat_classes s ON b.seat_class_id = s.seat_class_id
WHERE b.flight_id = 1 AND b.status = 'booked'
GROUP BY s.class_name;

-- 7. Update elder assistance for a booking
UPDATE bookings
SET elder_assistance = TRUE
WHERE booking_id = 3;

-- 8. Cancel a booking
UPDATE bookings
SET status = 'cancelled'
WHERE booking_id = 2;

-- 9. Flight status update
UPDATE flights
SET status = 'boarding'
WHERE flight_number = 'AI101';

-- 10. Check seats availability for a flight
SELECT s.class_name, s.seats_available
FROM seat_classes s
WHERE s.flight_id = 1;

-- 12. Payments pending
SELECT p.payment_id, u.name, b.booking_id, p.amount, p.status
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN users u ON b.user_id = u.user_id
WHERE p.status = 'pending';

-- 13. Payments completed
SELECT p.payment_id, u.name, b.booking_id, p.amount, p.payment_method, p.status
FROM payments p
JOIN bookings b ON p.booking_id = b.booking_id
JOIN users u ON b.user_id = u.user_id
WHERE p.status = 'completed';

-- 15. Flights that are delayed
SELECT flight_number, departure_city, arrival_city, departure_time, arrival_time, status
FROM flights
WHERE status = 'delayed';

-- 16. Flights boarding soon (next 2 hours)
SELECT flight_number, departure_city, arrival_city, departure_time, status
FROM flights
WHERE status = 'boarding' AND departure_time BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 2 HOUR);

-- 18. Count of passengers requiring elder assistance per flight
SELECT f.flight_number, COUNT(b.booking_id) AS elder_passengers
FROM bookings b
JOIN flights f ON b.flight_id = f.flight_id
WHERE b.elder_assistance = TRUE
GROUP BY f.flight_number;

-- 19. Available seats after elder assistance bookings
SELECT f.flight_number, s.class_name, s.seats_available - COUNT(b.booking_id) AS seats_remaining
FROM seat_classes s
JOIN flights f ON s.flight_id = f.flight_id
LEFT JOIN bookings b ON s.seat_class_id = b.seat_class_id AND b.elder_assistance = TRUE AND b.status = 'booked'
GROUP BY f.flight_number, s.class_name;

-- 20. Search flights by date and city
SELECT f.flight_number, f.departure_city, f.arrival_city, f.departure_time, f.arrival_time, f.status
FROM flights f
WHERE DATE(f.departure_time) = '2026-03-15' 
  AND f.departure_city = 'Kochi' 
  AND f.arrival_city = 'Mumbai';

-- 21. Update booking status to completed after flight departure
UPDATE bookings b
JOIN flights f ON b.flight_id = f.flight_id
SET b.status = 'completed'
WHERE f.status = 'departed' AND b.status = 'booked';

-- 23. All completed bookings with payment info
SELECT b.booking_id, u.name, f.flight_number, s.class_name, p.amount, p.status
FROM bookings b
JOIN users u ON b.user_id = u.user_id
JOIN flights f ON b.flight_id = f.flight_id
JOIN seat_classes s ON b.seat_class_id = s.seat_class_id
JOIN payments p ON b.booking_id = p.booking_id
WHERE b.status = 'completed';

-- 24. Flights with available seats for a class
SELECT f.flight_number, s.class_name, s.seats_available
FROM flights f
JOIN seat_classes s ON f.flight_id = s.flight_id
WHERE s.class_name = 'Business' AND s.seats_available > 0;