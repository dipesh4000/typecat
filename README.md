# 🐱 TypeCat

> **An adorable, gamified typing practice platform featuring interactive feline companions, real-time performance metrics, level progression, and dynamic themes.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.3-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-4.1-6E9F18?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

---

## ✨ Key Features

### 🐾 Animated Cat Companions
- **Interactive Characters**: Practice alongside unique companions including *Classic Cat*, *Luo Xiaohei*, *Elysia*, *Red Panda*, *Nailin*, *Suxin*, and *Anhe*.
- **Reactive State Machine**: Companions react to typing speed, precision, streaks, and pauses with real-time state changes (*Idle*, *Typing*, *Celebrating*, *Distracted*, *Annoyed*).
- **Tailored Visual Themes**: Distinct light and dark color themes dynamically applied based on your active cat companion.

### ⌨️ Precision Typing Engine
- **Real-Time Metrics**: Live tracking of Words Per Minute (WPM), Accuracy (%), Characters Per Minute (CPM), and error rates.
- **Flexible Modes**:
  - **Timed Modes**: 15s, 30s, 60s practice sessions.
  - **Word Counts**: 10, 25, 50 word sets.
  - **Custom Passages**: Practice with user-provided text snippets or custom passage uploads.
- **Fluid Typing Interface**: Character-by-character validation, smooth cursor tracking, and instant visual error feedback.

### 🎮 Gamification & Level Progression
- **XP & Leveling System**: Earn experience points calculated from your speed and accuracy to level up from Novice to Master.
- **Daily Streaks**: Maintain active practice streaks with daily tracking to build consistent typing habits.
- **Unlockable Achievements**: Earn trophies across speed milestones (*Speed Demon*), accuracy feats (*Accuracy Master*), streak consistency (*Streak Keeper*), and progression ranks.

### 📊 Stats & Analytics Dashboard
- **Session History**: Comprehensive log of all completed practice tests.
- **Lifetime Analytics**: Track total sessions, average WPM, peak speed records, and overall typing accuracy over time.

---

## 🛠️ Tech Stack

| Domain | Technology |
| :--- | :--- |
| **UI Framework** | [React 19](https://react.dev/) |
| **Language** | [TypeScript 6](https://www.typescriptlang.org/) |
| **Build Tooling** | [Vite 8](https://vite.dev/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) |
| **State Management** | [Zustand 5](https://github.com/pmndrs/zustand) |
| **Routing** | [React Router DOM v7](https://reactrouter.com/) |
| **Testing** | [Vitest](https://vitest.dev/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) |
| **Linting** | [ESLint 10](https://eslint.org/) |

---

## 📁 Project Structure

```text
typecat/
├── public/                 # Static assets & SVG icons
├── src/
│   ├── app/                # App layout, routing & main container
│   │   ├── App.tsx
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── routes.tsx
│   ├── features/           # Feature modules
│   │   ├── cat-companion/  # Companion characters, animations & state machine
│   │   ├── custom-texts/   # Custom passage reader & parser
│   │   ├── progression/    # XP, leveling & streak tracking
│   │   ├── stats/          # Charts & performance history
│   │   └── typing-engine/  # Typing metrics & caret engine
│   ├── pages/              # Primary route pages
│   │   ├── PracticePage/   # Main practice interface
│   │   ├── StatsPage/      # Detailed performance analytics
│   │   ├── AchievementsPage/# Unlocked achievements grid
│   │   └── SettingsPage/   # Customization & companion settings
│   ├── services/           # Content providers & API services
│   ├── shared/             # Reusable UI components, hooks & types
│   ├── stores/             # Zustand state management stores
│   │   ├── typingStore.ts
│   │   ├── catStore.ts
│   │   ├── progressionStore.ts
│   │   ├── statsStore.ts
│   │   └── settingsStore.ts
│   └── index.css           # Global Tailwind CSS imports & theme setup
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) (v18.0 or later) installed on your machine.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/dipesh4000/typecat.git
   cd typecat
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:5173`.

---

## 📜 Available Scripts

In the project directory, you can run:

| Command | Action |
| :--- | :--- |
| `npm run dev` | Runs the app in development mode with HMR |
| `npm run build` | Compiles TypeScript and creates an optimized production build |
| `npm run preview` | Previews the production build locally |
| `npm run test` | Executes unit test suite once via Vitest |
| `npm run test:watch` | Runs Vitest in interactive watch mode |
| `npm run lint` | Runs ESLint check across all source files |

---

## 🕹️ Architecture & State Management

TypeCat utilizes **Zustand** stores decoupled by feature responsibility:

- `useTypingStore`: Tracks current text, user input, cursor index, WPM, accuracy, timer state, and errors.
- `useCatStore`: Controls active companion character selection and triggers state transitions (*idle*, *typing*, *celebrating*, *annoyed*).
- `useProgressionStore`: Manages user XP, current level, level thresholds, and daily practice streaks.
- `useStatsStore`: Stores historical session records, lifetime metrics, and performance analytics.
- `useSettingsStore`: Stores sound preferences, timer/word length options, and theme configurations.

Session conclusions trigger central orchestration via `onSessionComplete()`, calculating XP, updating statistics, checking achievement conditions, and animating your cat companion.

---

## 🤝 Contributing

Contributions are welcome! If you have suggestions or bug reports, feel free to open an issue or submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
