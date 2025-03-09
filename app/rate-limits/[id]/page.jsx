"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Navbar, Nav, Spinner, Alert, Button } from "react-bootstrap";
import { usePathname } from "next/navigation";
import { House, ChatText, Prohibit, Monitor, Key, TwitterLogo, SignOut  } from "phosphor-react";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [rateLimit, setRateLimit] = useState("");  
    const [message, setMessage] = useState(null); 
    const [isSaving, setIsSaving] = useState(false);
    const twitterId = window.location.pathname.split("/").pop();

    useEffect(() => {
      const fetchRateLimit = async () => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/get_rate_limit?twitter_id=${twitterId}`);
            const data = await response.json();
              
              if (response.ok) {
                  setRateLimit(data.rate_limit);
              } else {
                  setMessage({ type: "danger", text: "Error obteniendo el rate limit." });
              }
          } catch (error) {
              console.error("Error obteniendo el rate limit:", error);
              setMessage({ type: "danger", text: "Error de conexión con el servidor." });
          }
      };

      fetchRateLimit();
      setTimeout(() => setLoading(false), 1500);
  }, []);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleRateLimitChange = (e) => {
        setRateLimit(e.target.value);
    };
    
    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/admin"; // Redirigir al login
    };
    
    const handleSaveRateLimit = async () => {
        if (!rateLimit || rateLimit <= 0) {
            setMessage({ type: "danger", text: "El límite debe ser un número mayor a 0." });
            return;
        }

        setIsSaving(true);
        setMessage(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/update_rate_limit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    twitter_id: twitterId, 
                    rate_limit: parseInt(rateLimit)
                })
            });

            const data = await response.json();
            
            if (response.ok) {
                setMessage({ type: "success", text: "Rate limit updated." });
            } else {
                setMessage({ type: "danger", text: data.error || "Error." });
            }
        } catch (error) {
            setMessage({ type: "danger", text: "Error connecting to the server." });
        }

        setIsSaving(false);
    };

    if (loading) {
        return (
            <div className="loader-container">
                <Spinner animation="border" role="status" className="loader">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <>
            <div className={`dashboard ${isSidebarOpen ? "sidebar-open" : ""}`}>
                {/* Sidebar */}
                <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
                    <Nav defaultActiveKey="/" className="flex-column">
                        <hr className="hr-line"/>
                        <Nav.Link href="/" className={`textl hometext ${pathname === "/" ? "active-link" : ""}`}>
                            <House size={20} weight="bold" className="me-2" /> Home
                        </Nav.Link>
                        <Nav.Link href="/api-status" className={`textl ${pathname === "/api-status" ? "active-link" : ""}`}>
                            <Monitor size={20} weight="bold" className="me-2" /> API Status
                        </Nav.Link>
                        <Nav.Link href="/api-keys" className={`textl ${pathname === "/api-keys" ? "active-link" : ""}`}>
                            <Key size={20} weight="bold" className="me-2" /> API Keys
                        </Nav.Link>
                        <Nav.Link href="/logs" className={`textl ${pathname === "/logs" ? "active-link" : ""}`}>
                            <ChatText size={20} weight="bold" className="me-2" /> Logs
                        </Nav.Link>
                        <Nav.Link href="/rate-limits" className={`textl ${pathname === "/rate-limits" ? "active-link" : ""}`}>
                            <Prohibit size={20} weight="bold" className="me-2" /> Rate Limits
                        </Nav.Link>
                        <Nav.Link
                            href="/tweets"
                            className={`textl ${pathname === "/tweets" ? "active-link" : ""}`}
                        >
                            <TwitterLogo  size={20} weight="bold" className="me-2" /> Tweets
                        </Nav.Link>
                        <Nav.Link
                            href="#"
                            onClick={handleLogout}
                            className="textl logout-link"
                        >
                            <SignOut size={20} weight="bold" className="me-2" /> Logout
                        </Nav.Link>
                    </Nav>
                </div>

                {/* Main Content */}
                <div className="main-content">
                    {/* Topbar */}
                    <Navbar className="navbar px-3">
                        <button className="btn btn-outline-primary d-lg-none" onClick={toggleSidebar}>
                            <i className="bi bi-list"></i>
                        </button>
                    </Navbar>

                    {/* Page Content */}
                    <Container fluid className="py-4">
                        <Row>
                            <div className="col-12 col-md-5">
                                <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; Rate Limits</span></h5>
                            </div>
                        </Row>
                        <Row>
                            <div className="div-api col-12 col-md-12">
                                <h1 className="text-center title-api2">Rate Limits</h1>
                                
                                <div className="d-flex justify-content-center">
                                    <input 
                                        type="number" 
                                        className="input-rate"
                                        value={rateLimit}
                                        onChange={handleRateLimitChange}
                                        min="1"
                                    />
                                    <p className="p-api">Posts Per Hour</p>
                                </div>
                                
                                <div className="d-flex justify-content-center">
                                    <Button 
                                        className="btn-save btn-read btn" 
                                        onClick={handleSaveRateLimit}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? "Saving..." : "Save"}
                                    </Button>
                                </div>

                                {message && <Alert variant={message.type} className="messsage-alert text-center">{message.text}</Alert>}

                            </div>
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
}
