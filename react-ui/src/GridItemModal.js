import React from 'react';
import { Modal , Button, Alert } from 'react-bootstrap';
import LC from 'literallycanvas';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'literallycanvas/lib/css/literallycanvas.css'
import './GridItemModal.css';

class GridItemModal extends React.Component {

  constructor(...args){
    super(...args);
    this.state = {
      isLCVisible : false,
      lc: null,
      disableButton: false,
      imgWasSaved:false,
      errorAtSaving:false,
      responseMessage:null
    }
    this.toggleLCVisible = this.toggleLCVisible.bind(this);
    this.toggleLCInvisible = this.toggleLCInvisible.bind(this);
    this.saveImageFromCanvas = this.saveImageFromCanvas.bind(this);
    this.toggleButton = this.toggleButton.bind(this);
  }

  toggleLCVisible(){
    this.setState((prevState)=>{
      return {isLCVisible : true}
    });
  }

  toggleLCInvisible(){
    this.setState((prevState)=>{
      return {isLCVisible : false , imgWasSaved: false}
    });
  }

  toggleButton(){
    this.setState((prevState)=>{
      return {
        disableButton:!prevState.disableButton
      }
    });
  }

  saveImageFromCanvas = () => {
    let lc = this.state.lc;
    this.toggleButton();
    console.log('Saving image');
    if(lc.getImage()!==null){
      let base64img = lc.getImage().toDataURL();
      let canvasIndex = this.props.openedcanvasindex;
      console.log(base64img);
      console.log(canvasIndex);
      axios.post('localhost:5000/saveImageToDatabase',{ canvas_id:canvasIndex, base64img:base64img })
           .then(res=>{
             console.log(res.data);
             if(res.data.status==='OK'){
               this.setState({
                imgWasSaved:true,
                errorAtSaving:false,
                responseMessage:'Your drawing was saved successfully!'
              },()=>{this.props.handleSave()});
               setTimeout(()=>{
                  this.toggleButton();
                  this.props.onHide();
               },1000);
             }else{
               this.toggleButton();
               this.setState({
                imgWasSaved:true,
                errorAtSaving:true,
                responseMessage:'There was an error'
               });
             }
           }).catch(err=>{
             console.log(err.response.status);
             //PAYLOAD TOO LARGE
             if(err.response.status === 413){
               this.toggleButton();
               this.setState({
                imgWasSaved:true,
                errorAtSaving:true,
                responseMessage:'There was an error'
               });
             }
           })
    }else{
      this.toggleButton();
      this.setState({
       imgWasSaved:true,
       errorAtSaving:true,
       responseMessage:'Canvas is empty'
     },()=>{
       setTimeout(()=>{
               this.setState({
                      imgWasSaved:false
                    })
            },2000);
     });
    }
  }

  render() {

    let statusText = null;

    if(this.state.imgWasSaved){
      if(this.state.errorAtSaving){
        statusText = <Alert variant="danger">{this.state.responseMessage}</Alert>
      }else{
        statusText = <Alert variant="success">{this.state.responseMessage}</Alert>
      }
    }

    return (

      <Modal
        {...this.props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
        onEntered={this.toggleLCVisible}
        onExited={this.toggleLCInvisible}
      >
        {this.state.isLCVisible ?
         <Modal.Body><LC.LiterallyCanvasReactComponent imageURLPrefix="/static/img"
                                           backgroundColor="white"
                                           zoom="0"
                                           onInit={(lc)=>{
                                             console.log('initialized with',lc);
                                             this.setState({
                                               lc : lc
                                             });
                                             lc.respondToSizeChange();
                                           }} /> <Modal.Footer>
                                              { statusText }
                                             <Button onClick={this.saveImageFromCanvas} disabled={this.state.disableButton}>Save your art</Button>
                                             <Button onClick={this.props.onHide}>Close</Button>
                                           </Modal.Footer></Modal.Body> : null}
      </Modal>
    );

  }
}

export default GridItemModal;
