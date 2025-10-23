# 🍕 MustiApp Admin Dashboard

A modern, responsive admin dashboard for managing your food delivery app. Built with Next.js 14, TypeScript, and Supabase.

![Admin Dashboard](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)

## ✨ Features

### 🎯 Core Functionality
- **Product Management**: Create, edit, and manage menu items
- **Addon System**: Product-specific addon assignment
- **Order Management**: Track and manage customer orders
- **Customer Management**: View customer information and history
- **Category Management**: Organize products by categories
- **Promotion Management**: Create and manage special offers
- **Delivery Tracking**: Monitor delivery status and logistics

### 🎨 Modern UI/UX
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Automatic theme switching
- **Real-time Updates**: Live data synchronization
- **Interactive Charts**: Analytics and reporting
- **Professional Components**: Built with shadcn/ui

### 🔧 Technical Features
- **TypeScript**: Full type safety
- **Database Integration**: Supabase with RLS policies
- **Image Optimization**: Next.js Image component
- **Performance**: Optimized for speed
- **Security**: Row Level Security (RLS)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mustiapp-admin-dashboard.git
   cd mustiapp-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

4. **Database Setup**
   ```bash
   # Run database migrations
   npm run db:setup
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📱 Mobile App Integration

This admin dashboard syncs with your mobile app through Supabase:

1. **Create addons** in the admin dashboard
2. **Assign to products** for specific customization
3. **Mobile app** automatically loads the assigned addons
4. **Real-time sync** ensures immediate updates

## 🗄️ Database Schema

### Core Tables
- `menu_items`: Product information and pricing
- `addons`: Customization options (sizes, toppings, spice levels)
- `categories`: Product organization
- `orders`: Customer orders and status
- `customers`: User information
- `promotions`: Special offers and discounts

### Key Features
- **Product-Addon Relationship**: Many-to-many with `available_addons` JSONB field
- **Row Level Security**: Secure data access
- **Real-time Subscriptions**: Live updates
- **Optimized Queries**: Fast performance

## 🎨 Customization

### Themes
- Modify `lib/theme.tsx` for color schemes
- Update `tailwind.config.js` for design tokens
- Customize components in `components/` directory

### Branding
- Replace logo in `components/Sidebar.tsx`
- Update favicon in `public/` directory
- Modify color palette in `lib/colors.ts`

## 📊 Analytics

### Built-in Metrics
- Order statistics
- Revenue tracking
- Customer analytics
- Product performance

### Integration Options
- Google Analytics
- Vercel Analytics
- Custom tracking

## 🔒 Security

### Authentication
- Supabase Auth integration
- Role-based access control
- Secure session management

### Data Protection
- Row Level Security (RLS)
- Input validation
- XSS protection
- CSRF protection

## 🚀 Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push

### Manual Deployment
   ```bash
npm run build
npm run start
```

### Environment Variables
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_key
```

## 📈 Performance

### Optimizations
- Next.js Image optimization
- Code splitting
- Lazy loading
- Caching strategies

### Monitoring
- Core Web Vitals
- Bundle analysis
- Performance metrics

## 🛠️ Development

### Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
```

### Project Structure
```
admin-dashboard/
├── app/                 # Next.js app directory
├── components/          # Reusable components
├── lib/                 # Utilities and configurations
├── public/              # Static assets
├── styles/              # Global styles
└── types/               # TypeScript definitions
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Issues
- GitHub Issues for bug reports
- Discussions for questions
- Pull requests for contributions

## 🎯 Roadmap

### Upcoming Features
- [ ] Advanced analytics dashboard
- [ ] Bulk operations
- [ ] Export/Import functionality
- [ ] Multi-language support
- [ ] Advanced reporting
- [ ] API rate limiting
- [ ] Backup and restore

### Performance Improvements
- [ ] Server-side rendering optimization
- [ ] Database query optimization
- [ ] Caching improvements
- [ ] Bundle size reduction

## 📞 Contact

- **Developer**: Your Name
- **Email**: your.email@example.com
- **GitHub**: [@yourusername](https://github.com/yourusername)
- **Website**: [yourwebsite.com](https://yourwebsite.com)

---

Made with ❤️ for the food delivery industry