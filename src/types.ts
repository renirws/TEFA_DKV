export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'Desain' | 'Cetak' | 'Merchandise' | 'Foto';
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}
