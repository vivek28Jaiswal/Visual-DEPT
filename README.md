# Visual DEPT

A modern, production-ready frontend setup built for creative web development.

## Tech Stack
- **Framework:** [React 19](https://react.dev/) + [Vite 6](https://vite.dev/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Smooth Scroll:** [Lenis](https://lenis.darkroom.engineering/)
- **Animation Ready:** [GSAP 3](https://gsap.com/) + [@gsap/react](https://gsap.com/resources/React/)
- **Icons:** [lucide-react](https://lucide.dev/)

## Folder Structure

```
Visual DEPT/
├── public/                     # Static public assets
│   └── fonts/                  # Web fonts accessible directly
├── src/
│   ├── assets/                 # Processed assets (fonts, images, SVGs)
│   ├── components/             # Reusable UI components
│   │   ├── common/             # Shared utility components (buttons, badges)
│   │   ├── layout/             # Header, Footer, Navbar, Containers
│   │   └── ui/                 # Atomic UI primitives
│   ├── hooks/                  # Custom React hooks (e.g., useLenisScroll)
│   ├── lib/                    # Library configs & singleton instances
│   │   ├── gsap.js             # GSAP & ScrollTrigger setup
│   │   └── lenis.js            # Lenis smooth scroll configuration
│   ├── providers/              # Context Providers (SmoothScrollProvider)
│   ├── styles/                 # Global styles and Tailwind configuration
│   ├── App.jsx                 # Main application view
│   └── main.jsx                # Entry point
├── jsconfig.json               # Absolute import path aliases (@/* -> src/*)
├── package.json
└── vite.config.js              # Vite configuration
```

## Getting Started

### 1. Development Server
```bash
npm run dev
```

### 2. Production Build
```bash
npm run build
```

### 3. Preview Production Build
```bash
npm run preview
```
