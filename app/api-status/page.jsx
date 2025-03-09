"use client"; // Necesario para usar hooks en el App Router

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Container, Row, Col, Modal, Nav, Navbar, Spinner, Alert, Button  } from "react-bootstrap";
import { usePathname } from "next/navigation"; // Importar usePathname
import { House, ChatText, Prohibit , TwitterLogo , Monitor, Key, List, SignOut } from "phosphor-react";
import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); // Estado para el loader
    const pathname = usePathname(); // Obtener la URL actual
    const [isFetching, setIsFetching] = useState(false);  // Estado para saber si el proceso está activo
    const [error, setError] = useState(false); // Estado para manejar errores

    useEffect(() => {
        const checkFetchingStatus = async () => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-fetch`);
                if (!response.ok) {
                    throw new Error("Error en la respuesta del servidor");
                }
                const data = await response.json();
                setIsFetching(data.status === "running"); // Actualiza el estado con la respuesta del servidor
                setError(false); // Limpiar errores si la solicitud es exitosa
            } catch (error) {
                console.error("❌ Error al verificar el estado de recolección:", error);
                setError(true); // Marcar como error
                setIsFetching(false); // Asegurarse de que isFetching sea falso en caso de error
            }
        };
        checkFetchingStatus();
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
        // Mostrar el loader mientras el estado `loading` sea true
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
            <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; API Status</span></h5>
            </div>
            </Row>
            <Row>
            <div className="div-api col-12 col-md-12">
            {error ? (
                // Mensaje de error
                <>
                    <div className="d-flex">
                        <img src="/error.png" className='icon-api' alt="" />
                    </div>

                    <h1 className="text-center title-api">Error verifying the status</h1>
                    <p className="text-center p-api">
                    Could not connect to the server. Please try again later.
                    </p>
                </>
            ) : isFetching ? (
                // Estado cuando isFetching es true
                <>
                    <div className="d-flex">
                        <img src="/check.png" className='icon-api' alt="" />
                    </div>
                    <h1 className="text-center title-api">The API is functioning correctly</h1>
                    <p className="text-center p-api">
                        Last updated a few seconds ago.
                    </p>
                </>
            ) : (
                // Estado cuando isFetching es false
                <>
                    <div className="d-flex">
                        <img src="/warning.png" className='icon-api' alt="" />
                    </div>
                    <h1 className="text-center title-api">Data collection is currently stopped.</h1>
                    <p className="text-center p-api">
                        Last updated a few seconds ago.
                    </p>
                </>
            )}
            </div>
            </Row>

            </Container>
          </div>
        </div>

      </>
  
    );
}
