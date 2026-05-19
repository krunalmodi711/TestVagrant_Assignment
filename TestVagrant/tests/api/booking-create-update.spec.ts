import { test, expect } from '../../fixtures/api-fixtures';

const validBookingPayload = {
  firstname: 'John',
  lastname: 'Doe',
  totalprice: 150,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-01-01',
    checkout: '2025-01-10',
  },
  additionalneeds: 'Breakfast',
};

test.describe('API: Booking Management - CREATE/UPDATE', () => {
  test.describe('POST /booking - Create Booking', () => {
    test('should create a booking with valid payload', async ({ apiContext }) => {
      const response = await apiContext.post('/booking', {
        data: validBookingPayload,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();

      // Validate response structure
      expect(body).toHaveProperty('bookingid');
      expect(typeof body.bookingid).toBe('number');
      expect(body).toHaveProperty('booking');

      // Validate data integrity
      expect(body.booking.firstname).toBe(validBookingPayload.firstname);
      expect(body.booking.lastname).toBe(validBookingPayload.lastname);
      expect(body.booking.totalprice).toBe(validBookingPayload.totalprice);
      expect(body.booking.depositpaid).toBe(validBookingPayload.depositpaid);
      expect(body.booking.bookingdates.checkin).toBe(validBookingPayload.bookingdates.checkin);
      expect(body.booking.bookingdates.checkout).toBe(validBookingPayload.bookingdates.checkout);
      expect(body.booking.additionalneeds).toBe(validBookingPayload.additionalneeds);
    });

    test('should create a booking without optional additionalneeds field', async ({ apiContext }) => {
      const { additionalneeds, ...payloadWithoutExtras } = validBookingPayload;

      const response = await apiContext.post('/booking', {
        data: payloadWithoutExtras,
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body).toHaveProperty('bookingid');
      expect(body.booking.firstname).toBe(validBookingPayload.firstname);
    });

    test('should return error for missing required fields', async ({ apiContext }) => {
      const response = await apiContext.post('/booking', {
        data: {
          firstname: 'John',
        },
      });

      expect(response.status()).toBe(500);
    });

    test('should return error for empty payload', async ({ apiContext }) => {
      const response = await apiContext.post('/booking', {
        data: {},
      });

      expect(response.status()).toBe(500);
    });
  });

  test.describe('PUT /booking/:id - Update Booking', () => {
    let bookingId: number;

    test.beforeEach(async ({ apiContext }) => {
      // Create a booking to update
      const response = await apiContext.post('/booking', {
        data: validBookingPayload,
      });
      const body = await response.json();
      bookingId = body.bookingid;
    });

    test('should update a booking with valid token', async ({ apiContext, authToken }) => {
      const updatedPayload = {
        ...validBookingPayload,
        firstname: 'Jane',
        lastname: 'Smith',
        totalprice: 200,
      };

      const response = await apiContext.put(`/booking/${bookingId}`, {
        data: updatedPayload,
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe('Jane');
      expect(body.lastname).toBe('Smith');
      expect(body.totalprice).toBe(200);
    });

    test('should return 403 when updating without auth token', async ({ apiContext }) => {
      const response = await apiContext.put(`/booking/${bookingId}`, {
        data: validBookingPayload,
      });

      expect(response.status()).toBe(403);
    });

    test('should return 405 for non-existent booking ID', async ({ apiContext, authToken }) => {
      const response = await apiContext.put('/booking/9999999', {
        data: validBookingPayload,
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(response.status()).toBe(405);
    });
  });

  test.describe('PATCH /booking/:id - Partial Update Booking', () => {
    let bookingId: number;

    test.beforeEach(async ({ apiContext }) => {
      const response = await apiContext.post('/booking', {
        data: validBookingPayload,
      });
      const body = await response.json();
      bookingId = body.bookingid;
    });

    test('should partially update a booking with valid token', async ({ apiContext, authToken }) => {
      const partialPayload = {
        firstname: 'Patched',
        totalprice: 999,
      };

      const response = await apiContext.patch(`/booking/${bookingId}`, {
        data: partialPayload,
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(response.status()).toBe(200);
      const body = await response.json();
      expect(body.firstname).toBe('Patched');
      expect(body.totalprice).toBe(999);
      // Unchanged fields should remain
      expect(body.lastname).toBe(validBookingPayload.lastname);
      expect(body.depositpaid).toBe(validBookingPayload.depositpaid);
    });

    test('should return 403 when patching without auth token', async ({ apiContext }) => {
      const response = await apiContext.patch(`/booking/${bookingId}`, {
        data: { firstname: 'NoAuth' },
      });

      expect(response.status()).toBe(403);
    });

    test('should return 405 for non-existent booking ID', async ({ apiContext, authToken }) => {
      const response = await apiContext.patch('/booking/9999999', {
        data: { firstname: 'Ghost' },
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(response.status()).toBe(405);
    });
  });
});
