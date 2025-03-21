"use client";

import { useEffect, useState } from "react";
import { Container, Row, Nav, Navbar, Spinner } from "react-bootstrap";
import { usePathname } from "next/navigation"; 
import { House, ChatText, Monitor, Key, Prohibit, List, TwitterLogo, SignOut  } from "phosphor-react";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";
import { getAccounts } from "../../lib/api";

export default function Home() {
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [accounts, setAccounts] = useState([]);
    const [logs, setLogs] = useState([]);

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
  
      const fetchLogs = async () => {
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/logs/logs`);
              if (!response.ok) throw new Error("Error al obtener logs");
              const data = await response.json();
              console.log("📥 Logs recibidos desde la API:", data);
              setLogs(data);
          } catch (error) {
              console.error("❌ Error al obtener logs:", error);
              setLogs([]);
          }
      };
  
      const fetchData = async () => {
          await fetchAccounts();
          await fetchLogs();
          setLoading(false); // ✅ Ahora loading se actualiza cuando ambas llamadas terminan
      };
  
      fetchData();
  }, []);
  
    useEffect(() => {
        console.log("🚀 Logs actualizados en el estado:", logs);
    }, [logs]); // Para ver los logs en consola cuando cambian

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };
    
    const handleLogout = () => {
      document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
      window.location.href = "/admin"; // Redirigir al login
  };
  

    // Función para convertir timestamp a formato YYYY-MM-DD
    const formatDate = (timestamp) => {
        try {
            const date = new Date(timestamp);
            return date.toISOString().split("T")[0];
        } catch (error) {
            console.error("❌ Error formateando la fecha:", timestamp, error);
            return ""; // Devuelve string vacío si hay error
        }
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
            <Row className="d-flex justify-content-center">
            {accounts.map((account) => {
                // Filtrar logs de esta cuenta específica
                const accountLogs = logs.filter(log => log.user_id === account.id);

                console.log(`🔍 Logs filtrados para ${account.id}:`, accountLogs);

                // Obtener la fecha de hoy en formato YYYY-MM-DD
                const today = new Date().toISOString().split("T")[0];

                // Calcular métricas
                const postedToday = accountLogs.filter(log => {
                    const logDate = formatDate(log.timestamp);
                    console.log(`⏳ Comparando: logDate (${logDate}) === today (${today})`);
                    return log.event_type === "POST" && logDate === today;
                }).length;

                const totalPosted = accountLogs.filter(log => log.event_type === "POST").length;
                const failedPosts = accountLogs.filter(log => log.event_type === "ERROR").length;

                return (
                    <div key={account.username} className="container-account col-12 col-lg-4 col-md-6">
                      <h5 className="title-log">@{account.username}</h5>
                      <Row className="text-center">
                        <div className="col-md-4">
                          <p className="p-log">Posted Today</p>
                          <p className="p2-log">{postedToday}</p>
                        </div>
                        <div className="col-md-4">
                          <p className="p-log">Total Posted</p>
                          <p className="p2-log">{totalPosted}</p>
                        </div>
                        <div className="col-md-4">
                          <p className="p-log">Failed Posts</p>
                          <p className="text-red p2-log">{failedPosts}</p>
                        </div>
                      </Row>

                    </div>
                );
            })}
            </Row>
            </Container>
          </div>
        </div>
      </>
    );
}
