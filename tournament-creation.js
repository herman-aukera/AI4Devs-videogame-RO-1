/* © GG, MIT License */

/**
 * Tournament Creation Interface
 *
 * Provides a responsive form interface for creating tournaments with:
 * - Game selection with visual feedback
 * - Tournament format selection (elimination/round-robin)
 * - Participant management with validation
 * - Spanish localization
 * - Integration with existing tournament system
 */

class TournamentCreationUI {
  constructor() {
    this.participants = [];
    this.selectedGames = [];
    this.maxParticipants = 8;

    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    this.setupEventListeners();
    this.updateCounters();
    this.createStars();
    this.validateForm();
  }

  setupEventListeners() {
    // Form submission
    const form = document.getElementById('tournament-form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Game selection with touch optimization
    const gameCheckboxes = document.querySelectorAll('input[name="games"]');
    gameCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.handleGameSelection());

      // Add touch-friendly interaction
      const label = checkbox.nextElementSibling;
      if (label) {
        this.setupTouchInteraction(label, () => {
          checkbox.checked = !checkbox.checked;
          this.handleGameSelection();
        });
      }
    });

    // Max participants change
    const maxParticipantsSelect = document.getElementById('max-participants');
    if (maxParticipantsSelect) {
      maxParticipantsSelect.addEventListener('change', (e) => {
        this.maxParticipants = parseInt(e.target.value);
        this.updateParticipantsCounter();
        this.validateParticipants();
      });
    }

    // Add participant with touch optimization
    const addParticipantBtn = document.getElementById('add-participant-btn');
    const participantInput = document.getElementById('participant-name');

    if (addParticipantBtn) {
      addParticipantBtn.addEventListener('click', () => this.addParticipant());
      this.setupTouchInteraction(addParticipantBtn, () => this.addParticipant());
    }

    if (participantInput) {
      participantInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.addParticipant();
        }
      });
      participantInput.addEventListener('input', () => this.validateParticipantInput());

      // Mobile keyboard optimization
      participantInput.addEventListener('focus', () => {
        // Scroll into view on mobile
        setTimeout(() => {
          participantInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    }

    // Cancel button with touch optimization
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.handleCancel());
      this.setupTouchInteraction(cancelBtn, () => this.handleCancel());
    }

    // Tournament name validation
    const tournamentNameInput = document.getElementById('tournament-name');
    if (tournamentNameInput) {
      tournamentNameInput.addEventListener('input', () => this.validateTournamentName());

      // Mobile keyboard optimization
      tournamentNameInput.addEventListener('focus', () => {
        setTimeout(() => {
          tournamentNameInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      });
    }

    // Keyboard navigation for game selection
    gameCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          checkbox.checked = !checkbox.checked;
          this.handleGameSelection();
        }
      });
    });

    // Format selection with touch optimization
    const formatRadios = document.querySelectorAll('input[name="tournamentFormat"]');
    formatRadios.forEach(radio => {
      radio.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          radio.checked = true;
          this.validateForm();
        }
      });

      radio.addEventListener('change', () => {
        this.validateForm();
      });

      // Add touch-friendly interaction for format labels
      const label = radio.nextElementSibling;
      if (label) {
        this.setupTouchInteraction(label, () => {
          radio.checked = true;
          this.validateForm();
        });
      }
    });

    // Submit button with touch optimization
    const submitBtn = document.getElementById('create-tournament-btn');
    if (submitBtn) {
      this.setupTouchInteraction(submitBtn, () => {
        if (this.validateForm()) {
          form.dispatchEvent(new Event('submit'));
        }
      });
    }

    // Enhanced keyboard navigation and gesture support
    this.setupKeyboardNavigation();
    this.setupGestureSupport();
    this.setupMobileOptimizations();
  }

  handleGameSelection() {
    const gameCheckboxes = document.querySelectorAll('input[name="games"]:checked');
    this.selectedGames = Array.from(gameCheckboxes).map(cb => cb.value);
    this.updateGamesCounter();
    this.validateForm();
  }

  addParticipant() {
    const input = document.getElementById('participant-name');
    const name = input.value.trim();

    if (!name) {
      this.showError(input, 'El nombre no puede estar vacío');
      return;
    }

    if (name.length > 30) {
      this.showError(input, 'El nombre debe tener 30 caracteres o menos');
      return;
    }

    if (this.participants.includes(name)) {
      this.showError(input, 'Este participante ya está agregado');
      return;
    }

    if (this.participants.length >= this.maxParticipants) {
      this.showError(input, `Máximo ${this.maxParticipants} participantes permitidos`);
      return;
    }

    this.participants.push(name);
    input.value = '';
    this.clearError(input);
    this.renderParticipants();
    this.updateParticipantsCounter();
    this.validateForm();
  }

  removeParticipant(name) {
    const index = this.participants.indexOf(name);
    if (index > -1) {
      this.participants.splice(index, 1);
      this.renderParticipants();
      this.updateParticipantsCounter();
      this.validateForm();
    }
  }

  renderParticipants() {
    const container = document.getElementById('participants-list');
    if (!container) return;

    container.innerHTML = '';

    this.participants.forEach(name => {
      const item = document.createElement('div');
      item.className = 'participant-item';
      item.innerHTML = `
                <span class="participant-name">${this.escapeHtml(name)}</span>
                <button type="button" class="remove-participant-btn" data-name="${this.escapeHtml(name)}">
                    ❌ ELIMINAR
                </button>
            `;

      const removeBtn = item.querySelector('.remove-participant-btn');
      removeBtn.addEventListener('click', () => this.removeParticipant(name));

      container.appendChild(item);
    });
  }

  updateCounters() {
    this.updateGamesCounter();
    this.updateParticipantsCounter();
  }

  updateGamesCounter() {
    const counter = document.getElementById('selected-count');
    if (counter) {
      counter.textContent = this.selectedGames.length;
    }
  }

  updateParticipantsCounter() {
    const counter = document.getElementById('participants-count');
    const maxDisplay = document.getElementById('max-participants-display');

    if (counter) {
      counter.textContent = this.participants.length;
    }
    if (maxDisplay) {
      maxDisplay.textContent = this.maxParticipants;
    }
  }

  validateForm() {
    const nameValid = this.validateTournamentName();
    const gamesValid = this.validateGameSelection();
    const participantsValid = this.validateParticipants();
    const formatValid = this.validateTournamentFormat();

    const isValid = nameValid && gamesValid && participantsValid && formatValid;

    const submitBtn = document.getElementById('create-tournament-btn');
    if (submitBtn) {
      submitBtn.disabled = !isValid;

      // Update button text based on validation state
      if (isValid) {
        submitBtn.textContent = '🏆 CREAR TORNEO';
        submitBtn.classList.remove('validation-error');
      } else {
        submitBtn.textContent = '⚠️ COMPLETAR FORMULARIO';
        submitBtn.classList.add('validation-error');
      }
    }

    // Update form validation indicators
    this.updateValidationIndicators(nameValid, gamesValid, participantsValid, formatValid);

    return isValid;
  }

  validateTournamentName() {
    const input = document.getElementById('tournament-name');
    const name = input.value.trim();

    if (!name) {
      this.showError(input, 'El nombre del torneo es obligatorio');
      return false;
    }

    if (name.length > 50) {
      this.showError(input, 'El nombre debe tener 50 caracteres o menos');
      return false;
    }

    this.clearError(input);
    return true;
  }

  validateGameSelection() {
    if (this.selectedGames.length === 0) {
      return false;
    }
    return true;
  }

  validateParticipants() {
    if (this.participants.length < 2) {
      return false;
    }
    return true;
  }

  validateTournamentFormat() {
    const formatRadios = document.querySelectorAll('input[name="tournamentFormat"]');
    return Array.from(formatRadios).some(radio => radio.checked);
  }

  updateValidationIndicators(nameValid, gamesValid, participantsValid, formatValid) {
    // Update visual indicators for each section
    this.updateSectionIndicator('tournament-name', nameValid);
    this.updateSectionIndicator('games-label', gamesValid);
    this.updateSectionIndicator('participants-label', participantsValid);

    const formatSection = document.querySelector('.format-selection');
    if (formatSection) {
      formatSection.classList.toggle('validation-error', !formatValid);
    }
  }

  updateSectionIndicator(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (element) {
      element.classList.toggle('validation-success', isValid);
      element.classList.toggle('validation-error', !isValid);
    }
  }

  validateParticipantInput() {
    const input = document.getElementById('participant-name');
    const addBtn = document.getElementById('add-participant-btn');
    const name = input.value.trim();

    const isValid = name.length > 0 &&
      name.length <= 30 &&
      !this.participants.includes(name) &&
      this.participants.length < this.maxParticipants;

    if (addBtn) {
      addBtn.disabled = !isValid;
    }
  }

  showError(input, message) {
    this.clearError(input);
    input.classList.add('error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    input.parentNode.appendChild(errorDiv);
  }

  clearError(input) {
    input.classList.remove('error');
    const existingError = input.parentNode.querySelector('.error-message');
    if (existingError) {
      existingError.remove();
    }
  }

  showSuccess(message) {
    // Create success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--accent-green), var(--primary-cyan));
            color: var(--bg-primary);
            padding: 20px 30px;
            border-radius: 10px;
            font-family: monospace;
            font-weight: bold;
            font-size: 1.2em;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0, 255, 0, 0.5);
            animation: successPulse 3s ease-in-out;
        `;
    notification.textContent = message;

    // Add animation style if not present
    if (!document.querySelector('#success-notification-style')) {
      const style = document.createElement('style');
      style.id = 'success-notification-style';
      style.textContent = `
                @keyframes successPulse {
                    0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                    20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { transform: translate(-50%, -50%) scale(1.05); }
                }
            `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateForm()) {
      this.showError(document.getElementById('tournament-name'), 'Por favor, completa todos los campos requeridos');
      return;
    }

    const formData = new FormData(e.target);
    const tournamentConfig = this.buildTournamentConfig(formData);

    // Validate using the tournament models
    if (typeof validateTournamentConfig === 'function') {
      const validation = validateTournamentConfig(tournamentConfig);
      if (!validation.isValid) {
        this.showError(document.getElementById('tournament-name'), validation.errors[0]);
        return;
      }
    }

    this.createTournament(tournamentConfig);
  }

  buildTournamentConfig(formData) {
    return {
      name: formData.get('tournamentName').trim(),
      games: this.selectedGames,
      format: formData.get('tournamentFormat'),
      participants: this.participants.map(name => ({
        id: this.generateParticipantId(),
        name: name,
        scores: {},
        normalizedScores: {},
        totalScore: 0,
        rank: 0,
        gamesCompleted: []
      })),
      settings: {
        maxParticipants: parseInt(formData.get('maxParticipants')),
        scoreNormalization: formData.get('scoreNormalization') === 'on',
        autoAdvance: formData.get('autoAdvance') === 'on'
      }
    };
  }

  generateParticipantId() {
    return `participant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  createTournament(config) {
    try {
      // Use the TournamentManager from shared-tournament-manager.js if available
      if (typeof TournamentManager !== 'undefined') {
        const tournamentManager = new TournamentManager();
        const tournament = tournamentManager.createTournament(config);

        if (tournament) {
          this.showSuccess(`🏆 Torneo "${config.name}" creado exitosamente!`);

          // Redirect to tournament view or main page after a delay
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 2000);
        } else {
          throw new Error('No se pudo crear el torneo');
        }
      } else {
        // Fallback to custom tournament creation
        this.createCustomTournament(config);
      }
    } catch (error) {
      console.error('Error creating tournament:', error);
      this.showError(document.getElementById('tournament-name'), 'Error al crear el torneo: ' + error.message);
    }
  }

  createCustomTournament(config) {
    // Create a custom tournament object
    const tournament = {
      id: `custom-tournament-${Date.now()}`,
      name: config.name,
      games: config.games,
      format: config.format,
      participants: config.participants,
      status: 'created',
      startDate: new Date().toISOString(),
      endDate: null,
      settings: config.settings,
      version: 1,
      type: 'custom',
      createdBy: 'tournament-creation-ui'
    };

    // Save to localStorage using the tournament storage system
    if (typeof tournamentStorage !== 'undefined') {
      const tournaments = tournamentStorage.getItem('tournaments', { tournaments: {} });
      tournaments.tournaments[tournament.id] = tournament;
      tournamentStorage.setItem('tournaments', tournaments);
    } else {
      // Fallback to direct localStorage
      const storageKey = 'ai4devs-custom-tournaments';
      const existing = JSON.parse(localStorage.getItem(storageKey) || '{}');
      existing[tournament.id] = tournament;
      localStorage.setItem(storageKey, JSON.stringify(existing));
    }

    this.showSuccess(`🏆 Torneo "${config.name}" creado exitosamente!`);

    // Redirect to tournament view or main page after a delay
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 2000);
  }

  handleCancel() {
    if (confirm('¿Estás seguro de que quieres cancelar? Se perderán todos los datos ingresados.')) {
      window.location.href = 'index.html';
    }
  }

  createStars() {
    const starsContainer = document.querySelector('.stars-bg');
    if (!starsContainer) return;

    const starCount = 50;
    for (let i = 0; i < starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      starsContainer.appendChild(star);
    }
  }

  setupKeyboardNavigation() {
    // Add keyboard shortcuts for common actions
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + Enter to submit form
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        if (this.validateForm()) {
          const form = document.getElementById('tournament-form');
          if (form) {
            form.dispatchEvent(new Event('submit'));
          }
        }
      }

      // Escape to cancel
      if (e.key === 'Escape') {
        e.preventDefault();
        this.handleCancel();
      }

      // Tab navigation enhancement
      if (e.key === 'Tab') {
        this.handleTabNavigation(e);
      }
    });
  }

  handleTabNavigation(e) {
    // Ensure proper tab order and focus management
    const focusableElements = document.querySelectorAll(
      'input, select, button, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const focusedIndex = Array.from(focusableElements).indexOf(document.activeElement);

    if (e.shiftKey && focusedIndex === 0) {
      // Shift+Tab on first element - focus last element
      e.preventDefault();
      focusableElements[focusableElements.length - 1].focus();
    } else if (!e.shiftKey && focusedIndex === focusableElements.length - 1) {
      // Tab on last element - focus first element
      e.preventDefault();
      focusableElements[0].focus();
    }
  }

  setupTouchInteraction(element, callback) {
    if (!element || !callback) return;

    let touchStartTime = 0;
    let touchStartPos = { x: 0, y: 0 };
    let isTouchMove = false;

    // Touch events for better mobile interaction
    element.addEventListener('touchstart', (e) => {
      touchStartTime = Date.now();
      const touch = e.touches[0];
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      isTouchMove = false;

      // Add visual feedback
      element.style.transform = 'scale(0.98)';
      element.style.transition = 'transform 0.1s ease-out';
    }, { passive: true });

    element.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const deltaX = Math.abs(touch.clientX - touchStartPos.x);
      const deltaY = Math.abs(touch.clientY - touchStartPos.y);

      // If moved more than 10px, consider it a scroll/swipe
      if (deltaX > 10 || deltaY > 10) {
        isTouchMove = true;
        element.style.transform = 'scale(1)';
      }
    }, { passive: true });

    element.addEventListener('touchend', (e) => {
      e.preventDefault();
      element.style.transform = 'scale(1)';

      const touchDuration = Date.now() - touchStartTime;

      // Only trigger callback if it was a tap (not a scroll/swipe)
      if (!isTouchMove && touchDuration < 500) {
        callback();
      }
    });

    // Fallback for non-touch devices
    element.addEventListener('click', (e) => {
      // Only handle click if touch events aren't supported
      if (!('ontouchstart' in window)) {
        callback();
      }
    });
  }

  setupGestureSupport() {
    // Swipe gestures for navigation
    let touchStartX = 0;
    let touchStartY = 0;
    let touchEndX = 0;
    let touchEndY = 0;

    const container = document.querySelector('.tournament-creation-container');
    if (!container) return;

    container.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    container.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      this.handleGesture();
    }, { passive: true });

    // Pinch-to-zoom prevention for better UX
    container.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    });
  }

  handleGesture() {
    const deltaX = this.touchEndX - this.touchStartX;
    const deltaY = this.touchEndY - this.touchStartY;
    const minSwipeDistance = 50;

    // Horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      if (deltaX > 0) {
        // Swipe right - go back
        this.handleCancel();
      } else {
        // Swipe left - could be used for next step in future
        console.log('Swipe left detected');
      }
    }

    // Vertical swipes for scrolling sections
    if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > minSwipeDistance) {
      if (deltaY > 0) {
        // Swipe down - scroll to previous section
        this.scrollToPreviousSection();
      } else {
        // Swipe up - scroll to next section
        this.scrollToNextSection();
      }
    }
  }

  scrollToPreviousSection() {
    const sections = document.querySelectorAll('.form-group');
    const currentSection = this.getCurrentVisibleSection(sections);

    if (currentSection > 0) {
      sections[currentSection - 1].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  scrollToNextSection() {
    const sections = document.querySelectorAll('.form-group');
    const currentSection = this.getCurrentVisibleSection(sections);

    if (currentSection < sections.length - 1) {
      sections[currentSection + 1].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }

  getCurrentVisibleSection(sections) {
    const viewportHeight = window.innerHeight;
    const scrollTop = window.pageYOffset;

    for (let i = 0; i < sections.length; i++) {
      const rect = sections[i].getBoundingClientRect();
      if (rect.top >= 0 && rect.top <= viewportHeight / 2) {
        return i;
      }
    }
    return 0;
  }

  setupMobileOptimizations() {
    // Viewport height adjustment for mobile browsers
    this.adjustViewportHeight();
    window.addEventListener('resize', () => this.adjustViewportHeight());
    window.addEventListener('orientationchange', () => {
      setTimeout(() => this.adjustViewportHeight(), 500);
    });

    // Prevent zoom on input focus for iOS
    this.preventZoomOnInputFocus();

    // Optimize scroll behavior for mobile
    this.optimizeScrollBehavior();

    // Add haptic feedback for supported devices
    this.setupHapticFeedback();

    // Optimize form validation for mobile
    this.optimizeMobileValidation();
  }

  adjustViewportHeight() {
    // Fix viewport height issues on mobile browsers
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
  }

  preventZoomOnInputFocus() {
    // Add viewport meta tag to prevent zoom on input focus
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
        viewport.setAttribute('content',
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      }
    }
  }

  optimizeScrollBehavior() {
    // Smooth scrolling for form sections
    const formGroups = document.querySelectorAll('.form-group');

    formGroups.forEach((group, index) => {
      const inputs = group.querySelectorAll('input, select, textarea');

      inputs.forEach(input => {
        input.addEventListener('focus', () => {
          // Delay to allow keyboard to appear
          setTimeout(() => {
            const rect = input.getBoundingClientRect();
            const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

            if (!isVisible) {
              input.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
              });
            }
          }, 300);
        });
      });
    });
  }

  setupHapticFeedback() {
    // Add haptic feedback for supported devices
    if ('vibrate' in navigator) {
      const addHapticFeedback = (element, pattern = [10]) => {
        element.addEventListener('touchstart', () => {
          navigator.vibrate(pattern);
        });
      };

      // Add haptic feedback to interactive elements
      const interactiveElements = document.querySelectorAll(
        '.game-label, .format-label, .add-participant-btn, .create-tournament-btn'
      );

      interactiveElements.forEach(element => {
        addHapticFeedback(element);
      });

      // Different patterns for different actions
      const submitBtn = document.getElementById('create-tournament-btn');
      if (submitBtn) {
        addHapticFeedback(submitBtn, [20, 10, 20]);
      }

      const cancelBtn = document.getElementById('cancel-btn');
      if (cancelBtn) {
        addHapticFeedback(cancelBtn, [50]);
      }
    }
  }

  optimizeMobileValidation() {
    // Show validation messages in a mobile-friendly way
    const originalShowError = this.showError.bind(this);

    this.showError = (input, message) => {
      // Use native mobile validation if available
      if (input.setCustomValidity && window.innerWidth <= 768) {
        input.setCustomValidity(message);
        input.reportValidity();

        // Clear custom validity after a delay
        setTimeout(() => {
          input.setCustomValidity('');
        }, 3000);
      } else {
        originalShowError(input, message);
      }
    };

    // Optimize success messages for mobile
    const originalShowSuccess = this.showSuccess.bind(this);

    this.showSuccess = (message) => {
      if (window.innerWidth <= 768) {
        // Use a mobile-optimized success notification
        this.showMobileSuccess(message);
      } else {
        originalShowSuccess(message);
      }
    };
  }

  showMobileSuccess(message) {
    // Create mobile-optimized success notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      left: 50%;
      transform: translateX(-50%);
      background: linear-gradient(135deg, var(--accent-green), var(--primary-cyan));
      color: var(--bg-primary);
      padding: 15px 20px;
      border-radius: 8px;
      font-family: monospace;
      font-weight: bold;
      font-size: 1em;
      z-index: 10000;
      box-shadow: 0 4px 12px rgba(0, 255, 0, 0.3);
      animation: mobileSuccessSlide 3s ease-in-out;
      max-width: 90vw;
      text-align: center;
    `;
    notification.textContent = message;

    // Add mobile-specific animation
    if (!document.querySelector('#mobile-success-style')) {
      const style = document.createElement('style');
      style.id = 'mobile-success-style';
      style.textContent = `
        @keyframes mobileSuccessSlide {
          0% { opacity: 0; transform: translateX(-50%) translateY(-100%); }
          10%, 90% { opacity: 1; transform: translateX(-50%) translateY(0); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-100%); }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Add haptic feedback for success
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }

    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize the tournament creation UI
