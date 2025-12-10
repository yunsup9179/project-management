# Gantt Chart Generator

Professional Gantt chart tool for EV charging installation projects with customizable columns.

## Features

- ✅ Custom columns (add fields like Assignee, Status, Priority, etc.)
- ✅ Multi-phase project support
- ✅ Visual timeline with automatic date calculations
- ✅ Print-to-PDF functionality (Ctrl+P)
- ✅ Save/load projects from localStorage
- ✅ Export projects as JSON

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production

```bash
npm run build
```

The built files will be in the `dist/` folder.

## How to Use

1. **Project Info**: Enter project name and client name
2. **Custom Columns**: Add any additional fields you need (Assignee, Status, etc.)
3. **Add Tasks**:
   - Select phase
   - Enter task name, start date, end date
   - Fill in custom fields
   - Click "Add Task"
4. **Generate Chart**: Click "Generate Gantt Chart"
5. **Print/Export**: Press Ctrl+P or click "Print / Save PDF"

## Customization

### Adding Default Phases

Edit [src/components/App.tsx](src/components/App.tsx):

```typescript
const [phases, setPhases] = useState<Phase[]>([
  { id: '1', name: 'Your Phase Name', color: '#3b82f6' },
  // Add more phases...
]);
```

### Styling

- Main styles: [src/styles/App.css](src/styles/App.css)
- Print styles: [src/styles/print.css](src/styles/print.css)

## Tech Stack

- React 18
- TypeScript
- Vite
- Pure CSS (no external UI libraries)

## Browser Support

Modern browsers (Chrome, Firefox, Safari, Edge)
