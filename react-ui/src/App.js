import React, { Component } from 'react';
import axios from 'axios';
import GridItemModal from './GridItemModal';
import HistoryModal from './HistoryModal';
import DrawedCanvasModal from './DrawedCanvasModal';
import MainNavbar from './MainNavbar'
import { Button } from 'react-bootstrap';
import domtoimage from 'dom-to-image';
import download from 'downloadjs';
import './App.css';
import 'literallycanvas/lib/css/literallycanvas.css';
import 'bootstrap/dist/css/bootstrap.min.css';

class App extends Component {

  constructor(props){
    super(props);
    this.state = {
      modalShow: false,
      historyModalShow:false,
      drawedModalShow:false,
      drawedModalUserId:null,
      drawedModalId:null,
      drawedModalUsername:null,
      drawedModalUpvotes:null,
      drawedModalDownvotes:null,
      canvasesJson: null,
      wallOfArtHistory:[],
      allCanvasesLoaded: false,
      openedCanvasIndex:null,
      intervalId:null,
      showParagraphs:true,
      wallOfArtVersion:null,
      imageWasSaved:false,
      drawedImgDataURL:'',
      userLoggedIn:false,
      loggedInUsername:null,
      usernameId:null
    }
    this.showModalAndUpdateModalIndex = this.showModalAndUpdateModalIndex.bind(this);
    this.showHistoryModal = this.showHistoryModal.bind(this);
    this.showDrawedCanvasModal = this.showDrawedCanvasModal.bind(this);
    this.setImmediateInterval = this.setImmediateInterval.bind(this);
    this.downloadWallAsImg = this.downloadWallAsImg.bind(this);
    this.toggleParagraphs = this.toggleParagraphs.bind(this);
    this.saveWallOfArt = this.saveWallOfArt.bind(this);
    this.logout = this.logout.bind(this);
  }

  logout(){
    localStorage.removeItem('username');
    localStorage.removeItem('usernameId');
    window.location.reload();
  }

  saveWallOfArt(){
    console.log('Saving wall of art...');
    var node = document.getElementsByClassName('App')[0];

    this.toggleParagraphs();
    document.getElementsByClassName('wallWrapper')[0].style.border = "none";
    document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "none";
    document.getElementsByClassName('navbar')[0].style.display = "none";

    let wallOfArtVersion = this.state.wallOfArtVersion;

    domtoimage.toPng(node,{ style:{ "marginTop":"20px" } })
               .then(function(dataUrl){
                 console.log(dataUrl);
                 let wall_of_art_version = wallOfArtVersion;
                 axios.post('http://157.230.134.30:5000/saveWallOfArt',{ wall_of_art_version:wall_of_art_version, base64img:dataUrl })
                      .then(res=>{
                        console.log(res.data);
                        if(res.data.status==='OK'){
                          console.log('Wall of Art was saved correctly');
                        }else{
                          console.log('An Error has ocurred');
                        }
                      }).catch(err=>{
                        console.log(err);
                        //console.log(err.response.status);
                      })
               }).then(()=>{this.toggleParagraphs();
                            document.getElementsByClassName('wallWrapper')[0].style.border = "3px solid black";
                            document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "8px 8px #dee2e6";
                            document.getElementsByClassName('navbar')[0].style.display = "flex";});
  }

  downloadWallAsImg(){
    var node = document.getElementsByClassName('App')[0];

    this.toggleParagraphs();
    document.getElementsByClassName('wallWrapper')[0].style.border = "none";
    document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "none";
    document.getElementsByClassName('navbar')[0].style.display = "none";

    domtoimage.toPng(node,{ style:{ "marginTop":"20px" } })
               .then(function(dataUrl){
                 download(dataUrl, 'wallofart.png');
               }).then(()=>{this.toggleParagraphs();
                            document.getElementsByClassName('wallWrapper')[0].style.border = "3px solid black";
                            document.getElementsByClassName('wallWrapper')[0].style.boxShadow = "8px 8px #dee2e6";
                            document.getElementsByClassName('navbar')[0].style.display = "flex";
                          });
  }

  showModalAndUpdateModalIndex(modalIndex){
    this.setState({
      modalShow:true,
      openedCanvasIndex:modalIndex
    },()=>console.log(this.state.openedCanvasIndex));
  }

