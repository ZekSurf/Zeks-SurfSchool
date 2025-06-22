import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface CartItem {
  beach: string;
  date: string;
  time: string; // Display time (1 hour for user)
  startTime?: string; // Original backend start time
  endTime?: string; // Original backend end time (1.5 hours)
  conditions: string;
  weather: string;
  price: number;
  isPrivateLesson: boolean;
  wetsuitSize?: string;
  slotId?: string;
  openSpaces?: number;
  available?: boolean;
  discountedPrice?: number;
  bookingForOthers?: {
    name: string;
    email: string;
    phone: string;
  };
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (index: number) => void;
  clearCart: () => void;
  itemCount: number;
  calculateTotalPrice: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('surfSchoolCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
        localStorage.removeItem('surfSchoolCart');
      }
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage whenever items change (but only after initial load)
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('surfSchoolCart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const applyDiscounts = (items: CartItem[]): CartItem[] => {
    return items.map((item, index) => {
      if (index === 0) return { ...item, discountedPrice: item.price }; // No discount for first item
      if (index === 1) return { ...item, discountedPrice: item.price * 0.85 }; // 15% off second item
      return { ...item, discountedPrice: item.price * 0.75 }; // 25% off third and subsequent items
    });
  };

  const addItem = useCallback((item: CartItem) => {
    setItems(prev => {
      const newItems = [...prev, item];
      return applyDiscounts(newItems);
    });
  }, []);

  const removeItem = useCallback((index: number) => {
    setItems(prev => {
      const newItems = prev.filter((_, i) => i !== index);
      return applyDiscounts(newItems);
    });
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem('surfSchoolCart');
  }, []);

  const calculateTotalPrice = useCallback(() => {
    return items.reduce((sum, item) => sum + (item.discountedPrice ?? item.price), 0);
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    clearCart,
    itemCount: items.length,
    calculateTotalPrice
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 