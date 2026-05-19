import { test, expect } from '../../fixtures/api-fixtures';

test.describe('API: Booking Management - GET', () => {
  test.describe('GET /booking - List Bookings', () => {
    test('should return list of booking IDs', async ({ apiContext }) => {
      const response = await apiContext.get('/booking');

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
      expect(body.length).toBeGreaterThan(0);
      expect(body[0]).toHaveProperty('bookingid');
      expect(typeof body[0].bookingid).toBe('number');
    });

    test('should filter bookings by firstname', async ({ apiContext }) => {
      const response = await apiContext.get('/booking', {
        params: { firstname: 'Sally' },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should filter bookings by lastname', async ({ apiContext }) => {
      const response = await apiContext.get('/booking', {
        params: { lastname: 'Brown' },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });

    test('should filter bookings by checkin/checkout dates', async ({ apiContext }) => {
      const response = await apiContext.get('/booking', {
        params: {
          checkin: '2020-01-01',
          checkout: '2025-12-31',
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(Array.isArray(body)).toBe(true);
    });
  });

  test.describe('GET /booking/:id - Get Booking by ID', () => {
    test('should return booking details for valid ID', async ({ apiContext }) => {
      // First get a valid booking ID
      const listResponse = await apiContext.get('/booking');
      const bookings = await listResponse.json();
      const bookingId = bookings[0].bookingid;

      const response = await apiContext.get(`/booking/${bookingId}`);

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Schema validation
      expect(body).toHaveProperty('firstname');
      expect(body).toHaveProperty('lastname');
      expect(body).toHaveProperty('totalprice');
      expect(body).toHaveProperty('depositpaid');
      expect(body).toHaveProperty('bookingdates');
      expect(body.bookingdates).toHaveProperty('checkin');
      expect(body.bookingdates).toHaveProperty('checkout');

      // Type validation
      expect(typeof body.firstname).toBe('string');
      expect(typeof body.lastname).toBe('string');
      expect(typeof body.totalprice).toBe('number');
      expect(typeof body.depositpaid).toBe('boolean');
    });

    test('should return 404 for non-existent booking ID', async ({ apiContext }) => {
      const response = await apiContext.get('/booking/9999999');

      expect(response.status()).toBe(404);
    });

    test('should return 404 for invalid booking ID format', async ({ apiContext }) => {
      const response = await apiContext.get('/booking/invalid');

      expect(response.status()).toBe(404);
    });
  });
});
