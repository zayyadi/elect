import React from 'react';

const LoginPage = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-green-600">Login Page</h1>
      <p>This is a placeholder Login Page.</p>
      {/* Add a simple form or button later */}
      <input type="text" placeholder="Username" className="border p-2 mr-2" />
      <input type="password" placeholder="Password" className="border p-2 mr-2" />
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Log In
      </button>
    </div>
  );
};

export default LoginPage;
