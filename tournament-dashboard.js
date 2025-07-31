/* © GG, MIT License */

/**
 * Tournament Dashboard Interface
 *
 * Real-time tournament dashboard with:
 * - Live leaderboard updates
 * - Tournament progress tracking
 * - Game status monitoring
 * - 60fps performance optimization
 * - Mobile-responsive design
 */

class TournamentDashboard {
  constructor() {
    this.tournamentManager = null;
    this.currentTournament = null;
    this.updateInterval = null;
    this.leaderboardView = 'overall';
    this.isUpdating = false;
    this.lastUpdateTime = 0;
    this.animationFrameId = null;

    // Performance optimization
    this.updateThrottle = 100; // Minimum ms between updates
    this.maxFPS = 60;
    this.frameTime = 1000 / this.maxFPS;

    // Initialize after DOM is loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    try {
      this.initializeTournamentManager();
      this.setupEventListeners();
      this.loadTournamentData();
      this.startRealTimeUpdates();
      this.createStars();

      console.log('🏆 Tournament Dashboard initialized');
    } catch (error) {
      console.error('Failed to initialize Tournament Dashboard:', error);
      this.showError('Error al inicializar el dashboard del torneo');
    }
  }

  initializeTournamentManager() {
    if (typeof TournamentManager !== 'undefined') {
      this.tournamentManager = new TournamentManager();
    } else {
      throw new Error('TournamentManager not available');
    }
  }

  setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refresh-leaderboard');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => this.refreshLeaderboard());
    }

    // View toggle buttons
    const viewToggleButtons = document.querySelectorAll('.toggle-btn');
    viewToggleButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.switchLeaderboardView(e.target.dataset.view));
    });

    // Action buttons
    this.setupActionButtons();

    // Modal controls
    this.setupModalControls();

    // Keyboard shortcuts
    this.setupKeyboardShortcuts();

    // Window events
    window.addEventListener('focus', () => this.onWindowFocus());
    window.addEventListener('blur', () => this.onWindowBlur());
    window.addEventListener('beforeunload', () => this.cleanup());

    // Tournament events
    this.setupTournamentEventListeners();
  }

  setupActionButtons() {
    const joinBtn = document.getElementById('join-tournament-btn');
    const leaveBtn = document.getElementById('leave-tournament-btn');
    const rulesBtn = document.getElementById('view-rules-btn');
    const exportBtn = document.getElementById('export-results-btn');

    if (joinBtn) {
      joinBtn.addEventListener('click', () => this.showJoinTournamentModal());
    }

    if (leaveBtn) {
      leaveBtn.addEventListener('click', () => this.showLeaveTournamentModal());
    }

    if (rulesBtn) {
      rulesBtn.addEventListener('click', () => this.showTournamentRules());
    }

    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportTournamentResults());
    }
  }

  setupModalControls() {
    const modalOverlay = document.getElementById('modal-overlay');
    const modalClose = document.getElementById('modal-close');

    if (modalClose) {
      modalClose.addEventListener('click', () => this.closeModal());
    }

    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.closeModal();
        }
      });
    }
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // R key to refresh
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey) {
          e.preventDefault();
          this.refreshLeaderboard();
        }
      }

      // Escape to close modal
      if (e.key === 'Escape') {
        this.closeModal();
      }

      // Tab navigation for leaderboard views
      if (e.key === 'Tab' && e.ctrlKey) {
        e.preventDefault();
        this.switchLeaderboardView(this.leaderboardView === 'overall' ? 'current-round' : 'overall');
      }
    });
  }

  setupTournamentEventListeners() {
    // Listen for tournament events
    window.addEventListener('tournament:updated', (e) => {
      this.onTournamentUpdated(e.detail);
    });

    window.addEventListener('tournament:participant-joined', (e) => {
      this.onParticipantJoined(e.detail);
    });

    window.addEventListener('tournament:participant-left', (e) => {
      this.onParticipantLeft(e.detail);
    });

    window.addEventListener('tournament:completed', (e) => {
      this.onTournamentCompleted(e.detail);
    });
  }

  // ============================================================================
  // TOURNAMENT DATA MANAGEMENT
  // ============================================================================

  loadTournamentData() {
    try {
      // Get tournament ID from URL parameters or use active tournament
      const urlParams = new URLSearchParams(window.location.search);
      const tournamentId = urlParams.get('tournament') || this.getActiveTournamentId();

      if (tournamentId) {
        this.currentTournament = this.tournamentManager.getTournament(tournamentId);
        if (this.currentTournament) {
          this.updateTournamentInfo();
          this.updateTournamentProgress();
          this.updateLeaderboard();
          this.updateGamesStatus();
          this.updateTimeline();
          this.updateActionButtons();
        } else {
          this.showError('Torneo no encontrado');
        }
      } else {
        this.showNoTournamentMessage();
      }
    } catch (error) {
      console.error('Error loading tournament data:', error);
      this.showError('Error al cargar los datos del torneo');
    }
  }

  getActiveTournamentId() {
    // Get the most recent active tournament
    const tournaments = this.tournamentManager.getAllTournaments({ status: 'active' });
    return tournaments.length > 0 ? tournaments[0].id : null;
  }

  startRealTimeUpdates() {
    // Use requestAnimationFrame for smooth 60fps updates
    const update = (timestamp) => {
      if (timestamp - this.lastUpdateTime >= this.frameTime) {
        if (!this.isUpdating) {
          this.performUpdate();
        }
        this.lastUpdateTime = timestamp;
      }
      this.animationFrameId = requestAnimationFrame(update);
    };

    this.animationFrameId = requestAnimationFrame(update);
  }

  performUpdate() {
    if (!this.currentTournament) return;

    this.isUpdating = true;

    try {
      // Reload tournament data
      const updatedTournament = this.tournamentManager.getTournament(this.currentTournament.id);

      if (updatedTournament && this.hasDataChanged(updatedTournament)) {
        this.currentTournament = updatedTournament;
        this.updateTournamentProgress();
        this.updateLeaderboard();
        this.updateGamesStatus();
      }
    } catch (error) {
      console.error('Error during real-time update:', error);
    } finally {
      this.isUpdating = false;
    }
  }

  hasDataChanged(newTournament) {
    if (!this.currentTournament) return true;

    // Check if participants or scores have changed
    const oldParticipants = JSON.stringify(this.currentTournament.participants);
    const newParticipants = JSON.stringify(newTournament.participants);

    return oldParticipants !== newParticipants ||
      this.currentTournament.updatedAt !== newTournament.updatedAt;
  }

  // ============================================================================
  // UI UPDATE METHODS
  // ============================================================================

  updateTournamentInfo() {
    const nameElement = document.getElementById('tournament-name');
    const statusElement = document.getElementById('status-text');
    const indicatorElement = document.getElementById('status-indicator');

    if (nameElement) {
      nameElement.textContent = this.currentTournament.name;
    }

    if (statusElement && indicatorElement) {
      const statusInfo = this.getTournamentStatusInfo();
      statusElement.textContent = statusInfo.text;
      indicatorElement.textContent = statusInfo.icon;
    }
  }

  getTournamentStatusInfo() {
    switch (this.currentTournament.status) {
      case 'created':
        return { text: 'ESPERANDO PARTICIPANTES', icon: '⏳' };
      case 'active':
        return { text: 'EN PROGRESO', icon: '🔥' };
      case 'completed':
        return { text: 'COMPLETADO', icon: '🏆' };
      default:
        return { text: 'DESCONOCIDO', icon: '❓' };
    }
  }

  updateTournamentProgress() {
    const participantsCount = document.getElementById('participants-count');
    const gamesCompleted = document.getElementById('games-completed');
    const gamesRemaining = document.getElementById('games-remaining');
    const tournamentProgress = document.getElementById('tournament-progress');
    const progressFill = document.getElementById('progress-fill');

    if (!this.currentTournament) return;

    const stats = this.calculateTournamentStats();

    if (participantsCount) {
      this.animateNumber(participantsCount, stats.participantsCount);
    }

    if (gamesCompleted) {
      this.animateNumber(gamesCompleted, stats.gamesCompleted);
    }

    if (gamesRemaining) {
      this.animateNumber(gamesRemaining, stats.gamesRemaining);
    }

    if (tournamentProgress) {
      tournamentProgress.textContent = `${Math.round(stats.progressPercentage)}%`;
    }

    if (progressFill) {
      progressFill.style.width = `${stats.progressPercentage}%`;
    }
  }

  calculateTournamentStats() {
    const participantsCount = this.currentTournament.participants.length;
    const totalGames = this.currentTournament.games.length;
    const totalPossibleGames = participantsCount * totalGames;

    let gamesCompleted = 0;
    this.currentTournament.participants.forEach(participant => {
      gamesCompleted += participant.gamesCompleted.length;
    });

    const gamesRemaining = Math.max(0, totalPossibleGames - gamesCompleted);
    const progressPercentage = totalPossibleGames > 0 ? (gamesCompleted / totalPossibleGames) * 100 : 0;

    return {
      participantsCount,
      gamesCompleted,
      gamesRemaining,
      progressPercentage
    };
  }

  updateLeaderboard() {
    const container = document.getElementById('leaderboard-container');
    if (!container || !this.currentTournament) return;

    const leaderboard = this.getLeaderboardData();

    if (leaderboard.length === 0) {
      container.innerHTML = `
        <div class="leaderboard-loading">
          <div>No hay participantes en el torneo</div>
        </div>
      `;
      return;
    }

    const tableHTML = this.generateLeaderboardTable(leaderboard);
    container.innerHTML = tableHTML;
  }

  getLeaderboardData() {
    if (!this.currentTournament) return [];

    return this.currentTournament.participants
      .map(participant => ({
        ...participant,
        gamesCompletedCount: participant.gamesCompleted.length
      }))
      .sort((a, b) => {
        // Sort by total score, then by games completed
        if (b.totalScore !== a.totalScore) {
          return b.totalScore - a.totalScore;
        }
        return b.gamesCompletedCount - a.gamesCompletedCount;
      })
      .map((participant, index) => ({
        ...participant,
        rank: index + 1
      }));
  }

  generateLeaderboardTable(leaderboard) {
    const headerHTML = `
      <table class="leaderboard-table">
        <thead class="leaderboard-header">
          <tr>
            <th>POSICIÓN</th>
            <th>JUGADOR</th>
            <th>PUNTUACIÓN</th>
            <th>JUEGOS</th>
          </tr>
        </thead>
        <tbody>
    `;

    const rowsHTML = leaderboard.map(participant => {
      const rankClass = participant.rank <= 3 ? `rank-${participant.rank}` : '';
      const rankIcon = this.getRankIcon(participant.rank);

      return `
        <tr class="leaderboard-row" style="animation-delay: ${participant.rank * 0.1}s">
          <td class="rank-cell ${rankClass}">${rankIcon} ${participant.rank}</td>
          <td class="player-name">${this.escapeHtml(participant.name)}</td>
          <td class="score-cell">${participant.totalScore.toLocaleString()}</td>
          <td class="games-completed-cell">${participant.gamesCompletedCount}/${this.currentTournament.games.length}</td>
        </tr>
      `;
    }).join('');

    return headerHTML + rowsHTML + '</tbody></table>';
  }

  getRankIcon(rank) {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '#';
    }
  }

  updateGamesStatus() {
    const gamesGrid = document.getElementById('games-grid');
    if (!gamesGrid || !this.currentTournament) return;

    const gamesHTML = this.currentTournament.games.map(gameId => {
      const gameInfo = this.getGameInfo(gameId);
      const gameStats = this.getGameStats(gameId);

      return `
        <div class="game-status-card">
          <div class="game-icon" style="color: ${gameInfo.color}">${gameInfo.icon}</div>
          <div class="game-name">${gameInfo.name}</div>
          <div class="game-progress">${gameStats.completed}/${gameStats.total} completados</div>
          <div class="game-status-indicator ${gameStats.statusClass}">
            ${gameStats.statusText}
          </div>
        </div>
      `;
    }).join('');

    gamesGrid.innerHTML = gamesHTML;
  }

  getGameInfo(gameId) {
    const gameMap = {
      'snake-GG': { name: 'SNAKE', icon: '🐍', color: 'var(--accent-green)' },
      'breakout-GG': { name: 'BREAKOUT', icon: '🧱', color: 'var(--accent-orange)' },
      'fruit-catcher-GG': { name: 'FRUIT CATCHER', icon: '🍎', color: 'var(--accent-red)' },
      'asteroids-GG': { name: 'ASTEROIDS', icon: '🚀', color: 'var(--primary-cyan)' },
      'space-invaders-GG': { name: 'SPACE INVADERS', icon: '👾', color: 'var(--accent-green)' },
      'pacman-GG': { name: 'PAC-MAN', icon: '🟡', color: 'var(--primary-yellow)' },
      'mspacman-GG': { name: 'MS. PAC-MAN', icon: '💗', color: '#ff69b4' },
      'tetris-GG': { name: 'TETRIS', icon: '🧩', color: 'var(--primary-magenta)' },
      'pong-GG': { name: 'PONG', icon: '🏓', color: 'var(--primary-cyan)' },
      'galaga-GG': { name: 'GALAGA', icon: '🚀', color: 'var(--accent-green)' }
    };

    return gameMap[gameId] || { name: gameId, icon: '🎮', color: 'var(--primary-cyan)' };
  }

  getGameStats(gameId) {
    const totalParticipants = this.currentTournament.participants.length;
    const completedCount = this.currentTournament.participants.filter(
      participant => participant.gamesCompleted.includes(gameId)
    ).length;

    let statusClass, statusText;
    if (completedCount === 0) {
      statusClass = 'status-pending';
      statusText = 'PENDIENTE';
    } else if (completedCount === totalParticipants) {
      statusClass = 'status-completed';
      statusText = 'COMPLETADO';
    } else {
      statusClass = 'status-active';
      statusText = 'EN PROGRESO';
    }

    return {
      completed: completedCount,
      total: totalParticipants,
      statusClass,
      statusText
    };
  }

  updateTimeline() {
    const timelineContainer = document.getElementById('timeline-container');
    if (!timelineContainer || !this.currentTournament) return;

    const events = this.generateTimelineEvents();
    const timelineHTML = events.map(event => `
      <div class="timeline-item">
        <div class="timeline-icon">${event.icon}</div>
        <div class="timeline-content">
          <div class="timeline-title">${event.title}</div>
          <div class="timeline-description">${event.description}</div>
          <div class="timeline-time">${event.time}</div>
        </div>
      </div>
    `).join('');

    timelineContainer.innerHTML = timelineHTML;
  }

  generateTimelineEvents() {
    const events = [];

    // Tournament creation
    events.push({
      icon: '🏆',
      title: 'Torneo Creado',
      description: `Torneo "${this.currentTournament.name}" creado con ${this.currentTournament.games.length} juegos`,
      time: this.formatTime(this.currentTournament.startDate)
    });

    // Participant joins (show last few)
    const recentJoins = this.currentTournament.participants
      .filter(p => p.joinedAt)
      .sort((a, b) => new Date(b.joinedAt) - new Date(a.joinedAt))
      .slice(0, 3);

    recentJoins.forEach(participant => {
      events.push({
        icon: '👤',
        title: 'Nuevo Participante',
        description: `${participant.name} se unió al torneo`,
        time: this.formatTime(participant.joinedAt)
      });
    });

    // Tournament status changes
    if (this.currentTournament.status === 'active') {
      events.push({
        icon: '🚀',
        title: 'Torneo Iniciado',
        description: 'El torneo ha comenzado oficialmente',
        time: this.formatTime(this.currentTournament.startDate)
      });
    }

    if (this.currentTournament.status === 'completed') {
      events.push({
        icon: '🎉',
        title: 'Torneo Completado',
        description: 'El torneo ha finalizado',
        time: this.formatTime(this.currentTournament.endDate)
      });
    }

    return events.sort((a, b) => new Date(b.time) - new Date(a.time));
  }

  updateActionButtons() {
    const joinBtn = document.getElementById('join-tournament-btn');
    const leaveBtn = document.getElementById('leave-tournament-btn');

    if (!this.currentTournament) return;

    const playerId = this.getPlayerId();
    const isParticipant = this.currentTournament.participants.some(p => p.id === playerId);

    if (joinBtn) {
      joinBtn.style.display = isParticipant ? 'none' : 'block';
      joinBtn.disabled = this.currentTournament.status !== 'created';
    }

    if (leaveBtn) {
      leaveBtn.style.display = isParticipant ? 'block' : 'none';
      leaveBtn.disabled = this.currentTournament.status === 'completed';
    }
  }

  // ============================================================================
  // USER INTERACTIONS
  // ============================================================================

  refreshLeaderboard() {
    const refreshBtn = document.getElementById('refresh-leaderboard');
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '🔄 ACTUALIZANDO...';
    }

    setTimeout(() => {
      this.loadTournamentData();

      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '🔄 ACTUALIZAR';
      }
    }, 500);
  }

  switchLeaderboardView(view) {
    this.leaderboardView = view;

    // Update toggle buttons
    document.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });

    // Update leaderboard display
    this.updateLeaderboard();
  }

  showJoinTournamentModal() {
    const modal = this.createModal(
      'Unirse al Torneo',
      `
        <p>¿Deseas unirte al torneo "${this.currentTournament.name}"?</p>
        <div style="margin: 20px 0;">
          <label for="player-name-input" style="display: block; margin-bottom: 10px; color: var(--primary-cyan);">
            Nombre del jugador:
          </label>
          <input type="text" id="player-name-input" placeholder="Ingresa tu nombre"
                 style="width: 100%; padding: 10px; background: rgba(0,0,0,0.5); border: 2px solid var(--primary-cyan); border-radius: 5px; color: white; font-family: var(--font-main);">
        </div>
      `,
      [
        {
          text: 'CANCELAR',
          class: 'secondary',
          action: () => this.closeModal()
        },
        {
          text: 'UNIRSE',
          class: 'primary',
          action: () => this.joinTournament()
        }
      ]
    );

    this.showModal(modal);

    // Focus on input
    setTimeout(() => {
      const input = document.getElementById('player-name-input');
      if (input) input.focus();
    }, 100);
  }

  joinTournament() {
    const input = document.getElementById('player-name-input');
    const playerName = input ? input.value.trim() : '';

    if (!playerName) {
      this.showError('Por favor, ingresa tu nombre');
      return;
    }

    const playerId = this.getPlayerId();
    const success = this.tournamentManager.joinTournament(
      this.currentTournament.id,
      playerId,
      playerName
    );

    if (success) {
      this.closeModal();
      this.showSuccess('¡Te has unido al torneo exitosamente!');
      this.loadTournamentData();
    } else {
      this.showError('No se pudo unir al torneo');
    }
  }

  showLeaveTournamentModal() {
    const modal = this.createModal(
      'Abandonar Torneo',
      `
        <p>¿Estás seguro de que deseas abandonar el torneo "${this.currentTournament.name}"?</p>
        <p style="color: var(--accent-red); font-size: 0.9em;">Esta acción no se puede deshacer.</p>
      `,
      [
        {
          text: 'CANCELAR',
          class: 'secondary',
          action: () => this.closeModal()
        },
        {
          text: 'ABANDONAR',
          class: 'danger',
          action: () => this.leaveTournament()
        }
      ]
    );

    this.showModal(modal);
  }

  leaveTournament() {
    const playerId = this.getPlayerId();
    const success = this.tournamentManager.leaveTournament(
      this.currentTournament.id,
      playerId
    );

    if (success) {
      this.closeModal();
      this.showSuccess('Has abandonado el torneo');
      this.loadTournamentData();
    } else {
      this.showError('No se pudo abandonar el torneo');
    }
  }

  showTournamentRules() {
    const modal = this.createModal(
      'Reglas del Torneo',
      `
        <div style="text-align: left;">
          <h4 style="color: var(--primary-cyan); margin-bottom: 15px;">📋 Reglas Generales</h4>
          <ul style="margin-bottom: 20px; line-height: 1.6;">
            <li>Cada participante debe completar todos los juegos del torneo</li>
            <li>Solo se cuenta la mejor puntuación de cada juego</li>
            <li>Las puntuaciones se normalizan para comparar diferentes juegos</li>
            <li>El ganador es quien tenga la mayor puntuación total</li>
          </ul>

          <h4 style="color: var(--primary-cyan); margin-bottom: 15px;">🎮 Formato: ${this.currentTournament.format.toUpperCase()}</h4>
          <p style="margin-bottom: 20px; line-height: 1.6;">
            ${this.currentTournament.format === 'round-robin'
        ? 'Todos los participantes compiten en todos los juegos. Gana quien tenga la mayor puntuación total.'
        : 'Los participantes son eliminados en rondas hasta que quede un ganador.'
      }
          </p>

          <h4 style="color: var(--primary-cyan); margin-bottom: 15px;">🏆 Juegos Incluidos</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
            ${this.currentTournament.games.map(gameId => {
        const gameInfo = this.getGameInfo(gameId);
        return `<div style="text-align: center; padding: 10px; background: rgba(0,0,0,0.3); border-radius: 8px;">
                ${gameInfo.icon} ${gameInfo.name}
              </div>`;
      }).join('')}
          </div>
        </div>
      `,
      [
        {
          text: 'ENTENDIDO',
          class: 'primary',
          action: () => this.closeModal()
        }
      ]
    );

    this.showModal(modal);
  }

  exportTournamentResults() {
    try {
      const data = {
        tournament: this.currentTournament,
        leaderboard: this.getLeaderboardData(),
        exportDate: new Date().toISOString(),
        stats: this.calculateTournamentStats()
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `torneo-${this.currentTournament.name}-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      URL.revokeObjectURL(url);

      this.showSuccess('Resultados exportados exitosamente');
    } catch (error) {
      console.error('Error exporting results:', error);
      this.showError('Error al exportar los resultados');
    }
  }

  // ============================================================================
  // MODAL SYSTEM
  // ============================================================================

  createModal(title, body, actions = []) {
    return { title, body, actions };
  }

  showModal(modal) {
    const overlay = document.getElementById('modal-overlay');
    const titleElement = document.getElementById('modal-title');
    const bodyElement = document.getElementById('modal-body');
    const footerElement = document.getElementById('modal-footer');

    if (titleElement) titleElement.textContent = modal.title;
    if (bodyElement) bodyElement.innerHTML = modal.body;

    if (footerElement) {
      footerElement.innerHTML = modal.actions.map(action =>
        `<button class="action-btn ${action.class}" data-action="${action.text}">
          ${action.text}
        </button>`
      ).join('');

      // Add event listeners to action buttons
      modal.actions.forEach(action => {
        const btn = footerElement.querySelector(`[data-action="${action.text}"]`);
        if (btn) {
          btn.addEventListener('click', action.action);
        }
      });
    }

    if (overlay) {
      overlay.style.display = 'flex';
    }
  }

  closeModal() {
    const overlay = document.getElementById('modal-overlay');
    if (overlay) {
      overlay.style.display = 'none';
    }
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  onTournamentUpdated(tournament) {
    if (tournament.id === this.currentTournament?.id) {
      this.currentTournament = tournament;
      this.updateTournamentProgress();
      this.updateLeaderboard();
      this.updateGamesStatus();
      this.updateTimeline();
    }
  }

  onParticipantJoined(data) {
    if (data.tournament.id === this.currentTournament?.id) {
      this.showSuccess(`${data.participant.name} se unió al torneo`);
      this.loadTournamentData();
    }
  }

  onParticipantLeft(data) {
    if (data.tournament.id === this.currentTournament?.id) {
      this.showSuccess(`${data.participant.name} abandonó el torneo`);
      this.loadTournamentData();
    }
  }

  onTournamentCompleted(tournament) {
    if (tournament.id === this.currentTournament?.id) {
      this.showSuccess('¡El torneo ha finalizado!');
      this.loadTournamentData();
    }
  }

  onWindowFocus() {
    // Resume real-time updates when window gains focus
    if (!this.animationFrameId) {
      this.startRealTimeUpdates();
    }
  }

  onWindowBlur() {
    // Pause updates when window loses focus to save resources
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  getPlayerId() {
    let playerId = localStorage.getItem('ai4devs-player-id');
    if (!playerId) {
      playerId = `player-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('ai4devs-player-id', playerId);
    }
    return playerId;
  }

  animateNumber(element, targetValue) {
    const currentValue = parseInt(element.textContent) || 0;
    if (currentValue === targetValue) return;

    const duration = 800;
    const startTime = performance.now();
    const startValue = currentValue;
    const difference = targetValue - startValue;

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentNumber = Math.round(startValue + (difference * easeOutCubic));

      element.textContent = currentNumber;

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    if (diffDays < 7) return `Hace ${diffDays} días`;

    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'error' ? 'var(--accent-red)' : 'var(--accent-green)'};
      color: white;
      padding: 15px 20px;
      border-radius: 8px;
      font-family: var(--font-main);
      font-weight: bold;
      z-index: 10001;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.style.animation = 'slideOutRight 0.3s ease-out';
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 3000);
  }

  showNoTournamentMessage() {
    const container = document.querySelector('.tournament-dashboard-container');
    if (container) {
      container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; color: rgba(255, 255, 255, 0.7);">
          <div style="font-size: 4em; margin-bottom: 20px;">🏆</div>
          <h2 style="color: var(--primary-cyan); margin-bottom: 20px;">No hay torneos activos</h2>
          <p style="margin-bottom: 30px;">Crea un nuevo torneo para comenzar a competir</p>
          <a href="tournament-creation.html" class="action-btn primary" style="text-decoration: none; display: inline-block;">
            ➕ CREAR TORNEO
          </a>
        </div>
      `;
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

  cleanup() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}

// Add CSS animations for notifications
if (!document.querySelector('#dashboard-notification-style')) {
  const style = document.createElement('style');
  style.id = 'dashboard-notification-style';
  style.textContent = `
    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100%);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes slideOutRight {
      from {
        opacity: 1;
        transform: translateX(0);
      }
      to {
        opacity: 0;
        transform: translateX(100%);
      }
    }
  `;
  document.head.appendChild(style);
}

// Initialize the tournament dashboard
const tournamentDashboard = new TournamentDashboard();

// Export for testing
if (typeof window !== 'undefined') {
  window.TournamentDashboard = TournamentDashboard;
  window.tournamentDashboard = tournamentDashboard;
}

// ============================================================================
// MOBILE OPTIMIZATIONS AND TOUCH SUPPORT
// ============================================================================

/**
 * Setup mobile-specific optimizations and touch interactions
 */
setupMobileOptimizations() {
  // Viewport height adjustment for mobile browsers
  this.adjustViewportHeight();
  window.addEventListener('resize', () => this.adjustViewportHeight());
  window.addEventListener('orientationchange', () => {
    setTimeout(() => this.adjustViewportHeight(), 500);
  });

  // Setup touch interactions for dashboard elements
  this.setupTouchInteractions();

  // Setup gesture support
  this.setupGestureSupport();

  // Optimize scroll behavior
  this.optimizeScrollBehavior();

  // Setup haptic feedback
  this.setupHapticFeedback();

  // Optimize performance for mobile
  this.optimizeMobilePerformance();
}

/**
 * Setup touch interactions for better mobile UX
 */
setupTouchInteractions() {
  // Touch-optimized refresh button
  const refreshBtn = document.getElementById('refresh-leaderboard');
  if (refreshBtn) {
    this.setupTouchInteraction(refreshBtn, () => this.refreshLeaderboard());
  }

  // Touch-optimized toggle buttons
  const toggleButtons = document.querySelectorAll('.toggle-btn');
  toggleButtons.forEach(btn => {
    this.setupTouchInteraction(btn, () => {
      this.switchLeaderboardView(btn.dataset.view);
    });
  });

  // Touch-optimized action buttons
  const actionButtons = document.querySelectorAll('.action-btn');
  actionButtons.forEach(btn => {
    this.setupTouchInteraction(btn, () => {
      btn.click();
    });
  });

  // Touch-optimized stat items for additional info
  const statItems = document.querySelectorAll('.stat-item');
  statItems.forEach(item => {
    this.setupTouchInteraction(item, () => {
      this.showStatDetails(item);
    });
  });

  // Touch-optimized game status cards
  const gameCards = document.querySelectorAll('.game-status-card');
  gameCards.forEach(card => {
    this.setupTouchInteraction(card, () => {
      this.showGameDetails(card);
    });
  });
}

/**
 * Setup touch interaction for an element with visual feedback
 */
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

/**
 * Setup gesture support for navigation
 */
setupGestureSupport() {
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;

  const container = document.querySelector('.tournament-dashboard-container');
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

  // Prevent pinch-to-zoom for better UX
  container.addEventListener('touchmove', (e) => {
    if (e.touches.length > 1) {
      e.preventDefault();
    }
  });
}

/**
 * Handle gesture recognition
 */
handleGesture() {
  const deltaX = this.touchEndX - this.touchStartX;
  const deltaY = this.touchEndY - this.touchStartY;
  const minSwipeDistance = 50;

  // Horizontal swipes for view switching
  if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
    if (deltaX > 0) {
      // Swipe right - switch to overall view
      this.switchLeaderboardView('overall');
    } else {
      // Swipe left - switch to current round view
      this.switchLeaderboardView('current-round');
    }
  }

  // Vertical swipes for section navigation
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

/**
 * Scroll to previous section
 */
scrollToPreviousSection() {
  const sections = document.querySelectorAll('.progress-card, .leaderboard-card, .games-card, .timeline-card, .actions-card');
  const currentSection = this.getCurrentVisibleSection(sections);

  if (currentSection > 0) {
    sections[currentSection - 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/**
 * Scroll to next section
 */
scrollToNextSection() {
  const sections = document.querySelectorAll('.progress-card, .leaderboard-card, .games-card, .timeline-card, .actions-card');
  const currentSection = this.getCurrentVisibleSection(sections);

  if (currentSection < sections.length - 1) {
    sections[currentSection + 1].scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

/**
 * Get currently visible section index
 */
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

/**
 * Adjust viewport height for mobile browsers
 */
adjustViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

/**
 * Optimize scroll behavior for mobile
 */
optimizeScrollBehavior() {
  // Smooth scrolling for dashboard sections
  const sections = document.querySelectorAll('.progress-card, .leaderboard-card, .games-card, .timeline-card, .actions-card');

  sections.forEach((section, index) => {
    // Add scroll indicators for mobile
    if (window.innerWidth <= 768) {
      this.addScrollIndicator(section, index, sections.length);
    }
  });

  // Optimize leaderboard scrolling
  const leaderboardContainer = document.getElementById('leaderboard-container');
  if (leaderboardContainer) {
    // Add momentum scrolling for iOS
    leaderboardContainer.style.webkitOverflowScrolling = 'touch';

    // Add scroll position memory
    let scrollPosition = 0;
    leaderboardContainer.addEventListener('scroll', () => {
      scrollPosition = leaderboardContainer.scrollTop;
    });

    // Restore scroll position after updates
    this.originalUpdateLeaderboard = this.updateLeaderboard;
    this.updateLeaderboard = () => {
      this.originalUpdateLeaderboard();
      setTimeout(() => {
        leaderboardContainer.scrollTop = scrollPosition;
      }, 100);
    };
  }
}

/**
 * Add scroll indicator for mobile sections
 */
addScrollIndicator(section, index, total) {
  const indicator = document.createElement('div');
  indicator.className = 'mobile-scroll-indicator';
  indicator.style.cssText = `
    position: absolute;
    top: 10px;
    right: 10px;
    background: rgba(0, 255, 255, 0.3);
    color: var(--primary-cyan);
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.7rem;
    font-weight: bold;
    z-index: 10;
  `;
  indicator.textContent = `${index + 1}/${total}`;

  section.style.position = 'relative';
  section.appendChild(indicator);
}

/**
 * Setup haptic feedback for supported devices
 */
setupHapticFeedback() {
  if ('vibrate' in navigator) {
    const addHapticFeedback = (element, pattern = [10]) => {
      element.addEventListener('touchstart', () => {
        navigator.vibrate(pattern);
      });
    };

    // Add haptic feedback to interactive elements
    const interactiveElements = document.querySelectorAll(
      '.refresh-btn, .toggle-btn, .action-btn, .stat-item, .game-status-card'
    );

    interactiveElements.forEach(element => {
      addHapticFeedback(element);
    });

    // Different patterns for different actions
    const refreshBtn = document.getElementById('refresh-leaderboard');
    if (refreshBtn) {
      addHapticFeedback(refreshBtn, [20]);
    }

    const actionButtons = document.querySelectorAll('.action-btn.primary');
    actionButtons.forEach(btn => {
      addHapticFeedback(btn, [30, 10, 30]);
    });
  }
}

/**
 * Optimize performance for mobile devices
 */
optimizeMobilePerformance() {
  // Reduce update frequency on mobile
  if (window.innerWidth <= 768) {
    this.updateThrottle = 200; // Slower updates on mobile
    this.maxFPS = 30; // Lower FPS for better battery life
    this.frameTime = 1000 / this.maxFPS;
  }

  // Use passive event listeners where possible
  const passiveEvents = ['touchstart', 'touchmove', 'scroll'];
  passiveEvents.forEach(eventType => {
    document.addEventListener(eventType, () => { }, { passive: true });
  });

  // Optimize animations for mobile
  if (window.innerWidth <= 768) {
    // Disable complex animations on mobile
    const style = document.createElement('style');
    style.textContent = `
      @media (max-width: 768px) {
        * {
          animation-duration: 0.3s !important;
          transition-duration: 0.2s !important;
        }

        .loading-spinner {
          animation-duration: 1s !important;
        }
      }
    `;
    document.head.appendChild(style);
  }
}

/**
 * Show details for a stat item (mobile-specific)
 */
showStatDetails(statItem) {
  const statLabel = statItem.querySelector('.stat-label').textContent;
  const statValue = statItem.querySelector('.stat-value').textContent;

  // Create mobile-friendly tooltip
  const tooltip = document.createElement('div');
  tooltip.className = 'mobile-stat-tooltip';
  tooltip.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-card);
    border: 2px solid var(--primary-cyan);
    border-radius: 12px;
    padding: 20px;
    z-index: 10000;
    max-width: 80vw;
    text-align: center;
    animation: fadeIn 0.3s ease-out;
  `;

  tooltip.innerHTML = `
    <h3 style="color: var(--primary-cyan); margin-bottom: 10px;">${statLabel}</h3>
    <p style="font-size: 2em; font-weight: bold; color: var(--primary-yellow); margin-bottom: 10px;">${statValue}</p>
    <p style="color: rgba(255, 255, 255, 0.8); font-size: 0.9em;">Toca para cerrar</p>
  `;

  document.body.appendChild(tooltip);

  // Close on tap
  tooltip.addEventListener('click', () => {
    document.body.removeChild(tooltip);
  });

  // Auto-close after 3 seconds
  setTimeout(() => {
    if (document.body.contains(tooltip)) {
      document.body.removeChild(tooltip);
    }
  }, 3000);
}