  showHistoryModal(){
    this.setState({
      historyModalShow:true
    });
  }

  showDrawedCanvasModal(gridImgSrc,gridImgId,gridImgUserId,gridImgUsername,gridImgUpvotes,gridImgDownvotes){
    this.setState({
      drawedImgDataURL:gridImgSrc,
      drawedModalShow: true,
      drawedModalUserId:gridImgUserId,
      drawedModalId:gridImgId,
      drawedModalUsername:gridImgUsername,
      drawedModalUpvotes:gridImgUpvotes,
      drawedModalDownvotes:gridImgDownvotes
    });
  }

  createGridItems(rowIndex){
    let gridItems = [];
    for(let i = 0 ; i < 10 ; i++){
      let gridIndex = i+1+(rowIndex*10);
      let canvasesJson = this.state.canvasesJson;
      if(canvasesJson == null){
        if(localStorage.getItem('drawingsMadeByUser')>0 || this.state.loggedInUsername==null){
          gridItems.push(<div className="grid-item-disabled"
                              key={gridIndex} id={gridIndex}
                              ></div>);
        }else{
          gridItems.push(<div className="grid-item"
                              key={gridIndex} id={gridIndex}
                              onClick={()=>this.showModalAndUpdateModalIndex(gridIndex)}></div>);
        }
      }else{
        let gridImgSrc = null;
        let gridImgId = null;
        let gridImgUserId = null;
        let gridImgUsername = null;
        let gridImgUpvotes = null;
        let gridImgDownvotes = null;

        for(var x = 0 ; x < canvasesJson.length ; x++){
          if(canvasesJson[x].drawingCanvasNumber == gridIndex){
            gridImgSrc = canvasesJson[x].drawingUrl;
            gridImgId = canvasesJson[x].drawingId;
            gridImgUserId = canvasesJson[x].drawingUserId;
            gridImgUsername = canvasesJson[x].drawingUserName;
            gridImgUpvotes = canvasesJson[x].drawingUpvotes;
            gridImgDownvotes = canvasesJson[x].drawingDownvotes;
          }
        }

        if(gridImgSrc!==null && gridImgId!==null && gridImgUserId!==null){
          gridItems.push(<div className="grid-item"
                              key={gridIndex} id={gridIndex}>
                         <img className="drawing-from-user"
                              src={gridImgSrc} onClick={()=>this.showDrawedCanvasModal(gridImgSrc,gridImgId,gridImgUserId
                                                                                      ,gridImgUsername,gridImgUpvotes,gridImgDownvotes)} /></div>);
        }else{
          if(localStorage.getItem('drawingsMadeByUser')>0 || this.state.loggedInUsername==null){
            gridItems.push(<div className="grid-item-disabled"
                                key={gridIndex} id={gridIndex}
                                ></div>);
          }else{
            gridItems.push(<div className="grid-item"
                                key={gridIndex} id={gridIndex}
                                onClick={()=>this.showModalAndUpdateModalIndex(gridIndex)}></div>);
          }
        }
      }

    }
    return gridItems;
  }

  createGrid(){
    let grid = [];
    for(let i = 0 ; i < 10 ; i++){
      grid.push(<div className="grid-row" key={i}>{this.createGridItems(i)}</div>);
    }
    return grid;
  }

  setImmediateInterval = (fn,interval) => {
    fn();
    return setInterval(fn,interval);
  }

  componentDidMount(){

    axios.get('http://157.230.134.30:5000/getWallsHistory')
         .then(res=>{
           this.setState({
             wallOfArtHistory:res.data
           });
         });

   let intervalId = this.setImmediateInterval(()=>{

     axios.get('http://157.230.134.30:5000/getWallVersion')
          .then(res=>{
            this.setState({
              wallOfArtVersion:res.data[0].wall_of_art_version
            },()=>{
              axios.post('http://157.230.134.30:5000/getCanvases',{wallofartversion:this.state.wallOfArtVersion == null ? 1 : this.state.wallOfArtVersion})
                   .then(res=>{
                     var data = res.data;
                     if(data.length==0){
                       this.setState({
                         canvasesJson: null,
                         allCanvasesLoaded: true
                       });
                     }else{
                       var canvasesJson = [];
                       for(var i = 0 ; i < data.length ; i++){
                         var drawingJson = {
                           drawingId:data[i].id,
                           drawingUserId:data[i].usernameid,
                           drawingCanvasNumber:data[i].canvasnumber,
                           drawingUrl:data[i].base64img,
                           drawingUserName:data[i].username,
                           drawingUpvotes:data[i].upvotes,
                           drawingDownvotes:data[i].downvotes
                         }
                         canvasesJson.push(drawingJson);
                       }
                       this.setState({
                         canvasesJson: canvasesJson,
                         allCanvasesLoaded: true
                       });
                     }
                   });
            });
          });

   },2500);

   this.setState({
     intervalId:intervalId
   });

   setTimeout(()=>{
     let isRequiredAmount = document.getElementsByTagName('img').length === 100 ? true : false ;

     if(isRequiredAmount){
       this.saveWallOfArt();
     }
   },5000)

  }

