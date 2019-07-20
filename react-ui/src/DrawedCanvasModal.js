import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DrawedCanvasModal.css';

class DrawedCanvasModal extends React.Component {

  constructor(...args){
    super(...args);
    this.state = {
      comments:[]
    }
    this.upvotes = React.createRef();
    this.downvotes = React.createRef();
    this.alertMsg = React.createRef();
    this.commentText = React.createRef();
    this.commentResponse = React.createRef();
    this.upvoteDrawing = this.upvoteDrawing.bind(this);
    this.downvoteDrawing = this.downvoteDrawing.bind(this);
    this.saveComment = this.saveComment.bind(this);
    this.enteringModal = this.enteringModal.bind(this);
    this.exitingModal = this.exitingModal.bind(this);
  }

  exitingModal(){
    setTimeout(()=>{
      this.setState({
        comments:[]
      });
    },500)
  }

  enteringModal(){
    axios.post('/getDrawingComments',{drawingid:this.props.imgId})
         .then(res=>{
           this.setState({
             comments:res.data
           });
         })
         .catch(err=>console.log(err));
  }

  upvoteDrawing(){
    if(localStorage.getItem('usernameId')===null){
      this.alertMsg.current.innerHTML = 'Log in to vote';
      return;
    }else{
      var loggedInUserId = localStorage.getItem('usernameId');
      axios.post('/upvoteDrawing',{imgid:this.props.imgId, userid:loggedInUserId})
           .then(res=>{
             if(res.data.status=='OK'){
               this.upvotes.current.innerHTML = parseInt(this.upvotes.current.innerHTML) + 1;
             }else{
               console.log(this.alertMsg);
               this.alertMsg.current.innerHTML = res.data.errorMsg;
               return;
             }
           })
           .catch(err=>{
             console.log(err);
           })
    }

  }

  downvoteDrawing(){
    if(localStorage.getItem('usernameId')===null){
      this.alertMsg.current.innerHTML = 'Log in to vote';
      return;
    }else{
      var loggedInUserId = localStorage.getItem('usernameId');
      axios.post('/downvoteDrawing',{imgid:this.props.imgId, userid:loggedInUserId})
            .then(res=>{
              if(res.data.status=='OK'){
                this.downvotes.current.innerHTML = parseInt(this.downvotes.current.innerHTML) + 1;
              }else{
                console.log(this.alertMsg);
                this.alertMsg.current.innerHTML = res.data.errorMsg;
                return;
              }
            })
            .catch(err=>{
              console.log(err);
            })
    }
  }
  //VALUES(${req.body.drawingid},${req.body.userid},'${req.body.textcontent}',${req.body.date});`;
  saveComment(){
    if(localStorage.getItem('usernameId')===null){
      this.commentResponse.current.innerHTML = 'Log in to comment';
      return;
    }else{
      let commentText = this.refs.commentText.value;
      if(commentText === ''){
        this.commentResponse.current.innerHTML = 'Text is empty';
        return;
      }
      let drawingid = this.props.imgId;
      let userid = localStorage.getItem("usernameId");
      let date = new Date().toJSON().slice(0,10).split('-').reverse().join('/');
      axios.post('/saveComment',{ drawingid:drawingid,userid:userid,textcontent:commentText,date:date })
           .then(res=>{
             if(res.data.status==='OK'){
               axios.post('/getDrawingComments',{drawingid:this.props.imgId})
                    .then(res=>{
                      console.log(res.data);
                      this.refs.commentText.value = '';
                      this.setState({
                        comments:res.data
                      });
                    })
                    .catch(err=>console.log(err));
             }else{
               this.commentResponse.current.innerHTML = res.data.errorMsg;
             }
           })
           .catch(err=>{
             console.log(err);
             this.commentResponse.current.innerHTML = 'There was an error';
           })
    }
  }

  render() {

    return (

      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        onEnter={this.enteringModal}
        onExit={this.exitingModal}
        centered
      >
        <Modal.Body className="bodyOfModal">
        <div className="imgWrapper">
          <img src={this.props.imgDataURL} />
        </div>
        </Modal.Body>
        <Modal.Footer>
           <div className="arrowContainer">
             <div className="arrow-up" onClick={this.upvoteDrawing}></div>
             <p className="votes" ref={this.upvotes}>{this.props.imgUpvotes}</p>
             <div className="arrow-down" onClick={this.downvoteDrawing}></div>
             <p className="votes" ref={this.downvotes}>{this.props.imgDownvotes}</p>
             <p ref={this.alertMsg} style={{marginBottom:'0px',marginLeft:'10px'}}></p>
           </div>
           <p style={{marginBottom:'0'}}>Made by {this.props.imgUsername}</p>
        </Modal.Footer>
        <div className="row commentSection">
          <textarea ref={'commentText'} placeholder="Write a comment..."></textarea>
        </div>
        <div className="row commentButton">
          <p ref={this.commentResponse} style={{marginBottom:'0px',marginRight:'10px',alignSelf:'center'}}></p>
          <Button onClick={this.saveComment}>Comment</Button>
        </div>
        <div className="row comments">
          { this.state.comments.length > 0 ? this.state.comments.map((key,index)=>{
            return <div className="singleComments">

              <p style={{marginBottom:'0'}}>
                <span className="commentText">{key.textcontent}</span> - <span className="commentUser">{key.username}</span> <span className="commentDate">{key.date}</span>
              </p>

            </div>
          }) : null }
        </div>
      </Modal>
    );

  }
}

export default DrawedCanvasModal;
