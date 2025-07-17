import { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import { useNavigate } from 'react-router-dom';

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
    }
  }
`;

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [register, { loading, error }] = useMutation(REGISTER_MUTATION);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await register({ variables: { username, email, password } });
      localStorage.setItem('authToken', data.register.token);
      navigate('/');
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <form onSubmit={handleSubmit} className="p-8 bg-white rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Register</h2>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
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
          {loading ? 'Registering...' : 'Register'}
        </button>
        {error && <p className="mt-4 text-red-500">{error.message}</p>}
      </form>
    </div>
  );
};

export default Register;
