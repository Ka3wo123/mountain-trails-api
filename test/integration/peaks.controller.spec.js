import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../../app.js';
import { peaks as mockPeaks } from '../fixtures/peaks.js';
import * as peakService from '../../src/services/peaks.js';

const mockCount = mockPeaks.length;
describe('Peaks API', () => {
  beforeAll(() => {
    vi.spyOn(peakService, 'findAll').mockResolvedValue(mockPeaks);
    vi.spyOn(peakService, 'countPeaks').mockResolvedValue(mockCount);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/peaks with coords should return peaks data', async () => {
    const params =
      'lat1=49.88003517318264&lon1=20.46409606933594&lat2=49.982799313421395&lon2=20.631294250488285';
    const response = await request(app).get(`/api/peaks?${params}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockPeaks);
  });

  it('GET /api/peaks/count should return total peaks count', async () => {
    const response = await request(app).get('/api/peaks/count');
    expect(response.status).toBe(200);
    expect(response.body).toBe(mockCount);
  });
});
