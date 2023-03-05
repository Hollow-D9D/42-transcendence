import { useState, useEffect } from 'react';

function SignIn() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    const clientId = 'YOUR_CLIENT_ID';
    const redirectUri = 'http://localhost:3000/callback'; // replace with your app's redirect URI
    const scope = 'public'; // replace with the scopes you need access to

    window.location.href = `https://api.intra.42.fr/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
  };

  const handleCallback = async () => {
    const code = new URLSearchParams(window.location.search).get('code');
    const clientId = 'YOUR_CLIENT_ID';
    const clientSecret = 'YOUR_CLIENT_SECRET';
    const redirectUri = 'http://localhost:3000/callback'; // replace with your app's redirect URI

    const response = await fetch('https://api.intra.42.fr/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const data = await response.json();

    // Save the access token and refresh token to local storage
    localStorage.setItem('accessToken', data.access_token);
    localStorage.setItem('refreshToken', data.refresh_token);

    setIsAuthenticated(true);
  };

  useEffect(() => {
    handleCallback();
  }, []);

  return (
    <div
      style={{
        backgroundImage: 'url("/background.jpg")',
        backgroundSize: 'cover',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '0 20px',
      }}
    >
      <h1 style={{ color: '#E90931', marginTop: 0, fontSize:48 }}>Welcome</h1>

      <div
        style={{
          backgroundColor: '#E90931',
          borderRadius: '4px',
          padding: '16px',
          display: 'flex',
          alignItems: 'center',
		  marginLeft: 'auto',
		  marginRight: '0',
		  marginBottom: '13%',
        }}
      >


        <button
          onClick={handleLogin}
          style={{
            backgroundColor: '#E90931',
            color: '#fff',
			fontSize: 32,
            borderRadius: '8px',
            border: 'solid',
			borderColor: '#fff',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Sign in with 42
        </button>
      </div>
    </div>
  );
}

export default SignIn;
