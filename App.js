import React, { useState, useContext, createContext, useEffect } from 'react';
import {
  LogOut,
  Truck,
  Package,
  Warehouse,
  AlertCircle,
  Camera,
  ShoppingCart,
  Clock,
  Users
} from 'lucide-react';

// ------------------------
// Utility Functions
// ------------------------
const calculateEOQ = (demand, setupCost, holdingCost) => {
  return Math.sqrt((2 * demand * setupCost) / holdingCost).toFixed(2);
};

const calculateSafetyStock = (zScore, leadTimeDeviation) => {
  return (zScore * leadTimeDeviation).toFixed(2);
};

const performABCAnalysis = (products) => {
  const sortedProducts = [...products].sort((a, b) => b.revenue - a.revenue);
  const totalRevenue = sortedProducts.reduce((sum, p) => sum + p.revenue, 0);
  let cumulative = 0;
  return sortedProducts.map((product) => {
    cumulative += product.revenue;
    const percentile = cumulative / totalRevenue;
    let category = 'C';
    if (percentile <= 0.8) category = 'A';
    else if (percentile <= 0.95) category = 'B';
    return { ...product, category };
  });
};

// ------------------------
// Authentication Context
// ------------------------
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  // Data store for registered accounts
  // (In production, use a backend API)
  const [accounts, setAccounts] = useState([
    { email: 'test@test.com', password: '123456', name: 'Test User' }
  ]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const login = (email, password) => {
    const found = accounts.find(
      (acc) => acc.email === email && acc.password === password
    );
    if (found) {
      setIsLoggedIn(true);
      setUser(found);
      return true;
    }
    return false;
  };

  const register = (name, email, password) => {
    const alreadyExists = accounts.find((acc) => acc.email === email);
    if (alreadyExists) return false;
    const newAccount = { name, email, password };
    setAccounts([...accounts, newAccount]);
    return true;
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
};

// ------------------------
// Login / Registration Component
// ------------------------
const Login = () => {
  const { login, register } = useContext(AuthContext);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    const success = login(email, password);
    if (!success) {
      alert('Invalid credentials. Please try again or sign up.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password) {
      alert('Please fill in all fields to register.');
      return;
    }
    const success = register(name, email, password);
    if (success) {
      // Optionally log in automatically after registration
      login(email, password);
    } else {
      alert('Email already exists. Please log in with your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-300 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
        <div className="p-8">
          <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
            {isRegisterMode ? 'Sign Up' : 'Login'}
          </h2>
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            {isRegisterMode && (
              <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg text-white font-semibold transition-colors bg-blue-600 hover:bg-blue-700"
            >
              {isRegisterMode ? 'Register' : 'Login'}
            </button>
            <p className="text-center text-sm text-gray-600">
              {isRegisterMode
                ? 'Already have an account?'
                : "Don't have an account?"}{' '}
              <span 
                onClick={() => setIsRegisterMode(!isRegisterMode)} 
                className="text-blue-600 cursor-pointer hover:underline">
                {isRegisterMode ? 'Log In' : 'Sign Up'}
              </span>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

// ------------------------
// Warehouse Setup Component
// ------------------------
const WarehouseSetup = ({ onComplete }) => {
  const [warehouseData, setWarehouseData] = useState({
    datasetYears: '',
    totalStacks: '',
    partitionsPerStack: '',
    boxConfiguration: '',
    maintenanceCost: '',
    movementCost: '',
    deliveryCost: '',
    electricityCost: ''
  });

  const handleChange = (e) => {
    setWarehouseData({ ...warehouseData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you could add input validations
    onComplete(warehouseData);
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6">Warehouse Configuration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 mb-2">Warehouse Dataset (Years)</label>
          <input
            type="number"
            name="datasetYears"
            value={warehouseData.datasetYears}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="1"
            max="5"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Total Stacks</label>
          <input
            type="number"
            name="totalStacks"
            value={warehouseData.totalStacks}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Partitions per Stack</label>
          <input
            type="number"
            name="partitionsPerStack"
            value={warehouseData.partitionsPerStack}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="1"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Box Configuration (e.g., "2 feet cube")</label>
          <input
            type="text"
            name="boxConfiguration"
            value={warehouseData.boxConfiguration}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Maintenance Cost per Product</label>
          <input
            type="number"
            name="maintenanceCost"
            value={warehouseData.maintenanceCost}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Movement Cost per Product</label>
          <input
            type="number"
            name="movementCost"
            value={warehouseData.movementCost}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Delivery Cost</label>
          <input
            type="number"
            name="deliveryCost"
            value={warehouseData.deliveryCost}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-gray-700 mb-2">Electricity Cost</label>
          <input
            type="number"
            name="electricityCost"
            value={warehouseData.electricityCost}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Save Configuration
        </button>
      </form>
    </div>
  );
};

// ------------------------
// Inventory Management Component
// ------------------------
const InventoryManagement = () => {
  const [products, setProducts] = useState([
    { id: 1, name: 'Product A', revenue: 5000, demand: 100, reorderPoint: 50 },
    { id: 2, name: 'Product B', revenue: 3000, demand: 150, reorderPoint: 60 },
    { id: 3, name: 'Product C', revenue: 2000, demand: 200, reorderPoint: 70 }
  ]);
  const [abcAnalysis, setABCAnalysis] = useState([]);

  useEffect(() => {
    const analyzed = performABCAnalysis(products);
    setABCAnalysis(analyzed);
  }, [products]);

  const handleAddProduct = () => {
    const newProduct = {
      id: products.length + 1,
      name: `Product ${String.fromCharCode(65 + products.length)}`,
      revenue: Math.floor(Math.random() * 5000) + 1000,
      demand: Math.floor(Math.random() * 200) + 50,
      reorderPoint: Math.floor(Math.random() * 100) + 20
    };
    setProducts([...products, newProduct]);
  };

  const handleDeleteProduct = (id) => {
    setProducts(products.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Inventory Management</h2>
      <button
        onClick={handleAddProduct}
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
      >
        Add Product
      </button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['A', 'B', 'C'].map((category) => (
          <div key={category} className="p-4 border rounded-lg bg-white shadow-sm">
            <h3 className="text-xl font-semibold mb-2">Category {category}</h3>
            <ul>
              {abcAnalysis
                .filter((p) => p.category === category)
                .map((product) => (
                  <li key={product.id} className="flex justify-between items-center mb-2">
                    <span>{product.name}</span>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Delete
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

// ------------------------
// Order Management Component
// ------------------------
const OrderManagement = () => {
  const [orders, setOrders] = useState([
    { id: 1, client: 'Client A', product: 'Product A', status: 'Pending', date: '2024-04-01' },
    { id: 2, client: 'Client B', product: 'Product B', status: 'Pending', date: '2024-04-02' },
    { id: 3, client: 'Client C', product: 'Product C', status: 'Dispatched', date: '2024-03-28' }
  ]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const pendingReorders = orders.filter((order) => order.status === 'Pending');
    setNotifications(pendingReorders);
  }, [orders]);

  const handleDispatch = (id) => {
    setOrders(
      orders.map((order) =>
        order.id === id ? { ...order, status: 'Dispatched' } : order
      )
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Order Management</h2>
      <div className="flex flex-col md:flex-row md:space-x-8">
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow mb-4 md:mb-0">
          <h3 className="text-xl font-semibold mb-2">Pending Orders</h3>
          {orders.filter((order) => order.status === 'Pending').length === 0 ? (
            <p>No pending orders.</p>
          ) : (
            <ul>
              {orders
                .filter((order) => order.status === 'Pending')
                .map((order) => (
                  <li key={order.id} className="flex justify-between items-center mb-2">
                    <span>
                      {order.client} - {order.product}
                    </span>
                    <button
                      onClick={() => handleDispatch(order.id)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600"
                    >
                      Dispatch
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
        <div className="w-full md:w-1/2 bg-white p-4 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-2">Reorder Notifications</h3>
          {notifications.length === 0 ? (
            <p>No notifications.</p>
          ) : (
            <ul>
              {notifications.map((order) => (
                <li key={order.id} className="mb-2">
                  Order {order.id} for {order.product} is pending.
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

// ------------------------
// Dashboard Component
// ------------------------
const Dashboard = () => {
  // If warehouse configuration has not been set yet, prompt the user.
  const [warehouseConfig, setWarehouseConfig] = useState(null);
  const [activeSection, setActiveSection] = useState('overview');
  const { logout, user } = useContext(AuthContext);

  // Navigation items for the dashboard
  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: <Warehouse className="w-5 h-5" /> },
    { id: 'inventory', label: 'Inventory', icon: <Package className="w-5 h-5" /> },
    { id: 'orders', label: 'Order Management', icon: <Truck className="w-5 h-5" /> },
    { id: 'security', label: 'Security Alerts', icon: <AlertCircle className="w-5 h-5" /> }
  ];

  return (
    warehouseConfig === null ? (
      <WarehouseSetup onComplete={setWarehouseConfig} />
    ) : (
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar Navigation */}
        <div className="w-64 bg-white shadow-lg border-r flex flex-col">
          <div className="p-6 border-b text-center">
            <h2 className="text-xl font-bold text-gray-800">Warehouse Management</h2>
            <p className="mt-1 text-sm text-gray-600">
              {user && user.name}
            </p>
          </div>
          <nav className="p-4 flex-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" /> Logout
            </button>
          </div>
        </div>

        {/* Main Dashboard Content */}
        <div className="flex-1 overflow-auto p-8">
          {activeSection === 'overview' && (
            <>
              <header className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                  {
                    icon: <Warehouse className="w-8 h-8 text-blue-600" />,
                    title: 'Total Inventory',
                    value: '523 Items',
                    change: '+12%'
                  },
                  {
                    icon: <Truck className="w-8 h-8 text-green-600" />,
                    title: 'Monthly Shipments',
                    value: '142',
                    change: '+5%'
                  },
                  {
                    icon: <Users className="w-8 h-8 text-purple-600" />,
                    title: 'Total Accounts',
                    value: '1+',
                    change: ''
                  },
                  {
                    icon: <Package className="w-8 h-8 text-red-600" />,
                    title: 'Pending Orders',
                    value: '37',
                    change: '-3'
                  }
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white border rounded-lg p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex justify-between items-center">
                      {stat.icon}
                      <div className="text-right">
                        <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                        <h3 className="text-2xl font-bold text-gray-800">{stat.value}</h3>
                        {stat.change && (
                          <span className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {activeSection === 'inventory' && <InventoryManagement />}
          {activeSection === 'orders' && <OrderManagement />}
          {activeSection === 'security' && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Security Alerts</h2>
              <div className="bg-gray-200 p-6 rounded-lg flex flex-col items-center justify-center">
                <Camera className="w-16 h-16 text-gray-500 mb-4" />
                <p>Live camera feed and intrusion detection will be displayed here.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  );
};

// ------------------------
// Main App Component
// ------------------------
const AppContent = () => {
  const { isLoggedIn } = useContext(AuthContext);
  return isLoggedIn ? <Dashboard /> : <Login />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;