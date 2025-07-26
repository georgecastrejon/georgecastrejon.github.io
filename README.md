# QA Professional Portfolio

Single Page Application (SPA) showcasing my Quality Assurance (QA) services and professional experience.

## Project Overview

This portfolio is designed to present my expertise in Quality Assurance, highlighting testing methodologies, automation capabilities, and professional services in software quality.

## Architecture

### Frontend Structure
```
├── assets/
│   ├── flags/      # Language selector flags (en.png, es.png)
│   ├── ico/        # Navigation icons
│   └── img/        # QA-related images and portfolio assets
├── scripts/
│   └── animations.js    # SPA interactions and animations
├── styles/
│   ├── _animations.scss # Transition and animation styles
│   ├── _base.scss      # Base styles
│   ├── _components.scss # UI components
│   ├── _layout.scss    # Page layout
│   ├── _mixins.scss    # SCSS utilities
│   ├── _responsive.scss # Responsive design
│   └── styles.scss     # Main style entry point
├── index.html          # Spanish version
└── index-en.html       # English version
```

### SPA Implementation Features

- **Single Page Design**: Smooth navigation without page reloads
- **Responsive Layout**: Optimized for all device sizes
- **Bilingual Support**: Spanish and English versions
- **Dynamic Content Loading**: Efficient resource management
- **Smooth Transitions**: Professional animations between sections

## QA Services Showcased

- Manual Testing
- Test Automation
- Performance Testing
- Mobile Testing
- API Testing
- Test Planning & Strategy
- Quality Processes Implementation
- Test Documentation

## Technical Stack

- **Frontend**:
  - HTML5 Semantic Markup
  - SCSS for styled components
  - Vanilla JavaScript for SPA functionality
  - Responsive Design
  
- **Build Tools**:
  - SASS compiler for CSS preprocessing
  - NPM for package management

## Development Setup

1. Clone the repository:
```bash
git clone https://github.com/georgecastrejon/georgecastrejon.github.io.git
```

2. Install dependencies:
```bash
npm install
```

3. Start SASS compilation:
```bash
npm run watch
```

## Multilanguage Implementation

The portfolio implements language switching through:
- Dedicated HTML files for each language
- Language detection based on user preferences
- Easy language toggle with flag indicators
- URL-based language selection

## Style Organization

- `_animations.scss`: Page transitions and UI animations
- `_base.scss`: Foundation styles
- `_components.scss`: Reusable UI elements
- `_layout.scss`: Page structure and grid
- `_mixins.scss`: SCSS functions and utilities
- `_responsive.scss`: Media queries
- `styles.scss`: Main stylesheet

## Deployment

The portfolio is hosted on GitHub Pages with automatic deployment from the master branch.

## License

ISC License
