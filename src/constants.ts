import { Product } from './types';

export const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Desain Logo Profesional',
    price: 150000,
    category: 'Desain',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?q=80&w=800&auto=format&fit=crop',
    description: 'Jasa pembuatan logo kreatif untuk identitas brand Anda.'
  },
  {
    id: '2',
    name: 'Cetak Banner (Per Meter)',
    price: 25000,
    category: 'Cetak',
    image: 'https://images.unsplash.com/photo-1562654508-4d9213bc5871?q=80&w=800&auto=format&fit=crop',
    description: 'Cetak banner berkualitas tinggi untuk kebutuhan promosi.'
  },
  {
    id: '3',
    name: 'Tumbler Custom Grafis',
    price: 75000,
    category: 'Merchandise',
    image: 'https://images.unsplash.com/photo-1574533030805-4f40f0907f1d?q=80&w=800&auto=format&fit=crop',
    description: 'Tumbler eksklusif dengan desain custom sesuai keinginan.'
  },
  {
    id: 'spanduk',
    name: 'Spanduk (Per Meter)',
    price: 50000,
    category: 'Cetak',
    image: 'https://lh3.googleusercontent.com/d/1FxV0Mcn6oEmk_bcQN658D60Q5snzb2Mn',
    description: 'Spanduk berkualitas tinggi dengan warna tajam.'
  },
  {
    id: 'notebook',
    name: 'Notebook Custom',
    price: 25000,
    category: 'Merchandise',
    image: 'https://lh3.googleusercontent.com/d/1d8clOcEyF3JM5krbgNg8BU7k3JX19kHp',
    description: 'Notebook eksklusif untuk catatan harian Anda.'
  },
  {
    id: 'undangan',
    name: 'Kartu Undangan',
    price: 15000,
    category: 'Cetak',
    image: 'https://lh3.googleusercontent.com/d/16xf7YcInD9I0njohn2D34G-KVWas6a7E',
    description: 'Desain undangan elegan untuk momen spesial Anda.'
  },
  {
    id: '4',
    name: 'Desain Feed Instagram (3 Post)',
    price: 100000,
    category: 'Desain',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=800&auto=format&fit=crop',
    description: 'Layout feed Instagram estetik untuk meningkatkan engagement.'
  },
  {
    id: '5',
    name: 'Cetak Kartu Nama (1 Box)',
    price: 45000,
    category: 'Cetak',
    image: 'https://lh3.googleusercontent.com/d/1ixVpJK6zQaaor0rXirGzXE43krbBvEjZ',
    description: 'Cetak kartu nama profesional dengan berbagai pilihan bahan.'
  },
  {
    id: '6',
    name: 'Kaos Sablon DTF',
    price: 85000,
    category: 'Merchandise',
    image: 'https://lh3.googleusercontent.com/d/1-SLz8fYR3lGBI6fPjZ3FQXVJDemWb1EP',
    description: 'Sablon kaos kualitas premium dengan teknologi DTF.'
  },
  {
    id: 'medali',
    name: 'Medali',
    price: 15000,
    category: 'Merchandise',
    image: 'https://lh3.googleusercontent.com/d/1aTn-qLrlYPmXpbVDllB13spwnFZ61PiL',
    description: 'Medali berkualitas untuk penghargaan dan kenang-kenangan.'
  },
  {
    id: 'photo-formal',
    name: 'Jasa Photo Formal',
    price: 20000,
    category: 'Foto',
    image: 'https://lh3.googleusercontent.com/d/1dZ08NNHHM7hKE9UN_DEqcMMXAYvz_pWK',
    description: 'Jasa pemotretan foto formal untuk kebutuhan ijazah, paspor, dll.'
  },
  {
    id: 'cetak-photo-2x3',
    name: 'Cetak Photo 2x3',
    price: 1000,
    category: 'Foto',
    image: 'https://lh3.googleusercontent.com/d/1dZ08NNHHM7hKE9UN_DEqcMMXAYvz_pWK',
    description: 'Cetak pas foto ukuran 2x3 cm (Harga per lembar).'
  },
  {
    id: 'cetak-photo-3x4',
    name: 'Cetak Photo 3x4',
    price: 1500,
    category: 'Foto',
    image: 'https://lh3.googleusercontent.com/d/1dZ08NNHHM7hKE9UN_DEqcMMXAYvz_pWK',
    description: 'Cetak pas foto ukuran 3x4 cm (Harga per lembar).'
  },
  {
    id: 'cetak-photo-4x6',
    name: 'Cetak Photo 4x6',
    price: 2000,
    category: 'Foto',
    image: 'https://lh3.googleusercontent.com/d/1dZ08NNHHM7hKE9UN_DEqcMMXAYvz_pWK',
    description: 'Cetak pas foto ukuran 4x6 cm (Harga per lembar).'
  }
];

export const CONTACT_INFO = {
  whatsapp: '6283892514698',
  address: 'Jl. Mangga No.3, Jakarta Utara - 14270',
  school: 'SMK Tanjung Priok 1 (StapOne)',
  instagram: 'dkv.smktanjungpriok1',
  phone: '+6283892514698',
  admins: [
    { name: 'Anggi', phone: '+62 838-9251-4698', wa: '6283892514698' },
    { name: 'Rizal', phone: '+62 857-1847-9450', wa: '6285718479450' }
  ],
  bank: {
    name: 'BCA',
    number: '0070053705',
    holder: 'Anggi Arini Widiastuti'
  }
};
