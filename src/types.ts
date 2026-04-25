export interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: 'Desain' | 'Cetak' | 'Merchandise';
  description: string;
}

export interface CartItem extends Product {
  quantity: number;
}
