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
      loggedInUsername:null,
      usernameId:null
    }
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.submitLogin = this.submitLogin.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout(){
    localStorage.removeItem('username');
    localStorage.removeItem('usernameId');
    this.setState({
      userLoggedIn:false,
      loggedInUsername:null,
      usernameId:null
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
      this.setState({
        loginPerformed:true,
        errorAtLogin:true,
        responseMessage:'Please fill in both fields'
      });
      return;
    }
    this.toggleButton();
    axios.post('http://157.230.134.30:5000/login',{
      username:username,
      password:password
    }).then((res)=>{
      var data = res.data;
      if(data.length!==0){
        var id = data[0].id;
        var username = data[0].username;
        this.setState({
          loginPerformed:true,
          errorAtLogin:false,
          responseMessage:'You\'re ready for drawing!'
        });
        localStorage.setItem('username',username);
        localStorage.setItem('usernameId',id);
        setTimeout(()=>this.props.history.push('/'),1000);
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
    console.log(localStorage.getItem('username'));
    console.log(localStorage.getItem('usernameId'));
    if(localStorage.getItem('username') !== null && localStorage.getItem('usernameId') !== null){
      var username = localStorage.getItem('username');
      var id = localStorage.getItem('usernameId');
      this.setState({
        userLoggedIn:true,
        loggedInUsername:username,
        usernameId:id
      });
    }else{
      this.setState({
        userLoggedIn:false,
        loggedInUsername:null,
        usernameId:null
      });
    }
  }

  render(){

    let statusText = null;

    if(this.state.loginPerformed){
      if(this.state.errorAtLogin){
        statusText = <Alert className="alertFromLoginAndSignup" variant="danger">{this.state.responseMessage}</Alert>
      }else{
        statusText = <Alert className="alertFromLoginAndSignup" variant="success">{this.state.responseMessage}</Alert>
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
            <a href="/signup">Haven't signed up yet?</a>
            { statusText }
          </div>
        </div>
      </div>
    )
  }

}

export default LoginPage;
