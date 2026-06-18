import axios from "axios";

export const detectLocation = async (req, res) => {
  try {
    const geo = await axios.get("http://ip-api.com/json/", { timeout: 5000 });

    const country = geo.data.country;
    const code = geo.data.countryCode;

    res.status(200).json({ country, code });
  } catch (error) {
    console.error(error?.response?.data || error.message);
    res.status(500).json({ message: "Location detection failed" });
  }
};
