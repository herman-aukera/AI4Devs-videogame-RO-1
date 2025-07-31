# 🏆 Tournament System User Guide

## Overview

The AI4Devs Retro Games Tournament System allows you to create and participate in competitive tournaments across all 10 classic arcade games. This guide will walk you through every aspect of using the tournament system.

## Getting Started

### Accessing the Tournament System

1. **From Main Page**: Click any of the tournament buttons on the main game collection page:
   - **CREAR TORNEO**: Create a new tournament
   - **DASHBOARD**: View active tournament status
   - **HISTORIAL**: Browse past tournament results

2. **From Games**: While playing any game, click the **🏆 TORNEO** button to access tournament features

3. **Direct Navigation**: Use the navigation bar at the top of any tournament page to switch between sections

## Creating a Tournament

### Step 1: Tournament Configuration

1. **Tournament Name**: Enter a descriptive name (max 50 characters)
   - Example: "Weekend Warriors Championship"

2. **Tournament Format**: Choose your competition structure:
   - **TODOS CONTRA TODOS (Round-Robin)**: Every participant plays against all others
   - **ELIMINACIÓN (Elimination)**: Losers are eliminated until one winner remains

### Step 2: Game Selection

Select which games to include in your tournament:

- **Available Games**: All 10 retro games are available
- **Selection Limit**: Choose between 1-10 games
- **Game Counter**: Shows selected games (X/10)
- **Recommendations**:
  - 3-5 games for quick tournaments
  - 6-10 games for comprehensive competitions

### Step 3: Tournament Settings

Configure advanced options:

- **Maximum Participants**: Choose from 2, 4, 8, 12, or 16 players
- **Score Normalization**: ✅ Recommended - Ensures fair comparison across different games
- **Auto Advance**: ✅ Recommended - Automatically progresses to next round when games complete

### Step 4: Add Participants

1. **Enter Player Name**: Type participant name (max 30 characters)
2. **Click AGREGAR**: Add player to tournament
3. **Participant Limit**: Cannot exceed maximum participants setting
4. **Remove Players**: Click ❌ next to any participant to remove them

### Step 5: Create Tournament

Click **🏆 CREAR TORNEO** to finalize and start your tournament.

## Participating in Tournaments

### Joining a Tournament

1. **From Dashboard**: Click **➕ UNIRSE AL TORNEO**
2. **Enter Your Name**: Provide a unique participant name
3. **Confirm Participation**: You'll be added to the active tournament

### Playing Tournament Games

1. **Game Selection**: Navigate to any game included in the tournament
2. **Tournament Mode**: Games automatically detect active tournaments
3. **Play Normally**: No special controls needed - just play your best!
4. **Score Submission**: Scores are automatically captured when games end
5. **Progress Tracking**: Return to dashboard to see updated standings

### Tournament Progression

- **Round-Robin**: Play all selected games, compete against all participants
- **Elimination**: Advance through rounds by achieving qualifying scores
- **Real-Time Updates**: Leaderboard updates automatically as games complete
- **Notifications**: Tournament status changes are displayed in the dashboard

## Monitoring Tournament Progress

### Dashboard Features

1. **Tournament Info**: Current tournament name and status
2. **Progress Statistics**:
   - Total participants
   - Games completed
   - Games remaining
   - Overall progress percentage

3. **Live Leaderboard**:
   - **GENERAL**: Overall tournament rankings
   - **RONDA ACTUAL**: Current round standings
   - Real-time score updates

4. **Game Status Grid**: Visual status of all tournament games
5. **Tournament Timeline**: Chronological event log

### Dashboard Actions

- **🔄 ACTUALIZAR**: Refresh leaderboard data
- **📋 VER REGLAS**: View tournament rules and format
- **📊 EXPORTAR RESULTADOS**: Download tournament data as CSV
- **❌ ABANDONAR TORNEO**: Leave current tournament (if participating)

## Tournament History

### Viewing Past Tournaments

