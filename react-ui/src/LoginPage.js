import React from 'react';
import MainNavbar from './MainNavbar';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import './LoginPage.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class LoginPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      loginPerformed:false,
      errorAtLogin:false,
      disableButton:false,
      responseMessage:'',
      userLoggedIn:true,
      loggedInUsername:null
    }
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout(){
    localStorage.removeItem('username');
    this.setState({
      userLoggedIn:false,
      loggedInUsername:null
    });
  }

  toggleButton(){
    this.setState((prevState)=>{
      return {
        disableButton:!prevState.disableButton
      }
    });
  }

  updateUsername(event){
    this.setState({
      username:event.target.value
    });
  }

  updatePassword(event){
    this.setState({
      password:event.target.value
    });
  }

  submitLogin(){
    var username = this.state.username;
    var password = this.state.password;
    if(username=='' || password==''){
      alert('Please fill in both fields');
      return;
    }
    this.toggleButton();
    axios.post('http://localhost:5000/login',{
      username:username,
      password:password
    }).then((res)=>{
      var data = res.data;
      var count = data[0].count;
      console.log(data[0].count);
      if(count>0){
        this.setState({
          loginPerformed:true,
          errorAtLogin:false,
          responseMessage:'You\'re ready for drawing!'
        });
        localStorage.setItem('username',username);
        setTimeout(()=>this.props.history.push('/',2000));
      }else{
        this.setState({
          loginPerformed:true,
          errorAtLogin:true,
          responseMessage:'Invalid credentials'
        });
        this.toggleButton();
      }
    }).catch((err)=>{
      console.log(err);
      this.setState({
        loginPerformed:true,
        errorAtLogin:true,
        responseMessage:'There was an error'
      });
      this.toggleButton();
    });

  }

  componentWillMount(){
    if(localStorage.getItem('username') !== null){
      var username = localStorage.getItem('username');
      this.setState({
        userLoggedIn:true,
        loggedInUsername:username
      });
    }else{
      this.setState({
        userLoggedIn:false,
        loggedInUsername:null
      });
    }
  }

  render(){

    let statusText = null;

    if(this.state.loginPerformed){
      if(this.state.errorAtLogin){
        statusText = <Alert variant="danger">{this.state.responseMessage}</Alert>
      }else{
        statusText = <Alert variant="success">{this.state.responseMessage}</Alert>
      }
    }

    return (
      <div className="LoginPage">
        <MainNavbar username={this.state.loggedInUsername} isuserloggedin={this.state.userLoggedIn} logout={this.logout} />
        <div className="container">
          <div className="loginContainer">
            <p id="loginTitle">Log In</p>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={this.state.username} onChange={this.updateUsername} />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={this.state.password} onChange={this.updatePassword}/>
            <Button onClick={this.submitLogin} disabled={this.state.disableButton}>Log In</Button>
            <a href="/login">Already signed up?</a>
            { statusText }
          </div>
        </div>
      </div>
    )
  }

}

export default LoginPage;
