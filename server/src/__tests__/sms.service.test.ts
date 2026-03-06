const mockCreate = jest.fn();

jest.mock('twilio', () => {
  return jest.fn(() => ({
    messages: {
      create: mockCreate,
    },
  }));
});

import { sendPatientCodeSMS } from '../services/smsService';

describe('smsService', () => {
  afterEach(() => jest.clearAllMocks());

  describe('sendPatientCodeSMS', () => {
    it('should normalize phone starting with 07 to E.164 format', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('0781234567', 'RW-TEST-001');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+250781234567',
        }),
      );
    });

    it('should normalize phone starting with 08 to E.164 format', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('0812345678', 'RW-TEST-001');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+250812345678',
        }),
      );
    });

    it('should normalize phone starting with 250 (no +) to E.164', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('250781234567', 'RW-TEST-001');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+250781234567',
        }),
      );
    });

    it('should leave already E.164 formatted numbers unchanged', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('+250781234567', 'RW-TEST-001');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+250781234567',
        }),
      );
    });

    it('should strip whitespace from phone numbers', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS(' 078 123 4567 ', 'RW-TEST-001');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '+250781234567',
        }),
      );
    });

    it('should include patient code in message body', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('0781234567', 'RW-ABC-XYZ');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('RW-ABC-XYZ'),
        }),
      );
    });

    it('should include facility name in message when provided', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('0781234567', 'RW-TEST-001', 'Kigali Hospital');

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: expect.stringContaining('at Kigali Hospital'),
        }),
      );
    });

    it('should not include facility text when not provided', async () => {
      mockCreate.mockResolvedValue({ sid: 'SM123' });

      await sendPatientCodeSMS('0781234567', 'RW-TEST-001');

      const body = mockCreate.mock.calls[0][0].body;
      expect(body).not.toContain(' at ');
    });

    it('should propagate Twilio errors', async () => {
      mockCreate.mockRejectedValue(new Error('Twilio error'));

      await expect(sendPatientCodeSMS('0781234567', 'RW-TEST-001')).rejects.toThrow('Twilio error');
    });
  });
});
