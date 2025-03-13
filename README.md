# Field-Track-LLC

A modern, responsive website for Field Track LLC, providing technology-driven strategies for agricultural land management.

## Project Overview

Field Track LLC specializes in optimizing soil health and crop yields with unbiased, science-driven solutions. The website showcases the company's services and expertise in agronomic research consulting and project implementation.

## Key Features

- **Modern UI/UX Design**: Clean, professional design with responsive layouts
- **Interactive Components**: Animations, transitions, and interactive elements powered by Framer Motion
- **Dark/Light Mode**: Theme toggling functionality with next-themes
- **Service Showcase**: Detailed presentation of agricultural technology services
- **Contact Form**: Integrated contact form for client inquiries
- **Real-time Monitoring**: Demonstration of digital land monitoring capabilities
- **Performance Analytics**: Showcase of data-driven agricultural insights
- **Responsive Design**: Fully responsive across all device sizes

## Tech Stack

- **Framework**: Next.js 14 (React 18)
- **Language**: TypeScript
- **Styling**: Tailwind CSS with custom theming
- **Components**:
  - Radix UI primitives
  - Shadcn UI components
- **Animation**: Framer Motion
- **Form Handling**: React Hook Form with Zod validation
- **Analytics**: Vercel Analytics and Speed Insights
- **3D Visualization**: React Three Fiber / Drei
- **Email**: Nodemailer for contact form submissions

## Project Structure

- `/app`: Main application code (Next.js App Router)
  - `/components`: Reusable UI components
  - `/lib`: Utility functions and shared code
  - `/hooks`: Custom React hooks
  - `/styles`: Global styles and Tailwind configuration
- `/public`: Static assets (images, icons, etc.)

## Key Components

- **Hero**: Main landing section showcasing company's value proposition
- **Services**: Detailed service offerings with interactive cards
- **Process**: Step-by-step workflow visualization
- **About**: Company information and comparison with traditional services
- **Testimonials**: Client feedback and success stories
- **Contact**: Contact form and information
- **Sample Report**: Interactive demonstration of agricultural reports

## Development

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
# or
yarn install

# Run development server
npm run dev
# or
yarn dev
```

### Building for Production

```bash
# Build the project
npm run build
# or
yarn build

# Start production server
npm start
# or
yarn start
```

## Deployment

The project is configured for easy deployment on Vercel, with Analytics and Speed Insights already integrated.

## Environment Variables

The following environment variables should be configured in a `.env.local` file:

- `SMTP_USER`: Email address used for sending emails via SMTP (Gmail)
- `SMTP_PASS`: Password or app-specific password for the SMTP email account
- `RECIPIENT_EMAIL`: Email address that receives contact form submissions
- `CC_EMAIL`: Optional CC email address for contact form notifications
- `BCC_EMAIL`: Optional BCC email address for contact form notifications
- `NEXT_PUBLIC_APP_URL`: The URL of your deployed application (used for Open Graph images)

## Open Graph Images

The website includes dynamic Open Graph images that appear when links are shared on social media platforms, messaging apps, and other services.

### How It Works

- The Open Graph images are generated dynamically using the `/api/og` endpoint
- The images include the Field Track logo, title, and description
- The metadata is configured in `app/layout.tsx`

### Customizing Open Graph Images

To customize the Open Graph image:

1. Edit the dynamic image generator in `app/api/og/route.tsx`
2. For a static fallback, edit `app/api/og/static/route.tsx`
3. Update the metadata in `app/layout.tsx` if needed

When deploying, make sure to set the `NEXT_PUBLIC_APP_URL` environment variable to your actual domain.

## Soil Sampling Map

The website includes an interactive soil sampling map that displays soil nutrient data. This map uses GeoJSON data files to render field boundaries and sample points.

### How It Works

- The map data is stored in the `public/data` directory
- The data is fetched dynamically when the map component loads
- The map is rendered using Leaflet.js

### Troubleshooting

If the soil sampling map doesn't display data points:

1. Make sure the data files exist in the `public/data` directory
2. Check that `Boundary_Demo.json` and `Point_Demo.json` are properly formatted
3. Open your browser's developer console (F12) and look for any errors
4. Try refreshing the page or clearing your browser cache

#### Common Issues and Solutions

- **Map not showing**: Ensure Leaflet CSS is properly loaded. The component uses dynamic imports to avoid server-side rendering issues.
- **Points not appearing**: This is usually due to timing issues with data loading or path issues. The component uses `window.location.origin` to ensure paths work in both development and production.
- **Console errors**: If you see 404 errors for the JSON files, verify they exist in the correct location and are accessible.

If you need to test the data files directly, try accessing them at:

- `https://your-domain.com/data/Boundary_Demo.json`
- `https://your-domain.com/data/Point_Demo.json`

## License

Private - All Rights Reserved
