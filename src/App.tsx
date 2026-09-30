import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { SearchBox } from './components/SearchBox';
import { HeroBanner } from './components/HeroBanner';
import { CategoryChips } from './components/CategoryChips';
import { BestSellingSection } from './components/BestSellingSection';
import { BottomNav } from './components/BottomNav';
import { CartDrawer } from './components/CartDrawer';
import { SideMenuDrawer } from './components/SideMenuDrawer';
import { ProfileView } from './components/ProfileView';
import { CategoriesView } from './components/CategoriesView';
import { SearchView } from './components/SearchView';
import { OrdersView } from './components/OrdersView';
import { CheckoutModal } from './components/CheckoutModal';
import { ProductDetailsModal } from './components/ProductDetailsModal';
import { Toast } from './components/Toast';
import { SplashScreen } from './components/SplashScreen';
import { LoginModal } from './components/LoginModal';
import { PullToRefresh } from './components/PullToRefresh';
import { CATEGORIES } from './data/categories';
import { BEST_SELLING_PRODUCTS, ALL_PRODUCTS } from './data/products';
import { TabType, ProductItem, CartItem, SavedAddress, Order, UserProfile } from './types';
import {
  cleanLegacyDemoOrders,
  getUserOrdersSync,
  createRealOrder,
  updateRealOrderStatus,
} from './services/orderService';
import { cleanLegacyDemoReviews } from './services/reviewService';