const tournamentCreationUI = new TournamentCreationUI();

// Export for testing
if (typeof window !== 'undefined') {
  window.TournamentCreationUI = TournamentCreationUI;
  window.tournamentCreationUI = tournamentCreationUI;
}
// ============================================================================
// ACCESSIBILITY FEATURES
// ============================================================================

/**
 * Setup comprehensive accessibility features
 */
setupAccessibilityFeatures() {
  this.setupKeyboardNavigation();
  this.setupScreenReaderSupport();
  this.setupFocusManagement();
  this.setupAriaLiveRegions();
  this.setupHighContrastSupport();
  this.setupReducedMotionSupport();
  this.setupFormAccessibility();
}

/**
 * Enhanced keyboard navigation for tournament creation
 */
setupKeyboardNavigation() {
  // Enhanced tab navigation
  this.setupEnhancedTabNavigation();

  // Arrow key navigation for game grid
  this.setupGameGridNavigation();

  // Keyboard shortcuts
  this.setupAccessibilityShortcuts();

  // Focus indicators
  this.enhanceFocusIndicators();

  // Skip links
  this.addSkipLinks();
}

/**
 * Setup enhanced tab navigation
 */
setupEnhancedTabNavigation() {
  const form = document.getElementById('tournament-form');
  if (!form) return;

  // Get all focusable elements in logical order
  const getFocusableElements = () => {
    return form.querySelectorAll(
      'input:not([disabled]), select:not([disabled]), textarea:not([disabled]), ' +
      'button:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
      '[role="button"]:not([aria-disabled="true"])'
    );
  };

  form.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      const focusableElements = getFocusableElements();
      const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);

      if (e.shiftKey) {
        // Shift+Tab - go to previous element
        if (currentIndex <= 0) {
          e.preventDefault();
          focusableElements[focusableElements.length - 1].focus();
        }
      } else {
        // Tab - go to next element
        if (currentIndex >= focusableElements.length - 1) {
          e.preventDefault();
          focusableElements[0].focus();
        }
      }
    }
  });
}

