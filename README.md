# Personadle

**Play now!!!**: [personadle.vercel.app](https://personadle.vercel.app)

A word puzzle game inspired by Wordle, but with a twist - you're guessing Persona characters from the beloved Shin Megami Tensei series! Each game brings a new challenge as you try to identify the mysterious Persona using hints about their affinities, weaknesses, and characteristics.



## How to Play

1. **Guess the Persona** - Type your guess and press Enter =)
2. **Get Visual Feedback** - See which letters are correct, in the wrong position, or not in the name at all
3. **Use the Hints!!!** - Pay attention to the affinity icons showing weaknesses and resistances
4. **Win in 6 Tries** - You have only 6 attempts to guess the correct Persona, use your tries wisely!!

## Features

- **Affinity System** - Visual hints with elemental weaknesses and resistances
- **Clean UI** - modern design with smooth animations
- **Responsive** - Works both on desktop and mobile
- **Rich Database** - Hundreds of Personas to be guessed!
- **Progressive Hints** - Get letter hints as you make more attempts

-- **SEO** is optimized by a.i.(soon i'll optimize it myself because some areas are not covered at all ._.)
## Tech Stack

This project is built with the following web technologies:

- **Vite** - Lightning-fast build tool and dev server
- **React 19** - Latest React with hooks and modern patterns
- **Tailwind CSS** - Utility-first CSS framework for rapid styling
- **TypeScript** - Type-safe JavaScript for better development experience
- **Vercel** - Easy deployment and hosting

## Project Structure

```
personadle/
├── public/                 # Static assets
│   ├── icons/             # Element affinity icons
│   ├── fonts/             # Custom fonts
│   └── personas.json      # Game data
├── src/
│   ├── components/        # React components
│   │   ├── GameBoard.tsx  # Main game logic
│   │   ├── PersonaModal.tsx # End game modal
│   │   ├── PersonaInfo.tsx # Character display
│   │   └── ...
│   ├── utils/             # Helper functions
│   │   ├── personaTypes.ts # Type definitions
│   │   └── imageProxy.ts  # Image loading utilities
│   ├── types/             # TypeScript interfaces
│   └── App.tsx           # Main application component
└── package.json          # Dependencies and scripts
```

## Key Components

### Game Logic (`GameBoard.tsx`)

Handles the core game mechanics - letter validation, visual feedback, and win/lose conditions.

### Character Display (`PersonaInfo.tsx`)

Shows the current Persona image, stats, and elemental affinities in a clean card format.

### Modal System (`PersonaModal.tsx`)

Displays the final result with character information and restart functionality.

### Affinity System (`personaTypes.ts`)

Manages the complex elemental system with visual icons and color coding for different damage types.

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/personadle.git

# Navigate to project directory
cd personadle

# Install dependencies
npm install

# Start development server
npm run dev
```

Found a bug or want to add a feature? Feel free to:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

This project is for educational and entertainment purposes. All Persona characters and related content are property of Atlus.
I also want to thank luyluish, the owner of the Persona Compendium API: https://github.com/luyluish/persona-compendium for exposing all of the data in which my game's based on.

<img src="https://media1.tenor.com/m/l5NzL2YP8aMAAAAd/narukami.gif" width="200" height="200"/>
