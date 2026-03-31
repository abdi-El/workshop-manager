# Workshop Manager

A desktop app for automotive workshops to manage customers, vehicles, estimates, and appointments — built with Tauri, React, and SQLite.

## Features

- **Estimates** — create, edit, and export repair estimates to PDF
- **Customers & Vehicles** — manage a registry of customers and their cars, linked to makes and models imported from Wikipedia
- **Appointments** — schedule jobs and link them to approved estimates via a calendar view
- **Multiple workshops** — switch between workshop profiles within the same app
- **Dark mode** — toggle between light and dark themes
- **Offline-first** — all data is stored locally in SQLite, no server required

## Tech Stack

| Layer | Technology |
|---|---|
| Desktop shell | Tauri 2 |
| Backend | Rust + reqwest |
| Frontend | React + TypeScript + Ant Design |
| Database | SQLite (via tauri-plugin-sql) |
| State | Zustand |
| PDF export | @react-pdf/renderer |

## Getting Started

**Prerequisites:** Node.js, Yarn, Rust

```bash
# Install dependencies
make build

# Start in development mode
make up
```

## Build for Distribution

```bash
make dist
```

This produces a Windows `.exe` installer. CI builds automatically on push to the `release` branch.

## Resetting App Data

```bash
make reset
```

Deletes the local SQLite database and settings.