/**
 * Setup arrow key navigation for game selection grid
 */
setupGameGridNavigation() {
  const gamesGrid = document.querySelector('.games-grid');
  if (!gamesGrid) return;

  gamesGrid.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;

    if (activeElement.matches('input[name="games"]')) {
      const gameInputs = Array.from(gamesGrid.querySelectorAll('input[name="games"]'));
      const currentIndex = gameInputs.indexOf(activeElement);
      let newIndex = currentIndex;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : gameInputs.length - 1;
          break;

        case 'ArrowRight':
          e.preventDefault();
          newIndex = currentIndex < gameInputs.length - 1 ? currentIndex + 1 : 0;
          break;

        case 'ArrowUp':
          e.preventDefault();
          // Move up one row (assuming 2-3 games per row)
          const gamesPerRow = window.innerWidth <= 768 ? 2 : 5;
          newIndex = currentIndex - gamesPerRow;
          if (newIndex < 0) newIndex = currentIndex;
          break;

        case 'ArrowDown':
          e.preventDefault();
          // Move down one row
          const gamesPerRowDown = window.innerWidth <= 768 ? 2 : 5;
          newIndex = currentIndex + gamesPerRowDown;
          if (newIndex >= gameInputs.length) newIndex = currentIndex;
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = gameInputs.length - 1;
          break;
      }

      if (newIndex !== currentIndex) {
        gameInputs[newIndex].focus();

        // Announce game name to screen readers
        const gameLabel = gameInputs[newIndex].nextElementSibling;
        const gameName = gameLabel.querySelector('.game-name').textContent;
        const isSelected = gameInputs[newIndex].checked ? 'seleccionado' : 'no seleccionado';
        this.announceToScreenReader(`${gameName}, ${isSelected}`);
      }
    }
  });
}

