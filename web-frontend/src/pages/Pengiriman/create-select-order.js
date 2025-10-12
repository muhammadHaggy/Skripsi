import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import { Loading } from "../../components/Loading";
import Button from "../../components/Button";
import { ImportBaseTable } from "../../components/ImportBaseTable";
import { SelectColumnFilter, ActionButtons} from "../../components/BaseTable";
import { Modal } from "../../components/Modal";
import axiosAuthInstance from "../../utils/axios-auth-instance";
import { BsChevronDown } from "react-icons/bs";
import { Dropdown } from "../../components/Dropdown";
import { checkAttributeNull } from "../../utils/utils";

function dateFormat(date) {
  const etaDate = new Date(date);
  const year = etaDate.getFullYear();
  const month = String(etaDate.getMonth() + 1).padStart(2, "0");
  const day = String(etaDate.getDate()).padStart(2, "0");
  const formattedETA = `${day}-${month}-${year}`;
  return formattedETA;
}

function dateFormatDB(date) {
  const etaDate = new Date(date);
  const year = etaDate.getFullYear();
  const month = String(etaDate.getMonth() + 1).padStart(2, "0");
  const day = String(etaDate.getDate()).padStart(2, "0");
  const formattedETA = `${year}-${month}-${day}`;
  return formattedETA;
}

