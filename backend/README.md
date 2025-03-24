# Link Tracker

A service for tracking and analyzing link clicks in HTML content and emails.

## Features

- URL shortening with click tracking
- HTML processing with automatic link replacement
- Detailed analytics (device, browser, location)
- JWT authentication
- Redis caching for performance

## Tech Stack

- Node.js with TypeScript
- Express.js
- MongoDB
- Redis
- JWT for auth

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

3. Start the service:
```bash
npm run dev
```

## API Documentation

API documentation is available at `/api-docs` when the server is running.

## Testing

```bash
npm test
```

## License

MIT 