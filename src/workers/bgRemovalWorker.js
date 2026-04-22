import { pipeline, env } from '@huggingface/transformers';

// Setup transformers environment synchronously
env.allowLocalModels = false;
env.allowRemoteModels = true;
env.useBrowserCache = true;

let segmenter = null;


self.onmessage = async (e) => {
  const { imageBlob } = e.data;

  try {
    // Load the model (cached after first download)
    if (!segmenter) {
      segmenter = await pipeline('image-segmentation', 'Xenova/modnet', {
        progress_callback: (data) => {
          if (data.status === 'progress') {
            self.postMessage({
              type: 'progress',
              file: data.file || '',
              progress: Math.round(data.progress || 0),
            });
          }
        },
      });
    }

    self.postMessage({ type: 'segmenting' });

    // Create a blob URL the pipeline can fetch
    const url = URL.createObjectURL(imageBlob);
    const results = await segmenter(url);
    URL.revokeObjectURL(url);

    if (results && results.length > 0) {
      const mask = results[0].mask;
      const maskDataCopy = new Uint8ClampedArray(mask.data);
      self.postMessage(
        {
          type: 'done',
          maskData: maskDataCopy,
          maskWidth: mask.width,
          maskHeight: mask.height,
          maskChannels: mask.channels,
        },
        [maskDataCopy.buffer]
      );
    } else {
      self.postMessage({ type: 'error', message: 'No segmentation result returned.' });
    }
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message || String(err) });
  }
};
