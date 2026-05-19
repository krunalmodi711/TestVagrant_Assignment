import { test, expect } from '../../fixtures/api-fixtures';

const validBookingPayload = {
  firstname: 'Delete',
  lastname: 'Test',
  totalprice: 100,
  depositpaid: true,
  bookingdates: {
    checkin: '2025-03-01',
    checkout: '2025-03-10',
  },
  additionalneeds: 'None',
};

test.describe('API: Booking Management - DELETE', () => {
  test.describe('DELETE /booking/:id', () => {
    test('should delete a booking with valid token', async ({ apiContext, authToken }) => {
      // Create a booking first
      const createResponse = await apiContext.post('/booking', {
        data: validBookingPayload,
      });
      const { bookingid } = await createResponse.json();

      // Delete the booking
      const deleteResponse = await apiContext.delete(`/booking/${bookingid}`, {
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(deleteResponse.status()).toBe(201);

      // Verify it's deleted
      const getResponse = await apiContext.get(`/booking/${bookingid}`);
      expect(getResponse.status()).toBe(404);
    });

    test('should return 403 when deleting without auth token', async ({ apiContext }) => {
      // Create a booking first
      const createResponse = await apiContext.post('/booking', {
        data: validBookingPayload,
      });
      const { bookingid } = await createResponse.json();

      // Attempt delete without auth
      const deleteResponse = await apiContext.delete(`/booking/${bookingid}`);

      expect(deleteResponse.status()).toBe(403);
    });

    test('should return 405 for non-existent booking ID', async ({ apiContext, authToken }) => {
      const response = await apiContext.delete('/booking/9999999', {
        headers: {
          Cookie: `token=${authToken}`,
        },
      });

      expect(response.status()).toBe(405);
    });
  });
});
