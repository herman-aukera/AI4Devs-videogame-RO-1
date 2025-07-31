/**
 * Tournament History Interface Controller
 * Manages the tournament history UI and user interactions
 */

class TournamentHistoryController {
  constructor() {
    // Initialize history manager
    this.historyManager = new TournamentHistoryManager();

    // UI state
    this.currentPage = 1;
    this.pageSize = 10;
    this.currentFilters = {};
    this.currentSort = { sortBy: 'endDate', sortOrder: 'desc' };

    // Initialize UI
    this.initializeUI();
    this.setupEventListeners();
    this.loadInitialData();
  }

  /**
   * Initialize UI elements
   */
  initializeUI() {
    // Get DOM elements
    this.elements = {
      // Search and filters
      searchInput: document.getElementById('searchInput'),
      searchBtn: document.getElementById('searchBtn'),
      formatFilter: document.getElementById('formatFilter'),
      gameFilter: document.getElementById('gameFilter'),
      startDateFilter: document.getElementById('startDateFilter'),
      endDateFilter: document.getElementById('endDateFilter'),
      clearFiltersBtn: document.getElementById('clearFiltersBtn'),

      // Actions
      exportBtn: document.getElementById('exportBtn'),
      importBtn: document.getElementById('importBtn'),
      importFile: document.getElementById('importFile'),
      archiveBtn: document.getElementById('archiveBtn'),

      // Statistics
      totalTournaments: document.getElementById('totalTournaments'),
      totalParticipants: document.getElementById('totalParticipants'),
      averageDuration: document.getElementById('averageDuration'),
      storageUsage: document.getElementById('storageUsage'),

      // List and sorting
      sortBy: document.getElementById('sortBy'),
      sortOrder: document.getElementById('sortOrder'),
      tournamentList: document.getElementById('tournamentList'),
      paginationInfo: document.getElementById('paginationInfo'),
      pageInfo: document.getElementById('pageInfo'),
      prevPageBtn: document.getElementById('prevPageBtn'),
      nextPageBtn: document.getElementById('nextPageBtn'),

      // Modal
      tournamentModal: document.getElementById('tournamentModal'),
      modalTitle: document.getElementById('modalTitle'),
      tournamentDetails: document.getElementById('tournamentDetails'),
      closeModal: document.getElementById('closeModal'),

      // Loading and messages
      loadingIndicator: document.getElementById('loadingIndicator'),
      errorContainer: document.getElementById('errorContainer'),
      successContainer: document.getElementById('successContainer')
    };

    console.log('✅ Tournament History UI initialized');
  }

