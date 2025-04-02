// speech-util.js - A utility for more reliable text-to-speech

// Global speech settings
const DEFAULT_RATE = 1.0;
const DEFAULT_PITCH = 1.05;
const DEFAULT_VOLUME = 1.0;

// Store reference to current utterance globally
let currentUtterance = null;

/**
 * Initialize speech synthesis and load voices
 * @returns {Promise<SpeechSynthesisVoice[]>} Available voices
 */
export const initSpeechSynthesis = () => {
  return new Promise((resolve, reject) => {
    // Check if speech synthesis is available
    if (!window.speechSynthesis) {
      console.error("Speech synthesis not available");
      reject(new Error("Speech synthesis not supported in this browser"));
      return;
    }
    
    console.log("Loading voices...");
    
    // Function to get voices
    const getVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log(`Successfully loaded ${voices.length} voices`);
        logAvailableVoices(voices);
        resolve(voices);
      } else {
        console.log("No voices available yet, waiting for voices to load...");
      }
    };
    
    // Get voices - first attempt
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log(`Immediately loaded ${voices.length} voices`);
      logAvailableVoices(voices);
      resolve(voices);
      return;
    }
    
    // Set up an event listener for when voices are loaded
    window.speechSynthesis.onvoiceschanged = () => {
      getVoices();
    };
    
    // Set a timeout in case voices don't load
    setTimeout(() => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        console.log(`Loaded ${voices.length} voices after timeout`);
        logAvailableVoices(voices);
        resolve(voices);
      } else {
        console.error("Failed to load voices after timeout");
        reject(new Error("Failed to load voices"));
      }
    }, 3000);
  });
};

/**
 * Log available voices for debugging
 * @param {SpeechSynthesisVoice[]} voices 
 */
const logAvailableVoices = (voices) => {
  console.log("----- Available Voices -----");
  voices.forEach((voice, i) => {
    console.log(`${i+1}. ${voice.name} (${voice.lang})${voice.default ? ' - DEFAULT' : ''}`);
  });
};

/**
 * Get the best available voice
 * @param {SpeechSynthesisVoice[]} voices Array of available voices
 * @returns {SpeechSynthesisVoice} The best voice to use
 */
export const getBestVoice = (voices) => {
  // Priority list of voice names to look for
  const preferredVoicePatterns = [
    /Google.*US.*English/i,  // Google US English
    /Microsoft.*David/i,     // Microsoft David
    /Microsoft.*Mark/i,      // Microsoft Mark
    /Microsoft.*Guy/i,       // Microsoft Guy
    /en-US/i,                // Any English US voice
    /English.*US/i,          // Any English US voice different pattern
    /en-GB/i,                // Any English GB voice
    /English/i,              // Any English voice
  ];
  
  // Try to find a preferred voice
  for (const pattern of preferredVoicePatterns) {
    const match = voices.find(voice => pattern.test(voice.name) || pattern.test(voice.lang));
    if (match) {
      console.log(`Selected preferred voice: ${match.name} (${match.lang})`);
      return match;
    }
  }
  
  // Fall back to the default voice
  const defaultVoice = voices.find(voice => voice.default);
  if (defaultVoice) {
    console.log(`Using default voice: ${defaultVoice.name} (${defaultVoice.lang})`);
    return defaultVoice;
  }
  
  // Last resort: just use the first voice
  if (voices.length > 0) {
    console.log(`Using first available voice: ${voices[0].name} (${voices[0].lang})`);
    return voices[0];
  }
  
  console.error("No voices available");
  return null;
};

/**
 * Speak text with robust error handling
 * @param {string} text The text to speak
 * @param {Object} options Options for speech
 * @param {Function} onStart Callback when speech starts
 * @param {Function} onEnd Callback when speech ends
 * @param {Function} onError Callback when an error occurs
 * @returns {Promise<void>}
 */