/**
 * Show details for a game status card (mobile-specific)
 */
showGameDetails(gameCard) {
  const gameName = gameCard.querySelector('.game-name').textContent;
  const gameProgress = gameCard.querySelector('.game-progress').textContent;
  const gameStatus = gameCard.querySelector('.game-status-indicator').textContent;

  // Create mobile-friendly game details modal
  const modal = document.createElement('div');
  modal.className = 'mobile-game-modal';
  modal.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease-out;
  `;

  const content = document.createElement('div');
  content.style.cssText = `
    background: var(--bg-card);
    border: 2px solid var(--primary-cyan);
    border-radius: 16px;
    padding: 30px;
    max-width: 90vw;
    max-height: 80vh;
    overflow-y: auto;
    text-align: center;
  `;

  content.innerHTML = `
    <h2 style="color: var(--primary-cyan); margin-bottom: 20px;">${gameName}</h2>
    <p style="color: rgba(255, 255, 255, 0.8); margin-bottom: 15px;">${gameProgress}</p>
    <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; background: rgba(0, 255, 255, 0.2); color: var(--primary-cyan); font-weight: bold; margin-bottom: 20px;">
      ${gameStatus}
    </div>
    <button style="background: var(--gradient-neon); border: none; padding: 12px 24px; border-radius: 8px; color: white; font-weight: bold; cursor: pointer; font-family: monospace;">
      CERRAR
    </button>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Close on button click or modal background click
  const closeBtn = content.querySelector('button');
  closeBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      document.body.removeChild(modal);
    }
  });
}