/**
 * Setup accessibility keyboard shortcuts
 */
setupAccessibilityShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt + S: Submit form (if valid)
    if (e.altKey && e.key === 's') {
      e.preventDefault();
      if (this.validateForm()) {
        const form = document.getElementById('tournament-form');
        if (form) {
          form.dispatchEvent(new Event('submit'));
        }
      } else {
        this.announceToScreenReader('Formulario incompleto. Por favor, completa todos los campos requeridos.');
      }
    }

    // Alt + C: Cancel
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      this.handleCancel();
    }

    // Alt + 1: Focus tournament name
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const nameInput = document.getElementById('tournament-name');
      if (nameInput) {
        nameInput.focus();
        this.announceToScreenReader('Navegando a nombre del torneo');
      }
    }

    // Alt + 2: Focus game selection
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const firstGame = document.querySelector('input[name="games"]');
      if (firstGame) {
        firstGame.focus();
        this.announceToScreenReader('Navegando a selección de juegos');
      }
    }

    // Alt + 3: Focus participants
    if (e.altKey && e.key === '3') {
      e.preventDefault();
      const participantInput = document.getElementById('participant-name');
      if (participantInput) {
        participantInput.focus();
        this.announceToScreenReader('Navegando a participantes');
      }
    }
  });
}

