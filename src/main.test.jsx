import { render } from "@testing-library/react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { router } from "./router/AppRouter";
import { RouterProvider } from "react-router-dom";

function Root() {
  return (
    <AuthProvider>
      <CartProvider>
        <Toaster />
        <RouterProvider router={router} />
      </CartProvider>
    </AuthProvider>
  );
}

test("renders without crashing", () => {
  render(<Root />);
});