export const speakText = (text, options = {}, onStart = null, onEnd = null, onError = null) => {
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis) {
      const error = new Error("Speech synthesis not supported");
      if (onError) onError(error);
      reject(error);
      return;
    }
    
    try {
      // Always cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      // Create a new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      currentUtterance = utterance;
      
      // Set voice if provided, otherwise load voices and use the best one
      if (options.voice) {
        utterance.voice = options.voice;
      } else {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          utterance.voice = getBestVoice(voices);
        } else {
          console.warn("No voices loaded yet, using default system voice");
        }
      }
      
      // Set speech parameters
      utterance.rate = options.rate || DEFAULT_RATE;
      utterance.pitch = options.pitch || DEFAULT_PITCH;
      utterance.volume = options.volume || DEFAULT_VOLUME;
      
      // Set up event handlers
      utterance.onstart = () => {
        console.log("Speech started");
        if (onStart) onStart();
      };
      
      utterance.onend = () => {
        console.log("Speech ended");
        if (onEnd) onEnd();
        resolve();
      };
      
      utterance.onerror = (event) => {
        console.error("Speech synthesis error:", event);
        if (onError) onError(event);
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };
      
      // Work around Chrome bug by breaking text into chunks if it's too long
      if (text.length > 200 && navigator.userAgent.indexOf("Chrome") !== -1) {
        const chunks = splitTextIntoChunks(text);
        speakChunks(chunks, utterance, 0, onEnd, onError);
      } else {
        // Speak the text
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error("Error in speech synthesis:", error);
      if (onError) onError(error);
      reject(error);
    }
  });
};

/**
 * Split long text into chunks to work around Chrome TTS bugs
 * @param {string} text 
 * @returns {string[]} Array of text chunks
 */
const splitTextIntoChunks = (text) => {
  const maxChunkLength = 200;
  const chunks = [];
  
  // Split by sentences to avoid cutting in the middle of a sentence
  const sentences = text.split(/(?<=[.!?])\s+/);
  let currentChunk = "";
  
  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length < maxChunkLength) {
      currentChunk += (currentChunk ? " " : "") + sentence;
    } else {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      currentChunk = sentence;
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk);
  }
  
  return chunks;
};

/**
 * Recursively speak chunks of text
 * @param {string[]} chunks Array of text chunks
 * @param {SpeechSynthesisUtterance} template Utterance template
 * @param {number} index Current chunk index
 * @param {Function} onAllComplete Callback when all chunks complete
 * @param {Function} onError Callback on error
 */
const speakChunks = (chunks, template, index, onAllComplete, onError) => {
  if (index >= chunks.length) {
    if (onAllComplete) onAllComplete();
    return;
  }
  
  try {
    const utterance = new SpeechSynthesisUtterance(chunks[index]);
    
    // Copy properties from template
    utterance.voice = template.voice;
    utterance.rate = template.rate;
    utterance.pitch = template.pitch;
    utterance.volume = template.volume;
    
    utterance.onend = () => {
      // Speak the next chunk
      speakChunks(chunks, template, index + 1, onAllComplete, onError);
    };
    
    utterance.onerror = (event) => {
      console.error(`Error speaking chunk ${index}:`, event);
      if (onError) onError(event);
      // Try to continue with the next chunk
      speakChunks(chunks, template, index + 1, onAllComplete, onError);
    };
    
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    console.error(`Error in speakChunks (${index}):`, error);
    if (onError) onError(error);
    // Try to continue with the next chunk
    speakChunks(chunks, template, index + 1, onAllComplete, onError);
  }
};

/**
 * Force stop all speech
 */
export const stopSpeech = () => {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Check if speech synthesis is available
 * @returns {boolean}
 */
export const isSpeechAvailable = () => {
  return 'speechSynthesis' in window;
};

/**
 * Test speech synthesis with a simple phrase
 * @returns {Promise<boolean>} True if successful
 */
export const testSpeech = () => {
  return new Promise((resolve) => {
    speakText("Test speech synthesis", {}, 
      () => console.log("Test speech started"),
      () => {
        console.log("Test speech completed successfully");
        resolve(true);
      },
      (error) => {
        console.error("Test speech failed:", error);
        resolve(false);
      }
    );
  });
};

export default {
  initSpeechSynthesis,
  speakText,
  stopSpeech,
  isSpeechAvailable,
  testSpeech,
  getBestVoice
};