// Initialize mobile optimizations when the class is instantiated
if (typeof window !== 'undefined' && window.innerWidth <= 1024) {
  // Add mobile optimizations to the init method
  const originalInit = TournamentDashboard.prototype.init;
  TournamentDashboard.prototype.init = function () {
    originalInit.call(this);
    this.setupMobileOptimizations();
  };
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
}

/**
 * Enhanced keyboard navigation for tournament dashboard
 */
setupKeyboardNavigation() {
  // Tab navigation enhancement
  this.setupTabNavigation();

  // Arrow key navigation for leaderboard
  this.setupArrowKeyNavigation();

  // Keyboard shortcuts
  this.setupAccessibilityShortcuts();

  // Focus indicators
  this.enhanceFocusIndicators();
}

/**
 * Setup tab navigation with proper focus management
 */
setupTabNavigation() {
  const focusableElements = this.getFocusableElements();

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      this.handleTabNavigation(e, focusableElements);
    }
  });

  // Skip links for screen readers
  this.addSkipLinks();
}

/**
 * Get all focusable elements in proper order
 */
getFocusableElements() {
  return document.querySelectorAll(
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), ' +
    'textarea:not([disabled]), [tabindex]:not([tabindex="-1"]), ' +
    '[role="button"]:not([aria-disabled="true"]), [role="tab"]:not([aria-disabled="true"])'
  );
}

