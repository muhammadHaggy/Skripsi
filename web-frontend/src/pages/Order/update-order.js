import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "../../components/Button";
import { Dropdown } from "../../components/Dropdown";
import { TextField } from "../../components/TextField";
import React, { forwardRef, useEffect, useState } from "react";
import { Loading } from "../../components/Loading";
import {Modal} from "../../components/Modal";
import { checkAttributeNull } from "../../utils/utils";
import axiosAuthInstance from "../../utils/axios-auth-instance";
import DatePicker from "react-datepicker";
import { BsCalendarEvent } from "react-icons/bs";
// import "react-datepicker/dist/react-datepicker.css";

function formatDateETA(dateTimeString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
    return new Date(dateTimeString).toLocaleDateString('id-ID', options);
}

function formatDateETD(dateTimeString) {
    const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
    return new Date(dateTimeString).toLocaleDateString('id-ID', options);
}

function UpdateOrder() {
    let navigate = useNavigate();
    const location = useLocation();
    const orderId = location.state.Id;
    const companyId = location.state.CompanyId;
    const companyName = {value: location.state.CompanyName, name:location.state.CompanyName};
    const dc_id= localStorage.getItem("dcId");    

    //Handle Create Req
    const [isOpenConfirmation, setIsOpenConfirmation] = useState(false); 
    const [isOpenError, setIsOpenError] = useState(false); 
    const [isOpenSuccess, setIsOpenSuccess] = useState(false); 
    const [isError, setIsError] = useState(false); 

    const [statusDropdown, setStatusDropdown] = useState(null);
    const [destinasiDropdown, setDestinasiDropdown] = useState(null);
    const [asalDropdown, setAsalDropdown] = useState(null);
    const [dcName,setDcName] = useState(null);

    const [dataStatus, setDataStatus] = useState([]);
    const [dataDestinasi, setDataDestinasi] = useState([]);

    const [showLoading, setShowLoading] = useState(true); 

    const [updateOrderData, setUpdateOrderData] = useState({
        id: null,
        order_num: null,
        description:null,
        volume:null,
        quantity:null,
        eta:null,
        etd:null,
        loc_ori_id: null,
        loc_dest_id: null,
        loc_dest:null,
        loc_ori: null,
        company_name: null,
        status: null
    });

    useEffect(() => {
        async function fetchDataDestinasi(){
            if (dataDestinasi.length === 0) {
                axiosAuthInstance.get("/api/locations",{
                    params: {
                      dc_id: dc_id
                    }
                  }
                ).then((response) => {
                    const responseData = response.data.data;
                    responseData.forEach(loc => {
                        if(loc.company.id === companyId){
                            dataDestinasi.push(loc);
                        }
                    });
                });
            }
        }

        async function fetchDataStatus(){
            if (dataStatus.length === 0) {
                axiosAuthInstance.get("/api/order/status").then((response) => {
                    const responseData = response.data.data.map((item) => {
                        if (item === 'OPEN'){
                            dataStatus.push({value: item, name: "Belum Diproses"})
                        }
                        else if (item === 'NOT_ELIGIBLE'){
                            dataStatus.push({value: item, name: "Tidak Disetujui"})
                        }}
                    )
                })
                setShowLoading(false);
            };
        }

        async function fetchDataOrder() {
          if (updateOrderData.id === null) {
            try {
                const response = await axiosAuthInstance.get(`/api/order/${orderId}`);
                const responseData = response.data.data;
                const orderData = {
                id: responseData.id,
                order_num: responseData.order_num,
                description: responseData.description,
                volume: responseData.volume,
                quantity: responseData.quantity,
                eta: responseData.eta,
                etd: responseData.etd,
                eta_target: new Date(responseData.eta_target),
                loc_ori_id: responseData.loc_ori_id,
                loc_dest_id: responseData.loc_dest_id,
                loc_dest: responseData.loc_dest,
                loc_ori: responseData.loc_ori,
                status: responseData.status,
                company_name: companyName
                };
        
                setUpdateOrderData(orderData);
                setDestinasiDropdown({
                    name: (orderData.loc_dest.name),
                    value: (orderData.loc_dest.name)
                });
                setDcName({
                    name: (responseData.loc_dest.dc.name),
                    value: (responseData.loc_dest.dc.name)
                });
                if (responseData.status === 'OPEN'){
                    setStatusDropdown({
                        name: 'Belum Diproses',
                        value: responseData.status,
                    });
                }else if (responseData.status === 'NOT_ELIGIBLE'){
                    setStatusDropdown({
                        name: 'Tidak Disetujui',
                        value: responseData.status,
                    });
                }
                console.log(orderData);
            } catch (error) {
                console.error("Error fetching order data:", error);
            }}
        }

        async function fetchData() {
            await fetchDataDestinasi();
            await fetchDataStatus();
            await fetchDataOrder();
            setShowLoading(false);
          }
        
          fetchData();
      }, [updateOrderData]);
      

    const handleInputChange = (name, value) => {
        setUpdateOrderData({ ...updateOrderData, [name]: value });
    };

    const handleDateChange = (date) => {
        handleInputChange('eta_target', date);
        console.log(date);
    };
    
    const handleDestinasiDropdownChange = (selectedValue) => {
        setDestinasiDropdown(selectedValue);
        setAsalDropdown(
            {
                name: selectedValue.dc.name,
                value: selectedValue.dc.name,
            });
        setUpdateOrderData({
            ...updateOrderData,
            loc_dest_id: selectedValue.id,
            loc_dest: selectedValue,
            loc_ori: selectedValue.dc,
            loc_ori_id: selectedValue.dc.id
        });
    };

    const handleStatusDropdownChange = (selectedValue) => {
        setStatusDropdown(selectedValue);
        setUpdateOrderData({
            ...updateOrderData,
            status: selectedValue.value
        });
    };

    const handleSubmit = () => {
        if (updateOrderData.id == null ||
            updateOrderData.order_num == null ||
            updateOrderData.description == null ||
            updateOrderData.volume == null ||
            updateOrderData.quantity == null ||
            updateOrderData.loc_ori_id == null ||
            updateOrderData.loc_dest_id == null ||
            updateOrderData.loc_dest == null ||
            updateOrderData.loc_ori == null ||
            updateOrderData.status == null ) {
            setIsOpenError(true)
            setIsError(true)
        }
        else {
            setIsOpenConfirmation(true)
        }
    }

    const updateOrder = async (e) => {
        e.preventDefault();
        setIsOpenConfirmation(false)
        const updateOrderFormat = {
            id: updateOrderData.id,
            loc_ori_id: updateOrderData.loc_ori_id,
            loc_dest_id: updateOrderData.loc_dest_id,
            status: updateOrderData.status,
            eta_target: updateOrderData.eta_target
        };
        axiosAuthInstance
        .put("/api/order", updateOrderFormat)
        .then((response) => {
            if (response.status == 200){
                setShowLoading(false)
                setIsOpenSuccess(true)
            };
        }
        ).catch(err => {
            setShowLoading(false)
            setIsOpenError(true)
        });
    }

    const [selectedDate, setSelectedDate] = useState(new Date());

    const CustomInput = forwardRef(({ value, onClick }, ref) => (
        <div className="block min-w-[25%] rounded-md border-0 py-2 px-2 m-p-reg shadow-sm ring-1 ring-inset ring-neutral-40 focus:ring-1 focus:ring-inset focus:ring-primary focus:outline-none sm:text-sm sm:leading-6 disabled:bg-neutral-30 disabled:placeholder-neutral-60" 
        onClick={onClick} 
        >
            {value}
        </div>
      ));
      
    return (
        <div className="relative h-full">
            <Loading visibility={showLoading} />
            <Modal variant="primary" isOpen={isOpenConfirmation} closeModal={() => setIsOpenConfirmation(false)} title="Update Order" description="Anda yakin ingin menyimpan data order?" rightButtonText="Yakin" 
            onClickRight={updateOrder} leftButtonText="Batal"/>

            <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil menyimpan data order." rightButtonText="Selesai" onClickRight={() => navigate("/order")}/>
            <Modal variant="danger" isOpen={isOpenError} closeModal={() => setIsOpenError(false)} description="Gagal menyimpan data order." rightButtonText="Ulangi"/>

            <div className={`px-[50px] py-[30px] ${showLoading ? "hidden" : "visible"}`}>
                <div className="p-8 bg-white rounded-lg">
                    <h4>Masukan Data Order</h4>
                    <div className="pt-4">
                        <TextField label="Nomor Order"  required={true} className="w-full" value={updateOrderData.order_num} disabled={true}/>
                        <TextField label="Deskripsi" required={true} className="w-full" value={updateOrderData.description} disabled={true}/>

                        <div className="flex">
                            <div className="w-[50%]">
                                <TextField label="Kuantitas" required={true} className="w-full" value={updateOrderData.quantity} disabled={true}/>
                            </div>
                            <div className="w-[50%]">
                                <TextField label="Volume (ml)" required={true} className="w-full" value={updateOrderData.volume} disabled={true}/>
                            </div>
                        </div>
                        <div className="flex">
                            <div className="w-[50%]">
                                <TextField label="Estimate Time Arrival (ETA)" required={true} className="w-full" value={updateOrderData.eta == null ? '-' : formatDateETA(updateOrderData.eta)} disabled={true}/>
                            </div>
                            <div className="w-[50%]">
                                <TextField label="Estimate Time Delivery (ETD)" required={true} className="w-full" value={updateOrderData.eta == null ? '-' : formatDateETD(updateOrderData.etd)} disabled={true}/>
                            </div>
                        </div>
                        {/* <TextField label="Target Estimate Time Arrival (ETA)" required={true} className="w-full" value={formatDateETD(updateOrderData.eta_target)} onChange={(e) => handleInputChange("eta_target", e.target.value)} isError={isError && checkAttributeNull(updateOrderData.eta_target)}/> */}
                        <div className="sm:col-span-3 p-2">
                            <label className="block m-p-med leading-6">
                                Target Estimate Time Arrival (ETA)
                            </label>

                            <div className="flex mt-1 min-w-full w-">
                                <DatePicker
                                    // selected={selectedDate}
                                    selected={updateOrderData.eta_target}
                                    onChange={handleDateChange}
                                    wrapperClassName="w-full"
                                    className="min-w-[25%] w-full rounded-md border-0 py-2 px-2 m-p-reg shadow-sm ring-1 ring-inset ring-neutral-40 focus:ring-1 focus:ring-inset focus:ring-primary focus:outline-none sm:text-sm sm:leading-6 disabled:bg-neutral-30 disabled:placeholder-neutral-60"
                                    dateFormat="dd/MM/yyyy"
                                    required
                                    // customInput={<CustomInput />}
                                />
                            </div>
                        </div>

                        <Dropdown placeholder="Perusahaan" label="Perusahaan" data={[]} className="w-full" required={true} value={companyName} disabled={true}/>

                        <Dropdown placeholder="Destinasi" label="Destinasi" data={dataDestinasi} className="w-full" required={true} value={destinasiDropdown} onChange={handleDestinasiDropdownChange} isError={isError && checkAttributeNull(destinasiDropdown)}/>

                        <Dropdown placeholder="asal" label="Asal" data={[]} className="w-full" required={true} value={dcName} disabled={true}/>

                        <Dropdown placeholder="Status" label="Status" data={dataStatus} className="w-full" required={true} value={statusDropdown} onChange={handleStatusDropdownChange} isError={isError && checkAttributeNull(statusDropdown)}/>
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-4">
                    <Button className="text-button btn-primary-outline" label="Kembali" onClick={() => navigate("/order")}/>
                    <Button className="text-button btn-primary" label="Simpan" onClick={handleSubmit}/>
                </div>
            </div>
        </div>
    )
}

export default UpdateOrder;
