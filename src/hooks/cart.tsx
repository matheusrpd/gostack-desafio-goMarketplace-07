import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';

const STORAGE_KEY = '@GoMarketplace:Cart';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const response = await AsyncStorage.getItem(STORAGE_KEY);

      if (response) {
        setProducts(JSON.parse(response));
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function setAsyncStorage(): Promise<void> {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    }

    setAsyncStorage();
  }, [products]);

  const increment = useCallback(
    async id => {
      const filterProducts = products.filter(product => product.id !== id);
      const product = products.find(p => p.id === id);

      if (product) {
        const newProduct = {
          ...product,
          quantity: product?.quantity + 1,
        };

        setProducts([...filterProducts, newProduct]);
      }
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const filterProducts = products.filter(product => product.id !== id);
      const product = products.find(productFind => productFind.id === id);

      if (product) {
        if (product.quantity === 1) {
          setProducts(filterProducts);
        } else {
          const newProduct = {
            ...product,
            quantity: product.quantity - 1,
          };

          setProducts([...filterProducts, newProduct]);
        }
      }
    },
    [products],
  );

  const addToCart = useCallback(
    async product => {
      const productIndex = products.findIndex(p => p.id === product.id);

      if (productIndex < 0) {
        setProducts([...products, { ...product, quantity: 1 }]);
      } else {
        increment(product.id);
      }
    },
    [increment, products],
  );

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
