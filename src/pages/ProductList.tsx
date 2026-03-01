/** @format */

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Plus, Search, Package } from "lucide-react";
import { productAPI } from "../services/api";
import type { Product } from "../types/product";

const ProductList = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await productAPI.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
      alert("Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...new Set(products.map((p) => p.category || "Uncategorized"))];

  const handleDelete = async (id: number) => {
    try {
      await productAPI.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    }
  };

  const filteredProducts = products.filter((product) => {
    const searchLower = searchTerm.toLowerCase();
    const productCategory = product.category || "Uncategorized";
    
    const matchesSearch = (
      (product.name || "").toLowerCase().includes(searchLower) ||
      (product.category || "").toLowerCase().includes(searchLower) ||
      (product.description || "").toLowerCase().includes(searchLower)
    );

    const matchesCategory = selectedCategory === "All" || productCategory === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section */}
      <div className="mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">
            Products Management
          </h2>
          <button
            onClick={() => navigate("/products/add")}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl font-semibold"
          >
            <Plus className="w-5 h-5" />
            Add New Product
          </button>
        </div>

        {/* Search and Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="relative w-full lg:col-span-2">
            <input
              type="text"
              placeholder="Search products by name, category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm bg-white"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          <div className="w-full">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 outline-none transition-all shadow-sm bg-white cursor-pointer appearance-none font-medium text-gray-700"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236B7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 1rem center',
                backgroundSize: '1.5em 1.5em',
                paddingRight: '2.5rem'
              }}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <Package className="w-24 h-24 text-gray-200 mx-auto mb-4" />
          <p className="text-xl text-gray-500 font-medium">
            {searchTerm || selectedCategory !== "All" 
              ? "No products match your filters" 
              : "No products available yet"}
          </p>
          {(searchTerm || selectedCategory !== "All") && (
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("All");
              }}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-semibold underline"
            >
              Clear all filters
            </button>
          )}
          {!searchTerm && selectedCategory === "All" && (
            <button
              onClick={() => navigate("/products/add")}
              className="mt-4 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-all shadow-md"
            >
              Add your first product
            </button>
          )}
        </div>
      ) : (
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-indigo-200"
            >
              {/* Product Image */}
              <div className="relative h-64 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden group">
                <img
                  src={product.image || "https://via.placeholder.com/400"}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "https://via.placeholder.com/400";
                  }}
                />
                {/* Category Badge - Floating */}
                <div className="absolute top-3 left-3">
                  <span className="inline-block px-3 py-1.5 bg-white/90 backdrop-blur-sm text-indigo-600 rounded-full text-xs font-semibold shadow-md">
                    {product.category || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-4 sm:p-5">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-base sm:text-lg font-bold text-gray-800 line-clamp-1 hover:text-indigo-600 transition-colors">
                    {product.name}
                  </h3>
                </div>

                <p className="text-xs sm:text-sm text-gray-600 mb-4 line-clamp-2 min-h-[32px] sm:min-h-[40px]">
                  {product.description || "No description available"}
                </p>

                <div className="mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-baseline gap-2">
                    <p className="text-xl sm:text-2xl font-bold text-indigo-600">
                      ₹{product.price.toLocaleString()}
                    </p>
                    {product.mrp && Number(product.mrp) > Number(product.price) && (
                      <span className="text-xs sm:text-sm text-gray-400 line-through">
                        ₹{Number(product.mrp).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Stock: <span className={`font-semibold ${product.stock > 10 ? 'text-green-600' : 'text-orange-600'}`}>{product.stock}</span>
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-500">
                      Ship: <span className="text-indigo-600 font-bold">₹{product.shipping_rate}</span>
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/products/edit/${product.id}`)}
                    className="flex items-center justify-center gap-1.5 bg-blue-50 text-blue-600 px-3 py-2 rounded-xl hover:bg-blue-600 hover:text-white transition-all text-xs sm:text-sm font-semibold border border-blue-100"
                  >
                    <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(product.id!)}
                    className="flex items-center justify-center gap-1.5 bg-red-50 text-red-600 px-3 py-2 rounded-xl hover:bg-red-600 hover:text-white transition-all text-xs sm:text-sm font-semibold border border-red-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this product? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductList;
