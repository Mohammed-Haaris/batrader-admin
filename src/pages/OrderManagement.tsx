/** @format */

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import { 
  Package, 
  Search, 
  CheckCircle, 
  XCircle, 
  Truck,
  Calendar,
  CreditCard,
  X,
  User,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import { io } from "socket.io-client";

interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  status: string;
  payment_status: string;
  subtotal: string;
  tax: string;
  shipping_fee: string;
  discount: string;
  total_amount: string;
  created_at: string;
  payment_method: string;
  shipping_name: string;
  shipping_phone: string;
  shipping_email: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state: string;
  shipping_pincode: string;
  shipping_country: string;
  items?: {
    name: string;
    image: string;
    quantity: number;
    price: string;
  }[];
}

const OrderManagement = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const API_URL = `${import.meta.env.VITE_API_BASE_URL}/api/v1/orders`;

  const lastDataHashRef = useRef("");
  const socketRef = useRef<any>(null);

  const fetchOrders = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const response = await axios.get(`${API_URL}/admin/all`);
      
      if (response.data.success) {
        const currentDataHash = JSON.stringify(response.data.data);
        if (currentDataHash !== lastDataHashRef.current) {
          setOrders(response.data.data);
          lastDataHashRef.current = currentDataHash;
        }
      }
    } catch (error) {
      if (isInitial) console.error("Error fetching admin orders:", error);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    // Initialize socket connection
    socketRef.current = io(import.meta.env.VITE_API_BASE_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to real-time order updates");
    });

    socketRef.current.on("new_order", (data: any) => {
      console.log("New order received:", data);
      fetchOrders(); // Refresh list instantly
    });

    socketRef.current.on("order_updated", (data: any) => {
      console.log("Order updated:", data);
      fetchOrders(); // Refresh list instantly
    });

    fetchOrders(true); // Initial load

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [fetchOrders]);

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    const comment = prompt(`Enter a comment for status update to ${newStatus}:`);
    if (comment === null) return;

    try {
      const response = await axios.put(`${API_URL}/admin/status/${orderId}`, {
        status: newStatus,
        payment_status: newStatus === "delivered" ? "paid" : undefined,
        comment: comment
      });

      if (response.data.success) {
        alert(`Order status updated to ${newStatus}`);
        fetchOrders();
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      alert("Failed to update status");
    }
  };

  const filteredOrders = orders.filter(order => {
    const orderNum = (order.order_number || "").toLowerCase();
    const custName = (order.customer_name || "").toLowerCase();
    const matchesSearch = orderNum.includes(searchTerm.toLowerCase()) || 
                         custName.includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || (order.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending": return "text-amber-600 bg-amber-50 border-amber-100";
      case "confirmed": return "text-blue-600 bg-blue-50 border-blue-100";
      case "shipped": return "text-indigo-600 bg-indigo-50 border-indigo-100";
      case "delivered": return "text-green-600 bg-green-50 border-green-100";
      case "cancelled": return "text-red-600 bg-red-50 border-red-100";
      default: return "text-gray-600 bg-gray-50 border-gray-100";
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen pt-20">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <Package className="w-8 h-8 text-indigo-600" />
              Order Management
            </h1>
            <p className="text-gray-500 mt-1">Manage and track all customer orders across the platform</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Active Orders</p>
              <p className="text-xl font-black text-indigo-600">{orders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled').length}</p>
            </div>
            <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200 text-center">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Completed</p>
              <p className="text-xl font-black text-green-600">{orders.filter(o => o.status === 'delivered').length}</p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Order ID or Customer Name..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2">
            <select
              className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 font-bold text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-bold">Order ID</th>
                  <th className="px-6 py-4 font-bold">Customer</th>
                  <th className="px-6 py-4 font-bold">Items</th>
                  <th className="px-6 py-4 font-bold">Details</th>
                  <th className="px-6 py-4 font-bold">Status</th>
                  <th className="px-6 py-4 font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-400">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                       Loading orders...
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center text-gray-500 font-medium">
                      No orders found matching your search.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => (
                    <tr 
                      key={order.id} 
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedOrder(order)}
                    >
                      <td className="px-6 py-4">
                        <p className="font-black text-gray-900 group-hover:text-indigo-600 transition-colors uppercase">{order.order_number}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 font-bold uppercase">
                            {order.customer_name ? order.customer_name.charAt(0) : "G"}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{order.customer_name || "Guest User"}</p>
                            <p className="text-xs text-gray-400 flex items-center gap-1">
                              <Search className="w-3 h-3" /> {order.shipping_city || "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-50 rounded-lg overflow-hidden border border-gray-100 flex items-center justify-center shrink-0">
                            {order.items && order.items[0]?.image ? (
                              <img 
                                src={order.items[0].image.startsWith("http") ? order.items[0].image : `${import.meta.env.VITE_API_BASE_URL}${order.items[0].image}`} 
                                alt={order.items[0].name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-6 h-6 text-gray-300" />
                            )}
                          </div>
                          <div className="max-w-[150px]">
                            <p className="text-xs font-black text-gray-800 line-clamp-1 truncate">
                              {order.items && order.items[0]?.name ? order.items[0].name : "No Items"}
                            </p>
                            {order.items && order.items.length > 1 && (
                              <p className="text-[10px] font-bold text-indigo-500 mt-0.5">
                                +{order.items.length - 1} more items
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-bold text-indigo-600">₹{parseFloat(order.total_amount).toLocaleString()}</p>
                        <p className="text-xs text-gray-500 uppercase font-medium flex items-center gap-1">
                          <CreditCard className="w-3 h-3" /> {order.payment_method}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1.5 rounded-full border text-xs font-black uppercase ${getStatusColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-2">
                          {order.status === "pending" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "confirmed")}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                              title="Confirm Order"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}
                          
                          {(order.status === "confirmed" || order.status === "pending") && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "shipped")}
                              className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                              title="Ship Order"
                            >
                              <Truck className="w-5 h-5" />
                            </button>
                          )}

                          {order.status === "shipped" && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "delivered")}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-600 hover:text-white transition-all shadow-sm"
                              title="Mark as Delivered"
                            >
                              <CheckCircle className="w-5 h-5" />
                            </button>
                          )}

                          {(order.status === "pending" || order.status === "confirmed") && (
                            <button 
                              onClick={() => handleUpdateStatus(order.id, "cancelled")}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all shadow-sm"
                              title="Cancel Order"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
                <div>
                  <h2 className="text-2xl font-black text-gray-900 uppercase">Order Details</h2>
                  <p className="text-indigo-600 font-bold tracking-widest text-xs mt-1">{selectedOrder.order_number}</p>
                </div>
                <button 
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 bg-white text-gray-400 hover:text-red-500 rounded-full shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Customer & Shipping Info */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <User className="w-4 h-4" /> Customer Information
                      </h3>
                      <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                            <User className="w-4 h-4" />
                          </div>
                          <span className="font-bold text-gray-800">{selectedOrder.customer_name}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                            <Mail className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{selectedOrder.shipping_email || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-indigo-600 shadow-sm">
                            <Phone className="w-4 h-4" />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{selectedOrder.shipping_phone}</span>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <MapPin className="w-4 h-4" /> Shipping Address
                      </h3>
                      <div className="bg-gray-50 rounded-2xl p-4 text-sm font-medium text-gray-600 leading-relaxed shadow-inner">
                        <p className="font-bold text-gray-900 mb-1">{selectedOrder.shipping_name}</p>
                        <p>{selectedOrder.shipping_address_line1}</p>
                        {selectedOrder.shipping_address_line2 && <p>{selectedOrder.shipping_address_line2}</p>}
                        <p>{selectedOrder.shipping_city}, {selectedOrder.shipping_state}</p>
                        <p>{selectedOrder.shipping_pincode}, {selectedOrder.shipping_country}</p>
                      </div>
                    </section>
                  </div>

                  {/* Order Summary & Status */}
                  <div className="space-y-6">
                    <section>
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Order Status</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Status</p>
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status}
                          </span>
                        </div>
                        <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                          <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Payment</p>
                          <div className="flex flex-col gap-1">
                            <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase text-center ${
                              selectedOrder.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {selectedOrder.payment_status}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase text-center mt-1">
                              {selectedOrder.payment_method}
                            </span>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Price Breakdown</h3>
                      <div className="bg-gray-900 rounded-2xl p-5 text-white space-y-3 shadow-lg">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Subtotal</span>
                          <span className="font-bold">₹{parseFloat(selectedOrder.subtotal).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-400">Shipping</span>
                          <span className="font-bold">₹{parseFloat(selectedOrder.shipping_fee).toLocaleString()}</span>
                        </div>
                        {parseFloat(selectedOrder.discount) > 0 && (
                          <div className="flex justify-between text-sm text-green-400 font-medium">
                            <span>Discount</span>
                            <span>-₹{parseFloat(selectedOrder.discount).toLocaleString()}</span>
                          </div>
                        )}
                        <div className="pt-3 border-t border-white/10 flex justify-between items-center">
                          <span className="font-black text-lg uppercase tracking-tight">Total</span>
                          <span className="text-2xl font-black text-indigo-400">₹{parseFloat(selectedOrder.total_amount).toLocaleString()}</span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>

                {/* Ordered Items List */}
                <section>
                  <h3 className="text-xs font-black text-indigo-500 uppercase tracking-widest mb-4">Ordered Items</h3>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                        <tr>
                          <th className="px-4 py-3">Product</th>
                          <th className="px-4 py-3 text-center">Qty</th>
                          <th className="px-4 py-3 text-right">Price</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {selectedOrder.items?.map((item, idx) => (
                          <tr key={idx} className="group hover:bg-gray-50/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                  <img 
                                    src={item.image.startsWith("http") ? item.image : `${import.meta.env.VITE_API_BASE_URL}${item.image}`} 
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <span className="font-bold text-gray-800 line-clamp-1">{item.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center font-bold text-gray-600">x{item.quantity}</td>
                            <td className="px-4 py-3 text-right font-medium text-gray-500">₹{parseFloat(item.price).toLocaleString()}</td>
                            <td className="px-4 py-3 text-right font-black text-gray-900 text-base">
                              ₹{(parseFloat(item.price) * item.quantity).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderManagement;
