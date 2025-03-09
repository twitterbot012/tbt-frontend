"use client"; 

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container, Row, Nav, Navbar, Spinner, Alert, Button } from "react-bootstrap";
import { usePathname } from "next/navigation";
import { House, ChatText, Monitor, Key, Prohibit, List, TwitterLogo, SignOut } from "phosphor-react";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function TwoFALogin() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); // Loader inicial
    const pathname = usePathname();

    useEffect(() => {
        setTimeout(() => setLoading(false), 1500);
    }, []);
    
    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/admin"; // Redirigir al login
    };
    
    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
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
        <Suspense fallback={<div>Loading...</div>}>
            <TwoFALoginContent isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} pathname={pathname} />
        </Suspense>
    );
}

function TwoFALoginContent({ isSidebarOpen, toggleSidebar, pathname }) {
    const searchParams = useSearchParams();
    const loginData = searchParams.get("loginData"); // Capturar loginData de la URL

    const [otp, setOtp] = useState("");
    const [isFetching, setIsFetching] = useState(false);
    const [error, setError] = useState(null);

    const handle2FALogin = async () => {
        setIsFetching(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login-2fa`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    login_data: loginData,
                    otp: otp
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/save-user`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        twitter_id: data.user.id_str,
                        username: data.user.screen_name,
                        session: data.session
                    })
                });

                window.location.href = "/";
            } else {
                setError(data.error || "Invalid code. Try again.");
            }
        } catch (err) {
            setError("Network error. Please try again.");
        } finally {
            setIsFetching(false);
        }
    };

    return (
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
                    <Nav.Link
                        href="/rate-limits"
                        className={`textl ${pathname === "/rate-limits" ? "active-link" : ""}`}
                    >
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
                        <List className="bi bi-list"></List>
                    </button>
                </Navbar>

                {/* Page Content */}
                <Container fluid className="py-4">
                    <Row>
                        <div className="col-12 col-md-5">
                            <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; 2FA Login</span></h5>
                        </div>
                    </Row>
                    <Row>
                        <div className="container-login col-11 col-md-4">
                            <div className="mb-3">
                                <h1 className="text-center h1-2fa">
                                    A login code was sent <br />
                                    by X to your email
                                </h1>
                            </div>
                            <div className="in2 mb-3">
                                <label htmlFor="code" className="label-in form-label">Code</label>
                                <input 
                                    type="text" 
                                    className="in form-control" 
                                    placeholder="Enter code" 
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <Button 
                                    className="btn-save btn-style-1" 
                                    onClick={handle2FALogin} 
                                    disabled={isFetching}
                                >
                                    {isFetching ? <Spinner size="sm" animation="border" /> : "Login"}
                                </Button>
                            </div>
                        </div>
                    </Row>
                </Container>
            </div>
        </div>
    );
}