/**
 * Handle tab navigation with proper focus management
 */
handleTabNavigation(e, focusableElements) {
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

/**
 * Add skip links for screen reader users
 */
addSkipLinks() {
  const skipLinks = document.createElement('div');
  skipLinks.className = 'skip-links';
  skipLinks.innerHTML = `
    <a href="#leaderboard-container" class="skip-link">Saltar a clasificación</a>
    <a href="#games-grid" class="skip-link">Saltar a estado de juegos</a>
    <a href="#timeline-container" class="skip-link">Saltar a cronología</a>
    <a href="#join-tournament-btn" class="skip-link">Saltar a acciones</a>
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
 * Setup arrow key navigation for leaderboard table
 */
setupArrowKeyNavigation() {
  document.addEventListener('keydown', (e) => {
    const activeElement = document.activeElement;

    // Arrow navigation in leaderboard
    if (activeElement.closest('.leaderboard-table')) {
      this.handleLeaderboardNavigation(e, activeElement);
    }

    // Arrow navigation in games grid
    if (activeElement.closest('.games-grid')) {
      this.handleGamesGridNavigation(e, activeElement);
    }
  });
}

/**
 * Handle arrow key navigation in leaderboard
 */
handleLeaderboardNavigation(e, activeElement) {
  const table = activeElement.closest('.leaderboard-table');
  const rows = table.querySelectorAll('.leaderboard-row');
  const currentRow = activeElement.closest('.leaderboard-row');
  const currentIndex = Array.from(rows).indexOf(currentRow);

  switch (e.key) {
    case 'ArrowUp':
      e.preventDefault();
      if (currentIndex > 0) {
        this.focusTableRow(rows[currentIndex - 1]);
      }
      break;

    case 'ArrowDown':
      e.preventDefault();
      if (currentIndex < rows.length - 1) {
        this.focusTableRow(rows[currentIndex + 1]);
      }
      break;

    case 'Home':
      e.preventDefault();
      this.focusTableRow(rows[0]);
      break;

    case 'End':
      e.preventDefault();
      this.focusTableRow(rows[rows.length - 1]);
      break;
  }
}

/**
 * Focus a table row and announce it to screen readers
 */
focusTableRow(row) {
  const playerName = row.querySelector('.player-name').textContent;
  const rank = row.querySelector('.rank-cell').textContent;
  const score = row.querySelector('.score-cell').textContent;

  // Make row focusable and focus it
  row.tabIndex = 0;
  row.focus();

  // Announce to screen readers
  this.announceToScreenReader(`Posición ${rank}: ${playerName}, puntuación ${score}`);
}

/**
 * Handle arrow key navigation in games grid
 */
handleGamesGridNavigation(e, activeElement) {
  const grid = activeElement.closest('.games-grid');
  const cards = grid.querySelectorAll('.game-status-card');
  const currentIndex = Array.from(cards).indexOf(activeElement.closest('.game-status-card'));

  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowLeft':
      e.preventDefault();
      newIndex = currentIndex > 0 ? currentIndex - 1 : cards.length - 1;
      break;

    case 'ArrowRight':
      e.preventDefault();
      newIndex = currentIndex < cards.length - 1 ? currentIndex + 1 : 0;
      break;

    case 'ArrowUp':
      e.preventDefault();
      // Move up one row (assuming 2-3 cards per row on mobile)
      const cardsPerRow = window.innerWidth <= 768 ? 1 : 2;
      newIndex = currentIndex - cardsPerRow;
      if (newIndex < 0) newIndex = currentIndex;
      break;

    case 'ArrowDown':
      e.preventDefault();
      // Move down one row
      const cardsPerRowDown = window.innerWidth <= 768 ? 1 : 2;
      newIndex = currentIndex + cardsPerRowDown;
      if (newIndex >= cards.length) newIndex = currentIndex;
      break;
  }

  if (newIndex !== currentIndex) {
    cards[newIndex].focus();

    // Announce game status
    const gameName = cards[newIndex].querySelector('.game-name').textContent;
    const gameStatus = cards[newIndex].querySelector('.game-status-indicator').textContent;
    this.announceToScreenReader(`${gameName}: ${gameStatus}`);
  }
}

/**
 * Setup accessibility keyboard shortcuts
 */
setupAccessibilityShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Alt + R: Refresh leaderboard
    if (e.altKey && e.key === 'r') {
      e.preventDefault();
      this.refreshLeaderboard();
      this.announceToScreenReader('Clasificación actualizada');
    }

    // Alt + 1: Focus leaderboard
    if (e.altKey && e.key === '1') {
      e.preventDefault();
      const leaderboard = document.getElementById('leaderboard-container');
      if (leaderboard) {
        leaderboard.focus();
        this.announceToScreenReader('Navegando a clasificación');
      }
    }

    // Alt + 2: Focus games grid
    if (e.altKey && e.key === '2') {
      e.preventDefault();
      const gamesGrid = document.getElementById('games-grid');
      if (gamesGrid) {
        const firstCard = gamesGrid.querySelector('.game-status-card');
        if (firstCard) {
          firstCard.focus();
          this.announceToScreenReader('Navegando a estado de juegos');
        }
      }
    }

    // Alt + 3: Focus timeline
    if (e.altKey && e.key === '3') {
      e.preventDefault();
      const timeline = document.getElementById('timeline-container');
      if (timeline) {
        timeline.focus();
        this.announceToScreenReader('Navegando a cronología del torneo');
      }
    }
  });
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

    /* High contrast focus for buttons */
    button:focus,
    .action-btn:focus,
    .toggle-btn:focus,
    .refresh-btn:focus {
      background: var(--primary-cyan) !important;
      color: var(--bg-primary) !important;
      border-color: var(--primary-cyan) !important;
    }

    /* Focus for interactive elements */
    .stat-item:focus,
    .game-status-card:focus,
    .leaderboard-row:focus {
      background: rgba(0, 255, 255, 0.2) !important;
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

  // Setup dynamic content announcements
  this.setupDynamicAnnouncements();

  // Add descriptive text for complex elements
  this.addDescriptiveText();
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
 * Setup dynamic content announcements
 */
setupDynamicAnnouncements() {
  // Announce leaderboard updates
  const originalUpdateLeaderboard = this.updateLeaderboard;
  this.updateLeaderboard = () => {
    originalUpdateLeaderboard.call(this);

    setTimeout(() => {
      const participantCount = document.querySelectorAll('.leaderboard-row').length;
      this.announceToScreenReader(`Clasificación actualizada con ${participantCount} participantes`);
    }, 500);
  };

  // Announce progress updates
  const originalUpdateProgress = this.updateTournamentProgress;
  this.updateTournamentProgress = () => {
    originalUpdateProgress.call(this);

    setTimeout(() => {
      const progress = document.getElementById('tournament-progress').textContent;
      this.announceToScreenReader(`Progreso del torneo: ${progress}`);
    }, 500);
  };
}

/**
 * Add descriptive text for complex elements
 */
addDescriptiveText() {
  // Add descriptions for progress stats
  const statItems = document.querySelectorAll('.stat-item');
  statItems.forEach((item, index) => {
    const label = item.querySelector('.stat-label').textContent;
    const value = item.querySelector('.stat-value').textContent;

    item.setAttribute('aria-label', `${label}: ${value}`);
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
  });

  // Add descriptions for game status cards
  const gameCards = document.querySelectorAll('.game-status-card');
  gameCards.forEach(card => {
    const gameName = card.querySelector('.game-name').textContent;
    const gameStatus = card.querySelector('.game-status-indicator').textContent;
    const gameProgress = card.querySelector('.game-progress').textContent;

    card.setAttribute('aria-label', `${gameName}: ${gameStatus}. ${gameProgress}`);
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
  });
}

/**
 * Setup focus management for dynamic content
 */
setupFocusManagement() {
  // Manage focus when modal opens
  this.originalShowModal = this.showModal || function () { };
  this.showModal = (content) => {
    this.originalShowModal(content);

    // Focus first focusable element in modal
    setTimeout(() => {
      const modal = document.getElementById('tournament-modal');
      if (modal) {
        const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }
    }, 100);
  };

  // Restore focus when modal closes
  let lastFocusedElement = null;

  document.addEventListener('focusin', (e) => {
    if (!e.target.closest('.modal')) {
      lastFocusedElement = e.target;
    }
  });

  this.originalCloseModal = this.closeModal || function () { };
  this.closeModal = () => {
    this.originalCloseModal();

    // Restore focus to last focused element
    if (lastFocusedElement) {
      lastFocusedElement.focus();
    }
  };
}

/**
 * Setup ARIA live regions for dynamic updates
 */
setupAriaLiveRegions() {
  // Make progress bar announce changes
  const progressBar = document.querySelector('.progress-bar-container');
  if (progressBar) {
    progressBar.setAttribute('aria-live', 'polite');
    progressBar.setAttribute('aria-atomic', 'false');
  }

  // Make leaderboard announce changes
  const leaderboard = document.getElementById('leaderboard-container');
  if (leaderboard) {
    leaderboard.setAttribute('aria-live', 'polite');
    leaderboard.setAttribute('aria-atomic', 'false');
  }

  // Make timeline announce new events
  const timeline = document.getElementById('timeline-container');
  if (timeline) {
    timeline.setAttribute('aria-live', 'polite');
    timeline.setAttribute('aria-atomic', 'false');
  }
}

/**
 * Setup high contrast mode support
 */
setupHighContrastSupport() {
  // Detect high contrast mode
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

      .high-contrast .progress-card,
      .high-contrast .leaderboard-card,
      .high-contrast .games-card,
      .high-contrast .timeline-card,
      .high-contrast .actions-card {
        border: 3px solid #ffffff !important;
        background: #000000 !important;
      }

      .high-contrast .game-status-card,
      .high-contrast .stat-item,
      .high-contrast .timeline-item {
        border: 2px solid #ffffff !important;
        background: #000000 !important;
      }

      .high-contrast button,
      .high-contrast .action-btn {
        border: 2px solid #ffffff !important;
        background: #000000 !important;
        color: #ffffff !important;
      }

      .high-contrast button:hover,
      .high-contrast .action-btn:hover {
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

      .reduced-motion .loading-spinner {
        animation: none !important;
        border: 3px solid var(--primary-cyan) !important;
      }

      .reduced-motion .progress-fill::after {
        animation: none !important;
      }
    `;

    document.head.appendChild(style);
  }
}

// Initialize accessibility features when the class is instantiated
const originalDashboardInit = TournamentDashboard.prototype.init;
TournamentDashboard.prototype.init = function () {
  originalDashboardInit.call(this);
  this.setupAccessibilityFeatures();
};
