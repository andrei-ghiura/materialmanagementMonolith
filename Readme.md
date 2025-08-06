# Material Management Application

## Overview
A mobile-first web application for managing woodworking materials, designed for Romanian users. The application provides comprehensive material tracking, QR code integration, and component management functionality.

## Features

### Material Management
- **Material Types**: 
  - BSTF (Buștean Fag) - Raw beech log
  - BSTN (Buștean) - Raw log
  - CHRF (Cherestea Fag) - Beech lumber
  - CHRR (Cherestea Rășinoase) - Softwood lumber
  - PALF (Palet Fag) - Beech pallet
  - PALR (Palet Rășinoase) - Softwood pallet

### Material Properties
- Unique identifier system with human-readable IDs
- Species selection
- Dimensions (length, diameter)
- Volume tracking (raw volume, processed volume)
- Location coordinates
- APV (Authorization for Wood Harvesting) tracking
- Red plate number tracking
- Component management system
- Custom notes and observations

### QR Code Integration
- QR code generation for each material
- Mobile camera scanning support
- Web-based QR scanning for desktop usage
- Component linking via QR codes

## Views

### Material List (Home)
- Responsive grid layout showing all materials
- Material type and species display
- Quick access to material details
- Floating Action Button for:
  - Creating new materials
  - Scanning QR codes
- Swipe actions for material deletion

### Material Details
- Complete material information form
- Component management section
  - Add components via QR scanning
  - View and navigate to component details
- QR code generation and download
- Actions:
  - Save/Update material
  - Delete material
  - Export component tree
  - Unsaved changes protection

### Material Export
- Hierarchical view of material components
- Recursive component tree display

## Technical Stack

### Frontend
- Ionic Framework with React
- Tailwind CSS for styling
- Capacitor for native mobile features
- HTML5-QRCode for web-based scanning

### Backend
```sh
node --watch server.js
```

### UI Development
```sh
npm run dev
```

### Database
```sh
docker-compose up
```

## Mobile Support
- Native camera integration for QR scanning
- Responsive design for all screen sizes
- Touch-optimized interface
- Works both as a web app and native mobile app

## Data Persistence
- MongoDB database integration
- Automatic ID generation
- Component relationship tracking
- Change tracking with unsaved changes protection