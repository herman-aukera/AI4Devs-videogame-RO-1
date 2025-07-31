/* © GG, MIT License */

/**
 * Universal Audio System for AI4Devs Retro Games
 *
 * Provides standardized Web Audio API implementation with:
 * - Retro 8-bit sound synthesis
 * - Cross-browser compatibility
 * - Audio toggle functionality
 * - Common game sound effects
 * - Easy integration across all games
 */

class UniversalAudioManager {
  constructor(config = {}) {
    this.audioContext = null;
    this.enabled = config.enabled !== false; // Default to enabled
    this.volume = config.volume || 0.3;
    this.frequencies = {
      // Standard retro game frequencies
      select: 440,      // Menu selection
      back: 220,        // Menu back/cancel
      powerup: 660,     // Power-up/bonus
      hit: 330,         // Object hit/collision
      bounce: 440,      // Ball/object bounce
      collect: 880,     // Item collection
      destroy: 165,     // Destruction/elimination
      score: 550,       // Score/points
      levelup: 880,     // Level completion
      gameover: 110,    // Game over
      victory: 880,     // Victory/win
      ...config.frequencies
    };

    this.isInitialized = false;
    this.initializeAudio();
    this.setupToggleControl();
  }

  async initializeAudio() {
    try {
      // Create Web Audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Handle context suspension (common on mobile/newer browsers)
      if (this.audioContext.state === 'suspended') {
        this.resumeOnUserInteraction();
      }

      this.isInitialized = true;
      console.log('🔊 Universal Audio System initialized');
    } catch (error) {
      console.warn('🔇 Web Audio API not supported:', error);
      this.enabled = false;
    }
  }

  resumeOnUserInteraction() {
    const resumeAudio = () => {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        this.audioContext.resume();
        console.log('🔊 Audio context resumed');
      }
      // Remove listeners after first interaction
      document.removeEventListener('click', resumeAudio);
      document.removeEventListener('keydown', resumeAudio);
      document.removeEventListener('touchstart', resumeAudio);
    };

