import { useEffect, useState } from "react";
import api from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function LicenseGuard({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkLicense = async () => {
      try {
        const res = await api.get("/license/status");

        if (!res.data.valid) {
          navigate("/activate-license");
        }
      } catch (err) {
        navigate("/activate-license");
      } finally {
        setLoading(false);
      }
    };

    checkLicense();
  }, [navigate]);

  if (loading) return <div>Loading...</div>;

  return children;
}