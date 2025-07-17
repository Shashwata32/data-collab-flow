import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
    }
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [login, { data, loading, error }] = useMutation(LOGIN_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { email, password } });
      localStorage.setItem('authToken', data.login.token);
      navigate('/');
      window.location.reload(); // To refresh the apollo client
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button type="submit" disabled={loading} className="w-full p-2 text-white bg-blue-500 rounded">
          {loading ? 'Logging in...' : 'Login'}
        </button>
        {error && <p className="mt-4 text-red-500">{error.message}</p>}
      </form>
    </div>
  );
};

export default Login;
