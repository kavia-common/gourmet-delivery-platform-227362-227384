import React, { useCallback } from "react";
import { BrowserRouter, Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";

import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";

import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { RestaurantListPage } from "./pages/RestaurantListPage";
import { RestaurantMenuPage } from "./pages/RestaurantMenuPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrdersPage } from "./pages/OrdersPage";
import { OrderDetailsPage } from "./pages/OrderDetailsPage";
import { OwnerDashboardPage } from "./pages/OwnerDashboardPage";
import { DeliveryDashboardPage } from "./pages/DeliveryDashboardPage";
import { NotFoundPage } from "./pages/NotFoundPage";

function AppRoutes() {
  const navigate = useNavigate();

  const onAuthError = useCallback(
    () => {
      // Redirect to login on auth errors; keep UX consistent.
      navigate("/login", { replace: true });
    },
    [navigate]
  );

  return (
    <AuthProvider onAuthError={onAuthError}>
      <CartProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            <Route path="/restaurants" element={<RestaurantListPage />} />
            <Route path="/restaurants/:restaurantId" element={<RestaurantMenuPage />} />

            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/orders" element={<OrdersPage />} />
              <Route path="/orders/:orderId" element={<OrderDetailsPage />} />
            </Route>

            <Route element={<ProtectedRoute requireRole="restaurant" />}>
              <Route path="/owner" element={<OwnerDashboardPage />} />
            </Route>

            <Route element={<ProtectedRoute requireRole="delivery" />}>
              <Route path="/delivery" element={<DeliveryDashboardPage />} />
            </Route>

            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </CartProvider>
    </AuthProvider>
  );
}

// PUBLIC_INTERFACE
function App() {
  /** This is a public function. */
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
