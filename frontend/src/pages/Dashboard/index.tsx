/* eslint-disable jsx-a11y/alt-text */
import React, { useState } from 'react'
import "./styles.css";
import HeaderPage from "../HeaderPage";
import Sidebar from "../Sidebar";
import { Link } from "react-router-dom";
import api from '../../services/api';
import Quotations from '../Quotations';
import ShippingCommodities from '../DashApis/actions';
import QuotatiosActions from '../DashApis/actions';
import QuotationsActions from '../DashApis/actions';
import QuotationsCurrency from '../DashApis/currency';
import DashTeste from '../DashApis/dash-test';
import CommoditiesList from '../DashApis/commodities';



const Dashboard = () => {
  const nameUser = sessionStorage.getItem("name");
  const email = sessionStorage.getItem("user_email");
  const[qtSearch, setqtSearch] = useState(0);
  const[qtBooking, setqtBooking] = useState(0);

  api.post('/user/find_user', {email})
    .then(resp=>{
      setqtSearch(resp.data.user.search ?? 0);
  });

  api.post('/booking/list_booking', {email})
  .then(resp => {
    const totalBooking = resp.data.list.length;
    setqtBooking(totalBooking);
  })

  return (
    <div className="flex-dashboard">
      <Sidebar elementoAtivo="dashboard"/>
      <main>
        <HeaderPage nomeOpcao="Dashboard"/>
          <div className="main-content">
            <div className="container dashboard">
                <div className="row gap-3 mt-3">
                <div className="card border-light col-xl-4 col-lg-12 col-md-12 card-profile" style={{"padding": 0}}>
                  <div
                    className="card-img-top" 
                    style={{"backgroundColor": "#9f9f9f"}}
                  >
                    <h5 className="card-title m-3 mb-4" style={{"color": "white"}}>Bem Vindo!</h5>
                  </div>
                  <img
                    src="https://img.freepik.com/premium-vector/avatar-profile-icon_188544-4755.jpg"
                    alt=""
                    style={{
                      "width": "90px",
                      "height": "50px",
                      "position": "absolute",
                      "top": "50px",
                      "left": "5px",
                      "borderRadius": "8px",
                      "objectFit": "contain",
                    }}
                  />
                  <div className="card-body row m-1">
                    <h4 className="col-8 card-subtitle" style={{"padding": 0}}>{nameUser} </h4>
                    <button className="col-4 btn btn-primary btn-sm">
                      Conta <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>
                </div>
                <div className="card border-light col-xl-2 col-lg-3 col-md-4 col-sm-12 card-dash">
                  <div className="card-body">
                  <img
                    src="/imagens/list.png"
                    alt=""
                    style={{
                      "width": "70px",
                      "height": "35px",
                      "position": "absolute",
                      "top": "5px",
                      "left": "140px",
                      "borderRadius": "8px",
                      "objectFit": "contain",
                    }}
                  />
                    <div className="top-card-dash fs-4 row column-gap-2">
                      <h6 className="col-8 card-title pd-0">Cotações Solicitadas</h6>
                      
                      
                    </div>
                    <h1 className="card-data text-center">{qtSearch}</h1>
                    <div style={{"textAlign":"right"}}>
                      <Link to="/cotacoes">Solicitar Cotação</Link>
                    </div>
                  </div>
                </div>
                <div className="card border-light col-xl-2 col-lg-3 col-md-4 col-sm-12 card-dash">
                  <div className="card-body">
                  <img
                    src="/imagens/ship.svg"
                    alt=""
                    style={{
                      "width": "90px",
                      "height": "35px",
                      "position": "absolute",
                      "top": "5px",
                      "left": "140px",
                      "borderRadius": "8px",
                      "objectFit": "contain",
                    }}
                  />
                    <div className="top-card-dash fs-4 row column-gap-2">
                      <h6 className="col-8 card-title pd-0">Bookings Solicitados</h6>
                      <i className="col-2 bi bi-map pd-0"></i>
                    </div>
                    <h1 className="card-data text-center">{qtBooking}</h1>
                    <div style={{"textAlign":"right"}}>
                      <Link to="/bookings">Detalhes </Link>
                      <img src="/imagens/right.svg" style={{ "width": "35px", "height": "20px"}}></img>
                    </div>
                  </div>
                </div>
                <div className="card border-light col-xl-3 col-lg-12 col-md-8 card-profile" style={{"padding": 0}}>
                  <div className="card-img-top" style={{"backgroundColor": "#9f9f9f", "padding": 10}} >
                    <h5 style={{"color": "white", "textAlign": "center"}}> Solicitar Cotação Instantânea </h5></div>
                    <div style={{"padding": 40}}>
                    <Link to="/cotacoes"> 
                      <button className="col-lg-12 col-md-8 btn btn-primary btn-big" >
                        Cotação Rápida  <i className="bi bi-arrow-right"></i>
                      </button>
                      </Link>
                    </div>
                  </div>
                </div>
                <p></p>
                </div>
              
            </div>
           
      </main>
    </div>
  );
};

export default Dashboard;
