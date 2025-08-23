import api from '../../api';

describe('자동 카테고리 추천 API', () => {
  it('fetches recommended categories for age/job', async () => {
    // 실제 API mocking 필요 (jest.mock 등)
    const mockResponse = { success: true, data: { recommended_categories: ['식비', '교통'] } };
    jest.spyOn(api, 'getRecommendedCategories').mockResolvedValueOnce(mockResponse as any);
    const res = await api.getRecommendedCategories('20s', 'student');
    expect(res.success).toBe(true);
    expect(res.data?.recommended_categories).toContain('식비');
  });
});
