"use client"; 

import { useEffect, useState } from "react";
import { Container, Row, Col, Nav, Navbar, Spinner, Alert, Button, Modal, Form } from "react-bootstrap";
import { usePathname } from "next/navigation"; 
import { House, ChatText, Prohibit, Monitor, Key, List, TwitterLogo, SignOut  } from "phosphor-react";
import './style.css'
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]); 
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true); 
    const pathname = usePathname(); 
    const twitterId = typeof window !== "undefined" ? window.location.pathname.split("/").pop() : "";
    const [tweets, setTweets] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedTweet, setSelectedTweet] = useState(null);
    const [tweetText, setTweetText] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);


    useEffect(() => {
        const fetchTweets = async () => {
            setLoading(true); // Asegura que loading se active antes de la petición
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/get-all-tweets/${twitterId}`);
                const data = await response.json();

                if (response.ok) {
                  console.log(data)

                    setTweets(data);
                    console.log(tweets)
                } else {
                    setTweets([]);
                }
            } catch (error) {
                console.error("Error obteniendo el rate limit:", error);
                setTweets([]);
            } finally {
                setLoading(false);
            }
        };

        if (twitterId) {
            fetchTweets();
        }
    }, [twitterId]);

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleDeleteTweet = async () => {
        if (!selectedTweet) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/delete-tweet/${selectedTweet}`, { method: "DELETE" });
        setTweets(tweets.filter(tweet => tweet.tweet_id !== selectedTweet));
        setShowDeleteModal(false);
    };

    const handleAddTweet = async () => {
        if (!tweetText) return;
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/add-tweet`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: twitterId, tweet_text: tweetText })
        });
        if (response.ok) {
            setTweets([{ tweet_id: Date.now(), tweet_text: tweetText }, ...tweets]);
        }
        setShowAddModal(false);
        setTweetText("");
    };
    
    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/admin"; // Redirigir al login
    };
    
    const handleEditTweet = async () => {
        if (!selectedTweet || !tweetText) return;
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/edit-tweet/${selectedTweet}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ tweet_text: tweetText })
        });
        setTweets(tweets.map(tweet => tweet.tweet_id === selectedTweet ? { ...tweet, tweet_text: tweetText } : tweet));
        setShowEditModal(false);
        setTweetText("");
    };

    const handleDownloadPDF = async () => {
        setIsDownloading(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tweets/generate-pdf?user_id=${twitterId}`, {
                method: "GET"
            });
    
            if (response.ok) {
                // Crear un blob y descargar el archivo
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `tweets_backup_${twitterId}.pdf`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
    
        } catch (error) {
            console.error("Error al descargar el PDF:", error);
        } finally {
            setIsDownloading(false);
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
                            <List className="bi bi-list"></List>
                        </button>
                    </Navbar>

                    {/* Page Content */}
                    <Container fluid className="py-4">
                        <Row>
                            <div className="col-12 col-md-5">
                                <h5 className="dashboard-title">Dashboard <span className="mensajes-title">&gt; Tweets</span></h5>
                            </div>
                            <div className="col-md-3">
                            </div>
                            <div className="col-12 col-md-2 d-flex justify-content-center">
                            {tweets.length === 0 ? (
                                <button className={`text-center btn btn-primary btn-read`} onClick={handleDownloadPDF} disabled>
                                    PDF Backup
                                </button>
                            ) : (
                            <button className={`text-center btn btn-primary btn-read`} disabled={isDownloading} onClick={handleDownloadPDF}>
                                    {isDownloading ? "Downloading..." : "PDF Backup"}
                            </button>
                            )}
                            </div>
                            <div className="col-12 col-md-2 d-flex justify-content-center">
                            <button className='text-center btn btn-primary btn-read' onClick={() => setShowAddModal(true)}>Add Tweet</button>
                            </div>

                        </Row>

                        <Row className="d-flex row-all">
                            {tweets.length === 0 ? (
                                <Alert variant="info" className="alertme text-center">No hay tweets disponibles</Alert>
                            ) : (
                                tweets.map((tweet) => (
                                    <Col key={tweet.tweet_id} md={6} className="col-12 mb-3">
                                        <div className="tweet-card">
                                            <p>{tweet.tweet_text}</p>
                                            <div className="btns-s d-flex justify-content-center">
                                            <button className='btn-d1 text-center btn btn-primary' onClick={() => { setSelectedTweet(tweet.tweet_id); setTweetText(tweet.tweet_text); setShowEditModal(true); }}>Edit</button>
                                            <button className='btn-d2 text-center btn btn-danger' onClick={() => { setSelectedTweet(tweet.tweet_id); setShowDeleteModal(true); }}>Delete</button>
                                            </div>
                                        </div>
                                    </Col>
                                ))
                            )}
                        </Row>
                    </Container>
                </div>
            </div>

            <Modal  className="modal" show={showAddModal} onHide={() => setShowAddModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Add Tweet</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Control as="textarea" rows={3} value={tweetText} onChange={(e) => setTweetText(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAddModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleAddTweet}>Add</Button>
                </Modal.Footer>
            </Modal>

            <Modal className="modal" show={showEditModal} onHide={() => setShowEditModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Edit Tweet</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Form.Control as="textarea" rows={3} value={tweetText} onChange={(e) => setTweetText(e.target.value)} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowEditModal(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleEditTweet}>Save</Button>
                </Modal.Footer>
            </Modal>

            <Modal className="modal" show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
                <Modal.Header closeButton><Modal.Title>Delete Tweet</Modal.Title></Modal.Header>
                <Modal.Body>Are you sure you want to delete this tweet?</Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
                    <Button variant="danger" onClick={handleDeleteTweet}>Delete</Button>
                </Modal.Footer>
            </Modal>

        </>
    );
}
