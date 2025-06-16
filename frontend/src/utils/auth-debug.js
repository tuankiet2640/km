// Debug utility to track authentication state
export const debugAuth = () => {
  console.log('----- AUTH DEBUG INFO -----');
  console.log('Access Token:', localStorage.getItem('accessToken') ? 'Present (starts with: ' + localStorage.getItem('accessToken').substring(0, 15) + '...)' : 'Missing');
  console.log('Refresh Token:', localStorage.getItem('refreshToken') ? 'Present' : 'Missing');
  console.log('User Data:', localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : 'Missing');
  console.log('--------------------------');
  return {
    accessToken: localStorage.getItem('accessToken'),
    refreshToken: localStorage.getItem('refreshToken'),
    user: localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null
  };
};
