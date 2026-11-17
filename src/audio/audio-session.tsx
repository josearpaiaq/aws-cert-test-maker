import { useEffect } from 'react';

import { setOnLessonHeard, useLessonPlayer } from '@/audio/lesson-player';
import type { VoiceId } from '@/content/lesson-audio';
import { CLF_C02 } from '@/data/exams/clf-c02';
import type { Repository } from '@/db/repository';
import { useRepository } from '@/db/use-repository';

const VOICE_KEY = 'audio.voice';

export async function saveVoice(repo: Repository, voice: VoiceId): Promise<void> {
  await repo.setSetting(VOICE_KEY, voice);
}

/**
 * Connects the audio player to the database: restores the chosen voice at startup, and records
 * a lesson as read when it has been listened to. Renders nothing.
 */
export function AudioSession() {
  const repo = useRepository();

  useEffect(() => {
    repo
      .getSetting(VOICE_KEY)
      .then((stored) => {
        if (stored === 'ruth' || stored === 'matthew') useLessonPlayer.setState({ voice: stored });
      })
      .catch(() => undefined);

    setOnLessonHeard((lessonId) => {
      repo.markLessonRead(CLF_C02.id, lessonId, Date.now()).catch(() => undefined);
    });
    return () => setOnLessonHeard(() => undefined);
  }, [repo]);

  return null;
}
