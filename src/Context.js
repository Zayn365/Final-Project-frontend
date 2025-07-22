import React, { createContext } from "react";
import HelperFunc from "./hooks/HelperFunc";

const ContextValue = createContext();

const ContextMain = ({ children }) => {
  const [
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    login,
    signup,
    handleLogin,
    handleSignup,
    IsError,
    IsLoading,
    Error,
    error,
    isLoading,
    isError,
  ] = HelperFunc();

  const value = [
    loginEmail,
    setLoginEmail,
    loginPassword,
    setLoginPassword,
    email,
    setEmail,
    password,
    setPassword,
    name,
    setName,
    login,
    signup,
    handleLogin,
    handleSignup,
    IsError,
    IsLoading,
    Error,
    error,
    isLoading,
    isError,
  ];

  return (
    <ContextValue.Provider value={value}>{children}</ContextValue.Provider>
  );
};

export { ContextValue, ContextMain };
