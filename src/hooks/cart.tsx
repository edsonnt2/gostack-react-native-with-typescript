import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const Products = await AsyncStorage.getItem('@GoMarketplace:products');
      const newProducts: Product[] = Products ? JSON.parse(Products) : [];
      setProducts([...newProducts]);
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async ({ id, title, image_url, price }: Omit<Product, 'quantity'>) => {
      const newProducts: Product[] = [
        ...products,
        {
          id,
          image_url,
          price,
          title,
          quantity: 1,
        },
      ];

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.reduce((acc, item) => {
        if (item.id !== id) {
          return [...acc, item];
        }

        const updatedItem = { ...item, quantity: item.quantity + 1 };

        return [...acc, updatedItem];
      }, [] as Product[]);

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  // const increment = useCallback(
  //   async id => {
  //     const indexProduct = products.findIndex(item => item.id === id);

  //     const newProducts = products;

  //     newProducts[indexProduct].quantity += 1;

  //     setProducts(newProducts);

  //     await AsyncStorage.setItem(
  //       '@GoMarketplace:products',
  //       JSON.stringify(newProducts),
  //     );
  //   },
  //   [products],
  // );

  const decrement = useCallback(
    async id => {
      const newProducts = products.reduce((acc, item) => {
        if (item.id !== id) {
          return [...acc, item];
        }

        if (item.quantity === 1) {
          return acc;
        }

        const updatedItem = { ...item, quantity: item.quantity - 1 };

        return [...acc, updatedItem];
      }, [] as Product[]);

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  // const decrement = useCallback(
  //   async id => {
  //     const indexProduct = products.findIndex(item => item.id === id);

  //     if (products[indexProduct].quantity > 1) {
  //       products[indexProduct].quantity -= 1;

  //       await AsyncStorage.setItem(
  //         '@GoMarketplace:products',
  //         JSON.stringify(products),
  //       );

  //       setProducts(products);
  //     }
  //   },
  //   [products],
  // );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
