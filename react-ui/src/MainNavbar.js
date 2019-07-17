import React from 'react';
import { Nav, Navbar, Form, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './MainNavbar.css';

function MainNavbar(props){

  var links = props.isuserloggedin ? <Nav.Link onClick={props.logout}>Logout</Nav.Link> : <div style={{display:'flex'}}><Nav.Link href="/">Home</Nav.Link>
                                                        <Nav.Link href="/login">Login</Nav.Link>
                                                        <Nav.Link href="/signup">Sign Up</Nav.Link></div>

  return (<div className="MainNavbar">
          <Navbar bg="white" variant="light" sticky="top">
            <Nav className="ml-auto">
              { props.username!==null ? <Nav.Link>Welcome, { props.username }!</Nav.Link> : null}
              { links }
            </Nav>
          </Navbar>
    </div>)
}

export default MainNavbar;
