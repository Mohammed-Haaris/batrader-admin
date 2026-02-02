/** @format */

import { useState, useEffect, useCallback } from "react";
import type { FormEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save, X } from "lucide-react";
import { productAPI } from "../services/api";
import type { ProductFormData } from "../types/product";

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    name: "",
    description: "",
    price: "",
    stock: "",
    image: "",
    category: "",
    brand: "",
    shipping_rate: "0",
    variants: [],
  });

  const [preview, setPreview] = useState<string>("");

  const fetchCategories = useCallback(async () => {
    try {
      const products = await productAPI.getAllProducts();
      const uniqueCategories = Array.from(
        new Set(
          products.map((product) => product.category).filter((cat) => cat)
        )
      ).sort();
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([
        "Electronics",
        "Clothing",
        "Books",
        "Home & Kitchen",
        "Sports",
        "Toys",
        "Beauty",
        "Other",
      ]);
    }
  }, []);

  const fetchProduct = useCallback(async () => {
    try {
      setFetching(true);
      const product = await productAPI.getProductById(parseInt(id!));
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image,
        category: product.category,
        brand: product.brand || "",
        shipping_rate: (product.shipping_rate || 0).toString(),
        // Map variants to string format for inputs
        variants: product.variants?.map(v => ({
           variant_name: v.variant_name,
           price: v.price.toString(),
           stock: v.stock.toString(),
           shipping_rate: (v.shipping_rate || 0).toString(),
           is_default: v.is_default
        })) || []
      });
      if (product.image) setPreview(product.image);
    } catch (error) {
      console.error("Error fetching product:", error);
      alert("Failed to fetch product");
      navigate("/products");
    } finally {
      setFetching(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    if (id) {
      fetchProduct();
      fetchCategories();
    }
  }, [id, fetchProduct, fetchCategories]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // Variant handlers
  const handleVariantChange = (index: number, field: string, value: string | boolean) => {
    const newVariants = [...(formData.variants || [])];
    // @ts-ignore
    newVariants[index][field] = value;
    
    // Auto-sync with base pricing if this is the default variant
    if (newVariants[index].is_default) {
        if (field === "price") {
            setFormData(prev => ({ ...prev, price: value as string, variants: newVariants }));
            return;
        }
        if (field === "stock") {
            setFormData(prev => ({ ...prev, stock: value as string, variants: newVariants }));
            return;
        }
    }

    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          variant_name: "",
          price: "",
          stock: "",
          shipping_rate: "0",
          is_default: prev.variants?.length === 0, // First one is default
        },
      ],
    }));
  };

  const removeVariant = (index: number) => {
    const newVariants = [...(formData.variants || [])];
    newVariants.splice(index, 1);
    setFormData((prev) => ({ ...prev, variants: newVariants }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.price ||
      !formData.stock ||
      !formData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);

      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", formData.price);
      data.append("stock", formData.stock);
      data.append("category", formData.category);
      data.append("brand", formData.brand);
      data.append("shipping_rate", formData.shipping_rate);

      if (formData.image instanceof File) {
        data.append("image", formData.image);
      } else if (typeof formData.image === "string" && formData.image) {
        data.append("image", formData.image);
      }

      // Append variants as JSON string
      if (formData.variants && formData.variants.length > 0) {
        data.append("variants", JSON.stringify(formData.variants));
      }

      await productAPI.updateProduct(parseInt(id!), data);
      alert("Product updated successfully!");
      navigate("/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-10 px-0 sm:px-4">
      {/* Header */}
      <div className="mb-6 sm:mb-8 px-4 sm:px-0">
        <button
          onClick={() => navigate("/products")}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold mb-4 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm sm:text-base">Back to Products</span>
        </button>
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">Edit Product</h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white sm:rounded-2xl shadow-xl p-4 sm:p-8 border border-gray-100"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* LEFT COLUMN: Main Info */}
            <div className="space-y-6">
                <h3 className="text-lg font-bold text-gray-900 border-b pb-2">Basic Details</h3>
                
                {/* Product Name */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Product Name <span className="text-red-500">*</span>
                    </label>
                    <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter product name"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                    required
                    />
                </div>

                {/* Category & Brand */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Category <span className="text-red-500">*</span>
                        </label>
                        <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                        required
                        >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                            {category}
                            </option>
                        ))}
                        </select>
                    </div>
                    <div>
                         <label className="block text-sm font-semibold text-gray-700 mb-2">
                         Brand <span className="text-red-500">*</span>
                         </label>
                         <input
                         name="brand"
                         value={formData.brand}
                         onChange={handleChange}
                         placeholder="e.g., Apple"
                         className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all"
                         required
                         />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                    </label>
                    <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Enter product description"
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all resize-none"
                    />
                </div>
                
                {/* Image Upload */}
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                   Product Image
                   </label>
                   <input
                   type="file"
                   name="image"
                   accept="image/*"
                   onChange={handleFileChange}
                   className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                   />
                   {preview && (
                   <div className="mt-4">
                       <p className="text-sm text-gray-600 mb-2">Image Preview:</p>
                       <img
                       src={preview}
                       alt="Preview"
                       className="w-full max-w-xs h-48 object-cover rounded-lg border border-gray-200"
                       onError={(e) => {
                           (e.target as HTMLImageElement).src =
                           "https://via.placeholder.com/400";
                       }}
                       />
                   </div>
                   )}
                </div>

                {/* Display Price & Stock */}
                <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Base Pricing (For Display)</h4>
                        {formData.variants && formData.variants.length > 0 && (
                            <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold uppercase">Synced with Default Variant</span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            disabled={formData.variants && formData.variants.length > 0}
                            className={`w-full p-2 rounded border border-gray-300 outline-none transition-all ${
                                formData.variants && formData.variants.length > 0 
                                ? "bg-gray-100 cursor-not-allowed opacity-75" 
                                : "focus:ring-2 focus:ring-indigo-200"
                            }`}
                        />
                        </div>
                        <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Stock</label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleChange}
                            disabled={formData.variants && formData.variants.length > 0}
                            className={`w-full p-2 rounded border border-gray-300 outline-none transition-all ${
                                formData.variants && formData.variants.length > 0 
                                ? "bg-gray-100 cursor-not-allowed opacity-75" 
                                : "focus:ring-2 focus:ring-indigo-200"
                            }`}
                        />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-bold text-gray-500 mb-1">Base Shipping (₹)</label>
                            <input
                            type="number"
                            name="shipping_rate"
                            value={formData.shipping_rate}
                            onChange={handleChange}
                            placeholder="0.00"
                            className="w-full p-2 rounded border border-gray-300 focus:ring-2 focus:ring-indigo-200 outline-none"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT COLUMN: Variants */}
            <div className="space-y-6">
                 <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900">Product Variants</h3>
                    <button 
                      type="button" 
                      onClick={addVariant}
                      className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-sm font-bold rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      + Add Size/Weight
                    </button>
                 </div>
                 
                 {(!formData.variants || formData.variants.length === 0) && (
                   <div className="p-8 text-center bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                     <p className="text-gray-500 text-sm">No variants added yet.</p>
                     <p className="text-xs text-gray-400 mt-1">This product will be sold as a single item using the Base Price.</p>
                     <button 
                      type="button" 
                      onClick={addVariant}
                      className="mt-4 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 shadow-sm"
                    >
                      Create First Variant
                    </button>
                   </div>
                 )}

                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                   {formData.variants?.map((variant, index) => (
                     <div key={index} className="p-4 bg-gray-50/50 border border-gray-200 rounded-xl relative group hover:border-indigo-200 transition-colors">
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                          title="Remove Variant"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                           <div className="sm:col-span-11 grid grid-cols-2 sm:grid-cols-11 gap-3">
                              <div className="col-span-2 sm:col-span-5">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Variant Name</label>
                                 <input 
                                    placeholder="e.g. 1 kg, XL"
                                    value={variant.variant_name}
                                    onChange={(e) => handleVariantChange(index, "variant_name", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none font-medium bg-white"
                                 />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (₹)</label>
                                 <input 
                                    type="number"
                                    placeholder="0"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white"
                                 />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Stock</label>
                                 <input 
                                    type="number"
                                    placeholder="0"
                                    value={variant.stock}
                                    onChange={(e) => handleVariantChange(index, "stock", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white"
                                 />
                              </div>
                              <div className="col-span-2 sm:col-span-2">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Ship (₹)</label>
                                 <input 
                                    type="number"
                                    placeholder="0"
                                    value={variant.shipping_rate}
                                    onChange={(e) => handleVariantChange(index, "shipping_rate", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white"
                                 />
                              </div>
                           </div>
                           
                           <div className="sm:col-span-1 flex flex-col items-center justify-center pb-1">
                              <label className="sm:hidden block text-[10px] font-bold text-gray-400 uppercase mb-2">Default</label>
                              <input 
                                type="radio" 
                                name="default_variant"
                                checked={variant.is_default}
                                onChange={() => {
                                  const newV = [...(formData.variants || [])].map((v, i) => ({...v, is_default: i === index}));
                                  setFormData(prev => ({
                                    ...prev, 
                                    price: variant.price,
                                    stock: variant.stock,
                                    variants: newV
                                  }));
                                }}
                                className="w-5 h-5 cursor-pointer text-indigo-600 focus:ring-indigo-500 border-gray-300 shadow-sm"
                                title="Set as Default"
                              />
                           </div>
                        </div>
                     </div>
                   ))}
                 </div>
              </div>
        </div>

        {/* Submit Button */}
        <div className="mt-8 flex gap-4">
          <button
            type="button"
            onClick={() => navigate("/products")}
            className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all font-semibold"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-5 h-5" />
            {loading ? "Updating..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
};



export default EditProduct;