1. **Access History**: Click **HISTORIAL** from any tournament page
2. **Browse Tournaments**: View completed tournaments with full details
3. **Search & Filter**: Find specific tournaments by:
   - Tournament name
   - Date range
   - Game type
   - Tournament format

### History Features

- **Tournament Statistics**: Total tournaments, participants, average duration
- **Storage Usage**: Monitor LocalStorage usage
- **Export/Import**: Backup and restore tournament data
- **Archive Management**: Clean up old tournament data

### Detailed Tournament View

Click any tournament in history to see:
- Complete participant list and final rankings
- Game-by-game results
- Tournament timeline
- Performance statistics
- Export options for individual tournaments

## Score System

### How Scoring Works

1. **Raw Scores**: Each game reports its native scoring system
2. **Normalization**: Scores are converted to comparable values (0.0-1.0 scale)
3. **Ranking**: Participants ranked by normalized total scores
4. **Tie Breaking**: Higher individual game scores used as tiebreakers

### Game-Specific Scoring

- **Snake**: Points from food consumption
- **Tetris**: Lines cleared and level progression
- **Pac-Man**: Dots, ghosts, and bonus items
- **Breakout**: Bricks destroyed and level completion
- **Space Invaders**: Aliens destroyed and bonus UFOs
- **Asteroids**: Asteroid destruction and survival time
- **Pong**: Points scored against AI opponent
- **Galaga**: Enemy formations and bonus stages
- **Ms. Pac-Man**: Enhanced scoring with moving fruits
- **Fruit Catcher**: Fruits caught and time bonuses

## Tips for Success

### Tournament Strategy

1. **Practice First**: Play games individually before tournaments
2. **Know the Scoring**: Understand how each game awards points
3. **Balanced Approach**: Don't focus only on your best games
4. **Time Management**: Some games have time pressure elements
5. **Stay Consistent**: Steady performance across all games wins tournaments

### Technical Tips

1. **Stable Connection**: Ensure reliable internet for score submission
2. **Browser Compatibility**: Use modern browsers (Chrome, Firefox, Safari, Edge)
3. **Mobile Optimization**: Tournament system works on all devices
4. **Keyboard vs Touch**: Choose input method that works best for you
5. **Performance**: Close unnecessary browser tabs for optimal game performance

## Troubleshooting

### Common Issues

**Tournament Not Loading**
- Refresh the page
- Clear browser cache
- Check browser console for errors

**Scores Not Updating**
- Ensure you completed the game properly
- Check tournament dashboard for updates
- Verify you're in the correct tournament

**Navigation Problems**
- Use browser back button or tournament navigation
- Return to main page and re-enter tournament system
- Check that JavaScript is enabled

**Mobile Issues**
- Rotate device for better layout
- Use touch controls instead of keyboard
- Ensure sufficient screen space for game canvas

### Getting Help

1. **Check Console**: Browser developer tools show error messages
2. **Test Navigation**: Use the test page at `test-tournament-navigation.html`
3. **Verify Setup**: Ensure all tournament files are properly loaded
4. **Browser Support**: Update to latest browser version

## Advanced Features

### Data Management

- **Export Tournaments**: Download complete tournament data
- **Import Tournaments**: Restore from backup files
- **Archive Old Data**: Clean up storage space
- **Performance Monitoring**: Track system performance metrics

### Accessibility

- **Keyboard Navigation**: Full tournament system accessible via keyboard
- **Screen Reader Support**: ARIA labels and semantic markup
- **High Contrast**: Compatible with high contrast display modes
- **Mobile Accessibility**: Touch-optimized controls with proper sizing

### Integration

- **Game Integration**: Tournament system works with all existing games
- **Non-Invasive**: No modifications required to game code
- **Event-Driven**: Uses CustomEvents for communication
- **Modular Design**: Easy to extend with new features

## API Reference

For developers wanting to integrate new games or extend tournament functionality, see the [Tournament API Documentation](TOURNAMENT_API.md) for detailed technical specifications.

---

**Need Help?** Check the main [README.md](README.md) for additional information or refer to the [Development Guide](DEVELOPMENT.md) for technical details.
