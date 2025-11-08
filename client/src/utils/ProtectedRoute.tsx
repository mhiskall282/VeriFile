import React, { useEffect, useState } from "react";
import axios from "axios";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { ethers } from "ethers";

const ProtectedRoute: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [metaMaskInstalled, setMetaMaskInstalled] = useState<boolean>(false);
  const [userType, setUserType] = useState<string | null>(null);

  useEffect(() => {
    const checkMetaMask = () => {
      if (typeof window.ethereum !== "undefined") {
        setMetaMaskInstalled(true);
        authenticateUser();
      } else {
        setMetaMaskInstalled(false);
        setIsLoading(false);
        const interval = setInterval(() => {
          if (typeof window.ethereum !== "undefined") {
            clearInterval(interval);
            setMetaMaskInstalled(true);
            setIsLoading(true);
            authenticateUser();
          }
        }, 5000);
      }
    };

    const authenticateUser = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const address = await signer.getAddress();
        const message =
          "Welcome! Please sign this message to verify your identity.";

        const signature = await signer.signMessage(message);

        const response = await axios.post("http://localhost:8080/api/auth", {
          metaMaskAddress: address,
          MetamaskMsg: message,
          MetaMaskSign: signature,
        });

        if (response.status >= 200 && response.status < 300) {
          setIsAuthenticated(true);
          
          // Store user type and redirect based on whatExists value
          const { whatExists } = response.data;
          setUserType(whatExists);
          
          if (whatExists === "org") {
            navigate("/organization");
          } else if (whatExists === "employee") {
            navigate("/employee");
          } else {
            navigate("/register-choice"); // Redirect to register choice if no user type
          }
        } else {
          navigate("/");
        }
      } catch (error) {
        console.error("Authentication failed", error);
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    checkMetaMask();
  }, [navigate]);

  // Enforce route restrictions based on user type
  useEffect(() => {
    if (isAuthenticated && userType) {
      const currentPath = location.pathname;
      
      if (userType === "org" && currentPath !== "/organization") {
        navigate("/organization");
      } else if (userType === "employee" && currentPath !== "/employee") {
        navigate("/employee");
      } else if (userType === "None" && currentPath !== "/register-choice") {
        navigate("/register-choice");
      }
    }
  }, [location.pathname, isAuthenticated, userType, navigate]);

  if (isLoading) {
    return (
      <div
        style={{
          backgroundColor: "#242424",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
        }}
      >
        Loading...
      </div>
    );
  }

  if (!metaMaskInstalled) {
    return (
      <div
        style={{
          backgroundColor: "#242424",
          color: "#fff",
          textAlign: "center",
          padding: "20px",
        }}
      >
        MetaMask is not installed. Please install it to continue. Checking
        again in 5 seconds...
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : null;
};

export default ProtectedRoute;