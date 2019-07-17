import React from 'react';
import MainNavbar from './MainNavbar';
import { Button } from 'react-bootstrap';
import './LoginPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
    return (
      <div className="LoginPage">
        <MainNavbar />
        <div className="container">
          <div className="loginContainer">
            <p id="loginTitle">Log In</p>
            <label for="username">Username</label>
            <input type="text" id="username" />
            <label for="password">Password</label>
            <input type="password" id="password" />
            <Button>Login</Button>
            <a href="/signup">Haven't signed up yet?</a>
          </div>
        </div>
      </div>
    )
  }

}

export default LoginPage;
