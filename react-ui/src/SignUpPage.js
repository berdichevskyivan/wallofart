import React from 'react';
import MainNavbar from './MainNavbar';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SignUpPage.css';

class SignUpPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {

    }
  }

  render(){
    return (
      <div className="SignUpPage">
        <MainNavbar />
        <div className="container">
          <div className="signupContainer">
            <p id="signupTitle">Sign Up</p>
            <label for="username">Username</label>
            <input type="text" id="username" />
            <label for="password">Password</label>
            <input type="password" id="password" />
            <Button>Sign Up</Button>
            <a href="/login">Already signed up?</a>
          </div>
        </div>
      </div>
    )
  }

}

export default SignUpPage;
