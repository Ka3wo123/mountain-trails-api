import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as peaksService from '../../src/services/peaks.js';
import { find, count } from '../../src/controllers/peaks.js';

// Mock Express request and response
const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnThis();
  res.json = vi.fn().mockReturnThis();
  res.problem = vi.fn();
  return res;
};

describe('Peaks Controller', () => {
  afterEach(() => {
    vi.restoreAllMocks(); // Reset mocks after each test
  });

  describe('find()', () => {
    it('should return peaks data when service call is successful', async () => {
      const req = { query: { difficulty: 'easy' } };
      const res = mockResponse();
      const mockPeaks = [{ name: 'Peak 1' }, { name: 'Peak 2' }];

      // Mock the service function
      vi.spyOn(peaksService, 'findAll').mockResolvedValue(mockPeaks);

      await find(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockPeaks);
    });

    it('should call res.problem on service failure', async () => {
      const req = { query: {} };
      const res = mockResponse();
      const error = { status: 500, name: 'Error', message: 'Something went wrong' };

      vi.spyOn(peaksService, 'findAll').mockRejectedValue(error);

      await find(req, res);

      expect(res.problem).toHaveBeenCalledWith(500, 'Error', 'Something went wrong');
    });
  });

  describe('count()', () => {
    it('should return total count of peaks', async () => {
      const req = {};
      const res = mockResponse();
      const mockTotal = 42;

      vi.spyOn(peaksService, 'countPeaks').mockResolvedValue(mockTotal);

      await count(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockTotal);
    });

    it('should call res.problem on service failure', async () => {
      const req = {};
      const res = mockResponse();
      const error = { status: 500, name: 'Error', message: 'Database error' };

      vi.spyOn(peaksService, 'countPeaks').mockRejectedValue(error);

      await count(req, res);

      expect(res.problem).toHaveBeenCalledWith(500, 'Error', 'Database error');
    });
  });
});