function CreatePengirimanSelectOrder() {
    let navigate = useNavigate();
    const [dataOrder, setDataOrder] = useState([]);
    const [dataDC, setDataDC] = useState([]);
    const [showLoading, setShowLoading] = useState(true); 
    const [isPilihanClusterOpen, setIsPilihanClusterOpen] = useState(true);
    const [isPilihanOriginOpen, setIsPilihanOriginOpen] = useState(true);
    const [isPilihanOrderOpen, setIsPilihanOrderOpen] = useState(true);
    const [dataTruk, setDataTruk] = useState([]);
    const [orderEg, setOrderEg] = useState();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [originDropdown, setOriginDropdown] = useState(null);
    const [selectedDC, setSelectedDC] = useState(null);
    // const dc_id= localStorage.getItem("dcId");   
    const [dc_id, setDCId] = useState(localStorage.getItem("dcId"));
    const userRole= localStorage.getItem("userRole");    

    useEffect(() => {
      if (dataDC.length === 0) {
        axiosAuthInstance.get("/api/locations" , {
          params: {
            is_dc : true
          }
        }).then((response) => {
            const dcData = response.data.data.map((item) => ({ 
                value: item.dc_id,
                name: item.name,
            }));
            setDataDC(dcData);
            console.log(dcData);
            setShowLoading(false)
        });
      }
    }, [dataDC]);

    useEffect(() => {
      const formattedDate = dateFormatDB(selectedDate);
      if (userRole === "Super"){
        axiosAuthInstance.get(`/api/orders`, {
          params: {
            order_date: formattedDate,
            status: 'OPEN',
            has_manifest: false,
            dc_id: selectedDC
          }
        }).then((response) => {
            setDataOrder(response.data.data);
            setShowLoading(false);
            if (response.data.data.length > 0) {
                setOrderEg(response.data.data[0]);
            }
          });
        if (dataTruk.length === 0) {
          axiosAuthInstance.get("/api/trucks")
          .then((response) => {
            setDataTruk(response.data.data);
            setShowLoading(false)
          });
        }
      }else{
        setSelectedDC(dc_id);
        axiosAuthInstance.get(`/api/orders`, {
          params: {
            order_date: formattedDate,
            status: 'OPEN',
            has_manifest: false,
            dc_id: dc_id
          }
        }).then((response) => {
            setDataOrder(response.data.data);
            setShowLoading(false);
            if (response.data.data.length > 0) {
                setOrderEg(response.data.data[0]);
            }
          });
        if (dataTruk.length === 0) {
          axiosAuthInstance.get("/api/trucks",{
            params: {
              dc_id: dc_id
            }
          }).then((response) => {
            setDataTruk(response.data.data);
            setShowLoading(false)
          });
        }
      }
    }, [selectedDate, dataTruk, originDropdown, selectedDC]);

    const columns = React.useMemo(
        () => [
          {
            id: "order_num",
            Header: "Nomor Order",
            accessor: "order_num",
            Cell: props => {
              const { original } = props.cell.row;
              return ( <>
                <div
                    style={{
                      textAlign:"left",
                    }}
                  >{props.value}</div> </>
              )
            },
          },
          {
            Header: "Tanggal Order",
            accessor: "order_date",
            Filter: SelectColumnFilter,  
            filter: 'includes',
            Cell: props => {
              const etaDate = new Date(props.value);
              const year = etaDate.getFullYear();
              const month = String(etaDate.getMonth() + 1).padStart(2, "0");
              const day = String(etaDate.getDate()).padStart(2, "0");
              const formattedETA = `${day}-${month}-${year}`;
              return formattedETA;
            },
          },
          {
            Header: "Asal",
            accessor: "loc_ori.name",
            Filter: SelectColumnFilter,
            filter: 'includes',
          },
          {
            Header: "Destinasi",
            accessor: "loc_dest.name",
            Filter: SelectColumnFilter,  
            filter: 'includes',
          },
          {
            Header: "Volume (ml)",
            accessor: "volume",
            Filter: SelectColumnFilter,  
            filter: 'includes',
          },
          {
            id: "action",
            Header: "Action",
            accessor: (row) => [
              "Order",
              row.id
            ],
            Cell: props => {
              return ( <>
                <div className="flex justify-center items-center">
                  {ActionButtons({value: props.value, createCluster: true})}
                </div> 
                </>
              )
            },
          },
        ],
        []
    );
    
    const [isOpenConfirmation, setIsOpenConfirmation] = useState(false); 
    const [isOpenError, setIsOpenError] = useState(false); 
    const [isOpenSuccess, setIsOpenSuccess] = useState(false);
    const [isCanceled, setIsCanceled] = useState(false);
    const [canceledDesc, setCanceledDesc] = useState("");
    const [isError, setIsError] = useState(false); 
    const [selectedData, setSelectedData] = useState([]);
    const [selectedId, setSelectedId] = useState([]);
    const [clusterDropdown, setClusterDropdown] = useState(null);

    const clusterTypes = [
      { name: 'Auto by System', value: "DBSCAN_KMEANS" },
    ]

    const [clusterData, setClusterData] = useState([]);

    const handleDropdownChange = (selectedValue) => {
        setClusterDropdown(selectedValue);
    };

    const handleOriginDropdownChange = (selectedValue) => {
      setOriginDropdown(selectedValue);
      setSelectedDC(selectedValue.value);
      setDCId(selectedValue.value);
    };

    const handleChildData = (data) => {
        setSelectedData(data);
        setSelectedId(data.map(item => ({ "order_id": item.id })))
    }

    const cekPengiriman = async (e) => {
      e.preventDefault();
      setShowLoading(true);
      const isTruckAvailable = dataTruk.some(truk => truk.first_status === "AVAILABLE");

      if (isTruckAvailable) {
        if (selectedId.length == 0) {
          setCanceledDesc("Harap memilih order.")
          setIsCanceled(true);
        }
        else if (selectedId.length < 2) {
          setCanceledDesc("Gagal membuat pengiriman, order minimal berjumlah 2.")
          setIsCanceled(true);
        }
        else {
          setIsOpenConfirmation(true);
        }
      }
      else {
        setIsCanceled(true);
        setCanceledDesc("Gagal membuat pengiriman, tidak ada truk yang tersedia.");
      }
    
      setShowLoading(false);
    };
    
    const createPengiriman = async (e) => {
      e.preventDefault();
      setIsOpenConfirmation(false);
    
      try {
        setShowLoading(true);
        const response = await axiosAuthInstance.post("/api/opt/load", selectedId, {
          headers: {
            // 'Cluster-Type': clusterDropdown.value
            'Cluster-Type': "DBSCAN_KMEANS",
            'dc_id': dc_id,
            "algo_type": "google_or"
          }
        });

        if (response.status === 200) {
          setClusterData(response.data.data);
          setShowLoading(false);
          setIsOpenSuccess(true);
        }
      } catch (err) {
        setShowLoading(false);
    
        if (err.response && err.response.data && err.response.data.error) {
          console.log(err.response.data.error);
        } else {
          console.log("An error occurred:", err);
        }
    
        setIsOpenError(true);
      }
    };
    
    const linkRef = useRef(null);
    const redirectClick = () => {
      linkRef.current.click();
    };
    
    return (
        <div className="relative h-full pb-[30px]">
            <Loading visibility={showLoading} />
            <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Buat Cluster" description="Anda yakin ingin membuat cluster baru?" rightButtonText="Yakin" 
            onClickRight={createPengiriman} leftButtonText="Batal"/>

            <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil membuat cluster." rightButtonText="Visualisasi" onClickRight={redirectClick}/>
            <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal membuat cluster." rightButtonText="Ulangi"/>
            
            <Modal variant="danger" isOpen={isCanceled} closeModal={() => setIsCanceled(false)} description={canceledDesc} rightButtonText="Ulangi"/>
            
            {/* <div className={`px-[50px] pt-[30px] ${showLoading ? "hidden" : "visible"}`}>
                <div className={`bg-white
                    ${
                        isPilihanClusterOpen ? "overflow-visible rounded-t-lg" : "overflow-hidden rounded-lg"
                    }`}>
                    <div className="py-5 px-6 bg-primary-hover flex items-center justify-between rounded-t-lg cursor-pointer" onClick={() => setIsPilihanClusterOpen(!isPilihanClusterOpen)}>
                        <h4 className="text-white">1. Pilih Level Cluster</h4>
                        <div className="flex items-center">
                        <BsChevronDown
                            className={`text-white transition-transform transform ${
                                isPilihanClusterOpen ? "rotate-180" : ""
                        }`}/>
                        </div>
                    </div>
                    <div
                        className={`transition-max-h ease-in-out duration-300  shadow-inset-outline ${
                            isPilihanClusterOpen ? "max-h-[500px] p-6" : "max-h-0 p-0"
                        }`}
                    >
                        <Dropdown placeholder="Berdasarkan: Provinsi" label="Level Cluster" data={clusterTypes} className="w-full" required={true} value={clusterDropdown} onChange={handleDropdownChange} isError={isError && checkAttributeNull(clusterDropdown)}/>
                    </div>
                </div>
            </div> */}

            {userRole === "Super"? 
              <div className={`px-[50px] pt-[10px] ${showLoading ? "hidden" : "visible"}`}>
                  <div className={`bg-white 
                      ${
                          isPilihanOriginOpen ? "overflow-visible rounded-t-lg" : "overflow-hidden rounded-lg"
                      }`}>
                      <div className="py-5 px-6 bg-primary-hover flex items-center justify-between rounded-t-lg cursor-pointer" onClick={() => setIsPilihanOriginOpen(!isPilihanOriginOpen)}>
                          <h4 className="text-white">1. Pilih Origin</h4>
                          <div className="flex items-center">
                          <BsChevronDown
                              className={`text-white transition-transform transform ${
                                isPilihanOriginOpen ? "rotate-180" : ""
                          }`}/>
                          </div>
                      </div>
                      <div
                          className={`transition-max-h ease-in-out duration-300  shadow-inset-outline ${
                            isPilihanOriginOpen ? "max-h-[500px] p-6" : "max-h-0 p-0"
                          }`}
                      >
                          <Dropdown placeholder="Berdasarkan: DC Jakarta" label="Origin" data={dataDC} className="w-full" required={true} value={originDropdown} onChange={handleOriginDropdownChange} isError={isError && checkAttributeNull(originDropdown)}/>
                      </div>
                  </div>
              </div>
            :null}

            <div className={`px-[50px] pt-[10px] ${showLoading ? "hidden" : "visible"}`}>
              <div className={`bg-white 
                      ${
                          isPilihanOrderOpen ? "overflow-visible rounded-t-lg" : "overflow-hidden rounded-lg"
                      }`}>
                      <div className="py-5 px-6 bg-primary-hover flex items-center justify-between rounded-t-lg cursor-pointer" onClick={() => setIsPilihanOrderOpen(!isPilihanOrderOpen)}>
                          {userRole === "Super"? 
                            <h4 className="text-white">2. Pilih Order</h4>
                            :
                            <h4 className="text-white">1. Pilih Order</h4>
                          }
                          <div className="flex items-center">
                              <BsChevronDown
                                  className={`text-white transition-transform transform ${
                                      isPilihanOrderOpen ? "rotate-180" : ""
                              }`}/>
                          </div>
                      </div>
                      <div
                          className={`transition-max-h ease-in-out duration-300 shadow-inset-outline ${
                              isPilihanOrderOpen ? " p-6" : "max-h-0 p-0"
                          }`}
                      >
                        {userRole === "Super" ?
                          originDropdown !== null ? 
                            <ImportBaseTable columns={columns} data={dataOrder} dataLength={dataOrder.length} judul={`Order`} onDataSelected={handleChildData} selectedDate={selectedDate} onDateChange={setSelectedDate} orderDate={orderEg!= null? dateFormat(orderEg.order_date) : null} selectOrderPengiriman={true} />
                            :
                            <div className="flex flex-col items-center">
                                <p className="font-[500]">Anda Belum Memilih Origin</p>
                                <p>Silahkan pilih origin untuk melihat data order</p>
                            </div>
                          :
                          <ImportBaseTable columns={columns} data={dataOrder} dataLength={dataOrder.length} judul={`Order`} onDataSelected={handleChildData} selectedDate={selectedDate} onDateChange={setSelectedDate} orderDate={orderEg!= null? dateFormat(orderEg.order_date) : null} selectOrderPengiriman={true} />
                        }
                      </div>
              </div>
            </div>
            
            <div className={`flex justify-center gap-4 py-[30px] ${showLoading ? "hidden" : "visible"}`}>
                <Button className="text-button btn-primary-outline" label="Kembali" onClick={() => navigate("/pengiriman")}/>
                <Button className="text-button btn-primary" label="Simpan" onClick={cekPengiriman}/>
                <Link to={"/pengiriman/visualise-cluster"} state={{
                  dataCluster: clusterData,
                  dcID: dc_id,
                }} ref={linkRef}/>
            </div>
        </div>
    )
}

export default CreatePengirimanSelectOrder;