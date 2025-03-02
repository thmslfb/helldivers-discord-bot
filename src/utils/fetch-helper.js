require('dotenv').config();

const fetchFromApi = async (endpoint) => {
  try {
    const response = await fetch(
      `${process.env.HELLDIVERS_API_URL}/${endpoint}`,
      {
        method: 'GET',
        headers: {
          'X-Super-Client': process.env.SUPER_CLIENT,
          'X-Super-Contact': process.env.SUPER_CONTACT,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API returned ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`❌ Error fetching ${endpoint}: ${error.message}`);
    throw error;
  }
};

module.exports = { fetchFromApi };
