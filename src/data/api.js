// Central API base URL
// In development (npm run dev) → uses local backend on port 5000
// In production (deployed) → uses Vercel backend
const API_BASE = import.meta.env.DEV
  ? 'http://localhost:5000'
  : 'https://portfolio-backend-31zk.vercel.app';

export default API_BASE;
