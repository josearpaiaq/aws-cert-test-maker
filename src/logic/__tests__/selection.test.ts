import { toggleSelection } from '@/logic/selection';

const single = { type: 'single' as const, correct: ['a'] };
const multi = { type: 'multi' as const, correct: ['a', 'c'] };

describe('toggleSelection', () => {
  it('selects the tapped option on a single-answer question', () => {
    expect(toggleSelection(single, [], 'b')).toEqual(['b']);
  });

  it('replaces the previous choice on a single-answer question', () => {
    expect(toggleSelection(single, ['b'], 'c')).toEqual(['c']);
  });

  it('keeps the choice when the selected single answer is tapped again', () => {
    expect(toggleSelection(single, ['b'], 'b')).toEqual(['b']);
  });

  it('adds options on a multiple-response question', () => {
    expect(toggleSelection(multi, ['a'], 'b')).toEqual(['a', 'b']);
  });

  it('removes an option that is tapped again', () => {
    expect(toggleSelection(multi, ['a', 'b'], 'a')).toEqual(['b']);
  });

  it('ignores a new option once the required number is selected', () => {
    expect(toggleSelection(multi, ['a', 'b'], 'c')).toEqual(['a', 'b']);
  });

  it('does not change the array it is given', () => {
    const selected = ['a'];
    toggleSelection(multi, selected, 'b');

    expect(selected).toEqual(['a']);
  });
});
