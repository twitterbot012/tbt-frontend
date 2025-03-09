"use client"; 

import { useEffect, useState } from "react";
import { getAccounts } from "../../lib/api";
import { Container, Row, Col, Nav, Navbar, Spinner, Alert, Button  } from "react-bootstrap";
import { usePathname } from "next/navigation"; 
import { House, ChatText, Prohibit, Monitor, Key, List, TwitterLogo, SignOut  } from "phosphor-react";
import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]); 
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); 
    const pathname = usePathname(); 

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const data = await getAccounts();
                setAccounts(Array.isArray(data) ? data : []); 
            } catch (error) {
                console.error("❌ Error al obtener cuentas:", error);
                setAccounts([]);
            }
        };

        fetchAccounts();
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
        <>
        <div className={`dashboard ${isSidebarOpen ? "sidebar-open" : ""}`}>
          {/* Sidebar */}
          <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
            <Nav defaultActiveKey="/" className="flex-column">
            <hr className="hr-line"/>
              <Nav.Link
                href="/"
                className={`textl hometext ${pathname === "/" ? "active-link" : ""}`}
              >
                <House size={20} weight="bold" className="me-2" /> Home
              </Nav.Link>
              <Nav.Link
                href="/api-status"
                className={`textl ${pathname === "/api-status" ? "active-link" : ""}`}
              >
                <Monitor  size={20} weight="bold" className="me-2" /> API Status
              </Nav.Link>
              <Nav.Link
                href="/api-keys"
                className={`textl ${pathname === "/api-keys" ? "active-link" : ""}`}
              >
                <Key  size={20} weight="bold" className="me-2" /> API Keys
              </Nav.Link>
              <Nav.Link
                href="/logs"
                className={`textl ${pathname === "/logs" ? "active-link" : ""}`}
              >
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
              <button
                className="btn btn-outline-primary d-lg-none"
                onClick={toggleSidebar}
              >
                <List className="bi bi-list"></List>
              </button>
            </Navbar>
  
            {/* Page Content */}
            <Container fluid className="py-4">
            <Row>
            <div className="col-12 col-md-5">
            <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; Rate Limits</span></h5>
            </div>
            </Row>
            {accounts.length === 0 ? (
                <Alert variant="warning" className="alertme text-center">No accounts found.</Alert>
              ) : (
                <Row className="mtrow d-flex justify-content-center">
                  {accounts.map((account) => (
                    <Col xs={12} md={5} key={account.twitter_id} className="col-message"
                    onClick={() => window.location.href = `/rate-limits/${account.twitter_id}`}>
                      <Button variant="primary" className={`btnv w-100 mb-2 d-flex justify-content-between align-items-center`}>
                        <span className="username-btn">@{account.username}</span>
                      </Button>
                    </Col>
                  ))}
                </Row>
              )}
            </Container>
          </div>
        </div>


      </>
  
    );
}