const INITIAL_ADDRESSES: SavedAddress[] = [];

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const raw = localStorage.getItem('quke_user_session');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.id) return parsed;
      }
    } catch {
      // ignore
    }
    return null;
  });

  // Splash / Loading Screen State
  const [isAppLoading, setIsAppLoading] = useState<boolean>(true);

  // Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('Home');
  const mainContainerRef = useRef<HTMLElement>(null);
  const scrollPositionsRef = useRef<Record<string, number>>({
    Home: 0,
    Categories: 0,
    Search: 0,
    Orders: 0,
    Profile: 0,
  });

  // Search State for Home
  const [searchQuery, setSearchQuery] = useState('');

  // Category Selection Filter State for Home
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Loading skeleton state
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);

  // Persistent Saved Addresses State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>(() => {
    try {
      const stored = localStorage.getItem('quke_saved_addresses');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_ADDRESSES;
  });

  // Real Persistent Orders State scoped to current user
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const raw = localStorage.getItem('quke_user_session');
      const user = raw ? JSON.parse(raw) : null;
      if (user?.id) {
        return getUserOrdersSync(user.id);
      }
      return [];
    } catch {
      return [];
    }
  });

  // Clean legacy demo orders & reviews on mount & re-sync orders when user changes
  useEffect(() => {
    cleanLegacyDemoOrders();
    cleanLegacyDemoReviews();
    if (currentUser?.id) {
      setOrders(getUserOrdersSync(currentUser.id));
    } else {
      setOrders([]);
    }
  }, [currentUser?.id]);

  // Persistent COD Selection State
  const [isCodSelected, setIsCodSelected] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('quke_cod_selected');
      return stored !== null ? JSON.parse(stored) : true;
    } catch {
      return true;
    }
  });

  // Real cart items - starts completely empty unless real customer items are saved
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('quke_cart_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // If legacy demo item was pre-stored, discard it
          const isLegacyPreload =
            parsed.length === 1 &&
            parsed[0]?.product?.id === 'c1' &&
            parsed[0]?.quantity === 2;
          if (!isLegacyPreload) {
            const valid = parsed.filter(
              (item) => item && item.product && item.product.id && item.product.price && item.quantity > 0
            );
            return valid;
          }
        }
      }
    } catch {
      // Fallback
    }
    return [];
  });

  // Sync Cart Items to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('quke_cart_items', JSON.stringify(cartItems));
    } catch (e) {
      console.error(e);
    }
  }, [cartItems]);

  // Sync Saved Addresses to localStorage
  const handleUpdateAddresses = (newAddresses: SavedAddress[]) => {
    setSavedAddresses(newAddresses);
    try {
      localStorage.setItem('quke_saved_addresses', JSON.stringify(newAddresses));
    } catch (e) {
      console.error(e);
    }
  };

  // Drawer / Modal States
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginReason, setLoginReason] = useState('');
  const [pendingCheckoutAfterLogin, setPendingCheckoutAfterLogin] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Deep-linking: Auto-open shared product from URL query parameter
  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      const prodId = searchParams.get('product');
      if (prodId) {
        const found = ALL_PRODUCTS.find((p) => p.id === prodId) || BEST_SELLING_PRODUCTS.find((p) => p.id === prodId);
        if (found) {
          setSelectedProduct(found);
        }
      }
    } catch {
      // Ignore URL parsing errors
    }
  }, []);

  // Auth Handlers
  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('quke_user_session', JSON.stringify(user));
      localStorage.setItem('quke_user_profile', JSON.stringify(user));
    } catch (e) {
      console.error(e);
    }
    setIsLoginModalOpen(false);

    if (pendingCheckoutAfterLogin) {
      setPendingCheckoutAfterLogin(false);
      setIsCheckoutOpen(true);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('quke_user_session');
      localStorage.removeItem('quke_user_profile');
    } catch (e) {
      console.error(e);
    }
    setCurrentUser(null);
    setOrders([]);
    showToast('Logged out successfully');
  };

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(message);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  // Cart count calculation
  const totalCartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Filter products based on search and category on Home
  const filteredProducts = useMemo(() => {
    let list = [...BEST_SELLING_PRODUCTS];

    if (selectedCategory) {
      list = list.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return list;
  }, [selectedCategory, searchQuery]);

  // Category name for active filter header
  const activeCategoryName = useMemo(() => {
    if (!selectedCategory) return null;
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.name : null;
  }, [selectedCategory]);

  // Handlers
  const handleAddToCart = (product: ProductItem) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });

    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1200);
    showToast(`Added "${product.name}" to Basket!`);
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
    showToast('Item removed from basket');
  };

  const handleCategoryClick = (categoryId: string) => {
    if (categoryId === 'more') {
      setIsMenuOpen(true);
      return;
    }

    setIsLoadingContent(true);
    setTimeout(() => {
      setIsLoadingContent(false);
    }, 250);

    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      showToast('Showing all accessories');
    } else {
      setSelectedCategory(categoryId);
      const cat = CATEGORIES.find((c) => c.id === categoryId);
      showToast(`Showing ${cat?.name || 'Category'}`);
    }

    const el = document.getElementById('best-selling-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  const handleShopNow = (categoryId?: string) => {
    setSearchQuery('');
    if (categoryId) {
      setSelectedCategory(categoryId);
      const cat = CATEGORIES.find((c) => c.id === categoryId);
      showToast(`Browsing ${cat?.name || 'Category'}!`);
    } else {
      setSelectedCategory(null);
      showToast('Browsing Best Selling tech accessories!');
    }
    const el = document.getElementById('best-selling-grid');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleViewAll = () => {
    setSelectedCategory(null);
    setSearchQuery('');
    showToast('Viewing all Best Selling products');
  };

  const handleTabChange = (tab: TabType) => {
    if (mainContainerRef.current) {
      scrollPositionsRef.current[activeTab] = mainContainerRef.current.scrollTop;
    }
    setActiveTab(tab);
    if (tab === 'Search') {
      const input = document.getElementById('input-search-accessories');
      input?.focus();
    }
    setTimeout(() => {
      if (mainContainerRef.current) {
        mainContainerRef.current.scrollTop = scrollPositionsRef.current[tab];
      }
    }, 0);
  };

  const handleOrderPlaced = async (newOrder: Order) => {
    if (currentUser?.id) {
      try {
        await createRealOrder(newOrder, currentUser.id);
        setOrders(getUserOrdersSync(currentUser.id));
      } catch (err) {
        console.error('Error persisting order:', err);
        setOrders((prev) => [newOrder, ...prev]);
      }
    } else {
      setOrders((prev) => [newOrder, ...prev]);
    }
    setCartItems([]);
  };

  const handleUpdateOrder = async (updated: Order) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === updated.id ? updated : o))
    );
    if (currentUser?.id) {
      try {
        await updateRealOrderStatus(
          updated.id,
          updated.status,
          currentUser.id,
          updated
        );
      } catch (err) {
        console.error('Error updating order:', err);
      }
    }
  };

  const handleReorder = (items: Order['items']) => {
    items.forEach((item) => {
      const matched = BEST_SELLING_PRODUCTS.find((p) => p.id === item.id) || {
        id: item.id,
        name: item.name,
        price: item.price,
        originalPrice: item.price,
        discount: '',
        category: 'accessories',
        image: item.image,
        stock: 50,
        description: item.name,
      };
      for (let i = 0; i < item.quantity; i++) {
        handleAddToCart(matched);
      }
    });
  };

  const handleHomeRefresh = async () => {
    setIsLoadingContent(true);
    // Tactile async delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 1. Re-sync real user orders
    if (currentUser?.id) {
      setOrders(getUserOrdersSync(currentUser.id));
    } else {
      try {
        const storedOrders = localStorage.getItem('quke_customer_orders');
        if (storedOrders) {
          setOrders(JSON.parse(storedOrders));
        }
      } catch {}
    }

    // 2. Re-sync saved addresses
    try {
      const saved = localStorage.getItem('quke_saved_addresses');
      if (saved) {
        setSavedAddresses(JSON.parse(saved));
      }
    } catch {}

    // 3. Re-sync user profile
    try {
      const session = localStorage.getItem('quke_user_session');
      if (session) {
        setCurrentUser(JSON.parse(session));
      }
    } catch {}

    // 4. Re-sync COD preference
    try {
      const cod = localStorage.getItem('quke_cod_selected');
      if (cod !== null) {
        setIsCodSelected(JSON.parse(cod));
      }
    } catch {}

    setIsLoadingContent(false);
    showToast('Updated: Latest products & offers synced!');
  };

  // Browser back navigation support
  useEffect(() => {
    const handlePopState = () => {
      if (selectedProduct) {
        setSelectedProduct(null);
      } else if (isCheckoutOpen) {
        setIsCheckoutOpen(false);
      } else if (isCartOpen) {
        setIsCartOpen(false);
      } else if (isMenuOpen) {
        setIsMenuOpen(false);
      } else if (activeTab !== 'Home') {
        setActiveTab('Home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [selectedProduct, isCheckoutOpen, isCartOpen, isMenuOpen, activeTab]);

  return (
    <div className="min-h-screen bg-[#e5e7eb] flex items-center justify-center p-0 sm:p-4 md:p-6 select-none font-sans">
      {/* 390px Max Width Mobile Frame */}
      <div
        id="qukebasket-mobile-container"
        className="w-full max-w-[390px] min-h-screen sm:h-[844px] bg-[#fcfcfc] shadow-2xl sm:rounded-[30px] overflow-hidden flex flex-col relative border-0 sm:border-[8px] sm:border-[#1e293b]"
      >
        {/* Startup Splash / Loading Screen */}
        <AnimatePresence>
          {isAppLoading && (
            <SplashScreen onFinish={() => setIsAppLoading(false)} />
          )}
        </AnimatePresence>

        {/* Top Header */}
        <Header
          cartCount={totalCartCount}
          showBack={activeTab !== 'Home'}
          showCart={activeTab === 'Home'}
          onBack={() => handleTabChange('Home')}
          onLogoClick={() => handleTabChange('Home')}
          title={
            activeTab === 'Orders'
              ? 'Your Orders'
              : activeTab === 'Profile'
              ? 'My Account'
              : activeTab === 'Categories'
              ? 'Categories'
              : activeTab === 'Search'
              ? 'Search'
              : undefined
          }
          onOpenMenu={() => setIsMenuOpen(true)}
          onOpenCart={() => setIsCartOpen(true)}
          isLoggedIn={!!currentUser}
          showLoginOption={activeTab === 'Home'}
          userName={currentUser?.name}
          onLoginClick={() => {
            setLoginReason('');
            setPendingCheckoutAfterLogin(false);
            setIsLoginModalOpen(true);
          }}
          onAccountClick={() => handleTabChange('Profile')}
        />

        {/* Main Content Area */}
        <main ref={mainContainerRef} className="flex-1 overflow-y-auto no-scrollbar pb-6">
          {activeTab === 'Orders' ? (
            /* Dedicated Orders View */
            <OrdersView
              orders={orders}
              onBackToShopping={() => handleTabChange('Home')}
              showToast={showToast}
              onUpdateOrder={handleUpdateOrder}
              onReorder={handleReorder}
              isLoggedIn={!!currentUser}
              onSelectProduct={(prod) => setSelectedProduct(prod)}
            />
          ) : activeTab === 'Categories' ? (
            /* Dedicated Categories View */
            <CategoriesView
              onBackToHome={() => handleTabChange('Home')}
              onAddToCart={handleAddToCart}
              onSelectProduct={setSelectedProduct}
              recentlyAddedId={recentlyAddedId}
              showToast={showToast}
              isLoading={isLoadingContent}
            />
          ) : activeTab === 'Search' ? (
            /* Dedicated Search View */
            <SearchView
              onBackToHome={() => handleTabChange('Home')}
              onAddToCart={handleAddToCart}
              onSelectProduct={setSelectedProduct}
              recentlyAddedId={recentlyAddedId}
              showToast={showToast}
            />
          ) : activeTab === 'Profile' ? (
            /* Profile / My Account View with exact 5 functional options */
            <ProfileView
              onBackToShopping={() => handleTabChange('Home')}
              showToast={showToast}
              onNavigateToTab={handleTabChange}
              addresses={savedAddresses}
              onUpdateAddresses={handleUpdateAddresses}
              isCodSelected={isCodSelected}
              onToggleCod={(selected) => {
                setIsCodSelected(selected);
                try {
                  localStorage.setItem('quke_cod_selected', JSON.stringify(selected));
                } catch (e) {
                  console.error(e);
                }
              }}
              isLoggedIn={!!currentUser}
              currentUser={currentUser}
              onOpenLogin={() => {
                setLoginReason('');
                setPendingCheckoutAfterLogin(false);
                setIsLoginModalOpen(true);
              }}
              onLogout={handleLogout}
              onUpdateProfile={(updated) => {
                setCurrentUser(updated);
                try {
                  localStorage.setItem('quke_user_session', JSON.stringify(updated));
                } catch (e) {
                  console.error(e);
                }
              }}
            />
          ) : (
            /* Home / Catalog View with Pull-to-Refresh Gesture */
            <PullToRefresh
              onRefresh={handleHomeRefresh}
              scrollContainerRef={mainContainerRef}
            >
              {/* Search Bar */}
              <SearchBox
                value={searchQuery}
                onChange={setSearchQuery}
                onClear={() => setSearchQuery('')}
                onSubmit={() => {
                  const el = document.getElementById('best-selling-grid');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }}
              />

              {/* ONE Hero Carousel (10 Slides, Left/Right Swipe, Auto-slide) */}
              <HeroBanner onShopNow={handleShopNow} />

              {/* 10 Categories */}
              <CategoryChips
                selectedCategoryId={selectedCategory}
                onSelectCategory={handleCategoryClick}
                isLoading={isLoadingContent}
              />

              {/* Best Selling Section */}
              <BestSellingSection
                products={filteredProducts}
                onAddToCart={handleAddToCart}
                onSelectProduct={setSelectedProduct}
                onViewAll={handleViewAll}
                addedProductId={recentlyAddedId}
                isLoading={isLoadingContent}
                activeFilterName={
                  searchQuery
                    ? `Search: "${searchQuery}"`
                    : activeCategoryName
                    ? `${activeCategoryName}`
                    : null
                }
                onResetFilter={
                  selectedCategory || searchQuery
                    ? () => {
                        setSelectedCategory(null);
                        setSearchQuery('');
                      }
                    : undefined
                }
              />
            </PullToRefresh>
          )}
        </main>

        {/* Fixed Bottom Navigation */}
        <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Product Details Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <ProductDetailsModal
              isOpen={true}
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={handleAddToCart}
              savedAddresses={savedAddresses}
              selectedAddress={savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null}
              onSelectAddress={(addr) => {
                const updated = savedAddresses.map((a) => ({
                  ...a,
                  isDefault: a.id === addr.id,
                }));
                handleUpdateAddresses(updated);
              }}
            />
          )}
        </AnimatePresence>

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          selectedAddress={savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onCheckout={() => {
            setIsCartOpen(false);
            setIsCheckoutOpen(true);
          }}
        />

        {/* Checkout Modal */}
        <CheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cartItems={cartItems}
          savedAddresses={savedAddresses}
          onUpdateAddresses={handleUpdateAddresses}
          isCodSelected={isCodSelected}
          onOrderPlaced={handleOrderPlaced}
          showToast={showToast}
          userId={currentUser?.id}
          isLoggedIn={!!currentUser}
          onRequireLogin={() => {
            setLoginReason('Login to complete your order');
            setPendingCheckoutAfterLogin(true);
            setIsLoginModalOpen(true);
          }}
        />

        {/* Side Menu Drawer (Hamburger Menu) */}
        <SideMenuDrawer
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          onSelectCategory={(catId) => {
            setSelectedCategory(catId);
            setActiveTab('Home');
            showToast('Category filtered');
          }}
          isLoggedIn={!!currentUser}
          userName={currentUser?.name}
          userContact={currentUser?.phone ? `+91 ${currentUser.phone}` : currentUser?.email}
          onLogout={handleLogout}
        />

        {/* Real Authentication Modal */}
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => {
            setIsLoginModalOpen(false);
            setPendingCheckoutAfterLogin(false);
          }}
          onSuccess={handleLoginSuccess}
          reason={loginReason}
          showToast={showToast}
        />

        {/* Interactive Toast Notifications */}
        <Toast
          message={toastMessage}
          onClose={() => setToastMessage(null)}
        />
      </div>
    </div>
  );
}
