import { useState } from 'react';
import { useAppContext } from '../../context/AppContext.jsx';
import { API_BASE_URL } from '../../config.js';

const Login = ({ onSwitchToSignup }) => {
    const { login } = useAppContext();
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLoginChange = (e) => {
        setLoginData({ ...loginData, [e.target.name]: e.target.value });
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validation
            if (!loginData.email || !loginData.password) {
                throw new Error('Please enter both email and password');
            }

            // Send to backend
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (result.success) {
                // Login user with 1 week expiry
                login(result.user);
                console.log('✅ User logged in successfully:', result.user);
            } else {
                throw new Error(result.error || 'Failed to login');
            }
        } catch (err) {
            console.error('❌ Login error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <svg className="h-5 w-5 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-600">{error}</span>
                    </div>
                </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                    </label>
                    <input
                        type="email"
                        name="email"
                        value={loginData.email}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="your@email.com"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                    </label>
                    <input
                        type="password"
                        name="password"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Enter your password"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                        loading
                            ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                >
                    {loading ? (
                        <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                            Signing In...
                        </div>
                    ) : (
                        'Sign In'
                    )}
                </button>
            </form>

            <div className="text-center">
                <p className="text-gray-600">
                    Don't have an account?{' '}
                    <button
                        type="button"
                        onClick={onSwitchToSignup}
                        className="text-green-600 hover:text-green-700 font-medium"
                    >
                        Sign up here
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;