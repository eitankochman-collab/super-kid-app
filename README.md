# 🦸 Super Kid App

A tablet-first task management app for kids with parent controls, built with React, TypeScript, and Tailwind CSS.

## Features

### Kid Mode (Main Screen)
- **Two side-by-side kid cards**: Lior (8) and Roni (6)
- **Morning & Evening routines**: Tabbed interface for each kid
- **Bilingual tasks**: Hebrew on top, English below with emoji icons
- **Audio playback**: TTS (Text-to-Speech) for English task names
- **Progress tracking**: Visual progress bar showing completion percentage
- **Celebration**: Full-screen confetti + sound when all tasks are completed
- **Touch-friendly**: Large buttons optimized for kids

### Parent Controls (PIN-Protected)
- **PIN protection**: 4-digit PIN (default: `1234`)
- **5-minute unlock window**: After correct PIN, parent actions are unlocked for 5 minutes
- **Star awarding**: Parents can award ⭐ to completed tasks
- **Star Bank**: Each kid accumulates stars
- **Lock now**: Manual lock button for parents
- **Reset done**: Testing feature to reset all task completion

### Admin Panel
- **Star Bank overview**: View total stars for each kid
- **Rewards system**: Pre-defined rewards with star costs
  - 🎬 Movie night (10 stars)
  - 📱 Extra screen time (5 stars)
  - 🎉 Special outing (15 stars)
- **Reward redemption**: Subtract stars when kids redeem rewards

### Data Persistence
- **localStorage**: All data persists between sessions
- **Per-kid tracking**: Task completion and star banks saved individually

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## Usage Guide

### For Kids 👶
1. **Select your card**: Lior or Roni
2. **Choose routine**: Tap "Morning" or "Evening" tab
3. **Complete tasks**: Read the task (Hebrew + English) and tap "Done ✅"
4. **Listen**: Tap the 🔊 icon to hear the English task name
5. **Watch progress**: See your progress bar fill up
6. **Celebrate**: Complete all tasks to see confetti and "Super Kid!" badge

### For Parents 👨‍👩‍👧‍👦
1. **Unlock parent mode**: Tap "Parent" button and enter PIN (default: `1234`)
2. **Award stars**: After unlocking, tap ⭐ +1 button on completed tasks
3. **View admin panel**: Access star banks and rewards
4. **Redeem rewards**: In admin panel, tap kid's name next to a reward to redeem
5. **Lock manually**: Tap "Lock Now" to end the 5-minute unlock window
6. **Reset for testing**: Tap "Reset" to clear all task completion (requires PIN)

### Default Tasks

**Morning Routine:**
- 🌅 Wake up
- 🚽 Bathroom
- 👕 Get dressed
- 🥣 Breakfast
- 👟 Shoes & socks
- 🎒 Water bottle in bag
- 😌 Leave calmly

**Evening Routine:**
- 🍱 Lunchbox to sink
- 👞 Shoes to closet
- 📚 Hebrew homework
- 🧹 Tidy playroom
- 🛏️ Sleep in own bed (Roni only)

## Technical Stack

- **Framework**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **State Management**: React useState + useEffect
- **Persistence**: localStorage
- **Audio**: Web Audio API + SpeechSynthesis API

## Component Architecture

```
App.tsx (main state management)
├── KidCard.tsx (per-kid card with tabs)
│   ├── TaskList.tsx (list of tasks)
│   │   └── TaskItem.tsx (individual task with TTS)
│   └── ConfettiOverlay.tsx (celebration screen)
├── PinModal.tsx (PIN entry)
└── AdminPanel.tsx (parent admin interface)
    └── RewardList (embedded in AdminPanel)

Data Layer:
├── types.ts (TypeScript interfaces)
├── data.ts (initial tasks and rewards)
└── storage.ts (localStorage helpers)
```

## Project Structure

```
super-kid/
├── src/
│   ├── components/
│   │   ├── AdminPanel.tsx
│   │   ├── ConfettiOverlay.tsx
│   │   ├── KidCard.tsx
│   │   ├── PinModal.tsx
│   │   ├── TaskItem.tsx
│   │   └── TaskList.tsx
│   ├── App.tsx
│   ├── data.ts
│   ├── storage.ts
│   ├── types.ts
│   ├── index.css
│   └── main.tsx
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Customization

### Change Default PIN
Edit `src/data.ts`:
```typescript
export const DEFAULT_PIN = '1234'; // Change to your PIN
```

### Add/Remove Tasks
Edit `src/data.ts` to modify `morningTasks`, `eveningTasks`, or `roniEveningTasks` arrays.

### Add/Remove Rewards
Edit `src/data.ts` to modify `defaultRewards` array.

### Adjust Unlock Duration
Edit `src/App.tsx`, line with `5 * 60 * 1000` (currently 5 minutes).

## Browser Compatibility

- **Modern browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **TTS Support**: SpeechSynthesis API (gracefully falls back if unavailable)
- **Audio**: Web Audio API for celebration sounds

## Development Notes

- State persists in localStorage with key: `super-kid-app-state`
- No external dependencies beyond React, Tailwind, and Vite
- Fully responsive: mobile-first, tablet-optimized, desktop-friendly
- Touch-optimized with `-webkit-tap-highlight-color: transparent`

## License

MIT License - feel free to use and modify for your family!

---

Built with ❤️ for Lior and Roni
