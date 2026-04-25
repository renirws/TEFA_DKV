import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShoppingBag, 
  Plus, 
  Minus, 
  X, 
  Instagram, 
  MapPin, 
  MessageCircle, 
  Printer, 
  Paintbrush, 
  Shirt, 
  Trash2,
  ChevronRight,
  Menu,
  ShoppingCart
} from 'lucide-react';
import { PRODUCTS, CONTACT_INFO } from './constants';
import { CartItem, Product } from './types';

export default function App() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('Semua');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    address: '',
    city: '',
    zipCode: ''
  });

  // Cart operations
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    if (!isCartOpen) setIsCartOpen(true);
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const totalPrice = useMemo(() => 
    cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  , [cart]);

  const totalItems = useMemo(() => 
    cart.reduce((sum, item) => sum + item.quantity, 0)
  , [cart]);

  const checkoutWhatsApp = () => {
    if (cart.length === 0) return;

    const message = `Halo StapOne! Saya ingin memesan:\n\n` +
      cart.map(item => `- ${item.name} (${item.quantity}x) - Rp ${ (item.price * item.quantity).toLocaleString('id-ID') }`).join('\n') +
      `\n\nTotal: Rp ${totalPrice.toLocaleString('id-ID')}\n\nMohon informasi selanjutnya. Terima kasih!`;
    
    const url = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const checkoutToGoogleSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const productNames = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID');
    const formattedDate = now.toLocaleDateString('id-ID');
    
    setIsSubmitting(true);
    
    // Data for Google Sheets
    const sheetData = new URLSearchParams();
    sheetData.append('Nama Depan', formData.firstName);
    sheetData.append('Nama Belakang', formData.lastName);
    sheetData.append('Email', formData.email);
    sheetData.append('Alamat', formData.address);
    sheetData.append('Kota', formData.city);
    sheetData.append('Kode Pos', formData.zipCode);
    sheetData.append('Nama Produk', productNames);
    sheetData.append('Total Harga', totalPrice.toString());
    sheetData.append('Waktu & Tanggal', `${formattedTime}, ${formattedDate}`);

    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbyTMBtsIN3FWXUXnjxniDtBKHlNbNqjv2X6CE1jN5HVbqfySrKxnUh-AqA_HUe3lvmJ/exec'; //ubah link hasil deploy appscript pada gsheet     
      // Kirim ke Google Sheets dengan format form-urlencoded yang lebih kompatibel dengan Apps Script doPost
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: sheetData.toString()
      });

      
      alert('Pemesanan Berhasil Terkirim! Mohon tunggu konfirmasi dari kami.');
      setCart([]);
      setIsCartOpen(false);
      setIsCheckingOut(false);
      setFormData({ firstName: '', lastName: '', email: '', address: '', city: '', zipCode: '' });
    } catch (error) {
      console.error('Submission error:', error);
      alert('Gagal mengirim pesanan. Silakan coba lagi atau hubungi admin via WhatsApp.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = activeCategory === 'Semua' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const categories = ['Semua', 'Desain', 'Cetak', 'Merchandise'];

  return (
    <div className="min-h-screen bg-brand-bg text-brand-primary selection:bg-brand-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 bg-brand-bg/80 backdrop-blur-md border-b border-black/5 z-40 px-6 lg:px-12 py-6">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between">
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-display font-black italic tracking-tighter uppercase leading-none">
              Stap<span className="text-brand-accent">One</span>
            </span>
            <span className="hidden sm:block text-[9px] uppercase tracking-[0.3em] font-bold opacity-30">
              Teaching Factory DKV SMK Tanjung Priok 1
            </span>
          </div>

          <div className="hidden lg:flex items-center space-x-10 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#hero" className="hover:text-brand-accent transition-colors border-b-2 border-brand-primary">Home</a>
            <a href="#katalog" className="hover:text-brand-accent transition-colors">Katalog</a>
            <a href="#testimoni" className="hover:text-brand-accent transition-colors">Testimoni</a>
            <a href="#kontak" className="hover:text-brand-accent transition-colors">Kontak</a>
          </div>

          <div className="flex items-center space-x-6">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="group flex items-center space-x-2 text-[10px] font-bold uppercase tracking-[0.2em]"
            >
              <span>Cart</span>
              <span className="bg-brand-primary text-white w-5 h-5 flex items-center justify-center rounded-full group-hover:bg-brand-accent transition-colors">
                {totalItems}
              </span>
            </button>
            <button 
              className="lg:hidden"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 bg-brand-bg z-50 p-8 flex flex-col justify-center items-center gap-8"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8">
              <X size={32} />
            </button>
            {['Home', 'Katalog', 'Testimoni', 'Kontak'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-4xl font-display font-black italic uppercase tracking-tighter"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-32 lg:pt-0 lg:h-screen lg:flex overflow-hidden">
        {/* Left Side: Hero Sidebar */}
        <section className="lg:w-[450px] lg:border-r border-black/5 p-10 lg:p-16 flex flex-col justify-between bg-white relative">
          <div className="z-10 mt-12 lg:mt-24">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-7xl lg:text-8xl font-display leading-[0.85] tracking-tighter mb-8"
            >
              CRAFTED<br/>WITH<br/><span className="text-brand-accent">PRECISION.</span>
            </motion.h1>
            <p className="text-sm leading-relaxed opacity-60 mb-10 max-w-sm">
              Kami melayani berbagai kebutuhan desain grafis, cetak digital, hingga merchandise kustom dengan standar industri yang dikelola oleh talenta muda berbakat.
            </p>
            <div className="space-y-6">
              <div className="p-5 border-l-4 border-brand-accent bg-brand-muted/50">
                <p className="text-[10px] uppercase font-bold opacity-30 mb-2 tracking-widest">Featured Service</p>
                <p className="text-sm font-semibold italic uppercase font-display leading-none">"Logo & Brand Identity Pack"</p>
                <p className="text-xs mt-2 opacity-60 uppercase font-bold tracking-widest">Mulai dari Rp 250k</p>
              </div>
              <a 
                href="#katalog" 
                className="inline-block w-full text-center bg-brand-primary text-white py-5 text-[10px] font-bold uppercase tracking-[0.3em] hover:bg-brand-accent transition-colors"
              >
                Shop Collection
              </a>
            </div>
          </div>
          
          <div className="mt-16 lg:mt-0 pt-8 border-t border-black/5">
            <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mb-4">Testimonial</p>
            <p className="text-xs font-medium italic mb-2 uppercase font-display leading-tight">
              "Kualitas cetaknya sangat profesional. Hasil karyanya benar-benar standar industri."
            </p>
            <p className="text-[9px] font-bold tracking-widest opacity-50 uppercase">— Alumni Angkatan 2024</p>
          </div>
        </section>

        {/* Right Side: Catalog Area */}
        <section className="flex-1 bg-brand-muted/30 lg:p-12 p-6 overflow-y-auto custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl font-display font-black italic tracking-tighter uppercase leading-none">
                  Product <span className="text-brand-accent">Catalog</span>
                </h2>
                <p className="text-[10px] uppercase tracking-widest font-bold opacity-30 mt-2">
                  {filteredProducts.length} Items Available
                </p>
              </div>
              
              <div className="flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-[0.2em]">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`transition-all ${
                      activeCategory === cat 
                        ? 'text-brand-accent border-b-2 border-brand-accent pb-1' 
                        : 'opacity-40 hover:opacity-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-black/5 hover:border-black/20 p-5 flex items-center space-x-8 group transition-all"
                  >
                    <div className="relative overflow-hidden w-28 h-28 lg:w-36 lg:h-36 shrink-0">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover grayscale opacity-90 group-hover:grayscale-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-grow flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div>
                        <p className="text-[9px] uppercase font-bold opacity-30 mb-2 tracking-[0.2em]">{product.category}</p>
                        <h4 className="text-xl font-display font-black italic uppercase leading-none mb-2">
                          {product.name}
                        </h4>
                        <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest">
                          Rp {product.price.toLocaleString('id-ID')}
                        </p>
                      </div>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-brand-primary text-white px-8 py-3 text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-brand-accent transition-colors self-start lg:self-center"
                      >
                        Add To Bag
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <footer className="mt-24 pt-12 border-t border-black/5 flex flex-col md:flex-row justify-between items-center gap-8 pb-12">
              <div className="flex space-x-8 text-[9px] font-bold uppercase tracking-widest opacity-40">
                <a href={`https://instagram.com/${CONTACT_INFO.instagram}`} target="_blank">Instagram: {CONTACT_INFO.instagram}</a>
                <a href="#">Web: smktjpriok1.sch.id</a>
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest opacity-40">
                {CONTACT_INFO.address}
              </p>
            </footer>
          </div>
        </section>
      </main>

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsCartOpen(false)}
               className="fixed inset-0 bg-brand-primary/20 backdrop-blur-sm z-[60]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-brand-bg z-[70] flex flex-col border-l border-black/10 shadow-2xl overflow-hidden"
            >
              <div className="p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-black/10">
                  <h3 className="text-3xl font-display font-black italic tracking-tighter uppercase">
                    {isCheckingOut ? 'Details' : 'Your Bag'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckingOut(false);
                    }}
                    className="text-[10px] font-bold uppercase tracking-widest opacity-40 hover:opacity-100"
                  >
                    Close
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-4 custom-scrollbar">
                  {!isCheckingOut ? (
                    cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                        <ShoppingBag size={48} className="mb-4 stroke-1" />
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em]">Bag is currently empty</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-start">
                            <div className="flex-grow">
                              <h4 className="text-sm font-display font-black italic uppercase leading-none mb-2">{item.name}</h4>
                              <p className="text-[10px] opacity-40 uppercase font-bold tracking-widest mb-4">
                                {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                              </p>
                              <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest">
                                <button onClick={() => updateQuantity(item.id, -1)} className="opacity-40 hover:opacity-100">Less</button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="opacity-40 hover:opacity-100">More</button>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="text-[10px] font-bold text-brand-accent uppercase tracking-widest"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <form id="checkout-form" onSubmit={checkoutToGoogleSheets} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Nama Depan</label>
                          <input 
                            required
                            name="Nama Depan"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Nama Belakang</label>
                          <input 
                            required
                            name="Nama Belakang"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Email</label>
                        <input 
                          required
                          type="email"
                          name="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Alamat</label>
                        <textarea 
                          required
                          name="Alamat"
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent resize-none"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Kota</label>
                          <input 
                            required
                            name="Kota"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[9px] uppercase font-bold opacity-40 tracking-widest">Kode Pos</label>
                          <input 
                            required
                            name="Kode Pos"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="w-full bg-brand-muted/50 border border-black/5 p-3 text-xs font-bold uppercase tracking-widest focus:outline-none focus:border-brand-accent"
                          />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-black">
                    <div className="flex justify-between items-end mb-8">
                      <span className="text-[10px] uppercase font-bold tracking-widest opacity-40">
                        {isCheckingOut ? 'Total Order' : 'Subtotal'}
                      </span>
                      <span className="text-3xl font-display font-black italic tracking-tighter">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {isCheckingOut ? (
                      <div className="flex flex-col gap-4">
                        <button 
                          form="checkout-form"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full bg-brand-accent text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-brand-accent/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
                        >
                          {isSubmitting ? 'Sending...' : 'Confirm Order'}
                        </button>
                        <button 
                          onClick={() => setIsCheckingOut(false)}
                          className="text-[9px] font-bold uppercase tracking-[0.2em] opacity-40 hover:opacity-100"
                        >
                          Back to Bag
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full bg-brand-primary text-white py-6 text-[10px] font-bold uppercase tracking-[0.3em] shadow-lg shadow-black/10 hover:scale-[1.02] transition-transform"
                      >
                        Proceed to Checkout
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
