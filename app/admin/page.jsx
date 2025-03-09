"use client"; // Necesario para usar hooks en el App Router

import { useState } from "react";
import { Container, Row, Button, Spinner, Alert } from "react-bootstrap";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);


    const handleLogin = async () => {
        setIsFetching(true);
        setError(null);
    
        const validUsername = "admin";
        const validPassword = "tbot123!";
    
        try {
            if (username === validUsername && password === validPassword) {
                document.cookie = `auth_token=logged_in; path=/; max-age=86400; secure`;
    
                window.location.href = "/";
            } else {
                throw new Error("Usuario o contraseña incorrectos");
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setIsFetching(false);
        }
    };
          

    return (
        <>
            <div className={`dashboard ${isSidebarOpen ? "sidebar-open" : ""}`}>
                {/* Main Content */}
                <div className="main-content">
                    {/* Page Content */}
                    <Container fluid className="py-4">
                        <Row>
                            <div className="col-12 col-md-5">
                                <h5 className="dashboard-title">Admin <span className="mensajes-title">&gt; Login</span></h5>
                            </div>
                        </Row>
                        <Row>
                            <div className="container-login col-11 col-md-4">
                                <div className="mb-3">
                                    <label htmlFor="username" className="label-in form-label">Username</label>
                                    <input 
                                        type="text" 
                                        className="in form-control" 
                                        placeholder="Enter username"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                    />
                                </div>
                                <div className="in2 mb-3">
                                    <label htmlFor="password" className="label-in form-label">Password</label>
                                    <input 
                                        type="password" 
                                        className="in form-control" 
                                        placeholder="Enter password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                                {error && <Alert variant="danger">{error}</Alert>}
                                <div className="d-flex justify-content-center col-12 col-md-12">
                                    <Button className="btn-save btn-style-1" onClick={handleLogin} disabled={isFetching}>
                                        {isFetching ? <Spinner size="sm" animation="border" /> : "Login"}
                                    </Button>
                                </div>
                            </div>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
}
