"use client"; // Necesario para usar hooks en el App Router

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAccounts, loginWithTwitter } from "../lib/api";
import { Container, Row, Col, Modal, Nav, Navbar, Spinner, Alert, Button  } from "react-bootstrap";
import { usePathname } from "next/navigation"; // Importar usePathname
import { House, ChatText, Prohibit , Trash, Monitor, Key, List, TwitterLogo, SignOut   } from "phosphor-react";
import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]); // 🔹 Siempre inicializa como un array
    const router = useRouter();
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); // Estado para el loader
    const [messages, setMessages] = useState([]);
    const pathname = usePathname(); // Obtener la URL actual
    const [showModal, setShowModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isFetching, setIsFetching] = useState(false);  // Estado para saber si el proceso está activo

    useEffect(() => {
      const fetchAccounts = async () => {
          try {
              const data = await getAccounts();
              setAccounts(Array.isArray(data) ? data : []); // 🔹 Asegura que siempre sea un array
          } catch (error) {
              console.error("❌ Error al obtener cuentas:", error);
              setAccounts([]); // 🔹 Si hay un error, mantiene un array vacío
          }
      };
  
      const checkFetchingStatus = async () => {
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-fetch`);
              const data = await response.json();
              setIsFetching(data.status === "running"); // Actualiza el estado con la respuesta del servidor
          } catch (error) {
              console.error("❌ Error al verificar el estado de recolección:", error);
          }
      };
  
      const init = async () => {
          checkFetchingStatus(); // Podés dejar que esto corra sin esperar
          await fetchAccounts(); // Esperás a que termine de traer las cuentas
          setLoading(false); // 🔹 Ahora el loading termina al finalizar fetchAccounts
      };
  
      init();
  }, []);
  

    const handleShowModal = (twitterId) => {
      setSelectedAccount(twitterId);
      setShowModal(true);
  };

  const handleLogout = () => {
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    window.location.href = "/admin"; // Redirigir al login
};

  const handleCloseModal = () => {
      setShowModal(false);
      setSelectedAccount(null);
  };

  const startStopProcess = async () => {
    // ⏳ Actualizamos el estado inmediatamente para evitar que el botón desaparezca
    setIsFetching(prev => !prev); 

    try {
        const endpoint = isFetching ? "/stop-fetch" : "/start-fetch";
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, { method: 'POST' });

        if (!response.ok) throw new Error("Error en la solicitud al backend");

        // 🔄 Refrescamos el estado desde el backend después de unos segundos para asegurarnos
        setTimeout(async () => {
            try {
                const statusResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/status-fetch`);
                const statusData = await statusResponse.json();
                setIsFetching(statusData.status === "running");
            } catch (error) {
                console.error("⚠️ Error al actualizar estado desde backend:", error);
            }
        }, 3000); // Esperamos 3 segundos antes de verificar el estado real
    } catch (error) {
        console.error("❌ Error al iniciar/detener el proceso:", error);
        setIsFetching(prev => !prev); // Si hubo un error, revertimos el estado
    }
};

  const deleteAccount = async () => {
    if (!selectedAccount) return;

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${selectedAccount}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            throw new Error("Error al eliminar la cuenta");
        }

        setAccounts(accounts.filter((account) => account.twitter_id !== selectedAccount));
    } catch (error) {
        console.error("❌ Error al eliminar la cuenta:", error);
    } finally {
        handleCloseModal();
    }
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
            <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; Home</span></h5>
            </div>
            <div className="col-md-3">
            </div>
            <div className="col-12 col-md-2 d-flex justify-content-center">
              <button 
                  className={`text-center btn ${isFetching ? 'btn-danger' : 'btn-primary'} btn-read`} 
                  onClick={startStopProcess}
              >
                  {isFetching ? 'Stop Process' : 'Start Process'}
              </button>
            </div>
            <div className="col-12 col-md-2 d-flex justify-content-center">
              <button className="text-center btn btn-primary btn-read" 
              onClick={() => window.location.href = '/auth/login'}
              >Add Account
              </button>
            </div>
            </Row>
            {accounts.length === 0 ? (
                <Alert variant="warning" className="alertme text-center">No accounts found.</Alert>
              ) : (
                <Row className="mtrow d-flex justify-content-center">
                  {accounts.map((account) => (
                    <Col xs={12} md={5} key={account.twitter_id} className="col-message"
                    onClick={() => window.location.href = `/account/${account.twitter_id}`}>
                      <Button variant="primary" className={`btnv w-100 mb-2 d-flex justify-content-between align-items-center`}>
                        <span className="username-btn">@{account.username}</span>
                        <span className="trash-btn" onClick={(e) => {
                            e.stopPropagation(); // Para que no navegue a la cuenta
                            handleShowModal(account.twitter_id);
                        }}>
                            <Trash size={20} />
                        </span>
                      </Button>
                    </Col>
                  ))}
                </Row>
              )}
            </Container>
          </div>
        </div>

        <Modal show={showModal} className='modal-delete' onHide={handleCloseModal} centered>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>Are you sure you want to delete this account?</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
                <Button variant="danger" onClick={deleteAccount}>Delete</Button>
            </Modal.Footer>
        </Modal>

      </>
  
    );
}
