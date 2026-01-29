/** @format */

import type { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Package, Plus, List, ShoppingBag } from "lucide-react";

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-600" />
              <h1 className="text-2xl font-bold text-gray-800">
                BA-traders Admin
              </h1>
            </div>

            <nav className="flex gap-4">
              <Link
                to="/products"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/products")
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <List className="w-5 h-5" />
                All Products
              </Link>
              <Link
                to="/products/add"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/products/add")
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Plus className="w-5 h-5" />
                Add Product
              </Link>
              <Link
                to="/orders"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive("/orders")
                    ? "bg-indigo-600 text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ShoppingBag className="w-5 h-5" />
                Orders
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;
