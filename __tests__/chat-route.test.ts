/**
 * @jest-environment node
 */
import { POST } from '../app/api/chat/route';

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

import Anthropic from '@anthropic-ai/sdk';

function makeRequest(body: object): Request {
  return new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/chat', () => {
  let mockCreate: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ANTHROPIC_API_KEY = 'test-key';
    mockCreate = jest.fn();
    (Anthropic as jest.MockedClass<typeof Anthropic>).mockImplementation(
      () => ({ messages: { create: mockCreate } } as unknown as Anthropic)
    );
  });

  it('returns 200 with message on success', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'LLM generated message' }],
    });

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.message).toBe('LLM generated message');
  });

  it('returns 400 when phase is missing', async () => {
    const req = makeRequest({ topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when topic is missing', async () => {
    const req = makeRequest({ phase: 1, userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 400 when userMessage is missing', async () => {
    const req = makeRequest({ phase: 1, topic: 'food' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('returns 500 when Anthropic SDK throws', async () => {
    mockCreate.mockRejectedValue(new Error('API failure'));

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    const res = await POST(req);
    expect(res.status).toBe(500);
  });

  it('injects userMessage and phase into system prompt', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    });

    const req = makeRequest({ phase: 3, topic: 'food', userMessage: 'dinner tonight' });
    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.system).toContain('dinner tonight');
    expect(callArgs.system).toContain('3');
  });

  it('uses claude-haiku-4-5-20251001 model', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'response' }],
    });

    const req = makeRequest({ phase: 1, topic: 'food', userMessage: 'dinner' });
    await POST(req);

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe('claude-haiku-4-5-20251001');
  });
});