/**
 * Add skip links for screen reader users
 */
addSkipLinks() {
  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';
  skipLinks.innerHTML = `
    <a href="#tournament-name" class="skip-link">Saltar a nombre del torneo</a>
    <a href="#format-round-robin" class="skip-link">Saltar a formato</a>
    <a href="#game-snake" class="skip-link">Saltar a selección de juegos</a>
    <a href="#participant-name" class="skip-link">Saltar a participantes</a>
    <a href="#create-tournament-btn" class="skip-link">Saltar a crear torneo</a>
  `;

  // Add skip link styles
  const style = document.createElement('style');
  style.textContent = `
    .skip-links {
      position: absolute;
      top: -40px;
      left: 6px;
      z-index: 10001;
    }

    .skip-link {
      position: absolute;
      left: -10000px;
      top: auto;
      width: 1px;
      height: 1px;
      overflow: hidden;
      background: var(--primary-cyan);
      color: var(--bg-primary);
      padding: 8px 16px;
      text-decoration: none;
      font-weight: bold;
      border-radius: 4px;
      font-family: var(--font-main);
    }

    .skip-link:focus {
      position: static;
      width: auto;
      height: auto;
      left: auto;
      top: auto;
      overflow: visible;
    }
  `;

  document.head.appendChild(style);
  document.body.insertBefore(skipLinks, document.body.firstChild);
}

