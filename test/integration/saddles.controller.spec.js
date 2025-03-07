import request from 'supertest';
import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import app from '../../app.js';
import { saddles as mockSaddles } from '../fixtures/saddles.js';
import * as saddlesService from '../../src/services/saddles.js';

describe('Saddles API', () => {
  beforeAll(() => {
    vi.spyOn(saddlesService, 'findAll').mockResolvedValue(mockSaddles);
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it('GET /api/saddles with coords should return saddles data', async () => {
    const params =
      'lat1=49.88003517318264&lon1=20.46409606933594&lat2=49.982799313421395&lon2=20.631294250488285';
    const response = await request(app).get(`/api/saddles?${params}`);
    expect(response.status).toBe(200);
    expect(response.body).toEqual(mockSaddles);
  });
});
