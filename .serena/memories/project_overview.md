# Favoritable - Project Overview

## Project Purpose
Favoritable is a social-login powered bookmark manager web application with support for a future Chrome extension. It allows users to save, organize, and manage web bookmarks with features like automatic metadata scraping, label organization, and import/export capabilities.

## Core Features
- **Authentication**: OAuth login (Google, Facebook, GitHub, Twitter) using Auth.js
- **Bookmark Management**: Full CRUD operations with automatic metadata fetching (title, description, author, thumbnail)
- **Label System**: Create, organize, and filter bookmarks by labels
- **Import/Export**: Support for Omnivore, browser bookmarks (HTML), and text files
- **Search & Filtering**: Full-text search and label-based filtering
- **Collections**: Default collections (All, Favorites, Archived)
- **Future Features**: Chrome extension, mobile app, AI-powered label suggestions

## Target Platforms
1. **Web App** (current focus)
2. **Chrome Extension** (future)
3. **Mobile App** (future)

## Project Type
- Modern TypeScript monorepo using Turborepo
- Full-stack application with separate API and Frontend
- Clean Architecture principles
- Package manager: pnpm
- Development system: Darwin (macOS)