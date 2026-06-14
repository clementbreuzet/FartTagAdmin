import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { cacheDirectory, deleteAsync, downloadAsync, getInfoAsync } from 'expo-file-system/legacy';

import { getAccessToken } from '../../api/apiClient';

let activePlayer: AudioPlayer | null = null;
let playbackGeneration = 0;

const stopActivePlayer = () => {
  playbackGeneration += 1;
  activePlayer?.pause();
  activePlayer?.remove();
  activePlayer = null;
};

const localFileFor = (eventId: string) => {
  if (!cacheDirectory) {
    throw new Error("Le cache audio n'est pas disponible sur cet appareil.");
  }
  return `${cacheDirectory}fart-replay-${eventId.replace(/[^a-zA-Z0-9-]/g, '')}.audio`;
};

export const audioPlaybackService = {
  async play(
    eventId: string,
    audioUrl: string,
    onFinished: () => void,
    onError: (message: string) => void,
  ): Promise<void> {
    stopActivePlayer();
    const generation = playbackGeneration;
    const localUri = localFileFor(eventId);
    const cachedFile = await getInfoAsync(localUri);

    if (!cachedFile.exists) {
      const token = getAccessToken();
      const result = await downloadAsync(audioUrl, localUri, {
        headers: {
          Accept: 'audio/*',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (result.status < 200 || result.status >= 300) {
        await deleteAsync(localUri, { idempotent: true });
        throw new Error(`Le téléchargement audio a échoué (${result.status}).`);
      }
    }

    if (generation !== playbackGeneration) {
      return;
    }

    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    const player = createAudioPlayer(localUri, { updateInterval: 250 });
    activePlayer = player;
    player.addListener('playbackStatusUpdate', (status) => {
      if (generation !== playbackGeneration) {
        return;
      }
      if (status.error) {
        stopActivePlayer();
        onError(status.error);
      } else if (status.didJustFinish) {
        stopActivePlayer();
        onFinished();
      }
    });
    player.play();
  },

  stop: stopActivePlayer,
};