  /**
   * Set up event listeners
   */
  setupEventListeners() {
    // Search functionality
    this.elements.searchBtn.addEventListener('click', () => this.performSearch());
    this.elements.searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });

    // Filter changes
    this.elements.formatFilter.addEventListener('change', () => this.applyFilters());
    this.elements.gameFilter.addEventListener('change', () => this.applyFilters());
    this.elements.startDateFilter.addEventListener('change', () => this.applyFilters());
    this.elements.endDateFilter.addEventListener('change', () => this.applyFilters());
    this.elements.clearFiltersBtn.addEventListener('click', () => this.clearFilters());

    // Sorting
    this.elements.sortBy.addEventListener('change', () => this.applySorting());
    this.elements.sortOrder.addEventListener('change', () => this.applySorting());

    // Actions
    this.elements.exportBtn.addEventListener('click', () => this.exportHistory());
    this.elements.importBtn.addEventListener('click', () => this.elements.importFile.click());
    this.elements.importFile.addEventListener('change', (e) => this.importHistory(e));
    this.elements.archiveBtn.addEventListener('click', () => this.archiveOldData());

    // Pagination
    this.elements.prevPageBtn.addEventListener('click', () => this.previousPage());
    this.elements.nextPageBtn.addEventListener('click', () => this.nextPage());

    // Modal
    this.elements.closeModal.addEventListener('click', () => this.closeModal());
    this.elements.tournamentModal.addEventListener('click', (e) => {
      if (e.target === this.elements.tournamentModal) this.closeModal();
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.elements.tournamentModal.style.display === 'block') {
        this.closeModal();
      }
    });

    // History manager events
    window.addEventListener('tournament-history:error', (e) => {
      this.showError(`Error en historial: ${e.detail.error}`);
    });

    console.log('✅ Event listeners set up');
  }

  /**
   * Load initial data
   */
  async loadInitialData() {
    try {
      this.showLoading(true);

      // Load statistics
      await this.updateStatistics();

      // Load tournament list
      await this.loadTournamentList();

      this.showLoading(false);
    } catch (error) {
      console.error('Error loading initial data:', error);
      this.showError('Error cargando datos iniciales');
      this.showLoading(false);
    }
  }

  /**
   * Update statistics display
   */
  async updateStatistics() {
    try {
      const analytics = this.historyManager.getAnalyticsSummary();
      const storageInfo = this.historyManager.getStorageQuotaInfo();

      // Update stat displays
      this.elements.totalTournaments.textContent = analytics.totalTournaments || 0;
      this.elements.totalParticipants.textContent = analytics.totalParticipants || 0;

      // Format average duration
      const avgDuration = analytics.averageDuration || 0;
      const hours = Math.floor(avgDuration / 60);
      const minutes = Math.round(avgDuration % 60);
      this.elements.averageDuration.textContent = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

      // Update storage usage
      this.elements.storageUsage.textContent = `${storageInfo.quotaUsagePercent || 0}%`;

    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  }

  /**
   * Load tournament list with current filters and sorting
   */
  async loadTournamentList() {
    try {
      const options = {
        ...this.currentFilters,
        ...this.currentSort,
        page: this.currentPage,
        pageSize: this.pageSize
      };

      const tournaments = this.historyManager.getTournamentHistory(options);
      const totalTournaments = this.historyManager.getTournamentHistory(this.currentFilters).length;

      this.renderTournamentList(tournaments);
      this.updatePaginationInfo(tournaments.length, totalTournaments);

    } catch (error) {
      console.error('Error loading tournament list:', error);
      this.showError('Error cargando lista de torneos');
    }
  }

  /**
   * Render tournament list
   */
  renderTournamentList(tournaments) {
    if (tournaments.length === 0) {
      this.elements.tournamentList.innerHTML = this.renderEmptyState();
      return;
    }

    const html = tournaments.map(tournament => this.renderTournamentItem(tournament)).join('');
    this.elements.tournamentList.innerHTML = html;

    // Add click listeners to tournament items
    this.elements.tournamentList.querySelectorAll('.tournament-item').forEach(item => {
      item.addEventListener('click', () => {
        const tournamentId = item.dataset.tournamentId;
        this.showTournamentDetails(tournamentId);
      });

      // Make items keyboard accessible
      item.setAttribute('tabindex', '0');
      item.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          const tournamentId = item.dataset.tournamentId;
          this.showTournamentDetails(tournamentId);
        }
      });
    });
  }

  /**
   * Render individual tournament item
   */
  renderTournamentItem(tournament) {
    const startDate = new Date(tournament.startDate).toLocaleDateString('es-ES');
    const endDate = tournament.endDate ? new Date(tournament.endDate).toLocaleDateString('es-ES') : 'En curso';
    const duration = this.calculateDuration(tournament);

    const gamesList = tournament.games.map(game =>
      `<span class="game-tag">${this.getGameDisplayName(game)}</span>`
    ).join('');

    const topParticipants = tournament.participants
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 3)
      .map(participant =>
        `<div class="participant-item">
          <span class="participant-rank">${participant.rank}</span>
          <span>${participant.name}</span>
        </div>`
      ).join('');

    return `
      <div class="tournament-item" data-tournament-id="${tournament.id}" role="button" aria-label="Ver detalles del torneo ${tournament.name}">
        <div class="tournament-item-header">
          <h3 class="tournament-name">${tournament.name}</h3>
          <div class="tournament-date">${startDate} - ${endDate}</div>
        </div>

        <div class="tournament-info">
          <div class="info-item">
            <div class="info-label">Formato</div>
            <div class="info-value">${tournament.format === 'round-robin' ? 'Round Robin' : 'Eliminación'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Participantes</div>
            <div class="info-value">${tournament.participants.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Juegos</div>
            <div class="info-value">${tournament.games.length}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Duración</div>
            <div class="info-value">${duration}</div>
          </div>
        </div>

        <div class="tournament-games">
          ${gamesList}
        </div>

        <div class="tournament-participants">
          <div class="participants-header">Top 3 Participantes</div>
          <div class="participants-list">
            ${topParticipants}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render empty state
   */
  renderEmptyState() {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">🏆</div>
        <div class="empty-state-title">No hay torneos en el historial</div>
        <div class="empty-state-message">
          Los torneos completados aparecerán aquí.<br>
          ¡Crea tu primer torneo para comenzar!
        </div>
      </div>
    `;
  }

  /**
   * Show tournament details in modal
   */
  showTournamentDetails(tournamentId) {
    const tournament = this.historyManager.getTournamentFromHistory(tournamentId);
    if (!tournament) {
      this.showError('Torneo no encontrado');
      return;
    }

    this.elements.modalTitle.textContent = tournament.name;
    this.elements.tournamentDetails.innerHTML = this.renderTournamentDetails(tournament);
    this.elements.tournamentModal.style.display = 'block';

    // Focus management for accessibility
    this.elements.closeModal.focus();
  }

  /**
   * Render detailed tournament information
   */
  renderTournamentDetails(tournament) {
    const startDate = new Date(tournament.startDate).toLocaleString('es-ES');
    const endDate = tournament.endDate ? new Date(tournament.endDate).toLocaleString('es-ES') : 'En curso';
    const duration = this.calculateDuration(tournament);

    const participantsList = tournament.participants
      .sort((a, b) => a.rank - b.rank)
      .map(participant => {
        const gameScores = Object.entries(participant.scores)
          .map(([game, score]) => `${this.getGameDisplayName(game)}: ${score}`)
          .join(', ');

        return `
          <div class="participant-detail">
            <div class="participant-header">
              <span class="participant-rank">${participant.rank}</span>
              <span class="participant-name">${participant.name}</span>
              <span class="participant-total">Total: ${participant.totalScore.toFixed(2)}</span>
            </div>
            <div class="participant-scores">${gameScores}</div>
          </div>
        `;
      }).join('');

    const gamesList = tournament.games
      .map(game => `<span class="game-tag">${this.getGameDisplayName(game)}</span>`)
      .join('');

    return `
      <div class="tournament-detail-content">
        <div class="detail-section">
          <h3>Información General</h3>
          <div class="detail-grid">
            <div class="detail-item">
              <strong>Formato:</strong> ${tournament.format === 'round-robin' ? 'Round Robin' : 'Eliminación'}
            </div>
            <div class="detail-item">
              <strong>Fecha de inicio:</strong> ${startDate}
            </div>
            <div class="detail-item">
              <strong>Fecha de finalización:</strong> ${endDate}
            </div>
            <div class="detail-item">
              <strong>Duración:</strong> ${duration}
            </div>
            <div class="detail-item">
              <strong>Participantes:</strong> ${tournament.participants.length}
            </div>
            <div class="detail-item">
              <strong>Juegos:</strong> ${tournament.games.length}
            </div>
          </div>
        </div>

        <div class="detail-section">
          <h3>Juegos Incluidos</h3>
          <div class="games-list">
            ${gamesList}
          </div>
        </div>

        <div class="detail-section">
          <h3>Clasificación Final</h3>
          <div class="participants-detail">
            ${participantsList}
          </div>
        </div>
      </div>

      <style>
        .tournament-detail-content {
          color: #00ffff;
        }

        .detail-section {
          margin-bottom: 30px;
        }

        .detail-section h3 {
          color: #00ffff;
          border-bottom: 2px solid #00ffff;
          padding-bottom: 10px;
          margin-bottom: 15px;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .detail-item {
          background: rgba(0, 255, 255, 0.1);
          padding: 10px;
          border-radius: 5px;
          border: 1px solid rgba(0, 255, 255, 0.3);
        }

        .games-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .participant-detail {
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid #00ffff;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .participant-header {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }

        .participant-name {
          font-weight: bold;
          color: #00ffff;
        }

        .participant-total {
          color: #00ff00;
          font-weight: bold;
        }

        .participant-scores {
          color: rgba(0, 255, 255, 0.8);
          font-size: 0.9rem;
        }
      </style>
    `;
  }

  /**
   * Close modal
   */
  closeModal() {
    this.elements.tournamentModal.style.display = 'none';
  }

  /**
   * Perform search
   */
  performSearch() {
    this.currentFilters.search = this.elements.searchInput.value.trim();
    this.currentPage = 1;
    this.loadTournamentList();
  }

  /**
   * Apply filters
   */
  applyFilters() {
    this.currentFilters = {
      search: this.elements.searchInput.value.trim(),
      format: this.elements.formatFilter.value,
      gameId: this.elements.gameFilter.value,
      startDate: this.elements.startDateFilter.value,
      endDate: this.elements.endDateFilter.value
    };

    // Remove empty filters
    Object.keys(this.currentFilters).forEach(key => {
      if (!this.currentFilters[key]) {
        delete this.currentFilters[key];
      }
    });

    this.currentPage = 1;
    this.loadTournamentList();
  }

  /**
   * Clear all filters
   */
  clearFilters() {
    this.elements.searchInput.value = '';
    this.elements.formatFilter.value = '';
    this.elements.gameFilter.value = '';
    this.elements.startDateFilter.value = '';
    this.elements.endDateFilter.value = '';

    this.currentFilters = {};
    this.currentPage = 1;
    this.loadTournamentList();
  }

  /**
   * Apply sorting
   */
  applySorting() {
    this.currentSort = {
      sortBy: this.elements.sortBy.value,
      sortOrder: this.elements.sortOrder.value
    };

    this.currentPage = 1;
    this.loadTournamentList();
  }

  /**
   * Go to previous page
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadTournamentList();
    }
  }

  /**
   * Go to next page
   */
  nextPage() {
    this.currentPage++;
    this.loadTournamentList();
  }

  /**
   * Update pagination information
   */
  updatePaginationInfo(currentCount, totalCount) {
    const totalPages = Math.ceil(totalCount / this.pageSize);
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(startItem + currentCount - 1, totalCount);

    this.elements.paginationInfo.textContent =
      `Mostrando ${startItem}-${endItem} de ${totalCount} torneos`;

    this.elements.pageInfo.textContent =
      `Página ${this.currentPage} de ${Math.max(1, totalPages)}`;

    // Update button states
    this.elements.prevPageBtn.disabled = this.currentPage <= 1;
    this.elements.nextPageBtn.disabled = this.currentPage >= totalPages;
  }

  /**
   * Export tournament history
   */
  async exportHistory() {
    try {
      this.showLoading(true);

      const url = this.historyManager.exportToFile(this.currentFilters);
      if (url) {
        this.showSuccess('Historial exportado exitosamente');
      } else {
        this.showError('Error exportando historial');
      }

      this.showLoading(false);
    } catch (error) {
      console.error('Error exporting history:', error);
      this.showError('Error exportando historial');
      this.showLoading(false);
    }
  }

  /**
   * Import tournament history
   */
  async importHistory(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      this.showLoading(true);

      const success = await this.historyManager.importFromFile(file);
      if (success) {
        this.showSuccess('Historial importado exitosamente');
        await this.loadInitialData();
      } else {
        this.showError('Error importando historial');
      }

      this.showLoading(false);
    } catch (error) {
      console.error('Error importing history:', error);
      this.showError('Error importando historial');
      this.showLoading(false);
    }

    // Reset file input
    event.target.value = '';
  }

  /**
   * Archive old tournament data
   */
  async archiveOldData() {
    if (!confirm('¿Estás seguro de que quieres archivar torneos antiguos? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      this.showLoading(true);

      const results = this.historyManager.archiveOldData(30); // Archive tournaments older than 30 days

      if (results.archivedCount > 0) {
        this.showSuccess(`${results.archivedCount} torneos archivados. Espacio liberado: ${Math.round(results.freedBytes / 1024)} KB`);
        await this.loadInitialData();
      } else {
        this.showSuccess('No hay torneos antiguos para archivar');
      }

      this.showLoading(false);
    } catch (error) {
      console.error('Error archiving data:', error);
      this.showError('Error archivando datos');
      this.showLoading(false);
    }
  }

  /**
   * Calculate tournament duration
   */
  calculateDuration(tournament) {
    if (!tournament.endDate) return 'En curso';

    const start = new Date(tournament.startDate);
    const end = new Date(tournament.endDate);
    const diffMs = end - start;

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  }

  /**
   * Get display name for game ID
   */
  getGameDisplayName(gameId) {
    const gameNames = {
      'snake-GG': 'Snake',
      'tetris-GG': 'Tetris',
      'pacman-GG': 'Pac-Man',
      'breakout-GG': 'Breakout',
      'space-invaders-GG': 'Space Invaders',
      'asteroids-GG': 'Asteroids',
      'pong-GG': 'Pong',
      'galaga-GG': 'Galaga',
      'mspacman-GG': 'Ms. Pac-Man',
      'fruit-catcher-GG': 'Fruit Catcher'
    };

    return gameNames[gameId] || gameId;
  }

  /**
   * Show loading indicator
   */
  showLoading(show) {
    this.elements.loadingIndicator.style.display = show ? 'block' : 'none';
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');

    this.elements.errorContainer.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 5000);
  }

  /**
   * Show success message
   */
  showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.setAttribute('role', 'status');

    this.elements.successContainer.appendChild(successDiv);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (successDiv.parentNode) {
        successDiv.parentNode.removeChild(successDiv);
      }
    }, 3000);
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.tournamentHistoryController = new TournamentHistoryController();
  console.log('🏆 Tournament History Controller initialized');
});
