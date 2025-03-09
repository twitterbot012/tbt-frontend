"use client"; // Necesario para usar hooks en el App Router

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Container, Row, Nav, Navbar, Spinner, Button, Badge, Col } from "react-bootstrap";
import { House, ChatText, Monitor, Key, Prohibit, List, TwitterLogo, SignOut  } from "phosphor-react";
import './style.css';
import "bootstrap/dist/css/bootstrap.min.css";

export default function Home() {
    const [accounts, setAccounts] = useState([]);
    const [isSidebarOpen, setSidebarOpen] = useState(true);
    const [loading, setLoading] = useState(true);
    const pathname = usePathname();
    const [languages, setLanguages] = useState([]);

    const [users, setUsers] = useState([]);
    const [keywords, setKeywords] = useState([]);
    const [userInput, setUserInput] = useState("");
    const [keywordInput, setKeywordInput] = useState("");
    const [userInfo, setUserInfo] = useState("");
    const [customStyle, setCustomStyle] = useState("");  // Nuevo estado para custom style
    const [selectedLanguage, setSelectedLanguage] = useState(""); // Nuevo estado para el idioma
    const [saveMessage, setSaveMessage] = useState(""); // Estado para mostrar mensaje

    useEffect(() => {
        // Obtener idiomas desde la API de países
        fetch("https://restcountries.com/v3.1/all")
            .then((response) => response.json())
            .then((data) => {
                const languageSet = new Set();
                data.forEach((country) => {
                    if (country.languages) {
                        Object.values(country.languages).forEach((lang) => languageSet.add(lang));
                    }
                });
                setLanguages([...languageSet].sort());
            })
            .catch((error) => console.error("Error fetching languages:", error));

        // Simular carga inicial
        setTimeout(() => setLoading(false), 1500);

        // Extraer twitter_id de la URL
        const pathSegments = pathname.split("/"); // Dividir la ruta por "/"
        const twitterId = pathSegments[pathSegments.length - 1]; // Obtener el último segmento

        if (twitterId && !isNaN(twitterId)) {
            // Realizar fetch al endpoint del backend con el twitter_id
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}`) // Ajusta la ruta según tu backend
                .then((response) => response.json())
                .then((data) => {
                    if (data.user) {
                        // Establecer usuarios monitoreados y keywords
                        setUsers(data.monitored_users.map((mu) => mu.twitter_username));
                        setUserInfo(data.user)
                        setCustomStyle(data.user.custom_style || "");  
                        setSelectedLanguage(data.user.language || "English");

                        setKeywords(data.keywords);
                    } else {
                        console.error("No se encontraron datos para la cuenta.");
                    }
                })
                .catch((error) => console.error("Error fetching account details:", error));
        } else {
            console.error("ID de Twitter no válido en la URL.");
        }
    }, [pathname]);
    
    const handleLogout = () => {
        document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        window.location.href = "/admin"; // Redirigir al login
    };
    
    const handleSave = () => {
        const twitterId = pathname.split("/").pop(); // Obtener twitter_id de la URL
    
        const updatedData = {
            language: selectedLanguage,
            custom_style: customStyle,
            monitored_users: users,
            keywords: keywords,
        };
    
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/account/${twitterId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updatedData),
        })
        .then((response) => response.json())
        .then((data) => {
            if (data.message) {
                setSaveMessage("Changes saved successfully! ✅");
            } else {
                setSaveMessage("An error occurred. Please try again. ❌");
            }
        })
        .catch(() => setSaveMessage("An error occurred. Please try again. ❌"));
    };
    

    const toggleSidebar = () => {
        setSidebarOpen((prev) => !prev);
    };

    // Función para manejar Enter en input de users
    const handleUserKeyDown = (e) => {
        if (e.key === "Enter" && userInput.trim() !== "") {
            setUsers([...users, userInput.trim()]);
            setUserInput(""); // Limpiar input
        }
    };

    // Función para manejar Enter en input de keywords
    const handleKeywordKeyDown = (e) => {
        if (e.key === "Enter" && keywordInput.trim() !== "") {
            setKeywords([...keywords, keywordInput.trim()]);
            setKeywordInput(""); // Limpiar input
        }
    };

    // Función para eliminar un usuario de la lista
    const removeUser = (index) => {
        setUsers(users.filter((_, i) => i !== index));
    };

    // Función para eliminar una keyword de la lista
    const removeKeyword = (index) => {
        setKeywords(keywords.filter((_, i) => i !== index));
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
                <div className={`sidebar ${isSidebarOpen ? "active" : ""}`}>
                    <Nav defaultActiveKey="/" className="flex-column">
                        <hr className="hr-line" />
                        <Nav.Link href="/" className={`textl hometext ${pathname === "/" ? "active-link" : ""}`}>
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

                <div className="main-content">
                    <Navbar className="navbar px-3">
                        <button className="btn btn-outline-primary d-lg-none" onClick={toggleSidebar}>
                            <List className="bi bi-list"></List>
                        </button>
                    </Navbar>

                    <Container fluid className="py-4">
                        <Row>
                            <div className="col-12 col-md-5">
                                <h5 className="dashboard-title">
                                    Dashboard <span className="mensajes-title">&gt; @{userInfo.username}</span>
                                </h5>
                            </div>
                        </Row>
                        <Row>
                            <div className="d-flex justify-content-center align-items-center col-12 col-md-12">
                                <h1 className="title-central">Choose the language in which you want to post.</h1>
                                <select name="language" id="" 
                                value={selectedLanguage}  // Valor inicial desde userInfo
                                onChange={(e) => setSelectedLanguage(e.target.value)}  // Actualiza el estado
                                className="language-select">
                                    {languages.map((lang) => (
                                        <option key={lang} value={lang}>
                                            {lang}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Input de Users */}
                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <input
                                    className="input-style-1"
                                    placeholder="Write the source user you want to add and press Enter Key."
                                    name="users"
                                    type="text"
                                    value={userInput}
                                    onChange={(e) => setUserInput(e.target.value)}
                                    onKeyDown={handleUserKeyDown}
                                />
                            </div>

                            <Row className="row-badge d-flex justify-content-center">
                            {users.map((user, index) => (
                                <Col xs={6} md={4} lg={2} key={index} className="mb-2">
                                    <Badge pill className='badge-style' >
                                    <span onClick={() => removeUser(index)} style={{ cursor: "pointer" }}>✖</span> @{user}
                                    </Badge>
                                </Col>
                            ))}
                            </Row>

                            {/* Input de Keywords */}
                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <input
                                    className="input-style-1 i2"
                                    placeholder="Write the keyword you want to analyze and press Enter Key."
                                    name="keywords"
                                    type="text"
                                    value={keywordInput}
                                    onChange={(e) => setKeywordInput(e.target.value)}
                                    onKeyDown={handleKeywordKeyDown}
                                />
                            </div>

                            {/* Badges de Keywords */}
                            <Row className="row-badge d-flex justify-content-center">
                                {keywords.map((keyword, index) => (
                                    <Col xs={6} md={4} lg={2} key={index} className="">
                                        <Badge pill className='badge-style'>
                                        <span onClick={() => removeKeyword(index)} style={{ cursor: "pointer" }}>✖</span> {keyword}
                                        </Badge>
                                    </Col>
                                ))}
                            </Row>

                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <input className="input-style-2"
                                value={customStyle}  // Valor inicial desde userInfo
                                onChange={(e) => setCustomStyle(e.target.value)}  // Actualiza el estado
                                placeholder="Customize your tweets however you prefer..." name="style-prompt" type="text" />
                            </div>
                            <div className="d-flex justify-content-center col-12 col-md-12">
                                <Button className="btn-save btn-style-1" onClick={handleSave}>Save</Button>
                            </div>
                            {saveMessage && (
                                <div className="d-flex justify-content-center col-12 col-md-12 mt-2">
                                    <span className="save-message">{saveMessage}</span>
                                </div>
                            )}
                        </Row>
                    </Container>
                </div>
            </div>
        </>
    );
}