/**
 * Enhance focus indicators for better visibility
 */
enhanceFocusIndicators() {
  const style = document.createElement('style');
  style.textContent = `
    /* Enhanced focus indicators */
    *:focus {
      outline: 3px solid var(--primary-cyan) !important;
      outline-offset: 2px !important;
      box-shadow: 0 0 0 1px var(--bg-primary), 0 0 0 4px var(--primary-cyan) !important;
    }

    /* High contrast focus for form elements */
    input:focus,
    select:focus,
    textarea:focus {
      border-color: var(--primary-cyan) !important;
      background: rgba(0, 255, 255, 0.1) !important;
    }

    /* Focus for game labels */
    .game-label:focus-within,
    .format-label:focus-within {
      outline: 3px solid var(--primary-cyan) !important;
      outline-offset: 2px !important;
      background: rgba(0, 255, 255, 0.1) !important;
    }

    /* Focus for buttons */
    button:focus,
    .add-participant-btn:focus,
    .remove-participant-btn:focus,
    .cancel-btn:focus,
    .create-tournament-btn:focus {
      background: var(--primary-cyan) !important;
      color: var(--bg-primary) !important;
      border-color: var(--primary-cyan) !important;
    }

    /* Skip link focus */
    .skip-link:focus {
      outline: 3px solid var(--bg-primary) !important;
      outline-offset: 2px !important;
    }
  `;

  document.head.appendChild(style);
}

/**
 * Setup screen reader support
 */
setupScreenReaderSupport() {
  // Create live region for announcements
  this.createLiveRegion();

  // Setup form validation announcements
  this.setupValidationAnnouncements();

  // Add descriptive text for complex elements
  this.addDescriptiveText();

  // Setup dynamic content announcements
  this.setupDynamicAnnouncements();
}

/**
 * Create ARIA live region for screen reader announcements
 */
createLiveRegion() {
  const liveRegion = document.createElement('div');
  liveRegion.id = 'sr-live-region';
  liveRegion.setAttribute('aria-live', 'polite');
  liveRegion.setAttribute('aria-atomic', 'true');
  liveRegion.className = 'sr-only';

  document.body.appendChild(liveRegion);
}

/**
 * Announce message to screen readers
 */
announceToScreenReader(message) {
  const liveRegion = document.getElementById('sr-live-region');
  if (liveRegion) {
    liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      liveRegion.textContent = '';
    }, 1000);
  }
}

/**
 * Setup form validation announcements
 */
setupValidationAnnouncements() {
  // Override showError to announce errors
  const originalShowError = this.showError.bind(this);
  this.showError = (input, message) => {
    originalShowError(input, message);

    // Announce error to screen readers
    this.announceToScreenReader(`Error: ${message}`);

    // Update aria-invalid
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', input.id + '-error');

    // Add error ID to error message
    const errorElement = input.parentNode.querySelector('.error-message');
    if (errorElement) {
      errorElement.id = input.id + '-error';
    }
  };

  // Override clearError to clear aria attributes
  const originalClearError = this.clearError.bind(this);
  this.clearError = (input) => {
    originalClearError(input);

    // Clear aria attributes
    input.setAttribute('aria-invalid', 'false');
    input.removeAttribute('aria-describedby');
  };

  // Announce successful validation
  const originalValidateForm = this.validateForm.bind(this);
  this.validateForm = () => {
    const isValid = originalValidateForm();

    if (isValid) {
      this.announceToScreenReader('Formulario válido. Listo para crear torneo.');
    }

    return isValid;
  };
}

/**
 * Add descriptive text for complex elements
 */
