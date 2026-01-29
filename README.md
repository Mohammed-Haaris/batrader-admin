# Product Admin Panel 🛍️

A modern, full-featured admin panel for managing products built with **React**, **TypeScript**, **Vite**, and **Tailwind CSS**.

## ✨ Features

- ✅ **View All Products** - Grid display with search functionality
- ✅ **Add New Products** - Comprehensive form with validation
- ✅ **Edit Products** - Update existing product details
- ✅ **Delete Products** - Remove products with confirmation modal
- ✅ **Image Preview** - Live preview of product images
- ✅ **Category Management** - Predefined categories
- ✅ **Responsive Design** - Works on all devices
- ✅ **Premium UI** - Modern design with smooth animations

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Backend server running on `http://localhost:5000`

### Installation

All dependencies are already installed! The project includes:

- **react-router-dom** - For routing
- **axios** - For API calls
- **lucide-react** - For icons
- **tailwindcss** - For styling

### Environment Setup

1. **Copy the example environment file:**

```bash
cp .env.example .env
```

2. **Configure your environment variables in `.env`:**

```env
VITE_API_BASE_URL=http://localhost:5000
```

> **Note:** Update `VITE_API_BASE_URL` to point to your backend server URL. In production, this should be your deployed backend URL.

### Running the Application

```bash
# Start the development server
npm run dev
```

The application will open at `http://localhost:5173` (or another port if 5173 is busy).

## 📁 Project Structure

```
shopse-Product-Admin/
├── src/
│   ├── components/
│   │   └── Layout.tsx          # Main layout with header
│   ├── pages/
│   │   ├── ProductList.tsx     # View all products
│   │   ├── AddProduct.tsx      # Add new product
│   │   └── EditProduct.tsx     # Edit existing product
│   ├── services/
│   │   └── api.ts              # API service layer
│   ├── types/
│   │   └── product.ts          # TypeScript types
│   ├── App.tsx                 # Main app component
│   ├── main.tsx                # Entry point
│   └── index.css               # Global styles
├── tailwind.config.js          # Tailwind configuration
├── postcss.config.js           # PostCSS configuration
└── package.json                # Dependencies
```

## 🔌 API Endpoints

The admin panel connects to these backend endpoints:

- `GET /api/v1/get/products` - Get all products
- `GET /api/v1/get/product/:id` - Get single product
- `POST /api/v1/create/product` - Create new product
- `PUT /api/v1/update/product/:id` - Update product
- `DELETE /api/v1/delete/product/:id` - Delete product

## 📝 Product Schema

```typescript
interface Product {
  id?: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  category: string;
}
```

## 🎨 Available Categories

- Electronics
- Clothing
- Books
- Home & Kitchen
- Sports
- Toys
- Beauty
- Other

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **React Router** - Navigation
- **Axios** - HTTP client
- **Lucide React** - Icons

## 📸 Features in Detail

### Product List
- Search products by name, category, or description
- Grid layout with responsive design
- Edit and delete buttons for each product
- Delete confirmation modal
- Empty state handling

### Add Product
- Form validation
- Image URL with live preview
- Category dropdown
- Price and stock number inputs
- Cancel and submit buttons

### Edit Product
- Pre-filled form with existing data
- Same validation as add product
- Update confirmation

## 🔧 Configuration

### API Base URL

The backend URL is configured via environment variables in the `.env` file:

```env
VITE_API_BASE_URL=http://localhost:5000
```

This value is used throughout the application in `src/services/api.ts` and other components. To change it:

1. Update the value in your `.env` file
2. Restart the development server for changes to take effect

### Tailwind Configuration

Customize colors, fonts, and more in `tailwind.config.js`.

## 🚀 Build for Production

```bash
npm run build
```

The production build will be in the `dist/` folder.

## 📦 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🎯 Usage Tips

1. **Make sure the backend is running** before starting the admin panel
2. **Image URLs** should be publicly accessible (use placeholder if needed)
3. **Stock** can be set to 0 for out-of-stock items
4. **Search** works across name, category, and description fields

## 🔐 Security Notes

This is an admin panel and should be protected with authentication in production. Consider adding:

- Login/authentication system
- Role-based access control
- API token authentication
- HTTPS in production

## 📄 License

Part of the Shopse e-commerce platform.

---

**Built with  using React + TypeScript + Vite + Tailwind CSS**
