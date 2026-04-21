### Rental Management Frontend

A modern, responsive web application for managing rental properties, tenants, agreements, and payments. Built with React 19 and Vite, this frontend provides a comprehensive dashboard and management tools for property owners and managers.

---

### 🚀 Features

*   **Dashboard:** Real-time overview of occupancy rates, revenue summaries, and key performance indicators.
*   **Property Management:** Manage rental units, their status, and details.
*   **Tenant Management:** Track tenant information, history, and contact details.
*   **Lease Agreements:** Digital management of rental agreements between tenants and units.
*   **Payment Tracking:** Monitor rent payments, track balances, and identify overdue accounts.
*   **Reporting:** Generate occupancy and financial reports.
*   **Authentication:** Secure login and registration with JWT-based session management (Access/Refresh tokens).
*   **Responsive Design:** Fully optimized for both desktop and mobile users with a persistent sidebar and mobile bottom navigation.

---

### 🛠️ Tech Stack

*   **Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite 8](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
*   **State Management:** [Zustand](https://github.com/pmndrs/zustand)
*   **Data Fetching:** [TanStack Query v5](https://tanstack.com/query/latest)
*   **Routing:** [React Router 7](https://reactrouter.com/)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **HTTP Client:** [Axios](https://axios-http.com/)
*   **Form Handling:** [React Hook Form](https://react-hook-form.com/)

---

### 📦 Getting Started

#### Prerequisites
*   Node.js (Latest LTS recommended)
*   npm or yarn

#### Installation
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd rental-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the API base URL:
   ```env
   VITE_API_BASE_URL=https://rental-api.askmoozo.com/api/v1
   ```

#### Development
Start the development server:
```bash
npm run dev
```

#### Production
Build the project for production:
```bash
npm run build
```
The output will be in the `dist/` folder.

---

### 📂 Project Structure

*   `src/components/`: Reusable UI components and layout elements (Sidebar, BottomNav, PageWrapper).
*   `src/pages/`: Main application views (Dashboard, Tenants, Units, etc.).
*   `src/hooks/`: Custom React hooks for data fetching and logic.
*   `src/services/`: API service layer for communicating with the backend.
*   `src/store/`: Zustand store definitions for global state (e.g., authStore).
*   `src/lib/`: Utility functions and configurations.
*   `public/`: Static assets.

---