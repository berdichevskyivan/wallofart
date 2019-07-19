import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './DrawedCanvasModal.css';

class DrawedCanvasModal extends React.Component {

  constructor(...args){
    super(...args);
    this.upvotes = React.createRef();
    this.downvotes = React.createRef();
    this.alertMsg = React.createRef();
    this.upvoteDrawing = this.upvoteDrawing.bind(this);
    this.downvoteDrawing = this.downvoteDrawing.bind(this);
  }

  upvoteDrawing(){
    axios.post('http://157.230.134.30:5000/upvoteDrawing',{imgid:this.props.imgId, userid:this.props.imgUserId})
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

  downvoteDrawing(){
    axios.post('http://157.230.134.30:5000/downvoteDrawing',{imgid:this.props.imgId, userid:this.props.imgUserId})
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

  render() {

    return (

      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
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
      </Modal>
    );

  }
}

export default DrawedCanvasModal;
