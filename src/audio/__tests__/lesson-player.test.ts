import { lessonsWithAudio, playLesson, stopPlayback, useLessonPlayer } from '@/audio/lesson-player';

type Status = {
  currentIndex: number;
  playing: boolean;
  currentTime: number;
  duration: number;
  didJustFinish: boolean;
};
type Listener = (payload: never) => void;

const mockListeners = new Map<string, Listener>();

jest.mock('expo-audio', () => ({
  setAudioModeAsync: jest.fn(async () => undefined),
  requestNotificationPermissionsAsync: jest.fn(async () => ({ granted: true })),
  createAudioPlaylist: jest.fn(() => ({
    addListener: (event: string, listener: Listener) => mockListeners.set(event, listener),
    skipTo: jest.fn(),
    play: jest.fn(),
    pause: jest.fn(),
    setActiveForLockScreen: jest.fn(),
    updateLockScreenMetadata: jest.fn(),
    clearLockScreenControls: jest.fn(),
    destroy: jest.fn(),
  })),
}));

/** Delivers a status event the way the native playlist does: asynchronously, maybe stale. */
const emitStatus = (status: Partial<Status>) =>
  (mockListeners.get('playlistStatusUpdate') as (s: Status) => void)({
    currentIndex: 0,
    playing: true,
    currentTime: 0,
    duration: 60,
    didJustFinish: false,
    ...status,
  });

describe('playLesson', () => {
  const order = lessonsWithAudio('ruth');
  const target = order[3];

  afterEach(() => {
    stopPlayback();
    mockListeners.clear();
  });

  it('ignores status updates sent before the skip to the chosen lesson took effect', async () => {
    await playLesson(target);
    expect(useLessonPlayer.getState().currentId).toBe(target);

    // The new playlist reports its first track before the native skipTo is applied.
    emitStatus({ currentIndex: 0 });
    expect(useLessonPlayer.getState().currentId).toBe(target);

    emitStatus({ currentIndex: 3, currentTime: 0.25 });
    expect(useLessonPlayer.getState()).toMatchObject({ currentId: target, currentTime: 0.25 });
  });

  it('follows the playlist once the chosen lesson is playing', async () => {
    await playLesson(target);
    emitStatus({ currentIndex: 3 });

    // Next track (or the lesson ended): the player moves on and the UI follows.
    emitStatus({ currentIndex: 4 });
    expect(useLessonPlayer.getState().currentId).toBe(order[4]);
  });
});
