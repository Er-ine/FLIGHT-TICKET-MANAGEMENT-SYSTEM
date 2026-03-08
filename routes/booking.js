const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/booking', async (req, res) => {
  const { agent_id, flight_id, booking_date, passenger_id, seat_id, meal_preference, wheelchair_required, special_assistance, infant_bassinet_required } = req.body;

  try {
    const [seats] = await db.query(
      `SELECT * FROM SEAT WHERE SEAT_ID = ? AND AVAILABILITY = 1`,
      [seat_id]
    );

    if (!seats.length) {
      return res.status(400).json({ success: false, message: 'Seat not available' });
    }

    const [booking] = await db.query(
      `INSERT INTO BOOKINGS (AGENT_ID, FLIGHT_ID, BOOKING_DATE, STATUS_)
       VALUES (?, ?, ?, 'CONFIRMED')`,
      [agent_id, flight_id, booking_date]
    );

    await db.query(
      `INSERT INTO Booking_Passenger
       (BOOKING_ID, PASSENGER_ID, SEAT_ID, MEAL_PREFERENCE, WHEELCHAIR_REQUIRED, SPECIAL_ASSISTANCE, INFANT_BASSINET_REQUIRED)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [booking.insertId, passenger_id, seat_id, meal_preference, wheelchair_required, special_assistance, infant_bassinet_required]
    );

    await db.query(
      `UPDATE SEAT SET AVAILABILITY = 0 WHERE SEAT_ID = ?`,
      [seat_id]
    );

    res.json({ success: true, booking_id: booking.insertId, message: 'Booking successful' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.put('/cancel-booking', async (req, res) => {
  const { booking_id } = req.body;

  try {
    const [bookings] = await db.query(
      `SELECT * FROM BOOKINGS WHERE BOOKING_ID = ?`,
      [booking_id]
    );

    if (!bookings.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (bookings[0].STATUS_ === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Already cancelled' });
    }

    await db.query(
      `UPDATE BOOKINGS SET STATUS_ = 'CANCELLED' WHERE BOOKING_ID = ?`,
      [booking_id]
    );

    await db.query(`
      UPDATE SEAT SET AVAILABILITY = 1
      WHERE SEAT_ID IN (
        SELECT SEAT_ID FROM Booking_Passenger WHERE BOOKING_ID = ?
      )`, [booking_id]
    );

    await db.query(
      `UPDATE PAYMENT SET PAYMENT_STATUS = 'REFUNDED' WHERE BOOKING_ID = ?`,
      [booking_id]
    );

    res.json({ success: true, message: 'Booking cancelled and payment refunded' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/booking-details/:booking_id', async (req, res) => {
  const { booking_id } = req.params;

  try {
    const [result] = await db.query(`
      SELECT B.BOOKING_ID, B.STATUS_, B.BOOKING_DATE,
             F.AIRLINE_NAME, F.ORIGIN, F.DESTINATION,
             F.DEPARTURE_TIME, F.ARRIVAL_TIME,
             P.NAME, P.AGE, P.GENDER,
             S.SEAT_NUMBER, S.CLASS, S.PRICE,
             BP.MEAL_PREFERENCE, BP.WHEELCHAIR_REQUIRED,
             BP.SPECIAL_ASSISTANCE, BP.INFANT_BASSINET_REQUIRED,
             PAY.AMOUNT, PAY.PAYMENT_METHOD, PAY.PAYMENT_STATUS
      FROM BOOKINGS B
      JOIN FLIGHT F ON B.FLIGHT_ID = F.FLIGHT_ID
      JOIN Booking_Passenger BP ON B.BOOKING_ID = BP.BOOKING_ID
      JOIN PASSENGER P ON BP.PASSENGER_ID = P.PASSENGER_ID
      JOIN SEAT S ON BP.SEAT_ID = S.SEAT_ID
      LEFT JOIN PAYMENT PAY ON B.BOOKING_ID = PAY.BOOKING_ID
      WHERE B.BOOKING_ID = ?
    `, [booking_id]);

    if (!result.length) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;