// src/app/login/page.tsx

// Default export: LoginPage component
export default function LoginPage() {
  return (
    // Full-page container: centers content both vertically and horizontally
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      {/* Card container with padding, rounded corners, and shadow */}
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        
        {/* Page title */}
        <h2 className="text-2xl font-bold mb-6 text-center">Login HR App</h2>
        
        {/* Login form */}
        <form>
          {/* Email input field */}
          <div className="mb-4">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="nama@perusahaan.com"
            />
          </div>

          {/* Password input field */}
          <div className="mb-6">
            <label className="block mb-2 text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="********"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            className="w-full py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
}
