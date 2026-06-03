/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, ShoppingCart, Percent, TrendingUp, ChevronRight, X, AlertCircle } from 'lucide-react';
import { Product } from '../types';

interface ResellerShopProps {
  products: Product[];
  onOrderCompleted: (earnedProfit: number, productName: string) => void;
}

export default function ResellerShop({ products, onOrderCompleted }: ResellerShopProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // In-app order setup states
  const [sellPrice, setSellPrice] = useState<number>(0);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [orderSuccess, setOrderSuccess] = useState<boolean>(false);
  const [formError, setFormError] = useState<string>('');

  const categories = [
    { key: 'all', label: 'সব প্রোডাক্ট' },
    { key: 'panjabi', label: 'পাঞ্জাবি' },
    { key: 'three piece', label: 'থ্রি পিস' },
    { key: 't-shirt', label: 'টি-শার্ট' },
    { key: 'shirts', label: 'শার্ট' },
    { key: 'pants', label: 'প্যান্ট' }
  ];

  // Filters
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.code.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openOrderModal = (product: Product) => {
    setSelectedProduct(product);
    setSellPrice(product.regularPrice); // default suggest retail price
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setQuantity(1);
    setOrderSuccess(false);
    setFormError('');
  };

  const calculateProfit = () => {
    if (!selectedProduct) return 0;
    const profit = (sellPrice - selectedProduct.wholesalePrice) * quantity;
    return profit > 0 ? profit : 0;
  };

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    if (sellPrice < selectedProduct.wholesalePrice) {
      setFormError(`😂 বিক্রয় মূল্য অবশ্যই ডিলার রেট (${selectedProduct.wholesalePrice} ৳) এর বেশি হতে হবে!`);
      return;
    }
    if (!customerName || !customerPhone || !customerAddress) {
      setFormError('⚠️ কাস্টমারের সব তথ্য সঠিকভাবে পূরণ করুন।');
      return;
    }
    if (customerPhone.length < 11) {
      setFormError('📞 সঠিক ১১ ডিজিটের মোবাইল নাম্বার প্রদান করুন।');
      return;
    }

    const profit = calculateProfit();
    
    // Call global callback to update income metrics and transactions
    onOrderCompleted(profit, selectedProduct.name);
    setOrderSuccess(true);
    setFormError('');
  };

  return (
    <div className="max-w-6xl mx-auto p-4 sm:p-6" id="reseller-shop">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-pink-500 rounded-3xl p-6 text-white mb-6 shadow-xl shadow-pink-100 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 w-44 h-44 bg-white/15 rounded-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">লাইভ গুড রিসেলার শপ</h1>
            <p className="text-sm opacity-95 max-w-xl">
              কোম্পানির শত শত প্রিমিয়াম মানের প্রোডাক্ট সম্পূর্ণ ফ্রিতে রিসেলিং করুন কাস্টমারের নিকট। কোনো পুঁজি বা স্টক এর ঝামেলা ছাড়া শুধু অর্ডার প্লে করে নিজের নির্ধারিত লভ্যাংশ ক্লেইম করুন!
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl text-center border border-white/25">
            <span className="text-xs uppercase font-extrabold tracking-wider text-yellow-200">রিসেলিং মার্জিন</span>
            <p className="text-2xl sm:text-3xl font-black mt-1">১০০% কাস্টম লাভ</p>
          </div>
        </div>
      </div>

      {/* Category Horizontal Filter Bar & Search bar */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-white/90 backdrop-blur-md border border-purple-100 rounded-2xl p-4 mb-6 shadow-md shadow-purple-50/50 gap-4">
        {/* Categories horizontal draglist */}
        <div className="flex overflow-x-auto w-full md:w-auto gap-2 no-scrollbar scroll-smooth py-1 shrink-0">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-4 py-2 rounded-full font-bold text-sm shrink-0 transition-all ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-purple-700 to-pink-500 text-white shadow-md shadow-pink-100'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-100/60'
              }`}
              id={`cat-btn-${cat.key}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-64 shrink-0">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400" />
          <input
            type="text"
            placeholder="প্রোডাক্ট কোড বা নাম দিয়ে খুঁজুন..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm bg-purple-50/50 border border-purple-100 hover:border-purple-200 focus:border-pink-300 rounded-full py-2.5 pl-10 pr-4 text-purple-950 focus:outline-none transition-all placeholder-purple-400"
            id="product-search-input"
          />
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" id="products-grid-list">
          {filteredProducts.map((p) => (
            <motion.div
              key={p.id}
              whileHover={{ y: -4 }}
              className="bg-white/95 backdrop-blur border border-purple-100 rounded-2xl overflow-hidden shadow-md shadow-purple-100/40 hover:shadow-xl hover:shadow-pink-100/60 transition-all flex flex-col justify-between"
              id={`product-item-${p.id}`}
            >
              {/* Product Visual */}
              <div className="relative aspect-video sm:aspect-square overflow-hidden bg-purple-50">
                <img
                  src={p.image}
                  alt={p.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute left-3 top-3 bg-purple-900/80 backdrop-blur-sm text-white text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full uppercase">
                  কোড: {p.code}
                </span>
              </div>

              {/* Product Context */}
              <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-extrabold text-purple-950 text-base sm:text-lg mb-1 leading-snug line-clamp-2">
                    {p.name}
                  </h3>
                  <p className="text-xs text-purple-700 mb-3 line-clamp-2">
                    {p.description}
                  </p>
                </div>

                {/* Rates layout */}
                <div className="space-y-3 pt-3 border-t border-purple-50">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium">ডিলার মূল্য (Wholesale)</span>
                    <span className="text-purple-700 font-bold">{p.wholesalePrice} ৳</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500 font-medium font-medium">সর্বোচ্চ বিক্রয় মূল্য (Retail)</span>
                    <span className="text-pink-600 font-bold">{p.regularPrice} ৳</span>
                  </div>
                  <div className="flex justify-between items-center text-xs bg-pink-50 p-2 rounded-xl border border-pink-100/50">
                    <span className="text-pink-700 font-bold flex items-center gap-1">
                      <TrendingUp size={12} /> সম্ভাব্য প্রফিট
                    </span>
                    <span className="text-pink-600 font-extrabold">{p.regularPrice - p.wholesalePrice} ৳</span>
                  </div>

                  {/* Buy Button */}
                  <button
                    onClick={() => openOrderModal(p)}
                    className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 hover:opacity-95 text-white font-bold text-sm tracking-wide transition-all shadow-md shadow-pink-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    id={`order-btn-${p.id}`}
                  >
                    <ShoppingCart size={15} />
                    অর্ডার করুন করুন
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center p-12 bg-white/80 border border-purple-100 rounded-2xl shadow-inner max-w-md mx-auto">
          <AlertCircle className="mx-auto text-purple-300 mb-2" size={32} />
          <h3 className="font-bold text-purple-950 text-base mb-1">কোনো প্রোডাক্ট পাওয়া যায়নি</h3>
          <p className="text-xs text-purple-600">ভিন্ন কোনো সার্চ কী-ওয়ার্ড ব্যবহার করে চেষ্টা করুন।</p>
        </div>
      )}

      {/* Order Dialog Form Overlay */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 bg-purple-950/45 backdrop-blur-sm z-50 overflow-y-auto flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-lg w-full border border-purple-100/80 flex flex-col max-h-[90vh]"
              id="order-modal-form"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 bg-gradient-to-r from-purple-700 to-pink-500 text-white flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2">
                  <ShoppingCart size={18} />
                  <span className="font-bold text-base sm:text-lg">রিসেলিং ড্যাশবোর্ড অর্ডার ফর্ম</span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 text-white transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 overflow-y-auto space-y-5 flex-1">
                {orderSuccess ? (
                  <div className="text-center py-6 space-y-4">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                      <ShoppingCart size={32} />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-lg font-black text-emerald-800">অর্ডারটি সফলভাবে প্লে করা হয়েছে!</h3>
                      <p className="text-xs text-purple-600">প্রোডাক্ট কোড: {selectedProduct.code}</p>
                    </div>

                    <div className="bg-pink-50 border border-pink-100 p-4 rounded-2xl inline-block">
                      <span className="text-xs font-bold text-pink-700 uppercase block tracking-wider mb-1">
                        আপনার ওয়ালেটে অর্জিত লাভ জমা হয়েছে
                      </span>
                      <p className="text-2xl font-black text-pink-600">+{calculateProfit()} ৳</p>
                    </div>

                    <p className="text-xs text-gray-500 max-w-sm mx-auto">
                      আমাদের ডেলিভারি টিম আগামী ২৪-৪৮ ঘণ্টার মধ্যে প্রোডাক্টটি গ্রাহকের নিকট পৌঁছে দিয়ে পেমেন্ট সম্পূর্ণ করে ফেলবে।
                    </p>

                    <button
                      onClick={() => setSelectedProduct(null)}
                      className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-sm rounded-full transition-colors"
                    >
                      ড্যাশবোর্ডে ফিরে যান
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handlePlaceOrder} className="space-y-4">
                    {/* Selected Product Context */}
                    <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-2xl border border-purple-100/60 select-none">
                      <img
                        src={selectedProduct.image}
                        alt={selectedProduct.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div>
                        <h4 className="font-bold text-purple-950 text-sm leading-snug line-clamp-1">
                          {selectedProduct.name}
                        </h4>
                        <p className="text-xs text-purple-600 mt-0.5">ডিলার ডাইরেক্ট মূল্য: {selectedProduct.wholesalePrice} ৳</p>
                        <p className="text-[10px] text-pink-600 font-semibold">প্রস্তাবিত রিটেইল মূল্য: {selectedProduct.regularPrice} ৳</p>
                      </div>
                    </div>

                    {/* Quantity & Profit estimation boxes */}
                    <div className="grid grid-cols-2 gap-3 select-none">
                      <div>
                        <label className="text-xs font-bold text-purple-900 block mb-1">প্রোডাক্টের পরিমাণ (Qty)</label>
                        <div className="flex items-center border border-purple-100 rounded-xl overflow-hidden bg-white">
                          <button
                            type="button"
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                            className="w-10 py-2 hover:bg-purple-50 text-purple-700 font-bold border-r border-purple-100 transition-colors"
                          >
                            -
                          </button>
                          <span className="flex-1 text-center font-bold text-purple-950 text-sm">{quantity}</span>
                          <button
                            type="button"
                            onClick={() => setQuantity(quantity + 1)}
                            className="w-10 py-2 hover:bg-purple-50 text-purple-700 font-bold border-l border-purple-100 transition-colors"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-bold text-purple-900 block mb-1">অর্ডার বিক্রয় মূল্য (৳)</label>
                        <input
                          type="number"
                          value={sellPrice}
                          onChange={(e) => setSellPrice(Number(e.target.value))}
                          className="w-full text-center text-sm bg-white border border-purple-100 focus:border-pink-300 rounded-xl py-2 font-bold text-pink-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Margin Calculation Widget */}
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-100 flex items-center justify-between shadow-inner select-none">
                      <div className="space-y-0.5">
                        <span className="text-xs font-bold text-purple-900 flex items-center gap-1">
                          <TrendingUp size={14} className="text-pink-600" />
                          আপনার ক্যাশ লাভ (Profit)
                        </span>
                        <p className="text-[10px] text-purple-600">
                          বিক্রয় মূল্য ({sellPrice} ৳) - ডিলার রেট ({selectedProduct.wholesalePrice} ৳) × {quantity}
                        </p>
                      </div>
                      <p className="text-2xl font-black text-pink-600">
                        {calculateProfit()} ৳
                      </p>
                    </div>

                    {/* Customer details fields */}
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs font-extrabold text-purple-950 uppercase border-b border-purple-50 pb-1">
                        গ্রাহকের ঠিকানা ও কন্টাক্ট ইনফো
                      </h4>

                      <div>
                        <label className="text-[11px] font-bold text-purple-900 block mb-1">গ্রাহকের নাম</label>
                        <input
                          type="text"
                          required
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          placeholder="উদাঃ আসিকুর রহমান"
                          className="w-full text-sm bg-white border border-purple-100 focus:border-pink-350 focus:ring-1 focus:ring-pink-350 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-purple-900 block mb-1">মোবাইল নাম্বার</label>
                        <input
                          type="tel"
                          required
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          placeholder="উদাঃ 017xxxxxxxx"
                          className="w-full text-sm bg-white border border-purple-100 focus:border-pink-350 focus:ring-1 focus:ring-pink-350 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-purple-900 block mb-1">ডেলিভারি ঠিকানা</label>
                        <textarea
                          required
                          rows={2}
                          value={customerAddress}
                          onChange={(e) => setCustomerAddress(e.target.value)}
                          placeholder="উদাঃ হাউজ ১৫, রোড ০৩, ধানমন্ডি, ঢাকা"
                          className="w-full text-sm bg-white border border-purple-100 focus:border-pink-350 focus:ring-1 focus:ring-pink-350 rounded-xl py-2 px-3 text-purple-950 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Errors box */}
                    {formError && (
                      <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-1.5 animate-shake">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{formError}</span>
                      </div>
                    )}

                    {/* Form submit */}
                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-purple-700 to-pink-500 hover:opacity-95 text-white font-bold text-base rounded-2xl shadow-lg shadow-pink-100 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                    >
                      কনফার্ম অর্ডার প্লে করুন 
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
