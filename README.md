# 🎮 Wordy - Word Puzzle Game

A beautiful and engaging mobile word puzzle game built with React Native and Expo. Challenge yourself across multiple categories and levels while enjoying smooth animations and immersive sound effects.

![Wordy Game](assets/images/icon.png)

## ✨ Features

### 🎯 Core Gameplay
- **9 Diverse Categories**: Art & Literature, Food & Culture, Games & Technology, General Knowledge, History & Civilization, Movies & Pop Culture, Planet Earth, Science & Nature, Travel & Geography
- **Progressive Difficulty**: Questions organized by word length with increasing complexity
- **Smart Hint System**: Get hints when stuck, earn more by watching rewarded ads
- **Auto-Reveal Mechanism**: Correctly answered words reveal matching letters in other questions
- **Level Progression**: Automatic save system tracks your progress in each category

### 🎨 User Experience
- **Beautiful Animations**: Lottie animations for categories and interactions
- **Immersive Sound**: Background music playlist with volume control
- **Sound Effects**: Feedback for correct/wrong answers, level completion, and UI interactions
- **Haptic Feedback**: Tactile responses for enhanced mobile experience
- **Responsive Design**: Optimized for various screen sizes

### 🎵 Audio System
- Background music with playlist rotation
- Adjustable volume controls
- Persistent audio settings
- Sound effects for game events

### 💰 Monetization
- Rewarded ads integration for earning hints
- Google Mobile Ads implementation

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for Mac) or Android Emulator

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Wordy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on your device**
   - Scan the QR code with Expo Go app (iOS/Android)
   - Press `i` for iOS simulator
   - Press `a` for Android emulator

### Building for Production

#### iOS
```bash
npm run ios
# or
expo run:ios
```

#### Android
```bash
npm run android
# or
expo run:android
```

## 📁 Project Structure

```
Wordy/
├── app/                    # App screens (Expo Router)
├── assets/                 # Images, sounds, and animations
│   ├── images/            # Lottie animations and backgrounds
│   └── sounds/            # Music and sound effects
├── components/            # Reusable UI components
│   ├── CustomAlert.js     # Custom alert dialog
│   ├── Grid.js            # Game grid component
│   ├── Keyboard.js        # On-screen keyboard
│   ├── Letter.js          # Letter cell component
│   ├── LevelCompleteModal.js  # Level completion modal
│   ├── SettingsModal.js   # Settings dialog
│   └── Word.js            # Word component
├── context/               # React Context providers
│   └── MusicContext.js    # Music playback management
├── hooks/                 # Custom React hooks
│   └── useSound.js        # Sound effect hook
├── navigation/            # Navigation configuration
│   └── AppNavigator.js    # Main navigation setup
├── screens/               # Main game screens
│   ├── HomeScreen.js      # Home menu and category selection
│   └── GameScreen.js      # Main gameplay screen
├── utils/                 # Utility functions
├── questions_db.json      # Question database
├── app.json              # Expo configuration
└── package.json          # Dependencies

```

## 🎮 How to Play

1. **Select a Category**: Choose from 9 different knowledge categories
2. **Read the Questions**: Each level has 5 questions to solve
3. **Type Your Answers**: Use the on-screen keyboard to fill in the blanks
4. **Use Hints Wisely**: Start with 3 hints, earn more by watching ads
5. **Auto-Reveal Magic**: Correct answers reveal matching letters in other questions
6. **Complete Levels**: Solve all questions to advance to the next level
7. **Track Progress**: Your level progress is automatically saved

## 🛠️ Technical Details

### Technologies Used
- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tooling
- **Lottie**: Beautiful vector animations
- **Expo AV**: Audio playback
- **AsyncStorage**: Local data persistence
- **React Navigation**: Screen navigation
- **Google Mobile Ads**: Rewarded ad integration

### Key Components

#### GameScreen.js
- Main game logic and state management
- Question loading and level progression
- Answer validation with cascade reveal
- Hint system and ad integration

#### Keyboard.js
- Custom on-screen keyboard
- Optimized with useMemo for performance
- Responsive sizing based on screen width

#### MusicContext.js
- Global music state management
- Playlist rotation
- Volume control with persistence
- Automatic cleanup on unmount

#### useSound.js
- Custom hook for sound effects
- Memory leak prevention
- Proper cleanup on component unmount

### Performance Optimizations
- Memoized style calculations in Keyboard component
- Proper cleanup of audio resources
- Efficient state management
- Optimized re-renders with React hooks

## 🎨 Customization

### Adding New Categories
1. Add questions to `questions_db.json` with the new category name
2. Add a Lottie animation file to `assets/images/`
3. Update `categoryAnimationsMap` in `HomeScreen.js`

### Changing Colors
Edit the color scheme in component StyleSheets:
- Primary: `#4A7E8E`
- Secondary: `#1C3B4F`
- Accent: `#68919E`
- Text: `#E1E2E1`

### Adding Music Tracks
1. Add MP3 files to `assets/sounds/`
2. Update `musicPlaylist` array in `MusicContext.js`

## 🐛 Known Issues & Fixes

### Recent Bug Fixes
- ✅ Fixed undefined `questionIndex` in handleEnter function
- ✅ Optimized Keyboard component to prevent style recreation
- ✅ Added memory leak prevention in useSound hook
- ✅ Implemented volume persistence in MusicContext

## 📝 License

This project is private and proprietary.

## 👨‍💻 Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Code Quality
- Follow React Native best practices
- Use functional components with hooks
- Implement proper error handling
- Clean up resources in useEffect cleanup functions

## 🤝 Contributing

This is a private project. For questions or issues, please contact the development team.

## 📧 Support

For support, please contact: [your-email@example.com]

---

**Made with ❤️ using React Native & Expo**
