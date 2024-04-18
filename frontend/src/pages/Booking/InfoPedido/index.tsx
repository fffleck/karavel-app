import React, { ChangeEvent, useState } from 'react'
import { Button , Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';
import Accordion from 'react-bootstrap/Accordion';
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { Dayjs } from "dayjs";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchNcm from '../Search/search-ncm';


type informacoesEnviarEmail = {
    armador: string;
    mercadoria: string;
    tipo_mercadoria: string;
    porto_embarque: string;
    porto_descarga: string;
    data_embarque: string;
    tipo_container: string;
    quantidade_containers: number;
    embarcador_nome: string;
    embarcador_email: string;
    embarcador_endereco: string;
    embarcador_cnpj: string;
    embarcador_telefone: string;
    valor: string;
}


const InfoPedido = (props) => {
const [formData, setFormData] = useState<Dayjs | null>(null);
const [qtdContainers, setQtdContainers] = useState<number>(1);
const [nomeEmbarcador, setNomeEmbarcador] = useState('');
const [enderecoEmbarcador, setEnderecoEmbarcador] = useState('');
const [cnpjEmbarcador, setCnpjEmbarcador] = useState('');
const [telefoneEmbarcador, setTelefoneEmbarcador] = useState('');
const [mercadoria, setMercadoria] = useState('');
const [tipoMercadoria, setTipoMercadoria] = useState('');
const email = sessionStorage.getItem("user_email");
const moeda = '$';

let navigate = useNavigate();

let dadosPedido = {
  ...props,
  moeda: props.frete.split[0], //simbolo moeda
  terminal_embarque: "",
  transbordo: "",
  quantidade_containers: qtdContainers,
  embarcador_nome: nomeEmbarcador,
  embarcador_endereco: enderecoEmbarcador,
  embarcador_cnpj: cnpjEmbarcador,
  embarcador_telefone: telefoneEmbarcador,
  valor: Number(props.frete) * qtdContainers,
  mercadoria: mercadoria,
  tipo_mercadoria: tipoMercadoria,
};

const routeChange = () =>{ 
  const path = "/pedido_resultado";
  navigate(path);
}

function handleInputChange(event: ChangeEvent<{ value: unknown }>) {
  const selectedDate = event.value as Dayjs;
  setFormData(selectedDate);
}

function handleInputContainers(event: ChangeEvent<HTMLInputElement>){
  const quantidade = Number(event.target.value);
  
  setQtdContainers(quantidade);
}


api.post('/user/find_user', {email})
.then(resp=>{
  setNomeEmbarcador(resp.data.user.name);
  setEnderecoEmbarcador(resp.data.user.address);
  setCnpjEmbarcador(resp.data.user.cnpj);
  setTelefoneEmbarcador(resp.data.user.telefone);
})
.catch(err =>{
  console.error(err);
})


var precoTotal = dadosPedido.valor;

const informacoesEnviarEmail:informacoesEnviarEmail = {
  armador: props.armador,
  mercadoria: mercadoria,
  tipo_mercadoria: tipoMercadoria,
  porto_embarque: props.porto_embarque,
  porto_descarga: props.porto_descarga,
  data_embarque: props.data_embarque,
  tipo_container: props.tipo_container,
  quantidade_containers: Number(qtdContainers),
  embarcador_nome: nomeEmbarcador,
  embarcador_email: email,
  embarcador_cnpj: cnpjEmbarcador,
  embarcador_telefone: telefoneEmbarcador,
  embarcador_endereco: enderecoEmbarcador,
  valor: `${moeda} ${precoTotal}`,
  
}

const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const sendEmailAnalisys = async (event) => {
  event.preventDefault();

  await api.post('/email/send_analysis', informacoesEnviarEmail)
  .then((res) => {
    console.log("Enviado para análise");
  })
  .catch(err => {
    console.log("Ocorreu um problema ao enviar e-mail para análise");
  })
}

const sendEmailClient = async (event) => {
  event.preventDefault();

  await api.post('/email/send_client', informacoesEnviarEmail)
  .then((res) => {
    console.log("Enviado para cliente");
  })
  .catch(err => {
    console.log("Ocorreu um problema ao enviar e-mail para o cliente");
  })
}

const saveBooking = async (event) => {
  event.preventDefault();
  await api.post('/booking/save_booking', informacoesEnviarEmail)
  .then((res) => {
    console.log("Booking salvo");
  })
  .catch(err => {
    console.log("Ocorreu um problema ao salvar o booking no banco de dados");
  })
}

const sendBookingReserva = async (event) => {

  event.preventDefault()

  const dataToSend = {
      ...dadosPedido,
      formData: formData?.format('YYYY-MM-DD') ?? null,
      qtdContainers,
      mercadoria,
      tipoMercadoria,
      ...extractFormData()
  };


  try {
      await api.post('/booking/reservas', dataToSend);
      console.log("Booking reservado com sucesso");
      sendEmailAnalisys(event);
      sendEmailClient(event);
      saveBooking(event);
      routeChange();
  } catch (error) {
      console.error("Ocorreu um problema ao reservar o booking:", error);
  }
}

const extractFormData = () => {
  const formElements = document.querySelectorAll('input, select, textarea');
  const formData = {};
  formElements.forEach((element: any) => {
      formData[element.name] = element.value || null;
  });
  return formData;
};

const handleSubmit = async (event) => {
  event.preventDefault();

  const form = event.currentTarget;
  const formData = new FormData(form);

  const dataToSend = {};
  formData.forEach((value, key) => {
      dataToSend[key] = value;
  });

  try {
    await api.post('/booking/reservas', dataToSend);
    console.log('Dados do formulário enviados com sucesso para o backend.');
    sendEmailAnalisys(event);
    sendEmailClient(event);
    saveBooking(event);
    routeChange(); // Redireciona para a próxima página após o envio bem-sucedido
  } catch (error) {
    console.error('Erro ao enviar dados do formulário para o backend:', error);
  }
}

return (  
  <form className="form"  onSubmit={sendBookingReserva}>
    <div className="col-md-12">
      <section className="pedido-reserva">
        <div className="topo">
          <h2 className="titulo-secao">Novo Booking</h2>
        </div>
        <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>General Details</Accordion.Header>
                <Accordion.Body>
                    <div className='row'>
                        <div className="col-md-4">
                        <Form.Label htmlFor="selectCarrier"> Carrier / NVOCC / Booking Agent </Form.Label>
                        <Form.Select id="selectCarrier" name='selectCarrier' aria-label="Default select example">
                          <option>Select ...</option>
                          <option value="1">One</option>
                          <option value="2">Two</option>
                          <option value="3">Three</option>
                          <option value="4">Four</option>
                          <option value="5">Five</option>
                        </Form.Select>
                        </div>
                        <div className="col-md-4">
                        <Form.Label htmlFor="inputContracNumber"> Contract Number </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputContracNumber"
                          name="inputContracNumber"
                          aria-required="true"
                          aria-describedby="inputContracNumber"
                        />
                        <Form.Text id="inputContracNumber"></Form.Text>
                        </div>
                        <div className="col-md-4 right">
                        <Form.Label htmlFor="inputContracNumber"> Booking Office </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputBookingOffice"
                          name="inputBookingOffice"
                          aria-required="true"
                          aria-describedby="inputBookingOffice"
                        />
                        <Form.Text id="inputBookingOffice"></Form.Text>
                        </div>
                      </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="1">
                <Accordion.Header> Parties </Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-4">
                      <Form.Label htmlFor="inputShipper"> Shipper </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputShipper"
                          name="inputShipper"
                          aria-required="true"
                          aria-describedby="inputShipper"
                        />
                        <Form.Text id="inputShipper"></Form.Text>
                      </div>

                      <div className="col-md-4">
                      <Form.Label htmlFor="inputForwarder"> Forwarder </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputForwarder"
                          name="inputForwarder"
                          aria-required="true"
                          aria-describedby="inputForwarder"
                          disabled="true"
                          value={"Zarpar Trade"}
                        />
                        <Form.Text id="inputForwarder"></Form.Text>
                      </div>

                      <div className="col-md-4">

                      <Form.Label htmlFor="inputConsignee"> Consignee </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputConsignee"
                          name="inputConsignee"
                          aria-required="true"
                          aria-describedby="inputConsignee"
                        />
                        <Form.Text id="inputConsignee"></Form.Text>
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="2">
                <Accordion.Header> References </Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-4">
                      <Form.Label htmlFor="inputshipperRefNumber"> Shipper Reference Number </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputshipperRefNumber"
                          name="inputshipperRefNumber"
                          aria-required="true"
                          aria-describedby="inputshipperRefNumber"
                        />
                        <Form.Text id="inputshipperRefNumber"></Form.Text>
                      </div>

                      <div className="col-md-4">
                      <Form.Label htmlFor="inputforwardRefNumber"> Forwarder's Reference Number </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputforwardRefNumber"
                          name="inputforwardRefNumber"
                          aria-required="true"
                          aria-describedby="inputforwardRefNumber"
                        />
                        <Form.Text id="inputforwardRefNumber"></Form.Text>
                      </div>

                      <div className="col-md-4">
                      <Form.Label htmlFor="inputpurchaseOrderNumber">Purchase Order Number</Form.Label>
                        <Form.Control
                          type="text"
                          id="inputpurchaseOrderNumber"
                          name="inputpurchaseOrderNumber"
                          aria-required="true"
                          aria-describedby="inputpurchaseOrderNumber"
                        />
                        <Form.Text id="inputpurchaseOrderNumber"></Form.Text>
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="3">
                <Accordion.Header> Transpor </Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-4">
                      <Form.Label htmlFor="selectMoveType"> Move Type</Form.Label>
                        <Form.Select id="selectMoveType" name="selectMoveType" aria-label="Default select">
                          <option>Select ...</option>
                          <option value="PortToPort">Port, Ramp, or CY to Port, Ramp, or CY</option>
                          <option value="DoorToPort">Door to port, Ramp, or Cy </option>
                          <option value="DoorToDoor">Door to Door</option>
                          <option value="PortToDoor">Port Ramp, or Cy to Door</option>
                        </Form.Select>
                      </div>

                      <div className="col-md-4">
                      <Form.Label htmlFor="inputplacecarrierreceipt"> Place of Carrier Receipt </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputplacecarrierreceipt"
                          name="inputplacecarrierreceipt"
                          aria-required="true"
                          aria-describedby="inputplacecarrierreceipt"
                        />
                        <Form.Text id="inputplacecarrierreceipt"></Form.Text>
                      </div>

                      <div className="col-md-4">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disablePast
                          label="Early Departure Date"
                          className="data"
                          name="dateDepartureEarly"
                          defaultValue={""}
                          value={formData}
                          onChange={handleInputChange}
                        />
                      </LocalizationProvider>
                      </div>
                  </div>
                  <p></p>
                  <div className='row'>
                      <div className="col-md-4">
                      </div>
                      <div className="col-md-4">
                      <Form.Label htmlFor="inputplacecarrierreceipt"> Place of Carrier Delivery</Form.Label>
                        <Form.Control
                          type="text"
                          id="inputplacecarrierreceipt"
                          name="inputplacecarrierreceipt"
                          aria-required="true"
                          aria-describedby="inputplacecarrierreceipt"
                        />
                        <Form.Text id="inputplacecarrierreceipt"></Form.Text>
                      </div>

                      <div className="col-md-4">
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <DatePicker
                          disablePast
                          label="Latest Delivery Date"
                          className="data"
                          name="dateDeliveryLatest"
                          defaultValue={""}
                          value={formData}
                          onChange={handleInputChange}
                        />
                      </LocalizationProvider>
                      </div>
                  </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="4">
                <Accordion.Header> Containers </Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-4">
                        <p className="item-ajuste__titulo">Quantidade de Containers</p>
                        <input type="number" name='qtdContainers' min={1} value={dadosPedido.quantidade_containers} onChange={handleInputContainers} className="espacamento"/>
                      </div>
                      <div className="col-md-1">
                      </div>
                      <div className="col-md-7">
                        <p className="item-ajuste__titulo">Tipo de Container</p>
                        <input type="text" name='typeContainer' value={dadosPedido.tipo_container} disabled className="espacamento"/>
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="5">
                <Accordion.Header> Cargo </Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                    <p className="item-ajuste__titulo"> Digite parte do nome da mercadoria</p>
                      <div className="col-md-12">
                      <SearchNcm mercadoria={mercadoria} />
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="6">
                <Accordion.Header>Payments Details</Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-4">
                        <Form.Label htmlFor="selectPaymentChargeType"> Charge Type</Form.Label>
                        <Form.Select id="selectPaymentChargeType"  name="selectPaymentChargeType" aria-label="Default select example">
                          <option>Select ...</option>
                          <option value="Additional">Additional Charges</option>
                          <option value="OceanFreight">Basic Freight</option>
                          <option value="DestinationHaulage">Destination Haulage Charges</option>
                          <option value="DetinationTerminalHandling">Destination Port Charges</option>
                          <option value="OriginTerminalHandling">Origin Port Charges</option>
                          <option value="DestinationHaulage">Destination Haulage Charges</option>
                        </Form.Select>
                      </div>
                      <div className="col-md-2">
                        <Form.Label htmlFor="selectPaymentTerm"> Payment Term</Form.Label>
                        <Form.Select id="selectPaymentTerm" name="selectPaymentTerm" aria-label="Default select example">
                          <option>Select ...</option>
                          <option value="Prepaid">Pre-paid</option>
                          <option value="Collect">Collect</option>
                          <option value="PayableElsehere">Payable Elsewhere</option>
                        </Form.Select>
                      </div>

                      <div className="col-md-3">
                        <Form.Label htmlFor="selectPayer"> Payer </Form.Label>
                        <Form.Select id="selectPayer" name="selectPayer" aria-label="Default select example">
                          <option>Select ...</option>
                          <option value="2">Booker</option>
                          <option value="5">Consignee</option>
                          <option value="6">Contract Party</option>
                          <option value="4">Forwarder</option>
                          <option value="7">Main Notify Party</option>
                          <option value="8">First Additional Notify Party</option>
                          <option value="9">Second Additional Notify Party</option>
                          <option value="3">Shipper</option>
                        </Form.Select>
                      </div>

                      <div className="col-md-3">
                      <Form.Label htmlFor="inputPaymentLocation"> Payment Location </Form.Label>
                        <Form.Control
                          type="text"
                          id="inputPaymentLocation"
                          name="inputPaymentLocation"
                          aria-required="true"
                          aria-describedby="inputPaymentLocation"
                        />
                        <Form.Text id="inputPaymentLocation"></Form.Text>
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
              <p></p>
              <Accordion.Item eventKey="7">
                <Accordion.Header>Comments & Notifications</Accordion.Header>
                <Accordion.Body>
                  <div className='row'>
                      <div className="col-md-12">
                      <Form.Label htmlFor="inputCustomerComment"> Customer Comments </Form.Label>
                        <Form.Control
                          as="textarea"
                          id="inputCustomerComment"
                          name="textAreaCustomerComment"
                          rows={3}
                          aria-describedby="inputCustomerComment"
                        />

                      </div>

                      <div className="col-md-12">
                      <Form.Label htmlFor="inputPartnerEmailNotifications"> Partner Email Notifications </Form.Label>
                        <Form.Control
                          type="email"
                          id="inputPartnerEmailNotifications"
                          name="inputPartnerEmailNotifications"
                          aria-describedby="inputCustomerComment"
                        />
                      </div>
                    </div>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion> 
      </section>
      <section className="pedido-reserva">
        <div className='row'>
          <div className="col-md-12">
          <h2 className="titulo-secao">SubTotal da reserva</h2> 
          <div className="item-ajuste">
              <p className="item-ajuste__titulo">Porto de Embarque</p>
              <input type="text" value={dadosPedido.porto_embarque} disabled className="espacamento"/>
          </div>
          <div className="item-ajuste">
              <p className="item-ajuste__titulo">Porto de Descarga</p>
              <input type="text" value={dadosPedido.porto_descarga} disabled className="espacamento"/>
          </div>
          <div className="item-ajuste">
              <p className="item-ajuste__titulo">Data de Embarque</p>
              <input type="text" value={dadosPedido.data_embarque} disabled className="espacamento"/>
          </div>
          <h2 className="valor-frete">Total Frete a Pagar</h2> 
          <p className="preco">{`${USDollar.format(precoTotal)}`}</p>
          </div>
        </div>
        <Button type="submit" className="botao">Reservar</Button>
      </section>
    </div>
    
  </form>
)
}

export default InfoPedido;