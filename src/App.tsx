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
  ShoppingCart,
  Phone
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
    zipCode: '',
    buktiBayar: '',
    fileName: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Ukuran file maksimal adalah 2MB.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => ({
        ...prev,
        buktiBayar: reader.result as string,
        fileName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

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

  const checkoutToGoogleSheets = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    const productNames = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    const now = new Date();
    const formattedTime = now.toLocaleTimeString('id-ID');
    const formattedDate = now.toLocaleDateString('id-ID');
    
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
    sheetData.append('Upload Bukti Bayar', formData.buktiBayar);
    sheetData.append('Waktu & Tanggal', `${formattedTime}, ${formattedDate}`);

    try {
      const scriptUrl = 'https://script.google.com/macros/s/AKfycbzE3EY3LDxsL0iniwNmXUaOF9UKOuBEuj11M6qgxjEm09TWQwQWeK3TiOklacEaxcXy/exec'; //ubah link hasil deploy appscript pada gsheet     
      
      // Kirim ke Google Sheets
      // Menggunakan mode: 'no-cors' adalah cara termudah untuk menghindari masalah CORS dengan Google Apps Script
      // saat kita tidak perlu membaca isi responnya.
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        cache: 'no-cache',
        body: sheetData
      });

      // WhatsApp Message Integration
      const message = `*HALO STAPONE! SAYA INGIN MEMESAN*%0A%0A` +
        `*Data Pemesan:*%0A` +
        `- Nama: ${formData.firstName} ${formData.lastName}%0A` +
        `- Email: ${formData.email}%0A` +
        `- Alamat: ${formData.address}%0A` +
        `- Kota: ${formData.city} (${formData.zipCode})%0A%0A` +
        `*Daftar Pesanan:*%0A${productNames.split(', ').map(p => `- ${p}`).join('%0A')}%0A%0A` +
        `*Total Harga:* Rp ${totalPrice.toLocaleString('id-ID')}%0A%0A` +
        `_Laporan pesanan sudah masuk ke sistem kami`;

      const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${message}`;
      
      alert('Pemesanan Berhasil Terkirim! Data Anda telah tersimpan dan akan diproses dalam waktu 1x24 jam. Klik OK untuk konfirmasi akhir via WhatsApp.');
      window.open(whatsappUrl, '_blank');

      setCart([]);
      setIsCartOpen(false);
      setIsCheckingOut(false);
      setFormData({ 
        firstName: '', 
        lastName: '', 
        email: '', 
        address: '', 
        city: '', 
        zipCode: '',
        buktiBayar: '',
        fileName: ''
      });
    } catch (error) {
      console.error('Submission error:', error);
      // Tetap arahkan ke WhatsApp jika gagal kirim ke Sheet agar pesanan tidak hilang
      const message = `*PEMESANAN (OFFLINE SYNC)*%0A%0A` +
        `Nama: ${formData.firstName}%0A` +
        `Order: ${productNames}%0A` +
        `Total: Rp ${totalPrice.toLocaleString('id-ID')}`;
      const whatsappUrl = `https://wa.me/${CONTACT_INFO.whatsapp}?text=${message}`;
      
      alert('Koneksi ke sistem Sheets terganggu, tapi pesanan Anda tetap bisa dikirim langsung melalui WhatsApp.');
      window.open(whatsappUrl, '_blank');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = activeCategory === 'Semua' 
    ? PRODUCTS 
    : PRODUCTS.filter(p => p.category === activeCategory);

  const categories = ['Semua', 'Desain', 'Cetak', 'Merchandise'];

  return (
    <div className="min-h-screen bg-surface selection:bg-accent selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 glass-morphism z-40 px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-3"
          >
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white font-display font-black text-xl shadow-lg shadow-primary/20">
              S1
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-display font-black tracking-tight leading-none">
                STAP<span className="text-energy">ONE</span>
              </span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold opacity-40">
                Teaching Factory DKV
              </span>
            </div>
          </motion.div>

          <div className="hidden lg:flex items-center space-x-10 text-[10px] font-bold uppercase tracking-[0.2em]">
            <a href="#hero" className="hover:text-accent transition-colors relative group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <a href="#katalog" className="hover:text-accent transition-colors relative group">
              Katalog
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <a href="#testimoni" className="hover:text-accent transition-colors relative group">
              Testimoni
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
            <a href="#kontak" className="hover:text-accent transition-colors relative group">
              Kontak
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-accent transition-all group-hover:w-full"></span>
            </a>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-3 sm:p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-90"
            >
              <ShoppingCart size={22} className="text-primary" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-energy text-white text-[10px] w-6 h-6 flex items-center justify-center rounded-full font-bold border-2 border-white">
                  {totalItems}
                </span>
              )}
            </button>
            <button 
              className="lg:hidden p-3 sm:p-4 bg-slate-50 rounded-2xl active:scale-90 transition-transform"
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
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 bg-primary/95 text-white z-50 p-8 flex flex-col justify-center items-center gap-8 backdrop-blur-lg"
          >
            <button onClick={() => setIsMenuOpen(false)} className="absolute top-8 right-8 text-white/50 hover:text-white">
              <X size={40} />
            </button>
            {['Home', 'Katalog', 'Testimoni', 'Kontak'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                onClick={() => setIsMenuOpen(false)}
                className="text-5xl font-display font-black tracking-tight hover:text-accent transition-colors"
              >
                {item}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <main className="pt-24">
        {/* Hero Section */}
        <section id="hero" className="relative px-6 lg:px-12 py-16 lg:py-32 overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-accent/5 to-transparent -z-10 blur-3xl"></div>
          <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-widest mb-8 border border-accent/20">
                <span className="w-2 h-2 bg-accent rounded-full animate-pulse mr-2"></span>
                Teaching Factory DKV
              </span>
              <h1 className="text-6xl lg:text-8xl leading-[0.95] mb-8">
                Unleash <br />
                <span className="gradient-text">Creative</span> <br />
                Power.
              </h1>
              <p className="text-lg text-slate-500 mb-12 max-w-lg font-medium leading-relaxed">
                StapOne menghadirkan solusi desain profesional, cetak berkualitas, dan merchandise kustom dengan standar industri nyata.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a href="#katalog" className="btn-energy flex items-center justify-center gap-2 group text-center">
                  Eksplor Katalog <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </a>
                <a href="#kontak" className="btn-primary flex items-center justify-center text-center">
                  Konsultasi Gratis
                </a>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-accent/20 to-energy/20 rounded-[3rem] blur-2xl -z-10 animate-pulse"></div>
              <div className="relative rounded-[3rem] overflow-hidden border-8 border-white shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1558655146-d09347e92766?q=80&w=1000&auto=format&fit=crop" 
                  alt="Creative Workspace" 
                  className="w-full aspect-[4/5] object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-8 left-8 right-8 glass-morphism p-6 rounded-2xl">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                       <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200"></div>
                     ))}
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                      Dipercaya oleh ratusan klien lokal
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Catalog Area */}
        <section id="katalog" className="px-6 lg:px-12 py-24 bg-white relative">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
              <div className="max-w-xl text-center lg:text-left mx-auto lg:mx-0">
                <h2 className="text-5xl lg:text-6xl mb-6">Pilihan <span className="text-energy">Katalog.</span></h2>
                <p className="text-slate-400 font-medium italic text-sm">Kualitas industri, hasil karya siswa DKV SMK Tanjung Priok 1.</p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-3 p-2 bg-slate-50 rounded-3xl self-center lg:self-end">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-4 sm:px-8 sm:py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 ${
                      activeCategory === cat 
                        ? 'bg-white text-primary shadow-lg' 
                        : 'text-slate-400 hover:text-primary'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((product) => (
                  <motion.div
                    layout
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="elegant-card flex flex-col group"
                  >
                    <div className="relative aspect-square rounded-[1.5rem] overflow-hidden mb-6">
                      <img 
                        src={product.image} 
                        alt={product.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-bold uppercase tracking-widest shadow-sm">
                          {product.category}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-grow">
                      <h4 className="text-2xl font-display font-black leading-tight mb-3">
                        {product.name}
                      </h4>
                      <p className="text-sm text-slate-500 mb-8 flex-grow leading-relaxed">
                        {product.description}
                      </p>
                      
                      <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                        <span className="text-xl font-display font-black tracking-tighter">
                          Rp {product.price.toLocaleString('id-ID')}
                        </span>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-primary group-hover:bg-energy group-hover:text-white transition-all shadow-sm"
                        >
                          <Plus size={24} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <footer className="mt-40 border-t border-slate-100 pt-20 pb-12">
              <div className="grid lg:grid-cols-3 gap-16 mb-20 text-center lg:text-left">
                <div className="space-y-6">
                  <div className="flex items-center justify-center lg:justify-start space-x-3 mb-8">
                    <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-white font-display font-black text-2xl shadow-xl">S1</div>
                    <h1 className="text-2xl font-display font-black tracking-tight">STAP<span className="text-energy">ONE</span></h1>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-sm mx-auto lg:mx-0">
                    Teaching Factory DKV SMK Tanjung Priok 1 merupakan wadah kreatif dan produktif berbasis standar industri pendidikan.
                  </p>
                </div>
                
                <div className="grid md:grid-cols-2 gap-12 lg:col-span-2">
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-energy mb-6">Hubungi Kami</h4>
                    <div className="flex items-start lg:items-center justify-center lg:justify-start gap-4 text-slate-600">
                      <MapPin size={24} className="text-accent shrink-0" />
                      <p className="text-sm font-medium">{CONTACT_INFO.address}</p>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-slate-600">
                      <Instagram size={20} className="text-accent shrink-0" />
                      <a href={`https://instagram.com/${CONTACT_INFO.instagram}`} target="_blank" className="text-sm font-bold border-b border-transparent hover:border-accent transition-all leading-none pb-1">
                        @{CONTACT_INFO.instagram}
                      </a>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-4 text-slate-600">
                      <Phone size={20} className="text-accent shrink-0" />
                      <p className="text-sm font-bold">{CONTACT_INFO.phone}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="text-xs uppercase tracking-[0.3em] font-bold text-accent mb-6">Sekolah</h4>
                    <p className="text-xs font-bold text-slate-400">{CONTACT_INFO.school}</p>
                    <p className="text-xs text-slate-400">Jakarta Utara, Indonesia</p>
                  </div>
                </div>
              </div>
              
              <div className="text-center pt-12 border-t border-slate-50">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.4em]">
                  © {new Date().getFullYear()} STAPONE - SMK TANJUNG PRIOK 1. All Rights Reserved.
                </p>
              </div>
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
               className="fixed inset-0 bg-primary/20 backdrop-blur-md z-[60]" 
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 h-full w-full bg-white z-[70] flex flex-col shadow-[-40px_0_100px_-20px_rgba(15,23,42,0.1)] overflow-hidden"
            >
              <div className="p-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-12 pb-6 border-b border-slate-50">
                  <h3 className="text-4xl font-display font-black tracking-tight italic">
                    {isCheckingOut ? 'Details' : 'Bag'}
                  </h3>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      setIsCheckingOut(false);
                    }}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-primary transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                  {!isCheckingOut ? (
                    cart.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-20">
                        <ShoppingBag size={80} className="mb-6 stroke-[0.5]" />
                        <p className="text-xs uppercase font-bold tracking-[0.2em] font-display">Bag is currently empty</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {cart.map((item) => (
                          <div key={item.id} className="flex justify-between items-center group">
                            <div className="flex items-center gap-6">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-slate-100">
                                <img src={item.image} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                <h4 className="text-lg font-display font-black tracking-tight leading-none mb-2">{item.name}</h4>
                                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-4">
                                  {item.quantity} x Rp {item.price.toLocaleString('id-ID')}
                                </p>
                        <div className="flex items-center space-x-6 text-[10px] font-bold uppercase tracking-widest py-2">
                                  <button 
                                    onClick={() => updateQuantity(item.id, -1)} 
                                    className="p-2 -m-2 text-slate-300 hover:text-energy transition-colors active:scale-125"
                                  >
                                    Less
                                  </button>
                                  <span className="bg-slate-50 w-8 h-8 flex items-center justify-center rounded-lg">{item.quantity}</span>
                                  <button 
                                    onClick={() => updateQuantity(item.id, 1)} 
                                    className="p-2 -m-2 text-slate-300 hover:text-accent transition-colors active:scale-125"
                                  >
                                    More
                                  </button>
                                </div>
                              </div>
                            </div>
                            <button 
                              onClick={() => removeFromCart(item.id)}
                              className="w-8 h-8 rounded-xl bg-slate-50 text-slate-300 hover:text-energy hover:bg-energy/5 transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <form id="checkout-form" onSubmit={checkoutToGoogleSheets} className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">First Name</label>
                          <input 
                            required
                            name="Nama Depan"
                            value={formData.firstName}
                            onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">Last Name</label>
                          <input 
                            required
                            name="Nama Belakang"
                            value={formData.lastName}
                            onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all"
                            placeholder="Doe"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">Email</label>
                        <input 
                          required
                          type="email"
                          name="Email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all"
                          placeholder="hello@example.com"
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">Address</label>
                        <textarea 
                          required
                          name="Alamat"
                          rows={3}
                          value={formData.address}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                          className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all resize-none"
                          placeholder="Your full address..."
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">City</label>
                          <input 
                            required
                            name="Kota"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all"
                            placeholder="Jakarta"
                          />
                        </div>
                        <div className="space-y-3">
                          <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">ZIP</label>
                          <input 
                            required
                            name="Kode Pos"
                            value={formData.zipCode}
                            onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                            className="w-full bg-slate-50 border-none rounded-2xl p-4 text-xs font-bold focus:ring-2 ring-accent/20 outline-none transition-all"
                            placeholder="14230"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-300">Upload Bukti Bayar (Maks 2MB)</label>
                        <div className="relative group">
                          <input 
                            required
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          />
                          <div className={`w-full border-2 border-dashed ${formData.fileName ? 'border-accent bg-accent/5' : 'border-slate-100 hover:border-accent bg-slate-50'} rounded-2xl p-8 text-center transition-all`}>
                            <p className={`text-xs font-bold uppercase tracking-widest ${formData.fileName ? 'text-accent' : 'text-slate-400'}`}>
                              {formData.fileName || 'Pilih File atau Drag & Drop'}
                            </p>
                            <p className="text-[10px] text-slate-300 mt-2">JPG, PNG atau PDF (Maks 2MB)</p>
                          </div>
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="mt-12 pt-8 border-t border-slate-50">
                    <div className="flex justify-between items-end mb-8">
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-slate-300">
                        {isCheckingOut ? 'Total Order' : 'Subtotal'}
                      </span>
                      <span className="text-4xl font-display font-black tracking-tighter">
                        Rp {totalPrice.toLocaleString('id-ID')}
                      </span>
                    </div>
                    {isCheckingOut ? (
                      <div className="flex flex-col gap-4">
                        <button 
                          form="checkout-form"
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full btn-energy text-[10px] py-6 tracking-[0.3em] disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Confirm Order'}
                        </button>
                        <button 
                          onClick={() => setIsCheckingOut(false)}
                          className="text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-primary transition-colors"
                        >
                          Back to Bag
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => setIsCheckingOut(true)}
                        className="w-full btn-primary text-[10px] py-6 tracking-[0.3em] shadow-primary/20"
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
