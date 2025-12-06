# Modern POS System - Angular 20

A comprehensive Point of Sale (POS) system built with Angular 20 and the latest web technologies.

## Features

### Core Features
- **Dashboard**: Real-time sales analytics and transaction overview
- **Point of Sale**: Intuitive checkout interface with product catalog
- **Product Management**: Manage inventory with categories and SKUs
- **Cart Management**: Advanced cart with discounts and tax calculations
- **Payment Processing**: Multiple payment methods (Cash, Card, Digital)
- **Customer Management**: Track customer information and loyalty points
- **Transaction History**: Complete transaction records and reporting

### Technical Features
- **Angular 20**: Latest Angular framework with standalone components
- **Signals**: Reactive state management with Angular signals
- **Tailwind CSS**: Modern utility-first CSS framework
- **TypeScript**: Fully typed codebase
- **Responsive Design**: Mobile-friendly interface
- **Dark Theme**: Professional dark UI for retail environments
- **Real-time Updates**: Instant cart and inventory updates

## Project Structure

```
src/
├── app/
│   ├── models/              # TypeScript interfaces and models
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   ├── customer.model.ts
│   │   └── user.model.ts
│   ├── services/            # Business logic services
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── customer.service.ts
│   │   └── auth.service.ts
│   ├── pages/               # Page components
│   │   ├── dashboard/
│   │   └── pos/
│   ├── layout/              # Layout components
│   │   └── layout.component.ts
│   ├── app.routes.ts        # Route configuration
│   └── app.config.ts        # Application configuration
├── styles.scss              # Global styles with Tailwind
└── main.ts                  # Application entry point
```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm start
   ```

3. **Navigate to**:
   ```
   http://localhost:4200/
   ```

## Available Routes

- `/dashboard` - Sales dashboard and analytics
- `/pos` - Point of sale checkout interface

## Key Services
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
