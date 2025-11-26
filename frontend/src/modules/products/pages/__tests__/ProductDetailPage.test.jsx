import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ProductDetailPage } from '../ProductDetailPage.jsx';

// Mock contexts and services used by the page
jest.mock('@/modules/products/hooks/useCategories.js', () => ({
  useCategories: () => ({
    categories: [
      { id: '123', name: 'Mesas', slug: 'mesas' },
      // Simulate a non-primitive id to ensure safe comparison handling
      { id: { toString: () => '456' }, name: 'Sillas', slug: 'sillas' },
    ],
  }),
}));

jest.mock('@/services/products.api.js', () => ({
  productsApi: {
    getBySlug: jest.fn(async (slug) => ({
      id: 42,
      name: 'Producto de prueba',
      slug,
      price: 19990,
      stock: 5,
      fk_category_id: '456', // must match category to test breadcrumb
      gallery: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
      description: 'Descripción del producto',
    })),
  },
}));

jest.mock('@/context/CartContext.jsx', () => ({
  useCartContext: () => ({ addToCart: jest.fn(), updateQuantity: jest.fn() }),
}));

jest.mock('@/context/AuthContext.jsx', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}));

// Silence console errors from React Router for cleaner test output
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (typeof args[0] === 'string' && args[0].includes('Warning')) return;
    originalError(...args);
  };
});

afterAll(() => {
  console.error = originalError;
});

const renderWithRouter = (initialPath = '/producto/test-slug') => {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/producto/:id" element={<ProductDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ProductDetailPage', () => {
  it('renders product details and breadcrumb without coercion errors', async () => {
    renderWithRouter('/producto/test-slug');

    // Title and price should render
    await waitFor(() => {
      expect(screen.getByText('Producto de prueba')).toBeInTheDocument();
    });

    // Breadcrumb includes Productos and category name
    expect(screen.getByText('Productos')).toBeInTheDocument();
    expect(screen.getByText('Sillas')).toBeInTheDocument();

    // Images from gallery should render
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
  });
});