  toggleParagraphs(){
    this.setState((prevState)=>{
      return {
        showParagraphs:!prevState.showParagraphs
      }
    });
  }

  componentWillUnmount(){
    clearInterval(this.state.intervalId);
  }

  componentWillMount(){
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

    if(localStorage.getItem('drawingsMadeByUser') > 0){
      if( ( localStorage.getItem('timer') - new Date().getTime() ) < 0 ){
        localStorage.setItem('drawingsMadeByUser',0);
      }
    }

    let modalClose = () => this.setState({modalShow:false});
    let historyModalClose = () => this.setState({historyModalShow:false});
    let drawedModalClose = () => this.setState({drawedModalShow:false});
    let handleSave = () => {
      this.setState({imageWasSaved:true});
      var drawingsMadeByUser = localStorage.getItem('drawingsMadeByUser') == null ? 0 : parseInt(localStorage.getItem('drawingsMadeByUser'));
      localStorage.setItem('drawingsMadeByUser',drawingsMadeByUser+1);
      if(parseInt(localStorage.getItem('drawingsMadeByUser'))>0){
        // User can draw again after 1 minute
        localStorage.setItem('timer',new Date().getTime()+(20*1000));
      }

    };

    let paragraphs = this.state.showParagraphs ?
                     <div><p className="paragraph" id="wallTitle">Earth's Wall of Art</p>
                     <p className="paragraph" style={{"fontSize":"20px",marginTop:'10px',marginBottom:'4px'}}>Select an empty space from the wall and leave your mark</p>
                     </div> :
                     null;

   let rules = this.state.userLoggedIn == false ?
                    <div>
                    <p className="paragraph rules" style={{"fontSize":"20px",marginBottom:'3px'}}>You need to log in first!</p>
                    </div> :
                    null;

    let buttons = this.state.showParagraphs ?
                  <div className="myFavoriteButton"><Button
                          onClick={this.downloadWallAsImg}>Download the Wall of Art</Button>
                        <Button onClick={this.showHistoryModal} disabled={this.state.wallOfArtHistory.length < 1}>Wall of Art History</Button></div> :
                     null;

    let grid = this.state.allCanvasesLoaded ?
               this.createGrid() :
               null ;

    return (
      <div className="App">
        <MainNavbar username={this.state.loggedInUsername} isuserloggedin={this.state.userLoggedIn} logout={this.logout} />
        { paragraphs }
        { rules }
        { buttons }
        <div className="wallWrapper">
          <div className="wallOfArt grid-container">
            {grid}
          </div>
        </div>

        <GridItemModal
         show={this.state.modalShow}
         onHide={modalClose}
         openedcanvasindex={this.state.openedCanvasIndex}
         handleSave={handleSave}
         wallofartversion={this.state.wallOfArtVersion}
         />
        <HistoryModal
         show={this.state.historyModalShow}
         onHide={historyModalClose}
         wallsHistory={this.state.wallOfArtHistory} />
         <DrawedCanvasModal
          show={this.state.drawedModalShow}
          onHide={drawedModalClose}
          imgDataURL={this.state.drawedImgDataURL}
          imgUserId={this.state.drawedModalUserId}
          imgId={this.state.drawedModalId}
          imgUsername={this.state.drawedModalUsername}
          imgUpvotes={this.state.drawedModalUpvotes}
          imgDownvotes={this.state.drawedModalDownvotes} />
      </div>
    );
  }

}

export default App;
