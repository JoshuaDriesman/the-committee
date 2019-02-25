const authConfig = {
  tokenExpirationTime: 86400,
  secretToken: process.env.JWT_SECRET || 'j9z40MmTygbbNZ40rTHG' // PRODUCTION ENV TOKEN SHOULD COME FROM ENV
}

export default authConfig;
