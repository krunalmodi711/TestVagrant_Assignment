import { test, expect } from '../../fixtures/api-fixtures';

test.describe('API E2E: Create → Update → Verify → Delete', () => {
  test('should complete full booking lifecycle', async ({ apiContext, authToken }) => {
    // Step 1: Create a new booking
    const createPayload = {
      firstname: 'E2E',
      lastname: 'TestUser',
      totalprice: 250,
      depositpaid: true,
      bookingdates: {
        checkin: '2025-06-01',
        checkout: '2025-06-15',
      },
      additionalneeds: 'Lunch',
    };

    const createResponse = await apiContext.post('/booking', {
      data: createPayload,
    });

    expect(createResponse.status()).toBe(200);
    const createBody = await createResponse.json();
    const bookingId = createBody.bookingid;
    expect(bookingId).toBeDefined();
    expect(createBody.booking.firstname).toBe('E2E');
    expect(createBody.booking.lastname).toBe('TestUser');

    // Step 2: Update the booking
    const updatePayload = {
      firstname: 'Updated',
      lastname: 'Booking',
      totalprice: 500,
      depositpaid: false,
      bookingdates: {
        checkin: '2025-07-01',
        checkout: '2025-07-20',
      },
      additionalneeds: 'Dinner',
    };

    const updateResponse = await apiContext.put(`/booking/${bookingId}`, {
      data: updatePayload,
      headers: {
        Cookie: `token=${authToken}`,
      },
    });

    expect(updateResponse.status()).toBe(200);
    const updateBody = await updateResponse.json();
    expect(updateBody.firstname).toBe('Updated');
    expect(updateBody.lastname).toBe('Booking');
    expect(updateBody.totalprice).toBe(500);
    expect(updateBody.depositpaid).toBe(false);

    // Step 3: Verify the updated booking
    const getResponse = await apiContext.get(`/booking/${bookingId}`);

    expect(getResponse.status()).toBe(200);
    const getBody = await getResponse.json();
    expect(getBody.firstname).toBe('Updated');
    expect(getBody.lastname).toBe('Booking');
    expect(getBody.totalprice).toBe(500);
    expect(getBody.depositpaid).toBe(false);
    expect(getBody.bookingdates.checkin).toBe('2025-07-01');
    expect(getBody.bookingdates.checkout).toBe('2025-07-20');
    expect(getBody.additionalneeds).toBe('Dinner');

    // Step 4: Delete the booking
    const deleteResponse = await apiContext.delete(`/booking/${bookingId}`, {
      headers: {
        Cookie: `token=${authToken}`,
      },
    });

    expect(deleteResponse.status()).toBe(201);

    // Step 5: Verify deletion
    const verifyDeleteResponse = await apiContext.get(`/booking/${bookingId}`);
    expect(verifyDeleteResponse.status()).toBe(404);
  });
});
