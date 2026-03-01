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
    mrp: "",
    price: "",
    stock: "",
    image: "",
    images: [],
    category: "",
    brand: "",
    shipping_rate: "0",
    variants: [],
  });

  const [preview, setPreview] = useState<string>("");
  const [multiPreviews, setMultiPreviews] = useState<string[]>([]);

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
        mrp: (product.mrp || "").toString(),
        price: product.price.toString(),
        stock: product.stock.toString(),
        image: product.image,
        category: product.category,
        brand: product.brand || "",
        shipping_rate: (product.shipping_rate || 0).toString(),
        // Map variants to string format for inputs
        variants: product.variants?.map(v => ({
           variant_name: v.variant_name,
           mrp: (v.mrp || "").toString(),
           price: v.price.toString(),
           stock: v.stock.toString(),
           shipping_rate: (v.shipping_rate || 0).toString(),
           is_default: v.is_default,
           image: v.image
        })) || [],
        images: product.images || []
      });
      if (product.image) setPreview(product.image);
      if (product.images) setMultiPreviews(product.images);
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
    setFormData((prev) => {
      const newState = { ...prev, [name]: value };
      
      // If we have only 1 variant (or it's the "Standard" one), keep it in sync with base pricing
      if (prev.variants && prev.variants.length === 1 && ["price", "mrp", "stock", "shipping_rate"].includes(name)) {
        const newVariants = [...prev.variants];
        // @ts-ignore
        newVariants[0][name] = value;
        newState.variants = newVariants;
      }
      
      return newState;
    });
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

  const handleMultiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...files],
      }));
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setMultiPreviews(prev => [...prev, ...newPreviews]);
    }
  };

  const removeMultiImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setMultiPreviews(prev => prev.filter((_, i) => i !== index));

    // If it's an existing image (string URL), we might need to tell backend to delete it
    // For now, we'll just not send it back in the images array.
  };

  // Variant handlers
  const handleVariantChange = (index: number, field: string, value: string | boolean) => {
    const newVariants = [...(formData.variants || [])];
    // @ts-ignore
    newVariants[index][field] = value;

    
    
    // Auto-sync with base pricing if this is the default variant
    if (newVariants[index].is_default) {
        if (field === "mrp") {
            setFormData(prev => ({ ...prev, mrp: value as string, variants: newVariants }));
            return;
        }
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

  const handleVariantFileChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newVariants = [...(formData.variants || [])];
      newVariants[index].image = file;
      setFormData(prev => ({ ...prev, variants: newVariants }));
    }
  };

  const addVariant = () => {
    setFormData((prev) => ({
      ...prev,
      variants: [
        ...(prev.variants || []),
        {
          variant_name: "",
          mrp: prev.mrp || "",
          price: prev.price || "",
          stock: prev.stock || "",
          shipping_rate: prev.shipping_rate || "0",
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
      data.append("mrp", formData.mrp || "");
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

      // Handle multiple images
      formData.images.forEach((img) => {
        if (img instanceof File) {
          data.append("images", img);
        } else {
          // If it's the existing URL, we append it so the backend knows to keep it
          data.append("images", img);
        }
      });

      // Append variants as JSON string
      if (formData.variants && formData.variants.length > 0) {
        let variantImageCounter = 0;
        const processedVariants = formData.variants.map((v) => {
            const variantCopy = { ...v };
            if (v.image instanceof File) {
                data.append("variant_images", v.image);
                // @ts-ignore
                variantCopy.image = `file:${variantImageCounter}`;
                variantImageCounter++;
            }
            return variantCopy;
        });
        data.append("variants", JSON.stringify(processedVariants));
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
                
                {/* Main Image Upload */}
                <div>
                   <label className="block text-sm font-semibold text-gray-700 mb-2">
                   Main Product Image
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
                       <p className="text-sm text-gray-600 mb-2">Primary Preview:</p>
                       <img
                       src={preview}
                       alt="Preview"
                       className="w-full max-w-xs h-40 object-cover rounded-lg border border-gray-200"
                       onError={(e) => {
                           (e.target as HTMLImageElement).src =
                           "https://via.placeholder.com/400";
                       }}
                       />
                   </div>
                   )}
                </div>

                {/* Multiple Images Upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Gallery Images (Optional)
                  </label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-indigo-400 transition-colors cursor-pointer relative bg-gray-50/30">
                    <div className="space-y-1 text-center">
                      <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="flex text-sm text-gray-600 justify-center">
                        <label htmlFor="multi-image-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                          <span>Add more images</span>
                          <input id="multi-image-upload" name="images" type="file" className="sr-only" multiple accept="image/*" onChange={handleMultiFileChange} />
                        </label>
                      </div>
                    </div>
                  </div>

                  {multiPreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {multiPreviews.map((src, idx) => (
                        <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                          <img
                            src={src}
                            alt={`Preview ${idx}`}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).src = "https://via.placeholder.com/400"; }}
                          />
                          <button
                            type="button"
                            onClick={() => removeMultiImage(idx)}
                            className="absolute -top-px -right-px p-1 bg-red-500 text-white rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
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
                        <label className="block text-xs font-bold text-gray-500 mb-1">MRP (₹) <span className="text-[10px] italic">(Struck out)</span></label>
                        <input
                            type="number"
                            name="mrp"
                            value={formData.mrp}
                            onChange={handleChange}
                            disabled={formData.variants && formData.variants.length > 1}
                            className={`w-full p-2 rounded border border-gray-300 outline-none transition-all ${
                                formData.variants && formData.variants.length > 1 
                                ? "bg-gray-100 cursor-not-allowed opacity-75" 
                                : "focus:ring-2 focus:ring-indigo-200"
                            }`}
                        />
                        </div>
                         <div>
                        <label className="block text-xs font-bold text-gray-500 mb-1">Selling Price (₹)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleChange}
                            disabled={formData.variants && formData.variants.length > 1}
                            className={`w-full p-2 rounded border border-gray-300 outline-none transition-all ${
                                formData.variants && formData.variants.length > 1 
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
                            disabled={formData.variants && formData.variants.length > 1}
                            className={`w-full p-2 rounded border border-gray-300 outline-none transition-all ${
                                formData.variants && formData.variants.length > 1 
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
                 
                 {(!formData.variants || formData.variants.length === 0 || (formData.variants.length === 1 && (formData.variants[0].variant_name === "" || formData.variants[0].variant_name === "Default" || formData.variants[0].variant_name === "Standard"))) && (
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
                   {formData.variants?.map((variant, index) => {
                      // Hide the 'Internal Default' variant card if it's the only one
                      // and it has a generic name, but show it if it has a custom name or if there are multiple variants
                      const isInternalDefault = formData.variants!.length === 1 && 
                        (variant.variant_name === "" || variant.variant_name === "Default" || variant.variant_name === "Standard");
                      
                      if (isInternalDefault) return null;

                      return (
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
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">MRP (₹)</label>
                                 <input 
                                    type="number"
                                    placeholder="0"
                                    value={variant.mrp}
                                    onChange={(e) => handleVariantChange(index, "mrp", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-medium text-gray-400 line-through"
                                 />
                              </div>
                              <div className="col-span-1 sm:col-span-2">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Price (₹)</label>
                                 <input 
                                    type="number"
                                    placeholder="0"
                                    value={variant.price}
                                    onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:ring-4 focus:ring-indigo-50 focus:border-indigo-500 outline-none bg-white font-bold text-indigo-700"
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

                           {/* Variant Image */}
                           <div className="sm:col-span-11 mt-3 flex items-center gap-4 border-t pt-3">
                              <div className="flex-1">
                                 <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Variant Image (Optional)</label>
                                 <input 
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleVariantFileChange(index, e)}
                                    className="w-full text-xs file:mr-4 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-[10px] file:font-bold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                 />
                              </div>
                              {variant.image && (
                                 <div className="w-12 h-12 rounded border overflow-hidden shrink-0">
                                    <img 
                                       src={variant.image instanceof File ? URL.createObjectURL(variant.image) : (variant.image as string)} 
                                       alt="Variant Preview" 
                                       className="w-full h-full object-cover"
                                    />
                                 </div>
                              )}
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
                                    mrp: variant.mrp,
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
                      );
                    })}
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
