import { Dialog, Transition } from '@headlessui/react'
import { useNavigate } from "react-router-dom";
import React, { useEffect, useState, Fragment  } from "react";
import { Modal } from '../../components/Modal';
import { BsPencilSquare } from "react-icons/bs";
import axiosAuthInstance from "../../utils/axios-auth-instance";
import { Dropdown } from '../../components/Dropdown';
import { checkAttributeNull } from "../../utils/utils";

function UpdatePengiriman({pengiriman, isOpen, closeModal, fetchData}) {
    const [isOpenSuccess, setIsOpenSuccess] = useState(false); 
    let navigate = useNavigate();
    const [showLoading, setShowLoading] = useState(true);
    const [isError, setIsError] = useState(false); 

    const [updatePengirimanData, setUpdatePengirimanData] = useState({
        id: null,
        status: null,
    })

    const [dataStatus, setDataStatus] = useState([]);
    const [statusDropdown, setStatusDropdown] = useState(null);

    useEffect(() => {
        async function fetchDataStatus(){
            if (dataStatus.length === 0) {
                axiosAuthInstance.get("/api/shipment-status").then((response) => {
                    const statusData = response.data.data.map((item) => ({
                        value: item,
                        name: item,
                    }));
                    setDataStatus(statusData);
                    setShowLoading(false)
                });
            }
        }
        async function fetchDataPengiriman(){
            if (updatePengirimanData.id === null){
                const pengirimanData = {
                    id: pengiriman.id,
                    status: pengiriman.status
                }
                setUpdatePengirimanData(pengirimanData);
            }
        }

        fetchDataStatus();
        fetchDataPengiriman();
    }, [dataStatus, updatePengirimanData]);

    const handleStatusDropdownChange = (selectedValue) => {
        setStatusDropdown(selectedValue);
        setUpdatePengirimanData({
          ...updatePengirimanData,
          status: selectedValue.value,
        });
    };

    const handleSubmit = async (e) => {
        setShowLoading(true)
        if (updatePengirimanData.id == null ||
            updatePengirimanData.status == null) {
            setIsError(true)
        }
        else {
            e.preventDefault();
            // const updatePengirimanFormat = {
            //     id: updatePengirimanData.id,
            //     status: updatePengirimanData.status
            // };

            if (updatePengirimanData.status == "DIBATALKAN") {
                axiosAuthInstance
                .put(`/api/shipment/${updatePengirimanData.id}/rejected`)
                .then((response) => {
                    if (response.status == 200){
                        setShowLoading(false)
                        setIsOpenSuccess(true)
                    };
                }
                ).catch(err => {
                    setShowLoading(false)
                });
            }
            else if (updatePengirimanData.status == "SELESAI") {
                axiosAuthInstance
                .put(`/api/shipment/${updatePengirimanData.id}/finish`)
                .then((response) => {
                    if (response.status == 200){
                        setShowLoading(false)
                        setIsOpenSuccess(true)
                    };
                }
                ).catch(err => {
                    setShowLoading(false)
                });
            }
            else {
                setShowLoading(false)
                setIsOpenSuccess(true)
            }
            // console.log(fetchData);
            fetchData(true)
        }
    }

    return (
        <>
            <Modal variant="primary" isOpen={isOpenSuccess} closeModal={() => setIsOpenSuccess(false)} description="Berhasil mengubah status pengiriman." rightButtonText="Selesai" onClickRight={() => {setIsOpenSuccess(false)}}/>
            
            <Transition appear show={isOpen} as={Fragment}>
                <Dialog as="div" className="relative z-50" onClose={closeModal}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-[578px] transform rounded-lg bg-white p-6 text-center align-middle shadow-xl transition-all">
                            <Dialog.Title
                                as="p"
                                className="text-modal-title flex flex-col items-center justify-center">
                                        <div className='rounded-full bg-primary text-white p-2 mb-3'>
                                            <BsPencilSquare className="text-2xl" />
                                        </div>
                                    <span>Ubah Status Pengiriman</span>
                            </Dialog.Title>

                            <div className='pt-5 space-y-3 text-left'>
                                <div className="grid grid-cols-5 px-2">
                                    <div className='col-span-2 text-left border-b border-neutral-40 p-2'>
                                        <p className='m-p-med'>Nomor Pengiriman</p>
                                    </div>
                                    <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                                        <p className='m-p-reg'>{pengiriman.shipment_num}</p>
                                    </div>
                                </div>

                                <Dropdown placeholder="Contoh: Dikirim" label="Status " data={dataStatus} className="w-full text-left" required={true} value={statusDropdown} onChange={handleStatusDropdownChange} isError={isError && checkAttributeNull(statusDropdown)}/>

                                <div className="flex w-full mt-2">
                                    <button type="button" className={`text-modal-button btn-primary-outline`} style={{ width: '100%' }} onClick={closeModal}>Batal</button>
                                    <button type="button" className={`text-modal-button btn-primary`} style={{ width: '100%' }} onClick={handleSubmit}>Simpan</button>
                                </div>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                    </div>
                </div>
                </Dialog>
            </Transition>
        </>
    )
}


export default UpdatePengiriman;