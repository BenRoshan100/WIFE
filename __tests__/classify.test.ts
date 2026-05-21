import { classify } from '../lib/classify';

describe('classify', () => {
  it('classifies food messages', () => {
    expect(classify('I am hungry')).toBe('food');
    expect(classify('What is for dinner?')).toBe('food');
    expect(classify('Can we order pizza')).toBe('food');
    expect(classify('I want to cook tonight')).toBe('food');
  });

  it('classifies time messages', () => {
    expect(classify('you are late')).toBe('time');
    expect(classify('how long will this take')).toBe('time');
    expect(classify('are you still there')).toBe('time');
    expect(classify('when are you coming')).toBe('time');
  });

  it('classifies location messages', () => {
    expect(classify('where are you')).toBe('location');
    expect(classify('when are you coming home')).toBe('location');
    expect(classify('are you at work')).toBe('location');
  });

  it('classifies plans messages', () => {
    expect(classify('what are we doing this weekend')).toBe('plans');
    expect(classify('should we cancel tonight')).toBe('plans');
    expect(classify('should we reschedule the meeting')).toBe('plans');
  });

  it('classifies money messages', () => {
    expect(classify('this is so expensive')).toBe('money');
    expect(classify('did you pay the bill')).toBe('money');
    expect(classify('can we afford this')).toBe('money');
  });

  it('classifies phone messages', () => {
    expect(classify('why are you so busy')).toBe('phone');
    expect(classify('you never reply to my texts')).toBe('phone');
    expect(classify('i can see you ignored my message')).toBe('phone');
  });

  it('classifies vague messages', () => {
    expect(classify('hi')).toBe('vague');
    expect(classify('hey')).toBe('vague');
    expect(classify('ok')).toBe('vague');
    expect(classify('okay')).toBe('vague');
    expect(classify('lol')).toBe('vague');
    expect(classify('.')).toBe('vague');
    expect(classify('...')).toBe('vague');
    expect(classify('hmm')).toBe('vague');
  });

  it('classifies unmatched messages as generic', () => {
    expect(classify('the sky is blue')).toBe('generic');
    expect(classify('interesting philosophical thought')).toBe('generic');
    expect(classify('I was thinking about mathematics')).toBe('generic');
  });

  it('is case-insensitive', () => {
    expect(classify('HUNGRY')).toBe('food');
    expect(classify('LATE')).toBe('time');
    expect(classify('WHERE ARE YOU')).toBe('location');
  });
});
