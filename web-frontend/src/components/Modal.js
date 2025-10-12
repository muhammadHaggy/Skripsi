import { Dialog, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { BiSolidError, BiErrorCircle } from 'react-icons/bi';
import { BsX } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';

function formatDateETA(dateTimeString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' };
  return new Date(dateTimeString).toLocaleDateString('id-ID', options);
}

function formatDateETD(dateTimeString) {
  const options = { year: 'numeric', month: '2-digit', day: '2-digit'};
  return new Date(dateTimeString).toLocaleDateString('id-ID', options);
}

function formatKM(meter) {
  var numMeter = parseInt(meter);
  return ((numMeter/1000).toFixed(3));
}

function Modal({variant, title, description, warningDesc, leftButtonText, rightButtonText, onClickRight, onClickLeft, isOpen, closeModal}) {
  return (
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
                <Dialog.Panel className="w-full max-w-[394px] transform overflow-hidden rounded-lg bg-white p-6 text-center align-middle shadow-xl transition-all">
                    <Dialog.Title
                        as="p"
                        className="text-modal-title flex flex-col items-center justify-center">
                            {
                                variant === 'primary' ?
                                <div className='rounded-full bg-primary text-white p-2 mb-3'>
                                    <BiSolidError className="text-2xl" />
                                </div> :
                                variant === 'warning' ?
                                <div className='rounded-full bg-warning text-white p-2 mb-3'>
                                    <BiSolidError className="text-2xl" />
                                </div> :
                                <div className='rounded-full bg-danger text-white p-2 mb-3'>
                                    <BiSolidError className="text-2xl" />
                                </div>
                            }
                            <span className={`${title == null ? '!hidden' : null}`}>{title}</span>
                    </Dialog.Title>

                    <div className="mt-1 max-h-[150px] overflow-y-auto">
                        <p className="m-p-reg">
                        {description}
                        </p>
                    </div>

                    <div className={`${warningDesc == null ? '!hidden' : null} mt-4 rounded-lg bg-danger-surface px-6 py-4 text-left align-middle`}>
                        <p className={`s-p-med text-danger flex`}>
                            <BiErrorCircle className="text-lg mr-1" />
                            Peringatan
                        </p>
                        <p className={`s-p-reg text-danger-hover pt-2`}>
                            {warningDesc}
                        </p>
                    </div>

                    <div className="flex w-full mt-2">
                        <button type="button" className={`${leftButtonText == null ? '!hidden' : null} text-modal-button btn-${variant}-outline`} style={{ width: '100%' }} onClick={onClickLeft == null ? closeModal : onClickLeft}>{leftButtonText}</button>
                        <button type="button" className={`text-modal-button btn-${variant}`} style={{ width: '100%' }} onClick={onClickRight == null ? closeModal : onClickRight}>{rightButtonText}</button>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

function ModalSelectPriority({ isOpen, closeModal}) {
  const navigate = useNavigate();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-50">
        <div className="bg-white p-6 rounded-lg shadow-lg w-1/2 relative">
          <button
            onClick={closeModal}
            className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
          >
            &times;
          </button>
          
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold">Pilih Prioritas Optimisasi</h2>
          </div>

          <div className="flex flex-col space-y-4">
            <button
              onClick={() => {
                console.log('First Button clicked');
                closeModal();
                navigate('/pengiriman/select-do-automate', {
                  state: { optimizationType: 'distance' },
                });              }}
              className="flex items-center px-4 py-2 bg-white text-primary-hover border border-primary-hover rounded-lg shadow-md hover:bg-primary-hover hover:text-white"
            >
              <span className="mr-2 text-lg">+</span> Optimisasi Rute
            </button>
            <button
              onClick={() => {
                console.log('Second Button clicked');
                closeModal();
                navigate('/pengiriman/select-do-automate', {
                  state: { optimizationType: 'load' },
                });  
              }}
              className="flex items-center px-4 py-2 bg-white text-primary-hover border border-primary-hover rounded-lg shadow-md hover:bg-primary-hover hover:text-white"
            >
              <span className="mr-2 text-lg">+</span> Optimisasi Muatan
            </button>
            <button
              onClick={() => {
                console.log('Third Button clicked');
                closeModal();
                navigate('/pengiriman/select-do-automate', {
                  state: { optimizationType: 'balance' },
                });  
              }}
              className="flex items-center px-4 py-2 bg-white text-primary-hover border border-primary-hover rounded-lg shadow-md hover:bg-primary-hover hover:text-white"
            >
              <span className="mr-2 text-lg">+</span> Optimisasi Muatan dan Jarak
            </button>
          </div>
        </div>
      </div>
    </Transition>
  );
}
function ModalDetailLokasi({lokasi, isOpen, closeModal, importTable=false}) {
  return (
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[783px] transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-neutral-20">
                      <Dialog.Title
                        as="p"
                        className="text-modal-title p-2 pl-6"
                      >
                        Lokasi {lokasi.loc_id}
                      </Dialog.Title>
                      <div className='py-2 pr-2'>
                        <BsX className='cursor-pointer' onClick={closeModal}/>
                      </div>
                    </div>
                    <div class="grid grid-cols-4 px-[30px] pb-[30px] pt-[20px]">
                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nama Lokasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{lokasi.name}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>ID Lokasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>{lokasi.id}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Alamat Lokasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>{lokasi.address}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Kelurahan</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r p-2 pr-1'>
                        <p className='m-p-reg'>{lokasi.desa_kelurahan}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                        <p className='m-p-med'>Kecamatan</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{lokasi.kecamatan}</p>
                      </div>

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Kabupaten/Kota</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r p-2 pr-1'>
                        <p className='m-p-reg'>{lokasi.kabupaten_kota}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                        <p className='m-p-med'>Provinsi</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2 '>
                        <p className='m-p-reg'>{lokasi.provinsi}</p>
                      </div>

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Kode Pos</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{lokasi.kode_pos}</p>
                      </div>

                      {importTable? null : <>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Latitude</p>
                        </div>
                        <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r p-2 pr-1 truncate'>
                          <p className='m-p-reg'>{lokasi.latitude}</p>
                        </div>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                          <p className='m-p-medx'>Longitude</p>
                        </div>
                        <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2 truncate'>
                          <p className='m-p-reg'>{lokasi.longitude}</p>
                        </div>
                      </>}

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Jam Buka Toko</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r p-2 pr-1 truncate'>
                        <p className='m-p-reg'>{lokasi.open_hour} WIB</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                        <p className='m-p-medx'>Jam Tutup Toko</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2 truncate'>
                        <p className='m-p-reg'>{lokasi.close_hour} WIB</p>
                      </div>
                      {
                        lokasi.location_type == null ? null :
                        importTable === true ? 
                        <>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Tipe Lokasi</p>
                        </div>
                        <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{lokasi.location_type}</p>
                        </div>
                        </> : 
                        <>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Tipe Lokasi</p>
                        </div>
                        <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{lokasi.location_type.name}</p>
                        </div>
                        </>
                      }
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Service Time</p>
                        </div>
                        <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{lokasi.service_time} Menit</p>
                        </div>
                        
                      {importTable === true ? 
                      (<>
                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Distribution Center (DC)</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2'>
                          <p className='m-p-reg'>{lokasi.dc}</p>
                        </div>
                      </>): (<>
                        {importTable? null : <>
                          <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                            <p className='m-p-med'>Jarak ke Distribution Center (DC)</p>
                          </div>
                          <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2'>
                            <p className='m-p-reg'>{formatKM(lokasi.dist_to_origin)} KM</p>
                          </div>
                        </> }
                      </>)}
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

function ModalDetailLokasiFailed({lokasi, isOpen, closeModal}) {
  return (
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[783px] transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-neutral-20">
                      <Dialog.Title
                        as="p"
                        className="text-modal-title p-2 pl-6"
                      >
                        Lokasi {lokasi.loc_id}
                      </Dialog.Title>
                      <div className='py-2 pr-2'>
                        <BsX className='cursor-pointer' onClick={closeModal}/>
                      </div>
                    </div>
                    <div class="grid grid-cols-4 px-[30px] pb-[30px] pt-[20px]">
                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nama Lokasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{lokasi.name}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>ID Lokasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>{lokasi.loc_id}</p>
                      </div>
                      {lokasi.address == null || lokasi.address == '' ?
                      <>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Alamat Lokasi</p>
                        </div>
                        <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>-</p>
                        </div>
                      </>
                      :
                      <>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Alamat Lokasi</p>
                        </div>
                        <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{lokasi.address}</p>
                        </div>
                      </>
                      }
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Keterangan</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-words'>
                        <p className='m-p-reg text-danger'>{Array.isArray(lokasi.message) ? 
                            lokasi.message.length > 1 ? 
                            lokasi.message.join(", ") 
                            : lokasi.message[0] 
                            : lokasi.message
                          }
                        </p>
                      </div>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

function ModalDetailTruk({truk, isOpen, closeModal, importTable=false}) {
  return (
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-neutral-20">
                      <Dialog.Title
                        as="p"
                        className="text-modal-title p-2 pl-6"
                      >
                        Truk {truk.id}
                      </Dialog.Title>
                      <div className='py-2 pr-2'>
                        <BsX className='cursor-pointer' onClick={closeModal}/>
                      </div>
                    </div>
                    
                    <div class="grid grid-cols-4 px-[30px] pb-[30px] pt-[20px]">
                      {importTable === true ? null : 
                      truk.first_status === "AVAILABLE"? 
                        (<div className='w-fit rounded-lg col-span-4 p-2 bg-success-surface text-success-hover mb-[10px]'>
                          <p className='m-p-med'>Tersedia - Siap digunakan</p>
                        </div>)
                      : 
                      truk.second_status === "ON_DELIVERY"? 
                        (<div className='w-fit rounded-lg col-span-4 p-2 bg-danger-surface text-danger mb-[10px]'>
                          <p className='m-p-med'>Tidak Tersedia - Sedang dalam pengiriman</p>
                        </div>)
                      :
                      truk.second_status === "ARCHIVE"? 
                        (<div className='w-fit rounded-lg col-span-4 p-2 bg-danger-surface text-danger mb-[10px]'>
                          <p className='m-p-med'>Tidak Tersedia - Tidak Aktif</p>
                        </div>)
                      :
                      truk.third_status === "MAINTENANCE"? 
                        (<div className='w-fit rounded-lg col-span-4 p-2 bg-danger-surface text-danger mb-[10px]'>
                          <p className='m-p-med'>Tidak Tersedia - OOS - Sedang Dalam Perbaikan</p>
                        </div>)
                      : 
                        (<div className='w-fit rounded-lg col-span-4 p-2 bg-danger-surface text-danger mb-[10px]'>
                          <p className='m-p-med'>Tidak Tersedia - OOS - Legal</p>
                        </div>)
                      }
                      
                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className=' m-p-med'>Plat Kendaraan</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{truk.plate_number}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Tipe Kendaraan</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>
                          {truk.type ? (
                            truk.type.name === "BLIND_VAN" ? "Blind Van" :
                            truk.type.name === "CDE" ? "CDE" :
                            truk.type.name === "CDD" ? "CDD" :
                            truk.type.name
                          ) : ''}
                        </p>
                      </div>

                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Volume Maksimal Kendaraan (ml)</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{truk.max_individual_capacity_volume}</p>
                        </div>
                      <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Distribution Center (DC) </p>
                      </div>
                      <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>{truk.dc}</p>
                      </div>
                      {importTable === true ? 
                      <>
                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Status</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                          <p className='m-p-reg'>{truk.status}</p>
                        </div>
                      </>
                      :null}
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

function ModalDetailOrder({order, isOpen, closeModal, importTable = false}) {
  return (
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-xl transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-neutral-20">
                      <Dialog.Title
                        as="p"
                        className="text-modal-title p-2 pl-6"
                      >
                        Order {order.order_num}
                      </Dialog.Title>
                      <div className='py-2 pr-2'>
                        <BsX className='cursor-pointer' onClick={closeModal}/>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 px-[30px] pb-[10px] pt-[20px]">
                      {importTable === true ? null : 
                      order.status === 'OPEN' ? 
                          (<div className="col-span-4 w-fit p-2 bg-warning-surface text-warning-hover rounded-[7px] mb-[10px]">
                              <p className="m-p-med" >Belum Diproses</p>
                          </div>)
                      : order.status === 'OPTIMIZED' ? 
                          (<div className="col-span-4 w-fit p-2 bg-success-surface text-success-hover rounded-[7px] mb-[10px]">
                              <p className="m-p-med" >Teroptimasi</p>
                          </div>)
                      :   (<div className="col-span-4 w-fit p-2 bg-danger-surface text-danger rounded-[7px] mb-[10px]">
                              <p className="m-p-med" >Tidak Disetujui</p>
                          </div>)
                      }
                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nomor Order</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{order.order_num}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Deskripsi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 break-all'>
                        <p className='m-p-reg'>{order.description}</p>
                      </div>

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Kuantitas</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r p-2 pr-1'>
                        <p className='m-p-reg'>{order.quantity}</p>
                      </div>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                        <p className='m-p-med'>Volume (ml)</p>
                      </div>
                      <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{order.volume}</p>
                      </div>
                      {importTable === true ? 
                      (<>
                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Estimate Time Arrival (ETA)</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 pr-1 p-2'>
                          <p className='m-p-reg'>{order.eta == null ? '-' : formatDateETA(order.eta)}</p>
                        </div>
                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Target Estimate Time Arrival (ETA)</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2'>
                          <p className='m-p-reg'>{order.eta_target != null && order.eta_target != "Invalid date" ? (formatDateETD(order.eta_target)) : '-'}</p>
                        </div>
                      </>)
                      :
                      (<>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Estimate Time Arrival (ETA)</p>
                        </div>
                        <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 border-r pr-1 p-2'>
                          <p className='m-p-reg'>{order.eta != null && order.eta != "Invalid date" ? (formatDateETA(order.eta)+ 'WIB') : '-'}</p>
                        </div>
                        <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2 pl-1'>
                          <p className='m-p-med'>Estimate Time Delivery (ETD)</p>
                        </div>
                        <div className='col-span-1 text-right m-p-reg border-b border-neutral-40 p-2'>
                          <p className='m-p-reg'>{order.etd != null ? (formatDateETD(order.etd)+ 'WIB') : '-'}</p>
                        </div>
                        <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                          <p className='m-p-med'>Target Estimate Time Arrival (ETA)</p>
                        </div>
                        <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2'>
                          <p className='m-p-reg'>{order.eta_target != null && order.eta_target != "Invalid date" ? (formatDateETD(order.eta_target)) : '-'}</p>
                        </div>
                      </>)
                      }

                      {importTable === true ?
                      (<>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Asal</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 pr-1'>
                        <p className='m-p-reg'>{order.dc}</p>
                      </div>
                      </>) : (<>
                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Perusahaan</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{order.company}</p>
                      </div>

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Asal</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 pr-1'>
                        <p className='m-p-reg'>{order.dc}</p>
                      </div>

                      <div className='col-span-1 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Destinasi</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2 pr-1'>
                        <p className='m-p-reg'>{order.loc_dest}</p>
                      </div>
                      <div className='col-span-2 text-left m-p-med border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nomor Pengiriman</p>
                      </div>
                      <div className='col-span-2 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{order.manifest != null ? order.manifest.shipment_id : "-"}</p>
                      </div>
                      </>)}
                    </div>

                    <div className={`mx-[30px] mb-[30px] rounded-lg bg-primary-surface px-6 py-4 text-left align-middle`}>
                        <p className={`s-p-med text-primary flex`}>
                            <BiErrorCircle className="text-lg mr-1" />
                            Keterangan
                        </p>
                        <p className={`s-p-reg text-primary-hover pt-2 pl-6`}>
                          <ul className="list-disc">
                            <li>
                              <span className='font-bold'>Estimate Time Arrival (ETA)</span> merupakan waktu perkiraan kedatangan berdasarkan sistem.
                            </li>
                            <li>
                              <span className='font-bold'>Target Estimate Time Arrival (Target ETA)</span> merupakan waktu kedatangan yang diinginkan oleh customer.
                            </li>
                          </ul>
                        </p>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

function ModalDetailUser({user, isOpen, closeModal}) {
  return (
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
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-[783px] transform overflow-hidden rounded-lg bg-white text-left align-middle shadow-xl transition-all">
                    <div className="flex items-center justify-between border-b border-neutral-20">
                      <Dialog.Title
                        as="p"
                        className="text-modal-title p-2 pl-6"
                      >
                        User
                      </Dialog.Title>
                      <div className='py-2 pr-2'>
                        <BsX className='cursor-pointer' onClick={closeModal}/>
                      </div>
                    </div>
                    <div class="grid grid-cols-4 px-[30px] pb-[30px] pt-[20px]">
                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Username</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.username}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nama Depan</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.first_name}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nama Belakang</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.last_name}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Email</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.email}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Nomor Telfon</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.phone_num}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Role</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.role.name}</p>
                      </div>

                      <div className='col-span-1 text-left border-b border-neutral-40 p-2'>
                        <p className='m-p-med'>Status</p>
                      </div>
                      <div className='col-span-3 text-right m-p-reg border-b border-neutral-40 p-2'>
                        <p className='m-p-reg'>{user.is_active ? 'Aktif' : 'Tidak Aktif'}</p>
                      </div>
                    </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
  )
}

export {Modal, ModalDetailLokasi, ModalDetailLokasiFailed, ModalDetailTruk, ModalDetailOrder, ModalDetailUser, ModalSelectPriority};