    document.addEventListener('click', resumeAudio, { once: true });
    document.addEventListener('keydown', resumeAudio, { once: true });
    document.addEventListener('touchstart', resumeAudio, { once: true });
  }

  setupToggleControl() {
    // Add global audio toggle (M key)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'M' || e.key === 'm') {
        this.toggle();
        e.preventDefault();
      }
    });

    // Store audio preference
    const savedEnabled = localStorage.getItem('ai4devs-audio-enabled');
    if (savedEnabled !== null) {
      this.enabled = JSON.parse(savedEnabled);
    }
  }

  createTone(frequency, duration = 0.1, type = 'square', envelope = 'exponential') {
    if (!this.enabled || !this.audioContext || !this.isInitialized) return;

    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);

      // Configure oscillator
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

      // Configure envelope
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      if (envelope === 'exponential') {
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      } else if (envelope === 'linear') {
        gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + duration);
      }

      // Start and stop
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);

    } catch (error) {
      console.warn('🔇 Audio playback failed:', error);
    }
  }

  // ===== COMMON GAME SOUNDS =====

  playSelect() {
    this.createTone(this.frequencies.select, 0.1, 'square');
  }

  playBack() {
    this.createTone(this.frequencies.back, 0.15, 'square');
  }

  playHit(intensity = 1) {
    const freq = this.frequencies.hit * (0.8 + intensity * 0.4);
    this.createTone(freq, 0.08, 'square');
  }

  playBounce() {
    this.createTone(this.frequencies.bounce, 0.06, 'sine');
  }

  playCollect() {
    this.createTone(this.frequencies.collect, 0.2, 'triangle');
  }

  playDestroy() {
    // Multi-tone destruction sound
    this.createTone(this.frequencies.destroy, 0.3, 'sawtooth');
    setTimeout(() => this.createTone(this.frequencies.destroy * 0.7, 0.2, 'square'), 50);
  }

  playScore() {
    this.createTone(this.frequencies.score, 0.2, 'triangle');
  }

  playLevelUp() {
    // Victory fanfare
    this.createTone(this.frequencies.levelup, 0.15, 'triangle');
    setTimeout(() => this.createTone(this.frequencies.levelup * 1.2, 0.15, 'triangle'), 150);
    setTimeout(() => this.createTone(this.frequencies.levelup * 1.5, 0.3, 'triangle'), 300);
  }

  playGameOver() {
    // Descending game over sound
    this.createTone(this.frequencies.gameover * 2, 0.5, 'sawtooth');
    setTimeout(() => this.createTone(this.frequencies.gameover, 0.8, 'sawtooth'), 200);
  }

  playVictory() {
    // Ascending victory sound
    this.createTone(this.frequencies.victory, 0.2, 'triangle');
    setTimeout(() => this.createTone(this.frequencies.victory * 1.3, 0.2, 'triangle'), 200);
    setTimeout(() => this.createTone(this.frequencies.victory * 1.6, 0.4, 'triangle'), 400);
  }

  playPowerUp() {
    // Ascending power-up sound
    this.createTone(this.frequencies.powerup, 0.1, 'triangle');
    setTimeout(() => this.createTone(this.frequencies.powerup * 1.2, 0.1, 'triangle'), 100);
    setTimeout(() => this.createTone(this.frequencies.powerup * 1.5, 0.2, 'triangle'), 200);
  }

  // ===== CONTROL METHODS =====

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('ai4devs-audio-enabled', JSON.stringify(this.enabled));

    // Show visual feedback
    this.showToggleFeedback();

    console.log(`🔊 Audio ${this.enabled ? 'enabled' : 'disabled'}`);
  }

  enable() {
    this.enabled = true;
    localStorage.setItem('ai4devs-audio-enabled', 'true');
  }

  disable() {
    this.enabled = false;
    localStorage.setItem('ai4devs-audio-enabled', 'false');
  }

  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  showToggleFeedback() {
    // Create temporary visual feedback
    const feedback = document.createElement('div');
    feedback.textContent = this.enabled ? '🔊 Audio ON' : '🔇 Audio OFF';
    feedback.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-cyan, #00ffff);
      color: var(--bg-primary, #000);
      padding: 10px 20px;
      border-radius: 5px;
      font-family: monospace;
      font-weight: bold;
      z-index: 10000;
      animation: fadeInOut 2s ease-in-out;
    `;

    // Add fade animation if not present
    if (!document.querySelector('#audio-feedback-style')) {
      const style = document.createElement('style');
      style.id = 'audio-feedback-style';
      style.textContent = `
        @keyframes fadeInOut {
          0%, 100% { opacity: 0; transform: translateY(-10px); }
          20%, 80% { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(feedback);
    setTimeout(() => document.body.removeChild(feedback), 2000);
  }

  // ===== UTILITY METHODS =====

  createCustomSound(config) {
    /**
     * Create custom retro sound with parameters
     * @param {Object} config - Sound configuration
     * @param {number} config.frequency - Base frequency
     * @param {number} config.duration - Duration in seconds
     * @param {string} config.type - Oscillator type
     * @param {Array} config.sequence - Frequency sequence for complex sounds
     */
    if (config.sequence) {
      config.sequence.forEach((freq, index) => {
        setTimeout(() => {
          this.createTone(freq, config.duration || 0.1, config.type || 'square');
        }, index * (config.delay || 100));
      });
    } else {
      this.createTone(
        config.frequency,
        config.duration || 0.1,
        config.type || 'square'
      );
    }
  }

  // ===== GAME-SPECIFIC EXTENSIONS =====

  // Pacman sounds
  playWaka() {
    this.createTone(400, 0.1, 'square');
    setTimeout(() => this.createTone(500, 0.1, 'square'), 100);
  }

  // Snake sounds
  playEat() {
    this.createTone(800, 0.1, 'triangle');
  }

  // Space game sounds
  playLaser() {
    this.createTone(800, 0.1, 'sawtooth');
    setTimeout(() => this.createTone(600, 0.1, 'sawtooth'), 50);
  }

  playExplosion() {
    this.createTone(150, 0.3, 'sawtooth');
    setTimeout(() => this.createTone(100, 0.4, 'square'), 100);
  }

  // Tetris sounds
  playRotate() {
    this.createTone(600, 0.05, 'triangle');
  }

  playLineClear() {
    this.createTone(880, 0.3, 'triangle');
    setTimeout(() => this.createTone(660, 0.2, 'triangle'), 150);
  }
}

// Create global instance if not exists
if (typeof window !== 'undefined' && !window.globalAudioManager) {
  window.globalAudioManager = new UniversalAudioManager();

  // Add audio status to page title in development
  if (window.location.hostname === 'localhost') {
    document.addEventListener('DOMContentLoaded', () => {
      const originalTitle = document.title;
      setInterval(() => {
        const audioStatus = window.globalAudioManager.enabled ? '🔊' : '🔇';
        if (!document.title.includes(audioStatus)) {
          document.title = `${audioStatus} ${originalTitle}`;
        }
      }, 1000);
    });
  }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = UniversalAudioManager;
}

// Global export for browser
if (typeof window !== 'undefined') {
  window.UniversalAudio = new UniversalAudioManager();
}