addDescriptiveText() {
  // Add descriptions for game selection
  const gameLabels = document.querySelectorAll('.game-label');
  gameLabels.forEach(label => {
    const gameName = label.querySelector('.game-name').textContent;
    const checkbox = label.previousElementSibling;

    label.setAttribute('aria-label', `Seleccionar ${gameName} para el torneo`);
    checkbox.setAttribute('aria-describedby', checkbox.id + '-desc');

    // Add hidden description
    const desc = document.createElement('div');
    desc.id = checkbox.id + '-desc';
    desc.className = 'sr-only';
    desc.textContent = `Incluir ${gameName} en el torneo`;
    label.appendChild(desc);
  });

  // Add descriptions for format selection
  const formatLabels = document.querySelectorAll('.format-label');
  formatLabels.forEach(label => {
    const formatTitle = label.querySelector('h3').textContent;
    const formatDesc = label.querySelector('p').textContent;
    const radio = label.previousElementSibling;

    label.setAttribute('aria-label', `${formatTitle}: ${formatDesc}`);
    radio.setAttribute('aria-describedby', radio.id + '-desc');
  });

  // Add descriptions for participant management
  const participantInput = document.getElementById('participant-name');
  if (participantInput) {
    participantInput.setAttribute('aria-describedby', 'participant-help');

    const helpText = document.createElement('div');
    helpText.id = 'participant-help';
    helpText.className = 'sr-only';
    helpText.textContent = 'Ingresa el nombre de un participante y presiona Agregar o Enter';
    participantInput.parentNode.appendChild(helpText);
  }
}

/**
 * Setup dynamic content announcements
 */
setupDynamicAnnouncements() {
  // Announce game selection changes
  const originalHandleGameSelection = this.handleGameSelection.bind(this);
  this.handleGameSelection = () => {
    originalHandleGameSelection();

    const selectedCount = this.selectedGames.length;
    this.announceToScreenReader(`${selectedCount} juegos seleccionados`);
  };

  // Announce participant additions
  const originalAddParticipant = this.addParticipant.bind(this);
  this.addParticipant = () => {
    const participantsBefore = this.participants.length;
    originalAddParticipant();

    if (this.participants.length > participantsBefore) {
      const newParticipant = this.participants[this.participants.length - 1];
      this.announceToScreenReader(`${newParticipant} agregado. Total: ${this.participants.length} participantes`);
    }
  };

  // Announce participant removals
  const originalRemoveParticipant = this.removeParticipant.bind(this);
  this.removeParticipant = (name) => {
    originalRemoveParticipant(name);
    this.announceToScreenReader(`${name} eliminado. Total: ${this.participants.length} participantes`);
  };
}

/**
 * Setup focus management
 */
setupFocusManagement() {
  // Focus management for dynamic participant list
  const originalRenderParticipants = this.renderParticipants.bind(this);
  this.renderParticipants = () => {
    const focusedParticipant = document.activeElement.closest('.participant-item');
    const focusedName = focusedParticipant ?
      focusedParticipant.querySelector('.participant-name').textContent : null;

    originalRenderParticipants();

    // Restore focus if possible
    if (focusedName) {
      const newFocusTarget = Array.from(document.querySelectorAll('.participant-item'))
        .find(item => item.querySelector('.participant-name').textContent === focusedName);

      if (newFocusTarget) {
        newFocusTarget.querySelector('.remove-participant-btn').focus();
      }
    }
  };

  // Focus management for form submission
  const originalHandleFormSubmit = this.handleFormSubmit.bind(this);
  this.handleFormSubmit = (e) => {
    e.preventDefault();

    if (!this.validateForm()) {
      // Focus first invalid field
      const firstInvalid = document.querySelector('input.error, select.error');
      if (firstInvalid) {
        firstInvalid.focus();
        this.announceToScreenReader('Por favor, corrige los errores en el formulario');
      }
      return;
    }

    originalHandleFormSubmit(e);
  };
}

/**
 * Setup ARIA live regions
 */
setupAriaLiveRegions() {
  // Make counters live regions
  const gamesCounter = document.getElementById('selected-count');
  if (gamesCounter) {
    gamesCounter.setAttribute('aria-live', 'polite');
    gamesCounter.setAttribute('aria-atomic', 'true');
  }

  const participantsCounter = document.getElementById('participants-count');
  if (participantsCounter) {
    participantsCounter.setAttribute('aria-live', 'polite');
    participantsCounter.setAttribute('aria-atomic', 'true');
  }

  // Make participant list a live region
  const participantsList = document.getElementById('participants-list');
  if (participantsList) {
    participantsList.setAttribute('aria-live', 'polite');
    participantsList.setAttribute('aria-atomic', 'false');
  }
}

/**
 * Setup form accessibility features
 */
setupFormAccessibility() {
  // Add form instructions
  this.addFormInstructions();

  // Setup fieldset and legend relationships
  this.setupFieldsetRelationships();

  // Add required field indicators
  this.addRequiredFieldIndicators();

  // Setup error summary
  this.setupErrorSummary();
}

/**
 * Add form instructions for screen readers
 */
addFormInstructions() {
  const form = document.getElementById('tournament-form');
  if (!form) return;

  const instructions = document.createElement('div');
  instructions.id = 'form-instructions';
  instructions.className = 'sr-only';
  instructions.innerHTML = `
    <h2>Instrucciones del formulario</h2>
    <p>Complete este formulario para crear un nuevo torneo. Los campos marcados con asterisco son obligatorios.</p>
    <p>Use las teclas de flecha para navegar por la selección de juegos.</p>
    <p>Atajos de teclado: Alt+S para enviar, Alt+C para cancelar, Alt+1/2/3 para navegar a secciones.</p>
  `;

  form.insertBefore(instructions, form.firstChild);
  form.setAttribute('aria-describedby', 'form-instructions');
}

