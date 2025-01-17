import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import { Link } from "react-router-dom"
import AuthContext from '../context/AuthContext'
import { useContext, useState } from 'react';
import HowToPlay from './HowToPlay';
import Button from 'react-bootstrap/esm/Button';

export default function NavigationBar() {
    const { authUser, logout, changeAuthType } = useContext(AuthContext)
    const [showHowTo, setShowHowTo] = useState(false)

    function handleLogout(event) {
        changeAuthType(0)
        logout(); // reset login context
    }

    // Handle how to play button click
    function handleHowToPlayButton() {
        setShowHowTo(!showHowTo)
    }

    return (
        <Navbar className='shadow p-3 bg-primary' data-bs-theme="dark">
            <Container>
                <Navbar.Brand as={Link} to='/' >TomatoQuest</Navbar.Brand>
                <Nav >
                    <Nav.Link onClick={handleHowToPlayButton} > How to play</Nav.Link>

                    {authUser.isAuthenticated && <NavDropdown title={authUser.username} id="navbarScrollingDropdown" >
                        <NavDropdown.Item className='text-danger' onClick={handleLogout}>
                            Logout
                        </NavDropdown.Item>
                    </NavDropdown>}

                </Nav>
            </Container>

            {showHowTo && <HowToPlay show={showHowTo} handleHowToPlayButton={handleHowToPlayButton} />}
        </Navbar>
    )
}