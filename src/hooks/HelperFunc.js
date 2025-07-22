import { useState } from "react";
import { useLoginMutation, useSignupMutation } from "../services/appApi";

function HelperFunc() {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [login, { IsError, IsLoading, Error }] = useLoginMutation();
  const [signup, { error, isLoading, isError }] = useSignupMutation();

  function handleSignup(e) {
    e.preventDefault();
    signup({ name, email, password });
  }

  function handleLogin(e) {
    e.preventDefault();
    login({ loginEmail, loginPassword });
  }

  return [
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
}

export default HelperFunc;