/**
 * Setup fieldset and legend relationships
 */
setupFieldsetRelationships() {
  // Ensure all fieldsets have proper legends
  const fieldsets = document.querySelectorAll('fieldset');
  fieldsets.forEach(fieldset => {
    const legend = fieldset.querySelector('legend');
    if (legend) {
      legend.setAttribute('id', legend.id || `legend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);
      fieldset.setAttribute('aria-labelledby', legend.id);
    }
  });
}

/**
 * Add required field indicators
 */
addRequiredFieldIndicators() {
  const requiredFields = document.querySelectorAll('input[required], select[required]');
  requiredFields.forEach(field => {
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label && !label.textContent.includes('*')) {
      label.innerHTML += ' <span aria-label="obligatorio">*</span>';
    }

    field.setAttribute('aria-required', 'true');
  });
}

/**
 * Setup error summary for form validation
 */
setupErrorSummary() {
  const form = document.getElementById('tournament-form');
  if (!form) return;

  // Create error summary container
  const errorSummary = document.createElement('div');
  errorSummary.id = 'error-summary';
  errorSummary.className = 'error-summary sr-only';
  errorSummary.setAttribute('aria-live', 'assertive');
  errorSummary.setAttribute('role', 'alert');

  form.insertBefore(errorSummary, form.firstChild);

  // Update error summary when validation fails
  const originalValidateForm = this.validateForm.bind(this);
  this.validateForm = () => {
    const isValid = originalValidateForm();

    if (!isValid) {
      this.updateErrorSummary();
    } else {
      this.clearErrorSummary();
    }

    return isValid;
  };
}

/**
 * Update error summary with current validation errors
 */
updateErrorSummary() {
  const errorSummary = document.getElementById('error-summary');
  if (!errorSummary) return;

  const errors = [];

  // Check tournament name
  const nameInput = document.getElementById('tournament-name');
  if (!this.validateTournamentName()) {
    errors.push('Nombre del torneo es obligatorio');
  }

  // Check game selection
  if (this.selectedGames.length === 0) {
    errors.push('Debe seleccionar al menos un juego');
  }

  // Check participants
  if (this.participants.length < 2) {
    errors.push('Debe agregar al menos 2 participantes');
  }

  // Check format selection
  if (!this.validateTournamentFormat()) {
    errors.push('Debe seleccionar un formato de torneo');
  }

  if (errors.length > 0) {
    errorSummary.innerHTML = `
      <h2>Errores en el formulario (${errors.length})</h2>
      <ul>
        ${errors.map(error => `<li>${error}</li>`).join('')}
      </ul>
    `;
    errorSummary.classList.remove('sr-only');
    errorSummary.focus();
  }
}

/**
 * Clear error summary
 */
clearErrorSummary() {
  const errorSummary = document.getElementById('error-summary');
  if (errorSummary) {
    errorSummary.innerHTML = '';
    errorSummary.classList.add('sr-only');
  }
}

/**
 * Setup high contrast mode support
 */
setupHighContrastSupport() {
  const isHighContrast = window.matchMedia('(prefers-contrast: high)').matches;

  if (isHighContrast) {
    document.body.classList.add('high-contrast');

    const style = document.createElement('style');
    style.textContent = `
      .high-contrast {
        --primary-cyan: #ffffff !important;
        --primary-magenta: #ffffff !important;
        --primary-yellow: #ffffff !important;
        --accent-green: #ffffff !important;
        --accent-red: #ffffff !important;
        --bg-primary: #000000 !important;
        --bg-secondary: #000000 !important;
        --bg-card: #000000 !important;
      }

      .high-contrast .tournament-form-section {
        border: 3px solid #ffffff !important;
        background: #000000 !important;
      }

      .high-contrast .game-label,
      .high-contrast .format-label,
      .high-contrast .setting-item,
      .high-contrast .participant-item {
        border: 2px solid #ffffff !important;
        background: #000000 !important;
      }

      .high-contrast input,
      .high-contrast select,
      .high-contrast button {
        border: 2px solid #ffffff !important;
        background: #000000 !important;
        color: #ffffff !important;
      }

      .high-contrast input:focus,
      .high-contrast select:focus,
      .high-contrast button:focus {
        background: #ffffff !important;
        color: #000000 !important;
      }
    `;

    document.head.appendChild(style);
  }
}

/**
 * Setup reduced motion support
 */
setupReducedMotionSupport() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    document.body.classList.add('reduced-motion');

    const style = document.createElement('style');
    style.textContent = `
      .reduced-motion * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
        scroll-behavior: auto !important;
      }

      .reduced-motion .form-group {
        animation: none !important;
      }

      .reduced-motion .participant-item {
        animation: none !important;
      }

      .reduced-motion .game-label:hover,
      .reduced-motion .format-label:hover,
      .reduced-motion button:hover {
        transform: none !important;
      }
    `;

    document.head.appendChild(style);
  }
}

// Initialize accessibility features when the class is instantiated
const originalCreationInit = TournamentCreationUI.prototype.init;
TournamentCreationUI.prototype.init = function () {
  originalCreationInit.call(this);
  this.setupAccessibilityFeatures();
};
