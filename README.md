# Shop Floor Lite - Manufacturing Management App

A robust, offline-first mobile application for manufacturing floor management built with React Native (Expo) and TypeScript.

## Overview

Shop Floor Lite enables operators to capture downtime and maintenance tasks while allowing supervisors to review and acknowledge alerts, even in areas with unreliable Wi-Fi connectivity.

## Features

### 1. Authentication & Roles
- Simple email-based authentication (mock JWT)
- Role selection: **Operator** or **Supervisor**
- Persistent login state
- Tenant-based data isolation

### 2. Machine Dashboard
- Real-time machine status display (RUN, IDLE, OFF)
- Visual status indicators with color coding
- Quick access to machine-specific actions
- Sync queue visibility badge

### 3. Downtime Capture (Operator)
- **Start Downtime** workflow with 2-level reason tree
- Categories: Power (Grid/Internal), Changeover (Tooling)
- Photo attachment with automatic compression (≤200KB)
- Camera and gallery support
- Offline queueing with automatic sync

### 4. Maintenance Checklist (Operator)
- Task status tracking: Due, Overdue, Done
- Completion notes for each task
- Offline persistence with sync indicators
- Machine-specific checklists

### 5. Alert Management (Supervisor)
- Real-time alert stream with severity levels (Low/Medium/High)
- Status workflow: Created → Acknowledged → Cleared
- Acknowledgment tracking (who and when)
- Auto-generation of simulated alerts
- Priority sorting

### 6. Summary Reports
- **Current shift overview** (last 8 hours)
- Key Performance Indicators (KPIs):
  - **Uptime Percentage** - Critical metric for production efficiency
  - **Total Downtime** - Identifies productivity losses
  - **Active Downtime Events** - Ongoing issues requiring attention
  - **Most Common Downtime Reason** - Helps prioritize improvement efforts
  - **Overdue Maintenance** - Prevents equipment failures
  - **Critical Alerts** - High-severity alerts requiring immediate action
  - **Alert Resolution Rate** - Measures response effectiveness

## Technical Architecture

### Offline-First Strategy

#### Data Persistence
- **AsyncStorage**: Primary local storage for all data
- **Zustand Store**: In-memory state management with persistence
- Data persisted on every change to survive app kills

#### Sync Queue Implementation
```
User Action → Local Storage Update → Sync Queue Entry → Auto-Sync (when online)
```

**Key Components:**
1. **Queue Management**: All offline changes added to sync queue with unique IDs
2. **Idempotency**: Using unique IDs and timestamps to prevent duplicate uploads
3. **Network Detection**: expo-network monitors connection status every 5 seconds
4. **Auto-Sync**: Processes queue automatically when connection detected
5. **Sync Visibility**: Badge showing pending items count + "Syncing..." indicator

#### Data Integrity
- Unique IDs (`id: 'prefix-${Date.now()}'`) prevent duplicates
- Timestamp tracking for conflict resolution
- Boolean `synced` flag on all data objects
- Queue items removed only after successful sync

### State Management

Using **Zustand** for:
- Clean, scalable state without boilerplate
- Built-in persistence integration
- Minimal re-renders
- TypeScript support

### Technology Stack

- **React Native** with Expo (TypeScript)
- **Zustand** - State management
- **AsyncStorage** - Local persistence
- **React Navigation** - Navigation (Stack + Bottom Tabs)
- **expo-image-picker** - Photo capture
- **expo-image-manipulator** - Image compression
- **expo-network** - Network status monitoring

## Setup and Run Instructions

### Prerequisites
- Node.js 16+ installed
- npm or yarn
- Expo Go app on Android device (or Android Studio for emulator)

### Installation

```bash
# Navigate to project directory
cd limelight-assignment

# Install dependencies (if not already done)
npm install

# Start the development server
npm start
```

### Running the App

#### Option 1: Android Emulator
```bash
npm run android
```

#### Option 2: Physical Device (Recommended for testing offline functionality)
1. Install **Expo Go** from Google Play Store
2. Run `npm start` in terminal
3. Scan QR code with Expo Go app
4. App will load on your device

### Building APK

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure build
eas build:configure

# Build APK for Android
eas build --platform android --profile preview
```

The APK will be available for download from the Expo dashboard.

## Testing Offline Functionality

### Recommended Testing Flow:

1. **Start with connection:**
   - Login as Operator
   - Navigate to a machine
   - Note the sync queue shows 0 items

2. **Enable Airplane Mode:**
   - Start downtime with photo
   - Complete maintenance task
   - Observe "Pending sync" indicators
   - Check sync queue badge shows pending items
   - Exit and kill the app

3. **Verify Persistence:**
   - Reopen app (still in Airplane Mode)
   - Data should persist
   - Queue should show same count

4. **Disable Airplane Mode:**
   - Watch sync queue process automatically
   - "Syncing..." indicator appears
   - Items marked as synced
   - Queue badge clears

5. **Test Supervisor Role:**
   - Logout and login as Supervisor
   - Navigate to Alerts tab
   - Acknowledge alerts (works offline)
   - Test sync on reconnection

## KPI Selection Rationale

The Summary Report displays carefully chosen metrics that provide maximum value to Shop Floor Managers:

### Production Metrics
- **Uptime %**: Most critical metric - directly correlates to production output
- **Total Downtime**: Quantifies productivity losses in minutes

### Operational Intelligence
- **Active Downtime**: Real-time awareness of ongoing issues
- **Most Common Reason**: Data-driven insights for root cause analysis

### Preventive Maintenance
- **Overdue Tasks**: Early warning system for potential failures
- **Pending Tasks**: Workload visibility for planning

### Response Effectiveness
- **Critical Alerts**: Immediate attention items for supervisors
- **Alert Resolution Rate**: Measures team responsiveness and efficiency

Each metric is color-coded (green/amber/red) to enable at-a-glance status assessment.

## Project Structure

```
src/
├── screens/           # All screen components
│   ├── LoginScreen.tsx
│   ├── DashboardScreen.tsx
│   ├── MachineDetailScreen.tsx
│   ├── DowntimeCaptureScreen.tsx
│   ├── MaintenanceChecklistScreen.tsx
│   ├── AlertManagementScreen.tsx
│   └── SummaryReportsScreen.tsx
├── store/
│   └── index.ts       # Zustand store with persistence
├── types/
│   └── index.ts       # TypeScript type definitions
├── constants/
│   └── seedData.ts    # Initial machine and reason data
└── components/        # Reusable components (future)
```

## Future Enhancements

- Real API integration with authentication
- Push notifications for critical alerts
- Offline photo queue (base64 encoding)
- Export reports to PDF
- Multi-shift tracking
- Advanced analytics and trends
- Barcode/QR scanning for machines
- Voice notes for maintenance

## License

MIT

## Author

Built for LimeLightIT Full Stack Developer Challenge

---

**Note**: This is an MVP implementation. The mock JWT and simulated sync demonstrate the architecture that would integrate with a real backend API.
