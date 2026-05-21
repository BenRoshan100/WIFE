import { initSession, getNextMessage } from '../lib/sessionEngine';

describe('initSession', () => {
  it('returns between 12 and 17 phase entries', () => {
    const plan = initSession('food', 'test message');
    expect(plan.phases.length).toBeGreaterThanOrEqual(12);
    expect(plan.phases.length).toBeLessThanOrEqual(17);
  });

  it('truncates userMessage longer than 40 chars', () => {
    const longMsg = 'a'.repeat(50);
    const plan = initSession('food', longMsg);
    expect(plan.truncatedMessage).toBe('a'.repeat(40) + '...');
  });

  it('preserves userMessage 40 chars or shorter', () => {
    const plan = initSession('food', 'hello');
    expect(plan.truncatedMessage).toBe('hello');
  });

  it('always ends with phase 6', () => {
    for (let i = 0; i < 5; i++) {
      const plan = initSession('food', 'test');
      expect(plan.phases[plan.phases.length - 1].phase).toBe(6);
    }
  });

  it('phases appear in ascending order', () => {
    const plan = initSession('food', 'test');
    const nums = plan.phases.map((p) => p.phase);
    const firstOf = (n: number) => nums.indexOf(n);
    expect(firstOf(1)).toBeLessThan(firstOf(2));
    expect(firstOf(2)).toBeLessThan(firstOf(3));
    expect(firstOf(3)).toBeLessThan(firstOf(4));
    expect(firstOf(4)).toBeLessThan(firstOf(5));
    expect(firstOf(5)).toBeLessThan(firstOf(6));
  });

  it('all delayMs are between 1500 and 3500', () => {
    const plan = initSession('food', 'test');
    plan.phases.forEach((p) => {
      expect(p.delayMs).toBeGreaterThanOrEqual(1500);
      expect(p.delayMs).toBeLessThanOrEqual(3500);
    });
  });

  it('stores topic and truncatedMessage', () => {
    const plan = initSession('time', 'you are late');
    expect(plan.topic).toBe('time');
    expect(plan.truncatedMessage).toBe('you are late');
  });
});

describe('getNextMessage — scripted fallback (useFallback=true)', () => {
  it('returns message with correct phase', async () => {
    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, true);
    expect(result.message.phase).toBe(plan.phases[0].phase);
    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(false);
  });

  it('does not contain literal {userMessage} in output', async () => {
    const plan = initSession('vague', 'hi');
    for (let i = 0; i < plan.phases.length; i++) {
      const result = await getNextMessage(plan, i, true);
      expect(result.message.text).not.toContain('{userMessage}');
    }
  });

  it('message id contains the index', async () => {
    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 3, true);
    expect(result.message.id).toContain('3');
  });
});

describe('getNextMessage — LLM path (useFallback=false)', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('calls /api/chat and returns LLM message on success', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'LLM generated response' }),
    });

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/chat',
      expect.objectContaining({ method: 'POST' })
    );
    expect(result.message.text).toBe('LLM generated response');
    expect(result.error).toBe(false);
  });

  it('falls back to scripted and sets error=true on non-ok response', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({ ok: false, status: 529 });

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(true);
  });

  it('falls back to scripted and sets error=true on network failure', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const plan = initSession('food', 'dinner');
    const result = await getNextMessage(plan, 0, false);

    expect(result.message.text.length).toBeGreaterThan(0);
    expect(result.error).toBe(true);
  });
});
