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
      loggedInUsername:''
    }
    this.updateUsername = this.updateUsername.bind(this);
    this.updatePassword = this.updatePassword.bind(this);
    this.submitSignUp = this.submitSignUp.bind(this);
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

  submitSignUp(){
    var username = this.state.username;
    var password = this.state.password;
    if(username=='' || password==''){
      alert('Please fill in both fields');
      return;
    }
    this.toggleButton();
    axios.post('http://localhost:5000/saveUsernameAndPassword',{
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
        setTimeout(()=>this.props.history.push('/login'),2000);
      }else{
        this.toggleButton();
        this.setState({
          signUpPerformed:true,
          errorAtSignUp:true,
          responseMessage:'There was an error'
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

    if(this.state.signUpPerformed){
      if(this.state.errorAtSignUp){
        statusText = <Alert variant="danger">{this.state.responseMessage}</Alert>
      }else{
        statusText = <Alert variant="success">{this.state.responseMessage}</Alert>
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
