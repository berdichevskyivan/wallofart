import React from 'react';
import MainNavbar from './MainNavbar';
import axios from 'axios';
import { Button, Alert } from 'react-bootstrap';
import { Redirect } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SignUpPage.css';

class SignUpPage extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      username:'',
      password:'',
      signUpPerformed:false,
      errorAtSignUp:false,
      disableButton:false,
      responseMessage:'',
      userLoggedIn:true,
      loggedInUsername:null,
      usernameId:null
    }
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.submitSignUp = this.submitSignUp.bind(this);
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

  submitSignUp(){
    var username = this.state.username;
    var password = this.state.password;
    if(username=='' || password==''){
      this.setState({
        signUpPerformed:true,
        errorAtSignUp:true,
        responseMessage:'Please fill in both fields'
      });
      return;
    }
    this.toggleButton();
    axios.post('http://157.230.134.30:5000/saveUsernameAndPassword',{
      username:username,
      password:password
    }).then((res)=>{
      console.log(res);
      var data = res.data;
      if(data.status=='OK'){
        this.setState({
          signUpPerformed:true,
          errorAtSignUp:false,
          responseMessage:'You\'re ready for drawing!'
        });
        axios.post('http://157.230.134.30:5000/getUsernameId',{
          username:username
        }).then((res)=>{
          var data = res.data;
          var id = data[0].id;
          localStorage.setItem('username',username);
          localStorage.setItem('usernameId',id);
          setTimeout(()=>this.props.history.push('/'),2000);
        }).catch((err)=>{
          this.setState({
            signUpPerformed:true,
            errorAtSignUp:true,
            responseMessage:'An error ocurred while logging in'
          });
          setTimeout(()=>this.props.history.push('/login'),2000);
        });
      }else{
        this.toggleButton();
        this.setState({
          signUpPerformed:true,
          errorAtSignUp:true,
          responseMessage:data.errorMsg
        });
      }
    }).catch((err)=>{
      this.toggleButton();
      console.log(err);
      this.setState({
        signUpPerformed:true,
        errorAtSignUp:true,
        responseMessage:'There was an error'
      });
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

    if(this.state.signUpPerformed){
      if(this.state.errorAtSignUp){
        statusText = <Alert className="alertFromLoginAndSignup" variant="danger">{this.state.responseMessage}</Alert>
      }else{
        statusText = <Alert className="alertFromLoginAndSignup" variant="success">{this.state.responseMessage}</Alert>
      }
    }

    return (
      <div className="SignUpPage">
        <MainNavbar username={this.state.loggedInUsername} isuserloggedin={this.state.userLoggedIn} logout={this.logout}/>
        <div className="container">
          <div className="signupContainer">
            <p id="signupTitle">Sign Up</p>
            <label htmlFor="username">Username</label>
            <input type="text" id="username" value={this.state.username} onChange={this.updateUsername} />
            <label htmlFor="password">Password</label>
            <input type="password" id="password" value={this.state.password} onChange={this.updatePassword}/>
            <Button onClick={this.submitSignUp} disabled={this.state.disableButton}>Sign Up</Button>
            <a href="/login">Already signed up?</a>
            { statusText }
          </div>
        </div>
      </div>
    )
  }

}

export default SignUpPage;
