# AIMED Wireframes and UI/UX Documentation

## User Interface Overview

### 1. Dashboard Layout
```
+------------------------------------------+
|           AIMED Health Monitor            |
+-------------+----------------------------+
| Navigation  |     Main Dashboard         |
|             |                           |
| [Dashboard] |   Health Metrics          |
| [Alerts]    | +----------------------+  |
| [Profile]   | |    Heart Rate        |  |
| [Settings]  | |    ❤️ 75 BPM         |  |
|             | |    [Graph View]      |  |
|             | +----------------------+  |
|             |                           |
|             | +----------------------+  |
|             | |  Blood Pressure      |  |
|             | |  120/80 mmHg        |  |
|             | |  [History]          |  |
|             | +----------------------+  |
|             |                           |
|             | +----------------------+  |
|             | |   Oxygen Level      |  |
|             | |    98%              |  |
|             | |   [Details]         |  |
|             | +----------------------+  |
+-------------+---------------------------+
```

### 2. Alert Screen
```
+------------------------------------------+
|              Active Alerts               |
+------------------------------------------+
| ⚠️ High Heart Rate Alert                 |
| Time: 10:15 AM                          |
| Status: Active                          |
| [View Details] [Acknowledge]            |
+------------------------------------------+
| ℹ️ Blood Pressure Check Reminder         |
| Time: 09:30 AM                          |
| Status: Pending                         |
| [View Details] [Dismiss]                |
+------------------------------------------+
| Filter: [All] [Active] [Resolved]       |
+------------------------------------------+
```

### 3. Health Metrics Detail View
```
+------------------------------------------+
|           Heart Rate Analysis            |
+------------------------------------------+
|                                          |
|     ┌────────────────────────┐          |
|  BPM│        •   •           │          |
|     │    •       •   •       │          |
|     │  •             •       │          |
|     └────────────────────────┘          |
|      9AM   10AM   11AM   12PM          |
|                                          |
| Current: 75 BPM                         |
| Average: 72 BPM                         |
| Range: 65-85 BPM                        |
|                                          |
| Risk Assessment: Low Risk               |
| [Export Data] [Share with Doctor]       |
+------------------------------------------+
```

### 4. Settings Panel
```
+------------------------------------------+
|              Settings                    |
+------------------------------------------+
| User Profile                             |
| ├── Personal Information                 |
| │   [Edit]                              |
| │                                        |
| ├── Connected Devices                    |
| │   [Add Device] [Manage Devices]        |
| │                                        |
| ├── Alert Preferences                    |
| │   [Configure]                          |
| │                                        |
| └── Data Sharing                         |
|     [Manage Permissions]                 |
+------------------------------------------+
```

## Mobile View Layouts

### 1. Mobile Dashboard
```
+----------------------+
|    AIMED Health     |
+----------------------+
| ☰ Menu              |
+----------------------+
|   Current Status    |
| ❤️ 75 BPM           |
| 📊 [View Graph]     |
+----------------------+
|   Blood Pressure    |
| 120/80 mmHg         |
| 📈 [History]        |
+----------------------+
|   Oxygen Level      |
| 98%                 |
| ℹ️ [Details]        |
+----------------------+
| [+ Add Reading]     |
+----------------------+
```

### 2. Mobile Alert View
```
+----------------------+
|      Alerts         |
+----------------------+
| Filter: [Active ▼]  |
+----------------------+
| ⚠️ High Heart Rate  |
| 10:15 AM            |
| [View] [Ack]        |
+----------------------+
| ℹ️ BP Check Due     |
| 09:30 AM            |
| [View] [Dismiss]    |
+----------------------+
```

## Interactive Elements

### 1. Alert Notification
```
+------------------+
|    ⚠️ ALERT     |
+------------------+
| High Heart Rate  |
| Detected: 150 BPM|
|                  |
| [View] [Dismiss] |
+------------------+
```

### 2. Data Input Modal
```
+--------------------------------+
|      Add Health Reading        |
+--------------------------------+
| Reading Type: [Heart Rate ▼]   |
|                                |
| Value: [___] BPM              |
|                                |
| Time: [Now ▼]                 |
|                                |
| Notes: [____________]          |
|                                |
| [Cancel]        [Save]        |
+--------------------------------+
```

## Color Scheme and Typography

### Colors
```css
:root {
  /* Primary Colors */
  --primary: #007AFF;      /* Main brand color */
  --secondary: #5856D6;    /* Secondary actions */
  
  /* Status Colors */
  --success: #34C759;      /* Normal readings */
  --warning: #FF9500;      /* Caution */
  --danger: #FF3B30;       /* Critical alerts */
  
  /* Neutral Colors */
  --background: #F2F2F7;   /* Main background */
  --surface: #FFFFFF;      /* Cards and panels */
  --text-primary: #000000; /* Primary text */
  --text-secondary: #8E8E93;/* Secondary text */
}
```

### Typography
```css
/* Font Hierarchy */
.heading-1 {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont;
  font-size: 34px;
  font-weight: 700;
}

.heading-2 {
  font-family: 'SF Pro Display', -apple-system, BlinkMacSystemFont;
  font-size: 28px;
  font-weight: 600;
}

.body-text {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont;
  font-size: 17px;
  line-height: 1.5;
}

.caption {
  font-family: 'SF Pro Text', -apple-system, BlinkMacSystemFont;
  font-size: 13px;
  color: var(--text-secondary);
}
```

## Responsive Breakpoints
```css
/* Breakpoints */
--mobile: 320px;
--tablet: 768px;
--desktop: 1024px;
--large-desktop: 1440px;

/* Media Queries */
@media (min-width: 768px) {
  .dashboard-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
```

## Animation Guidelines

### Transitions
```css
/* Standard Transitions */
.transition-standard {
  transition: all 0.3s ease-in-out;
}

/* Alert Animations */
@keyframes alertPulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

.alert-critical {
  animation: alertPulse 2s infinite;
}
```

## Accessibility Features

### ARIA Labels
```html
<!-- Example of accessible alert -->
<div role="alert" aria-live="assertive">
  <span aria-label="Warning">⚠️</span>
  High Heart Rate Detected
</div>

<!-- Navigation -->
<nav aria-label="Main navigation">
  <button aria-label="View Dashboard">
    Dashboard
  </button>
</nav>
```

## Component States

### Button States
```
[Default] → [Hover] → [Active] → [Disabled]
   ↓          ↓          ↓          ↓
Normal     Elevated    Pressed    Greyed
```

### Alert States
```
[Active] → [Acknowledged] → [Resolved]
   ↓            ↓             ↓
  Red        Yellow         Green
```

## Implementation Notes

1. **Responsive Design**
   - Use CSS Grid for dashboard layout
   - Flexbox for component alignment
   - Mobile-first approach

2. **Performance**
   - Lazy load graphs and charts
   - Optimize for 60fps animations
   - Cache frequent data points

3. **Accessibility**
   - WCAG 2.1 AA compliance
   - Screen reader support
   - Keyboard navigation

4. **Cross-browser Support**
   - Chrome, Safari, Firefox, Edge
   - iOS Safari
   - Android Chrome
